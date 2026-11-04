// Firebase-compat API client. Talks to the Node/MySQL backend (/api).
const API_URL: string = (import.meta as any).env?.VITE_API_URL || '/api';

const LS_ACCESS = 'ka_access_token';
const LS_REFRESH = 'ka_refresh_token';

let accessToken: string | null = null;
let refreshToken: string | null = null;
let useSessionStore = false;

type Listener = (user: any | null) => void;
const listeners = new Set<Listener>();

function storage(): Storage {
  return useSessionStore ? sessionStorage : localStorage;
}

export function loadTokens(): void {
  accessToken = localStorage.getItem(LS_ACCESS) || sessionStorage.getItem(LS_ACCESS);
  refreshToken = localStorage.getItem(LS_REFRESH) || sessionStorage.getItem(LS_REFRESH);
  useSessionStore = !localStorage.getItem(LS_ACCESS) && !!sessionStorage.getItem(LS_ACCESS);
}

export function setTokens(access: string | null, refresh: string | null, session = false): void {
  storage().removeItem(LS_ACCESS);
  storage().removeItem(LS_REFRESH);
  if (!session) { sessionStorage.removeItem(LS_ACCESS); sessionStorage.removeItem(LS_REFRESH); }
  useSessionStore = session;
  accessToken = access;
  refreshToken = refresh;
  if (access && refresh) {
    storage().setItem(LS_ACCESS, access);
    storage().setItem(LS_REFRESH, refresh);
  }
}

export const getAccessToken = () => accessToken;
export const getRefreshToken = () => refreshToken;
export function setPersistenceMode(session: boolean): void {
  if (session === useSessionStore) return;
  const acc = accessToken; const ref = refreshToken;
  setTokens(null, null, session);
  accessToken = acc; refreshToken = ref;
  useSessionStore = session;
  if (acc && ref) { storage().setItem(LS_ACCESS, acc); storage().setItem(LS_REFRESH, ref); }
}

export function onAuthEvent(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
export function emitAuthEvent(user: any | null): void {
  listeners.forEach((fn) => { try { fn(user); } catch { /* listener error */ } });
}

export class ApiError extends Error {
  code: string;
  status: number;
  constructor(code: string, message: string, status = 400) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

async function tryRefresh(): Promise<boolean> {
  if (!refreshToken) loadTokens();
  if (!refreshToken) return false;
  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken, accessToken }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    setTokens(data.accessToken, data.refreshToken, useSessionStore);
    return true;
  } catch {
    return false;
  }
}

function isTokenExpiringSoon(token: string | null): boolean {
  if (!token) return true;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    if (!payload.exp) return false;
    return payload.exp * 1000 < Date.now() + 60_000;
  } catch {
    return true;
  }
}

export async function ensureFreshAccessToken(force = false): Promise<string> {
  if (!accessToken) loadTokens();
  if ((force || isTokenExpiringSoon(accessToken)) && refreshToken) {
    await tryRefresh();
  }
  return accessToken || '';
}

export async function request<T = any>(method: string, path: string, body?: any, opts: { auth?: boolean; retry?: boolean } = {}): Promise<T> {
  const headers: Record<string, string> = {};
  if (body !== undefined && !(body instanceof FormData)) headers['Content-Type'] = 'application/json';
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (res.status === 401 && opts.retry !== false && accessToken) {
    if (await tryRefresh()) return request<T>(method, path, body, { ...opts, retry: false });
  }
  let data: any = null;
  try { data = await res.json(); } catch { data = null; }
  if (!res.ok) {
    const err = data?.error;
    const code = typeof err === 'string' ? err : err?.code || `http/${res.status}`;
    const message = typeof err === 'string' ? err : err?.message || res.statusText;
    throw new ApiError(code, message, res.status);
  }
  return data as T;
}

export const api = { request, API_URL };
