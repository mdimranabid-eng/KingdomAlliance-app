import React, { useState, useEffect, useRef } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase'; 
import { isUserOnline } from '../lib/utils'; 

export const OnlineIndicator = ({ uid, initialLastActive }: { uid: string, initialLastActive: any }) => {
  const [isOnline, setIsOnline] = useState(isUserOnline(initialLastActive));
  const indicatorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!uid) return;
    let unsubscribe: (() => void) | null = null;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Attach listener just before card becomes visible
          unsubscribe = onSnapshot(doc(db, 'users', uid), (docSnap) => {
            if (docSnap.exists()) {
              setIsOnline(isUserOnline(docSnap.data().lastActive));
            }
          });
        } else {
          // Detach listener to save memory when scrolled away
          if (unsubscribe) {
            unsubscribe();
            unsubscribe = null;
          }
        }
      },
      { rootMargin: '100px' } // Load data 100px before scrolling into view
    );

    if (indicatorRef.current) {
      observer.observe(indicatorRef.current);
    }

    return () => {
      observer.disconnect();
      if (unsubscribe) unsubscribe();
    };
  }, [uid]);

  // Keep existing class names and logic, just attach the ref:
  if (!isOnline) return null;

  return (
    <div ref={indicatorRef}>
      {isOnline && (
        <div className="flex items-center gap-1.5">
          <div className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
          </div>
          <span className="text-xs font-medium text-green-500 tracking-wide">
            Online
          </span>
        </div>
      )}
    </div>
  );
};
