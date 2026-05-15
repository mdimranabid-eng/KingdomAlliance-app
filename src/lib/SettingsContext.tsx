import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import DEFAULT_CONFIG from '../config';

interface Settings {
  siteName: string;
  siteTagline: string;
  supportEmail: string;
  supportPhone: string;
  primaryColor: string;
  secondaryColor: string;
  enableChat: boolean;
  enableNotifications: boolean;
  requireAdminApproval: boolean;
  minAge: number;
  cloudinaryCloudName: string;
  cloudinaryUploadPreset: string;
}

interface SettingsContextType {
  settings: Settings;
  loading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>({
    siteName: DEFAULT_CONFIG.siteName,
    siteTagline: DEFAULT_CONFIG.siteTagline,
    supportEmail: DEFAULT_CONFIG.supportEmail,
    supportPhone: DEFAULT_CONFIG.supportPhone,
    primaryColor: DEFAULT_CONFIG.theme.primaryColor,
    secondaryColor: DEFAULT_CONFIG.theme.secondaryColor,
    enableChat: DEFAULT_CONFIG.features.enableChat,
    enableNotifications: DEFAULT_CONFIG.features.enableNotifications,
    requireAdminApproval: DEFAULT_CONFIG.features.requireAdminApproval,
    minAge: DEFAULT_CONFIG.minAge,
    cloudinaryCloudName: DEFAULT_CONFIG.cloudinaryCloudName || '',
    cloudinaryUploadPreset: DEFAULT_CONFIG.cloudinaryUploadPreset || '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for real-time settings updates from Firestore
    const unsubscribe = onSnapshot(doc(db, 'settings', 'site_config'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setSettings(prev => ({
          ...prev,
          ...data,
          // Explicitly preserve Cloudinary settings if Firestore doesn't have them
          cloudinaryCloudName: data.cloudinaryCloudName || prev.cloudinaryCloudName,
          cloudinaryUploadPreset: data.cloudinaryUploadPreset || prev.cloudinaryUploadPreset,
        }));
        
        // Apply theme colors to CSS variables dynamically
        if (data.primaryColor) {
          document.documentElement.style.setProperty('--primary', data.primaryColor);
        }
        if (data.secondaryColor) {
          document.documentElement.style.setProperty('--secondary', data.secondaryColor);
        }
        if (data.siteName) {
          document.title = data.siteName;
        }
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
