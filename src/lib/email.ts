import { auth } from './firebase';

interface EmailPayload {
  interestId: string;
  type: 'connection_request' | 'connection_accepted';
}

export const sendEmail = async (payload: EmailPayload): Promise<void> => {
  if (!auth.currentUser) throw new Error('Please sign in to send notifications.');
  const token = await auth.currentUser.getIdToken();
  const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
  const response = await fetch(`${backendUrl}/api/send-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || `Unable to send notification (${response.status}).`);
  }
};
