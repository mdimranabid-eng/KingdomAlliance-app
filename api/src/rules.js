// Port of firestore.rules for the REST fs layer. Every client request is
// checked here server-side; internal server code bypasses via store.js.
// ctx = { auth, op, collPath, id, incoming (future doc), existing (current doc), callerUserDoc }
const g = (data, k, d) => (data && typeof data === 'object' && k in data ? data[k] : d);
const isValidId = (id) => typeof id === 'string' && id.length <= 128 && /^[a-zA-Z0-9_\-]+$/.test(id);

class PermissionDenied extends Error {
  constructor(msg = 'permission-denied') { super(msg); this.code = 'permission-denied'; }
}

function isUsableAccount(ctx) {
  if (!ctx.auth || !ctx.auth.uid) return false;
  const u = ctx.callerUserDoc;
  if (!u) return true; // no profile yet — signup flow
  return g(u, 'deletionStatus', '') === '' &&
    g(u, 'isSuspended', false) !== true &&
    g(u, 'isBanned', false) !== true &&
    !['suspended', 'blocked', 'banned'].includes(g(u, 'status', ''));
}

function isApproved(ctx) {
  return isUsableAccount(ctx) && !!ctx.callerUserDoc &&
    ctx.callerUserDoc.isApproved === true && g(ctx.callerUserDoc, 'deletionStatus', '') === '';
}

const isAdmin = (ctx) => !!ctx.auth && !!ctx.auth.admin;
const isOwner = (ctx, id) => !!ctx.auth && ctx.auth.uid === id;

function affectedKeys(existing, future) {
  const keys = new Set(Object.keys(future || {}));
  Object.keys(existing || {}).forEach((k) => keys.add(k));
  return [...keys].filter((k) => JSON.stringify(g(existing, k, undefined)) !== JSON.stringify(g(future, k, undefined)));
}

const createdAtOk = (data) => {
  const c = g(data, 'createdAt');
  return !!c && typeof c === 'object' && typeof c.__ts === 'number' &&
    Math.abs(c.__ts - Date.now()) < 5 * 60 * 1000;
};

function safeInitialAccount(data) {
  return g(data, 'role', 'user') === 'user' &&
    g(data, 'isAdmin', false) !== true &&
    g(data, 'isApproved', false) !== true &&
    g(data, 'isBanned', false) !== true &&
    g(data, 'isSuspended', false) !== true &&
    g(data, 'photoApproved', false) !== true &&
    ['incomplete', 'pending'].includes(g(data, 'approvalStatus', 'incomplete')) &&
    ['incomplete', 'pending', 'not_approved'].includes(g(data, 'status', 'incomplete')) &&
    ['idle', 'pending'].includes(g(data, 'photoStatus', 'idle')) &&
    g(data, 'photoUrl', '') === '' &&
    !['onboardingEmailSent', 'onboardingEmailSentAt', 'deletionStatus', 'scheduledDeletionAt',
      'deletionRequestedAt', 'deletionReminderSent', 'deletionLeaseUntil', 'deletionCleanupStartedAt',
      'approvedBy', 'approvedAt'].some((k) => k in (data || {}));
}

const USER_SIZE_FIELDS = [
  ['name', 128], ['aboutMe', 2000], ['denomination', 100], ['church', 200], ['churchName', 200],
  ['education', 200], ['profession', 200], ['location', 200], ['mobileNumber', 20],
  ['familyDetails', 2000], ['photoRejectionReason', 500], ['pauseReason', 250],
];

function isValidUser(data) {
  if (!data || typeof data !== 'object') return false;
  if (typeof data.uid !== 'string' || data.uid.length > 128) return false;
  if (typeof data.email !== 'string' || data.email.length > 256) return false;
  for (const [f, max] of USER_SIZE_FIELDS) {
    const v = g(data, f, '');
    if (typeof v !== 'string' || v.length > max) return false;
  }
  if (!['bride', 'groom'].includes(g(data, 'profileType', 'bride'))) return false;
  if (!['idle', 'pending', 'approved', 'rejected'].includes(g(data, 'photoStatus', 'idle'))) return false;
  if (!['public', 'accepted_only'].includes(g(data, 'photoPrivacy', 'public'))) return false;
  if (!['incomplete', 'pending', 'approved', 'rejected'].includes(g(data, 'approvalStatus', 'incomplete'))) return false;
  if (typeof g(data, 'onboardingComplete', false) !== 'boolean') return false;
  const age = g(data, 'age', 0);
  const ageOk = (typeof age === 'number' && age >= 18 && age <= 100) ||
    (typeof age === 'string' && age.length > 0 && age.length <= 3) ||
    // incomplete draft profiles may still carry the initial age: 0
    (Number(age) === 0 && g(data, 'onboardingComplete', false) !== true);
  if (!ageOk) return false;
  if (typeof g(data, 'height', '') !== 'string' && typeof g(data, 'height', 0) !== 'number') return false;
  if (!['', 'male', 'female'].includes(g(data, 'gender', ''))) return false;
  if (!Array.isArray(g(data, 'gallery', []))) return false;
  return true;
}

