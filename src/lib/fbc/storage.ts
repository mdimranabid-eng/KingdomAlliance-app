// Firebase Storage compatibility layer backed by /api/storage + /uploads.
import { request } from './api';

export const getStorage = (_app?: any) => ({ __storage: true }) as any;

export interface StorageRef { kind: 'storage'; path: string; __url?: string; }

export function ref(_storage: any, pathOrUrl: string): StorageRef {
  let path = String(pathOrUrl || '');
  if (path.includes('/uploads/')) path = path.split('/uploads/')[1];
  if (path.startsWith('http')) path = ''; // external URL (legacy)
  return { kind: 'storage', path };
}

export async function uploadBytes(r: StorageRef, data: Blob | File, _opts?: any): Promise<any> {
  if (!r.path) throw Object.assign(new Error('Invalid storage path'), { code: 'storage/invalid-argument' });
  const form = new FormData();
  form.append('path', r.path);
  form.append('file', data instanceof File ? data : new File([data], r.path.split('/').pop() || 'upload', { type: (data as any).type || 'image/jpeg' }));
  const payload = await request<any>('POST', '/storage/upload', form);
  r.__url = payload.url;
  return { ref: r, metadata: { contentType: (data as any).type } };
}

export async function getDownloadURL(r: StorageRef): Promise<string> {
  if (r.__url) return r.__url;
  if (!r.path) throw Object.assign(new Error('Unknown path'), { code: 'storage/object-not-found' });
  const payload = await request<any>('POST', '/storage/url', { path: r.path });
  r.__url = payload.url;
  return payload.url;
}

export async function deleteObject(r: StorageRef): Promise<void> {
  if (!r.path) {
    throw Object.assign(new Error('Object not found'), { code: 'storage/object-not-found' });
  }
  await request('POST', '/storage/delete', { paths: [r.path] });
}
