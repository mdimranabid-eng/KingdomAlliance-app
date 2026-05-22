import { useEffect } from 'react';
import { ref, onValue, onDisconnect, set, serverTimestamp } from 'firebase/database';
import { rtdb } from '../lib/firebase';

export const usePresence = (uid: string | undefined) => {
  useEffect(() => {
    if (!uid) return;

    const userStatusDatabaseRef = ref(rtdb, `/status/${uid}`);
    const connectedRef = ref(rtdb, '.info/connected');

    const unsubscribe = onValue(connectedRef, (snap) => {
      if (snap.val() === true) {
        onDisconnect(userStatusDatabaseRef).set({
          state: 'offline',
          last_changed: serverTimestamp(),
        }).then(() => {
          set(userStatusDatabaseRef, {
            state: 'online',
            last_changed: serverTimestamp(),
          });
        });
      }
    });

    return () => unsubscribe();
  }, [uid]);
};
