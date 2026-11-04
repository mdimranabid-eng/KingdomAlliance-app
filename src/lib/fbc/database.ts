// Firebase Realtime Database compatibility layer for presence + typing.
// The API sweeps stale entries (presence TTL 45s, typing TTL 8s), which covers
// onDisconnect semantics; clients just heartbeat and poll.
import { request } from './api';
import { Timestamp } from './firestore';

export const getDatabase = (_app?: any) => ({ __rtdb: true }) as any;
export const serverTimestamp = () => ({ __st: 1 }) as any;

export interface RtdbRef { kind: 'rtdb'; path: string; }

export function ref(_rtdb: any, path: string): RtdbRef {
  return { kind: 'rtdb', path: String(path || '').replace(/^\/+/, '') };
}

// ── heartbeats ────────────────────────────────────────────────────────────────
const activeHeartbeats = new Map<string, any>(); // uid → interval

function startHeartbeat(uid: string): void {
  if (activeHeartbeats.has(uid)) return;
  const beat = () => request('POST', `/presence/${uid}`, { state: 'online' }).catch(() => undefined);
  beat();
  activeHeartbeats.set(uid, setInterval(beat, 20000));
}

function stopHeartbeat(uid: string): void {
  const t = activeHeartbeats.get(uid);
  if (t) { clearInterval(t); activeHeartbeats.delete(uid); }
}

// ── write ops ─────────────────────────────────────────────────────────────────
export async function set(r: RtdbRef, value: any): Promise<void> {
  if (r.path.startsWith('status/')) {
    const uid = r.path.split('/')[1];
    const state = value && typeof value === 'object' ? String(value.state || 'offline') : String(value);
    await request('POST', `/presence/${uid}`, { state });
    if (state === 'online') startHeartbeat(uid); else stopHeartbeat(uid);
    return;
  }
  if (r.path.startsWith('typingStatus/')) {
    const segs = r.path.split('/');
    const chatId = segs[1];
    const uid = segs[2];
    if (!chatId || !uid) return;
    await request('POST', `/typing/${chatId}`, { value: !!value });
    return;
  }
}

export async function remove(r: RtdbRef): Promise<void> {
  if (r.path.startsWith('status/')) {
    const uid = r.path.split('/')[1];
    stopHeartbeat(uid);
    await request('DELETE', `/presence/${uid}`).catch(() => undefined);
    return;
  }
  if (r.path.startsWith('typingStatus/')) {
    const segs = r.path.split('/');
    const chatId = segs[1];
    const uid = segs[2];
    if (chatId && uid) await request('POST', `/typing/${chatId}`, { value: false }).catch(() => undefined);
    return;
  }
}

// onDisconnect is covered by the server-side sweep (stale online → offline,
// typing rows expire). Kept as a no-op promise API for signature compatibility.
export function onDisconnect(r: RtdbRef): any {
  return {
    async set(_value: any): Promise<void> { void r; },
    async remove(): Promise<void> { void r; },
    async cancel(): Promise<void> { void r; },
  };
}

// ── subscriptions ─────────────────────────────────────────────────────────────
const POLL_MS = 10000;

export function onValue(r: RtdbRef, cb: (snap: { val: () => any }) => void): () => void {
  const emit = (v: any) => cb({ val: () => v });

  if (r.path === '.info/connected') {
    emit(true);
    const t = setInterval(() => emit(true), 30000);
    return () => clearInterval(t);
  }

  if (r.path.startsWith('status/')) {
    const uid = r.path.split('/')[1];
    let timer: any = null;
    const poll = async () => {
      try {
        const states = await request<Record<string, any>>('GET', `/presence?uids=${encodeURIComponent(uid)}`);
        const s = states[uid];
        emit(s ? { state: s.state, last_changed: s.last_changed ? Timestamp.fromMillis(s.last_changed) : null } : null);
      } catch { /* offline — keep last value */ }
      timer = setTimeout(poll, POLL_MS);
    };
    poll();
    return () => { if (timer) clearTimeout(timer); };
  }

  if (r.path.startsWith('typingStatus/')) {
    const chatId = r.path.split('/')[1];
    let timer: any = null;
    const poll = async () => {
      try {
        const map = await request<Record<string, boolean>>('GET', `/typing/${encodeURIComponent(chatId)}`);
        emit(map || {});
      } catch { /* ignore */ }
      timer = setTimeout(poll, 3000);
    };
    poll();
    return () => { if (timer) clearTimeout(timer); };
  }

  // unknown path: emit null once
  emit(null);
  return () => undefined;
}
