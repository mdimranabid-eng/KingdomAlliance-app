// Zero-Firebase local compatibility layer for firebase/app & firebase/app-check.
// All app state and credentials are managed directly by Hostinger Node/Express + MySQL.

export interface FirebaseApp {
  name: string;
  options: Record<string, any>;
  automaticDataCollectionEnabled: boolean;
}

const defaultApp: FirebaseApp = {
  name: '[DEFAULT]',
  options: {},
  automaticDataCollectionEnabled: false,
};

export function initializeApp(options: Record<string, any> = {}, name = '[DEFAULT]'): FirebaseApp {
  return { name, options, automaticDataCollectionEnabled: false };
}

export function getApp(_name?: string): FirebaseApp {
  return defaultApp;
}

export function getApps(): FirebaseApp[] {
  return [defaultApp];
}

export function deleteApp(_app: FirebaseApp): Promise<void> {
  return Promise.resolve();
}

// App-check dummy stub
export function initializeAppCheck(_app?: any, _options?: any): any {
  return {};
}

export class ReCaptchaV3Provider {
  constructor(_siteKey: string) {}
}

export class CustomProvider {
  constructor(_options: any) {}
}
