import React, { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { rtdb } from '../lib/firebase';
import { isUserOnline } from '../lib/utils';

interface OnlineIndicatorProps {
  uid: string;
  initialLastActive?: any;
  showLabel?: boolean;
}

export const OnlineIndicator: React.FC<OnlineIndicatorProps> = ({
  uid,
  initialLastActive,
  showLabel = true,
}) => {
  const [isOnline, setIsOnline] = useState(() => isUserOnline(initialLastActive));

  useEffect(() => {
    if (!uid) return;
    const statusRef = ref(rtdb, `/status/${uid}`);

    const unsubscribe = onValue(statusRef, (snapshot) => {
      const val = snapshot.val();
      if (val && typeof val.state === 'string') {
        setIsOnline(val.state === 'online');
      } else {
        setIsOnline(isUserOnline(initialLastActive));
      }
    });

    return () => {
      unsubscribe();
    };
  }, [uid, initialLastActive]);

  // Keep wrapper in DOM so presence transitions animate cleanly
  return (
    <div className="inline-flex items-center transition-all duration-300">
      {isOnline ? (
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-[0_2px_8px_-2px_rgba(16,185,129,0.25)] transition-all animate-in fade-in zoom-in-95 duration-300"
          title="Active on Kingdom Alliance"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-sm" />
          </span>
          {showLabel && <span className="tracking-wide">Online</span>}
        </span>
      ) : null}
    </div>
  );
};