const USER_OWNER_FORBIDDEN = ['role', 'isAdmin', 'isSuspended', 'isBanned', 'isApproved', 'status',
  'photoApproved', 'onboardingEmailSent', 'onboardingEmailSentAt', 'deletionStatus', 'scheduledDeletionAt',
  'deletionRequestedAt', 'deletionReminderSent', 'deletionLeaseUntil', 'deletionCleanupStartedAt', 'approvedBy', 'approvedAt'];
const USER_LOCKED_AFTER_ONBOARDING = ['denomination', 'churchName', 'diocese', 'baptized', 'fathersName',
  'fathersOccupation', 'mothersName', 'mothersOccupation', 'numberOfSiblings', 'pastorNumber', 'gender',
  'dob', 'age', 'citizenship', 'maritalStatus', 'profileFor', 'profileType', 'motherTongue', 'education'];

function isValidContactMessage(data) {
  return data && typeof data.name === 'string' && data.name.length <= 100 &&
    typeof data.email === 'string' && data.email.length <= 128 && /^[^@]+@[^@]+\.[^@]+$/.test(data.email) &&
    typeof data.mobile === 'string' && data.mobile.length === 10 && /^[0-9]+$/.test(data.mobile) &&
    typeof data.subject === 'string' && data.subject.length <= 100 &&
    typeof data.message === 'string' && data.message.length <= 1000 &&
    data.status === 'new' && createdAtOk(data);
}

// ── success_stories ───────────────────────────────────────────────────────────
function checkSuccessStories(ctx) {
  const { op, id, incoming, existing } = ctx;
  if (op === 'get') {
    if (isAdmin(ctx)) return {};
    if (existing && existing.status === 'approved') return {};
    if (ctx.auth && existing && existing.userId === ctx.auth.uid) return {};
    throw new PermissionDenied();
  }
  if (op === 'list') {
    if (isAdmin(ctx)) return {};
    if (ctx.auth && ctx.auth.uid) {
      return { filter: (d) => d.status === 'approved' || d.userId === ctx.auth.uid };
    }
    // Public unauthenticated visitor on landing page:
    return { filter: (d) => d.status === 'approved' };
  }
  if (op === 'create') {
    if (!isValidId(id) || !isUsableAccount(ctx)) throw new PermissionDenied();
    if (g(incoming, 'userId') !== ctx.auth?.uid) throw new PermissionDenied();
    if (g(incoming, 'status') !== 'pending') throw new PermissionDenied();
    const coupleNames = g(incoming, 'coupleNames', '');
    const story = g(incoming, 'story', g(incoming, 'text', ''));
    if (typeof coupleNames !== 'string' || coupleNames.length < 2 || coupleNames.length > 120) throw new PermissionDenied();
    if (typeof story !== 'string' || story.length < 10 || story.length > 4000) throw new PermissionDenied();
    if (!createdAtOk(incoming)) throw new PermissionDenied();
    return {};
  }
  if (op === 'update') {
    if (isAdmin(ctx)) return {};
    throw new PermissionDenied();
  }
  if (op === 'delete') {
    if (isAdmin(ctx)) return {};
    if (isUsableAccount(ctx) && existing && existing.userId === ctx.auth?.uid) return {};
    throw new PermissionDenied();
  }
  throw new PermissionDenied();
}


