import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { collection, collectionGroup, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import toast from 'react-hot-toast';

export const NotificationListener: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const pathnameRef = useRef(location.pathname);

  // Keep location pathname updated in ref to avoid subscribing/unsubscribing on path change
  useEffect(() => {
    pathnameRef.current = location.pathname;
  }, [location.pathname]);

  useEffect(() => {
    if (!user) return;

    let isInitialNotifications = true;
    let isInitialMessages = true;

    // 1. Listen to notifications collection where userId == user.uid and read == false
    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      where('read', '==', false)
    );

    const unsubscribeNotifications = onSnapshot(notificationsQuery, (snapshot) => {
      // Skip initial load
      if (isInitialNotifications) {
        isInitialNotifications = false;
        return;
      }

      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data();
          const type = data.type;

          if (type === 'interest') {
            toast.success("New Connection Request!", {
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
            if (!pathnameRef.current.includes('/messages')) {
              toast("New Message!", {
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

    // 2. Listen to messages subcollections where receiverId == user.uid and read == false
    const messagesQuery = query(
      collectionGroup(db, 'messages'),
      where('receiverId', '==', user.uid),
      where('read', '==', false)
    );

    const unsubscribeMessages = onSnapshot(messagesQuery, (snapshot) => {
      // Skip initial load
      if (isInitialMessages) {
        isInitialMessages = false;
        return;
      }

      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data();
          // Suppress notification if user is on the /messages page
          if (!pathnameRef.current.includes('/messages')) {
            const previewText = data.text 
              ? (data.text.length > 50 ? `${data.text.substring(0, 47)}...` : data.text)
              : 'New Message';

            toast(`New Message: "${previewText}"`, {
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
      });
    }, (error) => {
      console.error("Error listening to messages subcollection:", error);
    });

    return () => {
      unsubscribeNotifications();
      unsubscribeMessages();
    };
  }, [user]);

  return null;
};
export default NotificationListener;
