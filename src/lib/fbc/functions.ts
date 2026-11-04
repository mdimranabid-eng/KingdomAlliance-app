// Firebase Functions compatibility layer — maps callables to REST endpoints.
import { request } from './api';

export const getFunctions = (_app?: any) => ({ __functions: true }) as any;

const CALLABLE_ROUTES: Record<string, string> = {
  requestOtp: '/otp/request',
  verifyOtp: '/otp/verify',
};

export function httpsCallable(_instance: any, name: string) {
  return async (data: any): Promise<{ data: any }> => {
    const route = CALLABLE_ROUTES[name] || `/fn/${name}`;
    const payload = await request<any>('POST', route, data || {});
    // httpsCallable resolves with { data: ... }
    return { data: payload?.result !== undefined ? payload.result : payload };
  };
}