// ── users ─────────────────────────────────────────────────────────────────────
function checkUsers(ctx) {
  const { op, id, incoming, existing } = ctx;
  if (op === 'get') {
    if (!ctx.auth) throw new PermissionDenied();
    if (isOwner(ctx, id) || isAdmin(ctx)) return {};
    if (isApproved(ctx) && existing && existing.isApproved === true && g(existing, 'deletionStatus', '') === '') return {};
    throw new PermissionDenied();
  }
  if (op === 'list') {
    if (!ctx.auth) throw new PermissionDenied();
    if (isAdmin(ctx)) return {};
    if (isApproved(ctx)) return { filter: (d) => d.isApproved === true && g(d, 'deletionStatus', '') === '' };
    throw new PermissionDenied();
  }
  if (op === 'create') {
    if (!isValidId(id) || !isOwner(ctx, id)) throw new PermissionDenied();
    if (g(incoming, 'uid') !== id) throw new PermissionDenied();
    if (String(g(incoming, 'email', '')).toLowerCase() !== String(ctx.auth.email || '').toLowerCase()) throw new PermissionDenied();
    if (!createdAtOk(incoming) || !safeInitialAccount(incoming)) throw new PermissionDenied();
    return {};
  }
  if (op === 'update') {
    if (!ctx.auth) throw new PermissionDenied();
    const keys = affectedKeys(existing, incoming);
    if (isOwner(ctx, id)) {
      if (!isValidUser(incoming) || !isUsableAccount(ctx)) throw new PermissionDenied();
      if (g(existing, 'deletionStatus', '') !== '') throw new PermissionDenied();
      if (keys.some((k) => USER_OWNER_FORBIDDEN.includes(k))) throw new PermissionDenied();
      if (g(existing, 'onboardingComplete', false) === true &&
        keys.some((k) => USER_LOCKED_AFTER_ONBOARDING.includes(k))) throw new PermissionDenied();
      if (keys.includes('approvalStatus') &&
        !(g(existing, 'onboardingComplete', false) === false &&
          incoming.onboardingComplete === true && incoming.approvalStatus === 'pending')) throw new PermissionDenied();
      if (g(existing, 'onboardingComplete', false) === true && incoming.onboardingComplete !== true) throw new PermissionDenied();
      if (g(incoming, 'uid') !== g(existing, 'uid') ||
        String(g(incoming, 'email')).toLowerCase() !== String(g(existing, 'email')).toLowerCase()) throw new PermissionDenied();
      if (JSON.stringify(g(incoming, 'createdAt')) !== JSON.stringify(g(existing, 'createdAt'))) throw new PermissionDenied();
      const photoChanged = keys.some((k) => ['photoUrl', 'pendingPhotoUrl'].includes(k));
      if (photoChanged && g(incoming, 'photoStatus', 'idle') !== 'pending' && !keys.includes('gallery')) throw new PermissionDenied();
      return {};
    }
    if (isAdmin(ctx)) {
      const allowed = ['isApproved', 'photoApproved', 'photoStatus', 'photoRejectionReason', 'photoUrl',
        'pendingPhotoUrl', 'gallery', 'status', 'approvalStatus', 'updatedAt', 'approvedAt', 'approvedBy',
        'rejectedAt', 'rejectedBy', 'rejectedReason', 'notifications', 'isSuspended', 'isBanned'];
      if (!keys.every((k) => allowed.includes(k))) throw new PermissionDenied();
      return {};
    }
    throw new PermissionDenied();
  }
  throw new PermissionDenied(); // deletes go through /api/account/delete
}

// ── interests ─────────────────────────────────────────────────────────────────
function checkInterests(ctx) {
  const { op, id, incoming, existing } = ctx;
  const mine = (d) => g(d, 'fromId') === ctx.auth?.uid || g(d, 'toId') === ctx.auth?.uid;
  if (op === 'get' || op === 'list') {
    if (!isUsableAccount(ctx)) throw new PermissionDenied();
    if (isAdmin(ctx)) return {};
    return { filter: mine };
  }
  if (op === 'create') {
    if (!isValidId(id) || !isUsableAccount(ctx) || !isApproved(ctx)) throw new PermissionDenied();
    if (g(incoming, 'fromId') !== ctx.auth?.uid || !isValidId(g(incoming, 'toId'))) throw new PermissionDenied();
    if (!['pending', 'accepted', 'declined'].includes(g(incoming, 'status'))) throw new PermissionDenied();
    if (!createdAtOk(incoming)) throw new PermissionDenied();
    return { needTarget: g(incoming, 'toId') };
  }
  if (op === 'update') {
    if (!isUsableAccount(ctx)) throw new PermissionDenied();
    const keys = affectedKeys(existing, incoming);
    if (!keys.every((k) => ['status', 'updatedAt', 'declinedBy'].includes(k))) throw new PermissionDenied();
    const uid = ctx.auth?.uid;
    const from = g(existing, 'fromId'); const to = g(existing, 'toId'); const prev = g(existing, 'status');
    const next = g(incoming, 'status');
    const ok = (next === 'accepted' && to === uid && prev === 'pending') ||
      (next === 'declined' && to === uid && prev === 'pending') ||
      (next === 'declined' && (from === uid || to === uid) && prev === 'accepted') ||
      (next === 'accepted' && g(existing, 'declinedBy') === uid) ||
      isAdmin(ctx);
    if (!ok) throw new PermissionDenied();
    return {};
  }
  if (op === 'delete') {
    if (!isUsableAccount(ctx)) throw new PermissionDenied();
    if (isAdmin(ctx)) return {};
    if (g(existing, 'fromId') === ctx.auth?.uid && g(existing, 'status') === 'pending') return {};
    throw new PermissionDenied();
  }
  throw new PermissionDenied();
}


