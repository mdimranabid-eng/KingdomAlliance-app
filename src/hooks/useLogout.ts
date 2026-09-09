import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { ref, set, serverTimestamp } from 'firebase/database';
import { auth, rtdb } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';

/**
 * Shared logout flow used by the app shell (Layout) and the profile page.
 *
 * 1. Flags the member as `offline` in Realtime Database presence *before* the
 *    auth session is dropped, so other users stop seeing the green dot.
 * 2. Signs the user out of Firebase Auth.
 * 3. Sends them to the home page (`/`).
 */
export const useLogout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const logout = useCallback(async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      // --- EXPLICIT OFFLINE ON LOGOUT START ---
      try {
        if (user?.uid) {
          const userStatusRef = ref(rtdb, `/status/${user.uid}`);
          await set(userStatusRef, {
            state: 'offline',
            last_changed: serverTimestamp(),
          });
        }
      } catch (error) {
        console.error("Failed to set offline status on logout:", error);
      }
      // --- EXPLICIT OFFLINE ON LOGOUT END ---

      await signOut(auth);
      navigate('/', { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
      setIsLoggingOut(false);
    }
  }, [user, isLoggingOut, navigate]);

  return { logout, isLoggingOut };
};

export default useLogout;
