import React, { useState } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, getDocs, addDoc, serverTimestamp, where } from 'firebase/firestore';
import { motion } from 'motion/react';
import { Send, Users, ShieldCheck, Mail, Info, Megaphone, Loader2 } from 'lucide-react';
import { cn, handleFirestoreError, OperationType } from '../../lib/utils';

export default function AdminAnnouncements() {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [target, setTarget] = useState<'all' | 'unverified' | 'active'>('all');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      // In a real app, this would trigger a Cloud Function to send actual emails.
      // Here we'll log the intention in an 'announcements' collection.
      await addDoc(collection(db, 'announcements'), {
        subject,
        message,
        target,
        sentAt: serverTimestamp(),
        status: 'queued'
      });

      setSuccess(true);
      setSubject('');
      setMessage('');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'announcements');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-headline text-4xl text-on-surface">Community Announcements</h1>
        <p className="text-on-surface-variant">Send mass notifications and updates to users</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <form onSubmit={handleSend} className="bg-surface-container-lowest border border-outline-variant rounded-[2.5rem] p-8 lg:p-12 space-y-8 shadow-sm">
            <div className="space-y-4">
              <label className="block font-label-lg text-on-surface uppercase tracking-widest">Target Audience</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button 
                  type="button"
                  onClick={() => setTarget('all')}
                  className={cn(
                    "p-4 rounded-2xl border transition-all flex flex-col items-center gap-2",
                    target === 'all' ? "bg-primary text-on-primary border-primary shadow-lg" : "bg-surface hover:border-primary border-outline-variant text-on-surface-variant"
                  )}
                >
                  <Users className="w-6 h-6" />
                  <span className="text-xs font-bold">All Users</span>
                </button>
                <button 
                  type="button"
                  onClick={() => setTarget('unverified')}
                  className={cn(
                    "p-4 rounded-2xl border transition-all flex flex-col items-center gap-2",
                    target === 'unverified' ? "bg-primary text-on-primary border-primary shadow-lg" : "bg-surface hover:border-primary border-outline-variant text-on-surface-variant"
                  )}
                >
                  <ShieldCheck className="w-6 h-6" />
                  <span className="text-xs font-bold">Unverified</span>
                </button>
                <button 
                  type="button"
                  onClick={() => setTarget('active')}
                  className={cn(
                    "p-4 rounded-2xl border transition-all flex flex-col items-center gap-2",
                    target === 'active' ? "bg-primary text-on-primary border-primary shadow-lg" : "bg-surface hover:border-primary border-outline-variant text-on-surface-variant"
                  )}
                >
                  <Users className="w-6 h-6" />
                  <span className="text-xs font-bold">Active Today</span>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <label className="block font-label-lg text-on-surface uppercase tracking-widest">Announcement Subject</label>
              <input 
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g., Important Security Update"
                className="w-full px-6 py-4 bg-surface border border-outline-variant rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
            </div>

            <div className="space-y-4">
              <label className="block font-label-lg text-on-surface uppercase tracking-widest">Message Content</label>
              <textarea 
                required
                rows={8}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your announcement here..."
                className="w-full px-6 py-4 bg-surface border border-outline-variant rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-primary text-on-primary rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
              Send Announcement Now
            </button>

            {success && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-green-500/10 text-green-500 rounded-2xl border border-green-500/20 flex items-center gap-3"
              >
                <Megaphone className="w-5 h-5" />
                <span className="font-bold">Announcement queued for delivery successfully!</span>
              </motion.div>
            )}
          </form>
        </div>

        <div className="space-y-8">
           <div className="bg-surface-container rounded-3xl p-8 border border-outline-variant shadow-sm space-y-4">
             <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
               <Info className="w-6 h-6 text-primary" />
             </div>
             <h3 className="font-headline text-2xl text-on-surface">Guidelines</h3>
             <ul className="space-y-3">
               {[
                 "Keep subjects clear and professional.",
                 "Use for critical updates or new features.",
                 "Avoid excessive frequency to prevent spam.",
                 "Links are automatically tracked for engagement."
               ].map((text, i) => (
                 <li key={i} className="flex items-start gap-3 text-sm text-on-surface-variant">
                   <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                   {text}
                 </li>
               ))}
             </ul>
           </div>

           <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-8 space-y-6">
              <h3 className="font-label-lg text-on-surface uppercase tracking-widest">Recent Sent</h3>
              <div className="space-y-4">
                <div className="p-4 bg-surface rounded-2xl border border-outline-variant/30">
                  <p className="text-xs text-on-surface-variant mb-1">May 10, 2026</p>
                  <p className="font-bold text-on-surface text-sm">Welcome to Kingdom Alliance</p>
                  <p className="text-[10px] text-primary uppercase font-bold mt-1">Status: Sent (432 users)</p>
                </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
