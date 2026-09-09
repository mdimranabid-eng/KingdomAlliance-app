import React, { useState } from 'react';
import { AlertTriangle, Loader2, LogOut, RotateCcw } from 'lucide-react';
import { auth } from '../lib/firebase';
import { signOut as firebaseSignOut } from 'firebase/auth';
import { KingdomCrossIcon } from './KingdomCrossIcon';

interface AccountDeletionPromptProps {
  scheduledDeletionAtMs?: number;
  onReactivated: () => void;
}

const BACKEND_URL = import.meta.env.DEV ? '' : (import.meta.env.VITE_BACKEND_URL || '');

/**
 * Full-screen prompt shown when a user with a pending account deletion logs in.
 * Gives them the chance to reactivate within the 7-day grace window.
 */
export default function AccountDeletionPrompt({ scheduledDeletionAtMs, onReactivated }: AccountDeletionPromptProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deletionDate = scheduledDeletionAtMs
    ? new Date(scheduledDeletionAtMs).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'within 7 days';

  const handleReactivate = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await auth.currentUser?.getIdToken();
      const response = await fetch(`${BACKEND_URL}/api/reactivate-account`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Reactivation failed.');
      onReactivated();
    } catch (err: any) {
      console.error('Reactivation failed:', err);
      setError(err.message || 'Failed to reactivate. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await firebaseSignOut(auth);
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-200 p-4 font-body">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 md:p-10 text-center">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center">
              <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>
          </div>
        </div>

        <h1 className="font-headline text-2xl md:text-3xl font-bold text-slate-900 mb-3">
          Your Account Is Scheduled For Deletion
        </h1>

        <p className="text-slate-600 mb-2 leading-relaxed">
          You requested to delete your Kingdom Alliance profile.
        </p>
        <p className="text-slate-800 font-bold mb-6">
          Permanent deletion date: <span className="text-red-600">{deletionDate}</span>
        </p>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-900 mb-8 leading-relaxed">
          Changed your mind? You can reactivate your account now and everything
          will be restored exactly as it was — your profile, photos and connections.
          If you do nothing, all your data will be permanently deleted on the date above.
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={handleReactivate}
            disabled={loading}
            className="w-full py-4 bg-primary text-white font-bold rounded-2xl shadow-lg flex items-center justify-center gap-2 hover:opacity-95 transition-opacity disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <RotateCcw className="w-5 h-5" />}
            Reactivate My Account
          </button>
          <button
            onClick={handleSignOut}
            disabled={loading}
            className="w-full py-3 text-slate-500 font-semibold hover:bg-slate-50 rounded-2xl flex items-center justify-center gap-2 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Keep Deletion Scheduled &amp; Sign Out
          </button>
        </div>

        <div className="mt-8 flex justify-center opacity-60">
          <KingdomCrossIcon size="sm" />
        </div>
      </div>
    </div>
  );
}
