// Firebase Auth compatibility layer backed by /api/auth/*.
import {
  request, setTokens, loadTokens, getAccessToken, getRefreshToken, ensureFreshAccessToken,
  setPersistenceMode, onAuthEvent, emitAuthEvent,
} from './api';

// ── User object ───────────────────────────────────────────────────────────────
export class User {
  uid: string;
  email: string | null;
  emailVerified: boolean;
  displayName: string;
  photoURL: string;
  providerData: any[];
  metadata: any;
  stsTokenManager: any;
  mfaEnrolled: boolean;
  admin: boolean;
  secondFactor: string;
  private _claims: any;

  constructor(data: any) {
    this.uid = data.uid;
    this.email = data.email || null;
    this.emailVerified = !!data.emailVerified;
    this.displayName = data.displayName || '';
    this.photoURL = data.photoURL || '';
    this.providerData = data.email ? [{ providerId: data.authProvider === 'google' ? 'google.com' : 'password', uid: data.uid, email: data.email }] : [];
    this.metadata = { creationTime: null, lastSignInTime: null };
    this.stsTokenManager = { refreshToken: null, accessToken: null, expirationTime: null };
    this.mfaEnrolled = !!data.mfaEnrolled;
    this.admin = !!data.admin;
    this.secondFactor = data.secondFactor || '';
    this._claims = null;
  }

  async getIdToken(_force?: boolean): Promise<string> {
    const token = await ensureFreshAccessToken(!!_force);
    if (_force) {
      try { await this.reload(); } catch { /* ignore */ }
    }
    return token || getAccessToken() || '';
  }

  async getIdTokenResult(): Promise<any> {
    if (!this._claims) {
      try {
        const me = await request<any>('GET', '/auth/me');
        this.admin = !!me.admin;
        this.mfaEnrolled = !!me.mfaEnrolled;
        this.secondFactor = me.secondFactor || '';
        this._claims = {
          claims: {
            admin: !!me.admin,
            email: me.email,
            email_verified: !!me.emailVerified,
            sign_in_second_factor: me.secondFactor || '',
            firebase: {
              sign_in_second_factor: me.secondFactor || undefined,
            },
          },
          token: getAccessToken(),
          expirationTime: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        };
      } catch {
        this._claims = {
          claims: {
            admin: this.admin,
            email: this.email,
            email_verified: this.emailVerified,
            sign_in_second_factor: this.secondFactor || '',
            firebase: {
              sign_in_second_factor: this.secondFactor || undefined,
            },
          },
          token: getAccessToken(),
        };
      }
    }
    return this._claims;
  }

  async reload(): Promise<void> {
    const me = await request<any>('GET', '/auth/me');
    this.emailVerified = !!me.emailVerified;
    this.displayName = me.displayName || this.displayName;
    this.photoURL = me.photoURL || this.photoURL;
    this.mfaEnrolled = !!me.mfaEnrolled;
    this.admin = !!me.admin;
    this.secondFactor = me.secondFactor || '';
    this._claims = null;
  }

  toJSON(): any { return { uid: this.uid, email: this.email, emailVerified: this.emailVerified, displayName: this.displayName, photoURL: this.photoURL }; }
}

// ── Auth singleton ────────────────────────────────────────────────────────────
let currentUser: User | null = null;
let initialized = false;

export const getAuth = (_app?: any) => ({ __auth: true, get currentUser() { return currentUser; } });

export function setCurrentUser(data: any, tokens?: { accessToken: string; refreshToken: string }): User {
  if (tokens) setTokens(tokens.accessToken, tokens.refreshToken);
  currentUser = data ? new User(data) : null;
  emitAuthEvent(currentUser);
  return currentUser as User;
}