// ── shortlists / blocked (owner-keyed collections) ────────────────────────────
function checkSimple(ctx, ownerKey) {
  const { op, existing, incoming } = ctx;
  const own = (d) => g(d, ownerKey) === ctx.auth?.uid;
  if (op === 'get' || op === 'list') {
    if (!isUsableAccount(ctx)) throw new PermissionDenied();
    if (isAdmin(ctx)) return {};
    return { filter: own };
  }
  if (op === 'create') {
    if (!isUsableAccount(ctx) || !isApproved(ctx)) throw new PermissionDenied();
    if (g(incoming, ownerKey) !== ctx.auth?.uid) throw new PermissionDenied();
    if (!createdAtOk(incoming)) throw new PermissionDenied();
    return {};
  }
  if (op === 'delete') {
    if (!isUsableAccount(ctx)) throw new PermissionDenied();
    if (isAdmin(ctx) || own(existing)) return {};
    throw new PermissionDenied();
  }
  throw new PermissionDenied();
}

function isParticipant(ctx, chatId) {
  return typeof chatId === 'string' && chatId.split('_').includes(ctx.auth?.uid);
}

// ── chats + messages (incl. collectionGroup 'messages') ───────────────────────
async function checkChats(ctx) {
  const { op, collPath, id, incoming, existing } = ctx;
  const isMessages = collPath === 'messages' || collPath.endsWith('/messages');
  if (isMessages) {
    const chatId = collPath === 'messages' ? g(incoming, 'chatId') : collPath.split('/')[1];
    if (op === 'get' || op === 'list') {
      if (!isUsableAccount(ctx)) throw new PermissionDenied();
      if (isAdmin(ctx)) return {};
      return { filter: (d) => g(d, 'receiverId') === ctx.auth?.uid || g(d, 'senderId') === ctx.auth?.uid };
    }
    if (op === 'create') {
      if (!isValidId(id) || !isUsableAccount(ctx) || !isParticipant(ctx, chatId)) throw new PermissionDenied();
      if (g(incoming, 'senderId') !== ctx.auth?.uid) throw new PermissionDenied();
      if (typeof g(incoming, 'text') !== 'string' || g(incoming, 'text').length > 5000) throw new PermissionDenied();
      if (!createdAtOk(incoming) || !isApproved(ctx)) throw new PermissionDenied();
      if (g(incoming, 'chatId') !== chatId) throw new PermissionDenied();
      return { needInterest: chatId };
    }
    if (op === 'update') {
      if (!isUsableAccount(ctx)) throw new PermissionDenied();
      const keys = affectedKeys(existing, incoming);
      if (!keys.every((k) => k === 'read')) throw new PermissionDenied();
      if (isAdmin(ctx) || g(existing, 'receiverId') === ctx.auth?.uid) return {};
      throw new PermissionDenied();
    }
    if (op === 'delete') {
      if (!isUsableAccount(ctx)) throw new PermissionDenied();
      if (isAdmin(ctx) || isParticipant(ctx, chatId)) return {};
      throw new PermissionDenied();
    }
  }
  // chat documents
  if (!isValidId(id)) throw new PermissionDenied();
  if (['get', 'list', 'delete'].includes(op)) {
    if (!isUsableAccount(ctx)) throw new PermissionDenied();
    if (isAdmin(ctx) || isParticipant(ctx, id)) return {};
  }
  throw new PermissionDenied();
}

