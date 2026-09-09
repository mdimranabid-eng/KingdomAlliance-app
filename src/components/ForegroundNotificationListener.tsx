import { useEffect } from 'react';
import { onMessage, type MessagePayload } from 'firebase/messaging';
import { useNavigate } from 'react-router-dom';
import { messaging } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import toast from 'react-hot-toast';
import { Heart, MessageCircle, Bell } from 'lucide-react';

const toastStyle: React.CSSProperties = {
  background: '#ffffff',
  color: '#4a3521',
  border: '1px solid #e2ddd2',
  borderRadius: '1rem',
  boxShadow: '0 10px 40px -10px rgba(74,53,33,0.18)',
  cursor: 'pointer',
  maxWidth: '360px',
};

/**
 * Listens for FCM messages when the app is in the foreground.
 * Shows an in-app toast notification instead of an OS notification.
 */
export default function ForegroundNotificationListener() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !messaging) return;

    const unsubscribe = onMessage(messaging, (payload: MessagePayload) => {
      const { notification, data } = payload;
      const title = notification?.title || 'Kingdom Alliance';
      const body = notification?.body || '';
      const type = data?.type || '';
      const fromId = data?.fromId || '';

      if (type === 'interest') {
        toast((t) => (
          <div
            onClick={() => {
              if (fromId) navigate(`/profile/${fromId}`);
              toast.dismiss(t.id);
            }}
            className="flex items-center gap-3 w-full"
          >
            <div className="w-9 h-9 rounded-full bg-[#C9A84C]/10 flex items-center justify-center flex-shrink-0">
              <Heart className="w-4 h-4 text-[#C9A84C]" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-sm" style={{ color: '#4a3521' }}>{title}</span>
              <span className="text-xs mt-0.5 truncate" style={{ color: '#8a7a65' }}>{body}</span>
            </div>
          </div>
        ), {
          duration: 6000,
          position: 'top-right',
          style: toastStyle,
        });
      } else if (type === 'accepted') {
        toast((t) => (
          <div
            onClick={() => {
              if (fromId) navigate(`/profile/${fromId}`);
              toast.dismiss(t.id);
            }}
            className="flex items-center gap-3 w-full"
          >
            <div className="w-9 h-9 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
              <Heart className="w-4 h-4 text-green-600" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-sm" style={{ color: '#4a3521' }}>{title}</span>
              <span className="text-xs mt-0.5 truncate" style={{ color: '#8a7a65' }}>{body}</span>
            </div>
          </div>
        ), {
          duration: 6000,
          position: 'top-right',
          style: toastStyle,
        });
      } else if (type === 'message') {
        toast((t) => (
          <div
            onClick={() => {
              if (fromId) navigate(`/messages/${fromId}`);
              toast.dismiss(t.id);
            }}
            className="flex items-center gap-3 w-full"
          >
            <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-sm" style={{ color: '#4a3521' }}>{title}</span>
              <span className="text-xs mt-0.5 truncate" style={{ color: '#8a7a65' }}>{body}</span>
            </div>
          </div>
        ), {
          duration: 6000,
          position: 'top-right',
          style: toastStyle,
        });
      } else {
        toast((t) => (
          <div
            onClick={() => toast.dismiss(t.id)}
            className="flex items-center gap-3 w-full"
          >
            <div className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0">
              <Bell className="w-4 h-4 text-gray-600" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-sm" style={{ color: '#4a3521' }}>{title}</span>
              {body && <span className="text-xs mt-0.5 truncate" style={{ color: '#8a7a65' }}>{body}</span>}
            </div>
          </div>
        ), {
          duration: 5000,
          position: 'top-right',
          style: toastStyle,
        });
      }
    });

    return () => unsubscribe();
  }, [user, navigate]);

  return null;
}