export function onAuthStateChanged(_auth: any, cb: (u: User | null) => void): () => void {
  const unsub = onAuthEvent(cb);
  if (!initialized) {
    initialized = true;
    (async () => {
      loadTokens();
      if (getAccessToken() && getRefreshToken()) {
        try {
          const data = await request<any>('POST', '/auth/refresh', { refreshToken: getRefreshToken(), accessToken: getAccessToken() });
          setTokens(data.accessToken, data.refreshToken);
          currentUser = new User(data.user);
          emitAuthEvent(currentUser);
          return;
        } catch { setTokens(null, null); }
      }
      emitAuthEvent(null);
    })();
  } else {
    // fire immediately with current state for new subscribers
    Promise.resolve().then(() => cb(currentUser));
  }
  return unsub;
}

// ── Persistence ───────────────────────────────────────────────────────────────
export const browserLocalPersistence = { type: 'LOCAL' };
export const browserSessionPersistence = { type: 'SESSION' };
export async function setPersistence(_auth: any, persistence: any): Promise<void> {
  setPersistenceMode(persistence?.type === 'SESSION');
}


// ── Email/password ────────────────────────────────────────────────────────────
export async function signInWithEmailAndPassword(_auth: any, email: string, password: string): Promise<{ user: User }> {
  try {
    const data = await request<any>('POST', '/auth/login', { email, password });
    if (data.mfaRequired) {
      throw authErr('auth/multi-factor-auth-required', 'Two-factor authentication is required.', {
        ticket: data.ticket,
        uid: data.hint?.uid,
        email: data.hint?.email,
      });
    }
    return { user: setCurrentUser(data.user, { accessToken: data.accessToken, refreshToken: data.refreshToken }) };
  } catch (e: any) {
    if (e.code) throw e;
    throw authErr('auth/network-request-failed', e?.message || 'Network error.');
  }
}

export async function createUserWithEmailAndPassword(_auth: any, email: string, password: string): Promise<{ user: User }> {
  try {
    const data = await request<any>('POST', '/auth/register', { email, password });
    return { user: setCurrentUser(data.user, { accessToken: data.accessToken, refreshToken: data.refreshToken }) };
  } catch (e: any) {
    if (e.code) throw e;
    throw authErr('auth/network-request-failed', e?.message || 'Network error.');
  }
}

export async function sendEmailVerification(_user: any): Promise<void> {
  // Email verification on this stack happens through the OTP email flow.
  return Promise.resolve();
}

export async function updateProfile(user: any, profile: { displayName?: string; photoURL?: string }): Promise<void> {
  const patch: any = {};
  if (profile.displayName !== undefined) patch.fullName = profile.displayName;
  if (profile.photoURL !== undefined) patch.photoUrl = profile.photoURL;
  await request('PATCH', `/fs/users/${user.uid}`, patch);
  if (profile.displayName !== undefined) user.displayName = profile.displayName;
  if (profile.photoURL !== undefined) user.photoURL = profile.photoURL;
}

export async function signOut(_auth?: any): Promise<void> {
  try { await request('POST', '/auth/logout', { refreshToken: getRefreshToken() }); } catch { /* ignore */ }
  setTokens(null, null);
  currentUser = null;
  emitAuthEvent(null);
}

// ── Google sign-in (Google Identity Services — 100% Zero-Firebase) ─────────────
export class GoogleAuthProvider {
  static PROVIDER_ID = 'google.com';
  _customParams: any = {};
  setCustomParameters(p: any): void { this._customParams = { ...this._customParams, ...(p || {}) }; }
}

function loadGsiScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.reject(new Error('Window not available'));
  if ((window as any).google?.accounts?.oauth2) {
    return Promise.resolve();
  }
  return new Promise((resolve, reject) => {
    const existing = document.getElementById('google-jssdk');
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Failed to load Google Identity Services')));
      // In case it already loaded before event listener attached
      if ((window as any).google?.accounts?.oauth2) resolve();
      return;
    }
    const s = document.createElement('script');
    s.id = 'google-jssdk';
    s.src = 'https://accounts.google.com/gsi/client';
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Failed to load Google Identity Services'));
    document.head.appendChild(s);
  });
}

