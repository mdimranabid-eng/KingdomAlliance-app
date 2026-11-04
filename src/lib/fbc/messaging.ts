// Zero-Firebase local compatibility layer for firebase/messaging.
// Real-time notifications and chat are managed entirely by Hostinger via Node/Express + MySQL
// and standard browser Notification API.

export interface MessagePayload {
  notification?: {
    title?: string;
    body?: string;
    icon?: string;
  };
  data?: Record<string, string>;
}

export function getMessaging(_app?: any): any {
  return null;
}

export async function getToken(_messaging?: any, _options?: any): Promise<string> {
  // FCM tokens are no longer used; native browser Notifications are used instead.
  return '';
}

export async function deleteToken(_messaging?: any): Promise<boolean> {
  return true;
}

export function onMessage(_messaging: any, _nextOrObserver: any): () => void {
  return () => {};
}

export function isSupported(): Promise<boolean> {
  return Promise.resolve(false);
}

