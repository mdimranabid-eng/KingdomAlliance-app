import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../lib/AuthContext';
import { 
  Save, 
  Palette, 
  Type, 
  Globe, 
  Phone, 
  Mail, 
  ShieldCheck, 
  MessageSquare, 
  Bell, 
  Layout, 
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'motion/react';
import CONFIG from '../../config';

export default function AdminSettings() {
  const { isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [settings, setSettings] = useState({
    siteName: CONFIG.siteName,
    siteTagline: CONFIG.siteTagline,
    supportEmail: CONFIG.supportEmail,
    supportPhone: CONFIG.supportPhone,
    primaryColor: CONFIG.theme.primaryColor,
    secondaryColor: CONFIG.theme.secondaryColor,
    enableChat: CONFIG.features.enableChat,
    enableNotifications: CONFIG.features.enableNotifications,
    requireAdminApproval: CONFIG.features.requireAdminApproval,
    minAge: CONFIG.minAge,
    cloudinaryCloudName: '',
    cloudinaryUploadPreset: '',
  });

  useEffect(() => {
    if (!isAdmin) return;

    // Load existing settings from Firestore
    const unsubscribe = onSnapshot(doc(db, 'settings', 'site_config'), (docSnap) => {
      if (docSnap.exists()) {
        setSettings(prev => ({ ...prev, ...docSnap.data() }));
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [isAdmin]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    try {
      await setDoc(doc(db, 'settings', 'site_config'), {
        ...settings,
        updatedAt: new Date(),
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Failed to save settings. Check your Firebase permissions.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-3xl text-on-surface">Site Settings</h1>
          <p className="text-on-surface-variant">Manage your brand identity and platform features</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-primary text-on-primary px-8 py-3 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {success ? "Saved!" : "Save Changes"}
        </button>
      </div>

      {success && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-green-100 text-green-700 rounded-2xl border border-green-200 flex items-center gap-3"
        >
          <CheckCircle2 className="w-5 h-5" />
          Settings updated successfully! The changes are now live.
        </motion.div>
      )}

      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Branding Section */}
        <section className="bg-surface-container rounded-[2rem] p-8 border border-outline-variant space-y-6">
          <h3 className="font-headline text-xl flex items-center gap-3 text-primary">
            <Layout className="w-6 h-6" /> Branding
          </h3>
          
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Site Name</label>
              <input 
                type="text" 
                value={settings.siteName} 
                onChange={e => setSettings({...settings, siteName: e.target.value})}
                className="w-full p-3 bg-surface rounded-xl border border-outline-variant outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Tagline</label>
              <textarea 
                rows={2}
                value={settings.siteTagline} 
                onChange={e => setSettings({...settings, siteTagline: e.target.value})}
                className="w-full p-3 bg-surface rounded-xl border border-outline-variant outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </section>

        {/* Theme Section */}
        <section className="bg-surface-container rounded-[2rem] p-8 border border-outline-variant space-y-6">
          <h3 className="font-headline text-xl flex items-center gap-3 text-secondary">
            <Palette className="w-6 h-6" /> Visual Theme
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Primary Color</label>
              <div className="flex gap-2">
                <input 
                  type="color" 
                  value={settings.primaryColor} 
                  onChange={e => setSettings({...settings, primaryColor: e.target.value})}
                  className="w-12 h-12 rounded-lg cursor-pointer border-2 border-outline-variant"
                />
                <input 
                  type="text" 
                  value={settings.primaryColor} 
                  onChange={e => setSettings({...settings, primaryColor: e.target.value})}
                  className="flex-1 p-2 bg-surface rounded-lg border border-outline-variant text-sm font-mono"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Secondary Color</label>
              <div className="flex gap-2">
                <input 
                  type="color" 
                  value={settings.secondaryColor} 
                  onChange={e => setSettings({...settings, secondaryColor: e.target.value})}
                  className="w-12 h-12 rounded-lg cursor-pointer border-2 border-outline-variant"
                />
                <input 
                  type="text" 
                  value={settings.secondaryColor} 
                  onChange={e => setSettings({...settings, secondaryColor: e.target.value})}
                  className="flex-1 p-2 bg-surface rounded-lg border border-outline-variant text-sm font-mono"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="bg-surface-container rounded-[2rem] p-8 border border-outline-variant space-y-6">
          <h3 className="font-headline text-xl flex items-center gap-3 text-on-surface">
            <Mail className="w-6 h-6" /> Contact Info
          </h3>
          
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Support Email</label>
              <input 
                type="email" 
                value={settings.supportEmail} 
                onChange={e => setSettings({...settings, supportEmail: e.target.value})}
                className="w-full p-3 bg-surface rounded-xl border border-outline-variant outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Support Phone</label>
              <input 
                type="tel" 
                value={settings.supportPhone} 
                onChange={e => setSettings({...settings, supportPhone: e.target.value})}
                className="w-full p-3 bg-surface rounded-xl border border-outline-variant outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-surface-container rounded-[2rem] p-8 border border-outline-variant space-y-6">
          <h3 className="font-headline text-xl flex items-center gap-3 text-on-surface">
            <ShieldCheck className="w-6 h-6" /> Feature Controls
          </h3>
          
          <div className="space-y-4">
            <label className="flex items-center justify-between p-3 bg-surface rounded-xl border border-outline-variant cursor-pointer group">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-primary" />
                <span className="text-sm font-bold">Enable Chat</span>
              </div>
              <input 
                type="checkbox" 
                checked={settings.enableChat} 
                onChange={e => setSettings({...settings, enableChat: e.target.checked})}
                className="w-5 h-5 accent-primary"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-surface rounded-xl border border-outline-variant cursor-pointer group">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-secondary" />
                <span className="text-sm font-bold">Require Admin Approval</span>
              </div>
              <input 
                type="checkbox" 
                checked={settings.requireAdminApproval} 
                onChange={e => setSettings({...settings, requireAdminApproval: e.target.checked})}
                className="w-5 h-5 accent-secondary"
              />
            </label>

            <div className="space-y-1 pt-2">
              <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Minimum Age</label>
              <input 
                type="number" 
                value={settings.minAge} 
                onChange={e => setSettings({...settings, minAge: parseInt(e.target.value)})}
                className="w-full p-3 bg-surface rounded-xl border border-outline-variant outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </section>

        {/* Cloud Storage Section */}
        <section className="bg-surface-container rounded-[2rem] p-8 border border-outline-variant space-y-6 md:col-span-2">
          <h3 className="font-headline text-xl flex items-center gap-3 text-on-surface">
            <Globe className="w-6 h-6" /> Cloud Storage (Cloudinary)
          </h3>
          <p className="text-sm text-on-surface-variant -mt-4">
            Use Cloudinary to avoid Firebase Storage limits. Get these from your Cloudinary dashboard.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Cloud Name</label>
              <input 
                type="text" 
                placeholder="e.g. dxyz123"
                value={settings.cloudinaryCloudName} 
                onChange={e => setSettings({...settings, cloudinaryCloudName: e.target.value})}
                className="w-full p-3 bg-surface rounded-xl border border-outline-variant outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Upload Preset (Unsigned)</label>
              <input 
                type="text" 
                placeholder="e.g. ml_default"
                value={settings.cloudinaryUploadPreset} 
                onChange={e => setSettings({...settings, cloudinaryUploadPreset: e.target.value})}
                className="w-full p-3 bg-surface rounded-xl border border-outline-variant outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </section>
      </form>
    </div>
  );
}