export async function signInWithPopup(_auth: any, _provider: any): Promise<{ user: User }> {
  try {
    await loadGsiScript();
    const clientId =
      (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID ||
      '583391827233-99lkvfsgcbmlssorgj0eatjm1mse61fc.apps.googleusercontent.com';

    const google = (window as any).google;
    if (!google?.accounts?.oauth2) {
      throw authErr('auth/network-request-failed', 'Google Identity Services could not be initialized.');
    }

    const tokenResponse = await new Promise<any>((resolve, reject) => {
      const tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'openid email profile',
        prompt: 'select_account',
        callback: (resp: any) => {
          if (resp.error) {
            reject(authErr('auth/popup-closed-by-user', resp.error_description || resp.error));
          } else {
            resolve(resp);
          }
        },
        error_callback: (err: any) => {
          reject(authErr('auth/popup-closed-by-user', err?.message || 'Google sign-in was closed.'));
        },
      });
      tokenClient.requestAccessToken({ prompt: 'select_account' });
    });

    const accessToken = tokenResponse?.access_token;
    if (!accessToken) {
      throw authErr('auth/invalid-credential', 'Google sign-in did not return an access token.');
    }

    const mode = _provider?._customParams?.mode || undefined;
    const data = await request<any>('POST', '/auth/google', { accessToken, mode });
    return { user: setCurrentUser(data.user, { accessToken: data.accessToken, refreshToken: data.refreshToken }) };
  } catch (e: any) {
    if (e?.code) throw e;
    throw authErr('auth/popup-closed-by-user', e?.message || 'Google sign-in was cancelled.');
  }
}

// ── MFA / TOTP ────────────────────────────────────────────────────────────────
export function multiFactor(user: any): any {
  return {
    enrolledFactors: user?.mfaEnrolled
      ? [{ factorId: 'totp', uid: user.uid, displayName: 'Authenticator' }]
      : [],
    async getSession() { return { __session: true }; },
    async enroll(assertion: any, _displayName?: string) {
      if (assertion?.kind === 'enroll') {
        await request('POST', '/auth/mfa/enroll/confirm', { code: assertion.code });
        await user?.reload?.();
      }
    },
    async unenroll() {
      await request('POST', '/auth/mfa/unenroll');
      if (user) user.mfaEnrolled = false;
    },
  };
}

export const TotpMultiFactorGenerator = {
  FACTOR_ID: 'totp',
  async generateSecret(_session: any): Promise<any> {
    const data = await request<any>('POST', '/auth/mfa/enroll/start');
    return {
      secretKey: data.secret,
      code: () => data.secret,
      qrCodeUri: data.qrCodeUri,
      generateQrCodeUrl: () => data.qrCodeUri,
      toString: () => data.secret,
      secretKeyLength: 20,
    };
  },
  assertionForEnrollment(secret: any, code: string): any {
    return { kind: 'enroll', code, secret };
  },
  assertionForSignIn(_secretOrUid: any, code: string): any {
    return { kind: 'signin', code };
  },
};

export function getMultiFactorResolver(_auth: any, err: any): any {
  const ticket = err?.customData?.ticket;
  const uid = err?.customData?.uid;
  return {
    hints: [{ factorId: 'totp', uid: uid || '' }],
    async resolveSignIn(assertion: any): Promise<{ user: User }> {
      const data = await request<any>('POST', '/auth/mfa/challenge', { ticket, code: assertion?.code });
      return { user: setCurrentUser(data.user, { accessToken: data.accessToken, refreshToken: data.refreshToken }) };
    },
  };
}

// ── Error helper ──────────────────────────────────────────────────────────────
function authErr(code: string, message: string, customData?: any): Error {
  const e: any = new Error(message);
  e.code = code;
  e.customData = customData || {};
  return e;
}
