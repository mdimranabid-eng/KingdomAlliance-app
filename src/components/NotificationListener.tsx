import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import toast from 'react-hot-toast';

export const NotificationListener: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const pathnameRef = useRef(location.pathname);
  const seenNotificationIds = useRef(new Set<string>());

  // Keep location pathname updated in ref to avoid subscribing/unsubscribing on path change
  useEffect(() => {
    pathnameRef.current = location.pathname;
  }, [location.pathname]);

  useEffect(() => {
    if (!user || isAdmin) return;

    let isInitialNotifications = true;

    // Listen to notifications collection where userId == user.uid and read == false
    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      where('read', '==', false)
    );

    const unsubscribeNotifications = onSnapshot(notificationsQuery, (snapshot) => {
      // Skip initial load fetch to prevent massive wave of toasts for old notifications
      if (isInitialNotifications) {
        isInitialNotifications = false;
        snapshot.docs.forEach((d) => seenNotificationIds.current.add(d.id));
        return;
      }

      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const docId = change.doc.id;
          if (seenNotificationIds.current.has(docId)) {
            return;
          }
          seenNotificationIds.current.add(docId);

          const data = change.doc.data();
          const type = data.type;

          // Trigger native OS/browser notification only once per notification event if tab is in background
          if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted' && document.hidden) {
            try {
              const tag = `ka-${data.chatId || data.fromId || docId}`;
              new Notification(data.title || 'Kingdom Alliance', {
                body: data.message || 'You have a new update.',
                icon: '/images/logo.png',
                tag,
              });
            } catch {
              // Ignore background notification failure
            }
          }

          if (type === 'interest') {
            toast.success(data.message || data.title || "New Connection Request!", {
              duration: 5000,
              position: 'top-right',
              style: {
                background: 'var(--color-surface-container-lowest, #ffffff)',
                color: 'var(--color-on-surface, #1a2e4a)',
                border: '1px solid var(--color-outline-variant, #e2e8f0)',
                borderRadius: '1rem',
                fontFamily: 'var(--font-sans)',
                boxShadow: '0 10px 40px -10px rgba(26, 46, 74, 0.08)',
              }
            });
          } else if (type === 'accepted') {
            toast.success("Connection Accepted!", {
              duration: 5000,
              position: 'top-right',
              style: {
                background: 'var(--color-surface-container-lowest, #ffffff)',
                color: 'var(--color-on-surface, #1a2e4a)',
                border: '1px solid var(--color-outline-variant, #e2e8f0)',
                borderRadius: '1rem',
                fontFamily: 'var(--font-sans)',
                boxShadow: '0 10px 40px -10px rgba(26, 46, 74, 0.08)',
              }
            });
          } else if (type === 'message') {
            // Chat Suppression Logic: do not show toast if user is actively chatting with this sender
            const activeChatUserIdFromPath = pathnameRef.current.startsWith('/messages/') 
              ? pathnameRef.current.split('/')[2] 
              : null;

            console.log("DEBUG: NotificationListener - activeChatUserIdFromPath:", activeChatUserIdFromPath, "data.fromId:", data.fromId);

            if (activeChatUserIdFromPath !== data.fromId) {
              toast((t) => (
                <div 
                  onClick={() => {
                    if (data.fromId) {
                      navigate(`/messages/${data.fromId}`);
                    }
                    toast.dismiss(t.id);
                  }}
                  className="cursor-pointer flex flex-col w-full text-left"
                >
                  <span className="font-semibold text-sm text-on-surface">{data.title || "New Message"}</span>
                  <span className="text-xs text-on-surface-variant mt-0.5">{data.message}</span>
                </div>
              ), {
                duration: 5000,
                position: 'top-right',
                icon: '💬',
                style: {
                  background: 'var(--color-surface-container-lowest, #ffffff)',
                  color: 'var(--color-on-surface, #1a2e4a)',
                  border: '1px solid var(--color-outline-variant, #e2e8f0)',
                  borderRadius: '1rem',
                  fontFamily: 'var(--font-sans)',
                  boxShadow: '0 10px 40px -10px rgba(26, 46, 74, 0.08)',
                }
              });
            }
          }
        }
      });
    }, (error) => {
      console.error("Error listening to notifications:", error);
    });

    return () => {
      unsubscribeNotifications();
    };
  }, [user]);

  return null;
};

export default NotificationListener;
