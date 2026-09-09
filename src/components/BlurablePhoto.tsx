import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { shouldBlurPhoto } from '../lib/utils';
import { Lock } from 'lucide-react';

interface BlurablePhotoProps {
  /** UID of the profile this photo belongs to. */
  targetUid: string;
  /** The real photo URL (e.g. `thumbUrl` or `photoUrl`). */
  src: string;
  /** Optional fallback image when there is no photo (DiceBear avatar). */
  fallbackSrc?: string;
  /** Alt text for the image. */
  alt: string;
  /** Class list forwarded to the <img>. */
  className?: string;
  /**
   * If `true` (default), the parent must already have fetched the profile and
   * pass `profile` to skip the extra Firestore round-trip.
   */
  profile?: any | null;
}

/**
 * Renders `<img src={src}>` but applies a CSS blur + DiceBear avatar when the
 * current viewer is not allowed to see the target user's photo.
 *
 * Connection status is looked up here (in addition to the profile) so the
 * same component works on Matches, Shortlists, Interests, and anywhere else
 * a profile photo is shown — even when the parent has not fetched the full
 * user document.
 */
export function BlurablePhoto({ targetUid, src, fallbackSrc, alt, className, profile: profileProp }: BlurablePhotoProps) {
  const { user: currentUser, isAdmin } = useAuth();
  const [profile, setProfile] = useState<any | null>(profileProp ?? null);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(!profileProp);

  // Hydrate the profile doc if the parent didn't pass it.
  useEffect(() => {
    if (profileProp) {
      setProfile(profileProp);
      return;
    }
    if (!targetUid) return;
    let cancelled = false;
    (async () => {
      try {
        const snap = await getDoc(doc(db, 'users', targetUid));
        if (!cancelled && snap.exists()) {
          setProfile({ id: snap.id, ...snap.data() });
        }
      } catch (err) {
        // Best-effort: if the read fails (e.g. rules), default to public.
        console.warn('[BlurablePhoto] profile lookup failed', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [targetUid, profileProp]);

  // Look up the connection status so an accepted connection unlocks the photo.
  useEffect(() => {
    if (!currentUser?.uid || currentUser.uid === targetUid) {
      setStatus(null);
      return;
    }
    const connectionId = [currentUser.uid, targetUid].sort().join('_');
    let cancelled = false;
    getDoc(doc(db, 'interests', connectionId))
      .then((snap) => {
        if (cancelled) return;
        setStatus(snap.exists() ? (snap.data()?.status ?? null) : null);
      })
      .catch(() => {
        if (!cancelled) setStatus(null);
      });
    return () => { cancelled = true; };
  }, [currentUser?.uid, targetUid]);

  // While we're still hydrating the profile, fall back to the supplied src.
  // This avoids a flash of the DiceBear avatar for owners and admins.
  const blur = !loading && shouldBlurPhoto(
    profile,
    { uid: currentUser?.uid },
    !!isAdmin,
    status
  );

  const effectiveSrc = blur && fallbackSrc ? fallbackSrc : src;

  if (blur) {
    return (
      <div className="relative w-full h-full">
        <img
          src={effectiveSrc}
          alt={alt}
          className={`${className ?? ''} blur-md scale-95`.trim()}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 backdrop-blur-[1px] z-10">
          <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-2 border border-white/30">
            <Lock className="w-5 h-5 text-white" />
          </div>
          <p className="text-white text-[11px] font-semibold text-center leading-tight px-4">
            Photo visible after<br />connection accepted
          </p>
        </div>
      </div>
    );
  }

  return (
    <img
      src={effectiveSrc}
      alt={alt}
      className={className ?? ''}
    />
  );
}

export default BlurablePhoto;
