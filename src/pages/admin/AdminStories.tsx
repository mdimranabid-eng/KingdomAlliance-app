import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../lib/AuthContext';
import {
  Heart,
  CheckCircle2,
  XCircle,
  Trash2,
  Search,
  Filter,
  Clock,
  Sparkles,
  Calendar,
  Mail,
  Loader2,
  ChevronRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn, parseFirestoreDate } from '../../lib/utils';
import toast from 'react-hot-toast';

interface SuccessStory {
  id: string;
  userId: string;
  userEmail?: string;
  coupleNames: string;
  initials?: string;
  story: string;
  text?: string;
  weddingDate?: string;
  photoUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt?: any;
  approvedAt?: any;
  approvedBy?: string;
}

export default function AdminStories() {
  const { user } = useAuth();
  const [stories, setStories] = useState<SuccessStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'success_stories'), (snapshot) => {
      const docs = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      })) as SuccessStory[];

      // Sort newest first
      docs.sort((a, b) => {
        const timeA = parseFirestoreDate(a.createdAt)?.getTime() || 0;
        const timeB = parseFirestoreDate(b.createdAt)?.getTime() || 0;
        return timeB - timeA;
      });

      setStories(docs);
      setLoading(false);
    }, (err) => {
      console.error('Error fetching success stories:', err);
      toast.error('Failed to load success stories');
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const handleApprove = async (story: SuccessStory) => {
    setActionLoadingId(story.id);
    try {
      await updateDoc(doc(db, 'success_stories', story.id), {
        status: 'approved',
        approvedAt: serverTimestamp(),
        approvedBy: user?.email || 'admin'
      });
      toast.success(`Approved testimony for "${story.coupleNames}"!`);
    } catch (err: any) {
      console.error('Error approving story:', err);
      toast.error(err.message || 'Failed to approve story');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (story: SuccessStory) => {
    setActionLoadingId(story.id);
    try {
      await updateDoc(doc(db, 'success_stories', story.id), {
        status: 'rejected',
        rejectedAt: serverTimestamp(),
        rejectedBy: user?.email || 'admin'
      });
      toast.success(`Marked testimony as rejected.`);
    } catch (err: any) {
      console.error('Error rejecting story:', err);
      toast.error(err.message || 'Failed to update story');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (story: SuccessStory) => {
    if (!window.confirm(`Are you sure you want to permanently delete the testimony from "${story.coupleNames}"?`)) {
      return;
    }
    setActionLoadingId(story.id);
    try {
      await deleteDoc(doc(db, 'success_stories', story.id));
      toast.success('Testimony deleted successfully.');
    } catch (err: any) {
      console.error('Error deleting story:', err);
      toast.error(err.message || 'Failed to delete story');
    } finally {
      setActionLoadingId(null);
    }
  };

  const pendingCount = stories.filter(s => s.status === 'pending').length;
  const approvedCount = stories.filter(s => s.status === 'approved').length;

  const filteredStories = stories.filter(s => {
    if (statusFilter !== 'all' && s.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = s.coupleNames?.toLowerCase().includes(q);
      const matchEmail = s.userEmail?.toLowerCase().includes(q);
      const matchStory = (s.story || s.text || '').toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchStory) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* ═══ Header Banner ═══ */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0f1729] via-[#162236] to-[#0f1729] p-6 lg:p-8 border border-[#1a2e4a]/50 shadow-[0_1px_3px_rgba(0,0,0,0.12)]">
        <div className="absolute top-0 right-0 h-48 w-48 rounded-full bg-[#d4af37]/5 blur-3xl pointer-events-none" />
        <div className="relative flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div>
            <nav className="flex items-center gap-1.5 text-[11px] text-[#94a3b8] mb-3">
              <Link to="/admin" className="hover:text-white transition-colors">Dashboard</Link>
              <ChevronRight className="size-3" />
              <span className="text-[#d4af37]">Success Stories & Testimonies</span>
            </nav>
            <h1 className="text-2xl lg:text-3xl font-display font-bold text-white tracking-tight flex items-center gap-3">
              <Sparkles className="w-7 h-7 text-[#d4af37]" />
              Success Stories Moderation
            </h1>
            <p className="text-sm text-[#94a3b8] mt-2 max-w-xl">
              Review, approve, and curate real Christian marriage testimonies submitted by members. Approved stories are showcased publicly on the landing page.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-amber-500/10 border border-amber-500/20 px-4 py-2.5 rounded-xl flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-semibold text-amber-300">{pendingCount} Pending Review</span>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2.5 rounded-xl flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-semibold text-emerald-300">{approvedCount} Live Stories</span>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ Filter & Search Toolbar ═══ */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-[#1a2e4a]/10 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#94a3b8]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by couple names, email, or story..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-[#0f172a] placeholder-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={cn(
                'px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize whitespace-nowrap',
                statusFilter === tab
                  ? 'bg-[#1a2e4a] text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              )}
            >
              {tab} {tab === 'pending' && pendingCount > 0 ? `(${pendingCount})` : ''}
            </button>
          ))}
        </div>
      </div>

      {/* ═══ Stories List ═══ */}
      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#1a2e4a]" />
          <p className="text-xs text-[#94a3b8]">Loading submissions...</p>
        </div>
      ) : filteredStories.length === 0 ? (
        <div className="bg-white border border-[#1a2e4a]/10 rounded-2xl p-12 text-center max-w-lg mx-auto">
          <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto text-amber-600 mb-4">
            <Heart className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-[#0f172a]">No Testimonies Found</h3>
          <p className="text-xs text-[#64748b] mt-1.5">
            {searchQuery ? 'No testimonies match your current search query.' : 'There are currently no success story submissions in this category.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredStories.map((story) => {
            const dateObj = parseFirestoreDate(story.createdAt);
            const dateStr = dateObj ? dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently';
            const isProcessing = actionLoadingId === story.id;
            const content = story.story || story.text || '';

            return (
              <div
                key={story.id}
                className={cn(
                  'bg-white border rounded-2xl p-5 sm:p-6 transition-all duration-200 flex flex-col justify-between shadow-sm',
                  story.status === 'pending' ? 'border-amber-300 ring-2 ring-amber-100' :
                  story.status === 'approved' ? 'border-emerald-200' : 'border-slate-200 opacity-75'
                )}
              >
                <div>
                  {/* Top Bar with Avatar and Status */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#f5e6de] to-[#f8ece6] text-[#b3804c] font-bold text-sm flex items-center justify-center border border-[#d4af37]/20 flex-shrink-0">
                        {story.initials || '💍'}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-[#0f172a] leading-tight">
                          {story.coupleNames}
                        </h3>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-[#64748b]">
                          {story.userEmail && (
                            <span className="flex items-center gap-1">
                              <Mail className="size-3" /> {story.userEmail}
                            </span>
                          )}
                          <span>•</span>
                          <span>{dateStr}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      {story.status === 'pending' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-amber-100 text-amber-800 border border-amber-200">
                          <Clock className="size-3" /> Pending
                        </span>
                      )}
                      {story.status === 'approved' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="size-3" /> Live
                        </span>
                      )}
                      {story.status === 'rejected' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-slate-100 text-slate-700 border border-slate-200">
                          <XCircle className="size-3" /> Rejected
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Wedding Date if provided */}
                  {story.weddingDate && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-900 rounded-lg text-xs font-semibold mb-3">
                      <Calendar className="size-3.5 text-amber-600" />
                      <span>{story.weddingDate}</span>
                    </div>
                  )}

                  {/* Story Text */}
                  <blockquote className="text-xs sm:text-sm text-slate-700 leading-relaxed italic bg-slate-50/80 rounded-xl p-4 border border-slate-100 mb-4 whitespace-pre-wrap">
                    "{content}"
                  </blockquote>
                </div>

                {/* Bottom Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {story.status !== 'approved' && (
                      <button
                        onClick={() => handleApprove(story)}
                        disabled={isProcessing}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                      >
                        {isProcessing ? <Loader2 className="size-3.5 animate-spin" /> : <CheckCircle2 className="size-3.5" />}
                        Approve for Public
                      </button>
                    )}
                    {story.status !== 'rejected' && (
                      <button
                        onClick={() => handleReject(story)}
                        disabled={isProcessing}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                      >
                        <XCircle className="size-3.5" />
                        Reject
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => handleDelete(story)}
                    disabled={isProcessing}
                    className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors text-xs font-medium"
                    title="Delete permanently"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