// ── main dispatcher (port of the collection match blocks) ─────────────────────
async function check(ctx) {
  const { op, collPath, id } = ctx;
  const top = collPath.split('/')[0];

  if (collPath === 'users') return checkUsers(ctx);
  if (collPath === 'interests') return checkInterests(ctx);
  if (collPath === 'shortlists') return checkSimple(ctx, 'userId');
  if (collPath === 'blocked') return checkSimple(ctx, 'blockerId');
  if (top === 'chats' || collPath === 'messages') return checkChats(ctx);

  if (collPath === 'profileViews') {
    if (ctx.op === 'get' || ctx.op === 'list') {
      if (!isUsableAccount(ctx)) throw new PermissionDenied();
      if (isAdmin(ctx)) return {};
      return { filter: (d) => g(d, 'profileId') === ctx.auth?.uid || g(d, 'viewerId') === ctx.auth?.uid };
    }
    if (ctx.op === 'create' || ctx.op === 'update') {
      if (!isValidId(id) || !isUsableAccount(ctx)) throw new PermissionDenied();
      if (g(ctx.incoming, 'viewerId') !== ctx.auth?.uid) throw new PermissionDenied();
      return {};
    }
    throw new PermissionDenied();
  }
  if (collPath === 'photoModeration') {
    if (op === 'get' || op === 'list') {
      if (!isUsableAccount(ctx)) throw new PermissionDenied();
      if (isAdmin(ctx)) return {};
      return { filter: (d) => g(d, 'uid', g(d, 'userId', '')) === ctx.auth?.uid };
    }
    if (op === 'create') {
      if (!isUsableAccount(ctx) || g(ctx.incoming, 'uid') !== ctx.auth?.uid) throw new PermissionDenied();
      return {};
    }
    if (op === 'update') { if (isAdmin(ctx)) return {}; throw new PermissionDenied(); }
    if (op === 'delete') {
      if (!isUsableAccount(ctx)) throw new PermissionDenied();
      if (isAdmin(ctx) || g(ctx.existing, 'uid', g(ctx.existing, 'userId', '')) === ctx.auth?.uid) return {};
      throw new PermissionDenied();
    }
  }
  if (collPath === 'admins') {
    if (op === 'get') { if (ctx.auth && (isOwner(ctx, id) || isAdmin(ctx))) return {}; throw new PermissionDenied(); }
    if (op === 'list') { if (isAdmin(ctx)) return {}; throw new PermissionDenied(); }
    throw new PermissionDenied(); // server-managed
  }
  if (collPath === 'settings') {
    if (op === 'get') { if (id === 'site_config') return {}; throw new PermissionDenied(); }
    if (op === 'list') throw new PermissionDenied();
    if (isAdmin(ctx)) return {};
    throw new PermissionDenied();
  }
  if (collPath === 'uploadedImages') {
    if (['get', 'list', 'create'].includes(op) && isUsableAccount(ctx)) return {};
    throw new PermissionDenied();
  }
  if (collPath === 'churches') { if (isAdmin(ctx)) return {}; throw new PermissionDenied(); }
  if (collPath === 'success_stories') return checkSuccessStories(ctx);
  if (collPath === 'contact_messages') {
    if (op === 'create') { if (isValidContactMessage(ctx.incoming)) return {}; throw new PermissionDenied(); }
    if (isAdmin(ctx)) return {};
    throw new PermissionDenied();
  }
  if (collPath === 'notifications') {
    if (op === 'get' || op === 'list') {
      if (!isUsableAccount(ctx)) throw new PermissionDenied();
      if (isAdmin(ctx)) return {};
      return { filter: (d) => g(d, 'userId') === ctx.auth?.uid };
    }
    if (op === 'create') {
      if (!isUsableAccount(ctx) || g(ctx.incoming, 'fromId') !== ctx.auth?.uid) throw new PermissionDenied();
      return {};
    }
    if (op === 'update') {
      if (!isUsableAccount(ctx)) throw new PermissionDenied();
      if (!affectedKeys(ctx.existing, ctx.incoming).every((k) => k === 'read')) throw new PermissionDenied();
      if (isAdmin(ctx) || g(ctx.existing, 'userId') === ctx.auth?.uid) return {};
      throw new PermissionDenied();
    }
    if (op === 'delete') {
      if (!isUsableAccount(ctx)) throw new PermissionDenied();
      if (isAdmin(ctx) || g(ctx.existing, 'userId') === ctx.auth?.uid) return {};
      throw new PermissionDenied();
    }
  }
  // temp_otps / email_deliveries / email_log / email_delivery_limits + global safety net
  throw new PermissionDenied();
}

module.exports = { check, PermissionDenied, isUsableAccount, isApproved, isAdmin };

