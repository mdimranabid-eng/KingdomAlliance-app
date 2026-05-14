import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useSearchParams, useNavigate } from 'react-router-dom';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  serverTimestamp, 
  doc, 
  getDoc, 
  getDocs,
  limit,
  setDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { Send, User, ChevronLeft, Phone, Video, Info, Search, Heart, MessageCircle } from 'lucide-react';
import { cn, handleFirestoreError, OperationType } from '../lib/utils';

export default function MessagesPage() {
  const { id: activeChatUserId } = useParams();
  const [searchParams] = useSearchParams();
  const chatWithQuery = searchParams.get('chatWith');
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  
  const [messages, setMessages] = useState<any[]>([]);
  const [activeChatUser, setActiveChatUser] = useState<any | null>(null);
  const [chats, setChats] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // If chatWith query param exists, redirect to the actual channel if allowed
  useEffect(() => {
    if (chatWithQuery) {
      navigate(`/messages/${chatWithQuery}`, { replace: true });
    }
  }, [chatWithQuery, navigate]);

  // Fetch all chats/matches
  useEffect(() => {
    if (!currentUser) return;

    // In a real app, we'd have a 'chats' collection. 
    // Here we'll derive it from 'interests' that are 'accepted' or just interactions.
    // For simplicity, let's look for accepted interests
    const q = query(
      collection(db, 'interests'),
      where('status', '==', 'accepted'),
      where('fromId', '==', currentUser.uid)
    );
    const q2 = query(
      collection(db, 'interests'),
      where('status', '==', 'accepted'),
      where('toId', '==', currentUser.uid)
    );

    const fetchChats = async () => {
      const [s1, s2] = await Promise.all([getDocs(q), getDocs(q2)]);
      const otherUserIds = new Set<string>();
      s1.docs.forEach(d => otherUserIds.add(d.data().toId));
      s2.docs.forEach(d => otherUserIds.add(d.data().fromId));

      const chatList: any[] = [];
      for (const uid of otherUserIds) {
        const uDoc = await getDoc(doc(db, 'users', uid));
        if (uDoc.exists()) {
          chatList.push({ id: uDoc.id, ...uDoc.data() });
        }
      }
      setChats(chatList);
      setLoading(false);
    };

    fetchChats();
  }, [currentUser]);

  // Fetch active chat user
  useEffect(() => {
    if (!activeChatUserId) {
      setActiveChatUser(null);
      setMessages([]);
      return;
    }

    async function fetchUser() {
      const uDoc = await getDoc(doc(db, 'users', activeChatUserId!));
      if (uDoc.exists()) setActiveChatUser({ id: uDoc.id, ...uDoc.data() });
    }
    fetchUser();

    // Set up real-time message listener
    const chatId = [currentUser?.uid, activeChatUserId].sort().join('_');
    const msgsQuery = query(
      collection(db, `chats/${chatId}/messages`),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(msgsQuery, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, `chats/${chatId}/messages`);
    });

    return unsubscribe;
  }, [activeChatUserId, currentUser]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser || !activeChatUserId) return;

    const chatId = [currentUser.uid, activeChatUserId].sort().join('_');
    const msgData = {
      text: newMessage,
      senderId: currentUser.uid,
      createdAt: serverTimestamp(),
      chatId
    };

    setNewMessage('');
    try {
      await addDoc(collection(db, `chats/${chatId}/messages`), msgData);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `chats/${chatId}/messages`);
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex bg-surface-container-lowest rounded-[2.5rem] border border-outline-variant overflow-hidden shadow-2xl">
      {/* Sidebar - Chat List */}
      <aside className={cn(
        "w-full md:w-80 border-r border-outline-variant flex flex-col transition-all duration-300",
        activeChatUserId ? "hidden md:flex" : "flex"
      )}>
        <div className="p-6 border-b border-outline-variant space-y-4">
          <h2 className="font-headline text-2xl text-on-surface">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
            <input 
              type="text" 
              placeholder="Search conversations..."
              className="w-full pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center text-on-surface-variant">Loading chats...</div>
          ) : chats.length === 0 ? (
            <div className="p-12 text-center space-y-4">
              <MessageCircle className="w-12 h-12 text-on-surface-variant/30 mx-auto" />
              <p className="text-sm text-on-surface-variant">No conversations yet. Start by sending an interest to matches!</p>
              <Link to="/matches" className="inline-block text-primary font-bold text-sm underline">Find Matches</Link>
            </div>
          ) : (
            <div className="divide-y divide-outline-variant/30">
              {chats.map((chat) => (
                <Link
                  key={chat.id}
                  to={`/messages/${chat.id}`}
                  className={cn(
                    "flex items-center gap-4 p-4 hover:bg-surface-variant transition-colors",
                    activeChatUserId === chat.id && "bg-primary/5"
                  )}
                >
                  <div className="w-12 h-12 rounded-full border border-primary-container overflow-hidden flex-shrink-0">
                    <img src={chat.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${chat.id}`} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <h4 className="font-bold text-on-surface truncate">{chat.name}</h4>
                      <span className="text-[10px] text-on-surface-variant">12:45 PM</span>
                    </div>
                    <p className="text-xs text-on-surface-variant truncate">Click to start chatting</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className={cn(
        "flex-1 flex flex-col bg-surface transition-all duration-300",
        !activeChatUserId && "hidden md:flex items-center justify-center text-center p-12 bg-surface-container-low"
      )}>
        {!activeChatUserId ? (
          <div className="max-w-xs space-y-4">
            <div className="w-20 h-20 bg-surface-container rounded-[2rem] flex items-center justify-center mx-auto text-primary/30">
              <MessageCircle className="w-10 h-10" />
            </div>
            <h3 className="font-headline text-2xl text-on-surface">Your Sanctuary for Connection</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Select a conversation to start building a meaningful relationship rooted in faith.
            </p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <header className="h-20 bg-surface border-b border-outline-variant flex items-center justify-between px-6">
              <div className="flex items-center gap-4">
                <Link to="/messages" className="md:hidden p-2 hover:bg-surface-container rounded-lg">
                  <ChevronLeft className="w-6 h-6 text-on-surface" />
                </Link>
                {activeChatUser && (
                  <Link to={`/profile/${activeChatUser.id}`} className="flex items-center gap-3 group">
                    <div className="w-10 h-10 rounded-full border border-primary-container overflow-hidden">
                      <img src={activeChatUser.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${activeChatUser.id}`} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="font-bold text-on-surface group-hover:text-primary transition-colors">{activeChatUser.name}</h4>
                      <p className="text-[10px] text-green-600 font-bold uppercase tracking-widest">Active Now</p>
                    </div>
                  </Link>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-surface-container rounded-xl text-on-surface-variant"><Phone className="w-5 h-5" /></button>
                <button className="p-2 hover:bg-surface-container rounded-xl text-on-surface-variant"><Video className="w-5 h-5" /></button>
                <button className="p-2 hover:bg-surface-container rounded-xl text-on-surface-variant"><Info className="w-5 h-5" /></button>
              </div>
            </header>

            {/* Messages List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="flex justify-center mb-8">
                <div className="px-4 py-1.5 bg-surface-container-high rounded-full border border-outline-variant text-[10px] font-label-lg uppercase tracking-widest text-on-surface-variant">
                  Today
                </div>
              </div>

              {messages.map((msg, i) => {
                const isMine = msg.senderId === currentUser?.uid;
                return (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={msg.id}
                    className={cn(
                      "flex flex-col max-w-[80%] space-y-1",
                      isMine ? "ml-auto items-end" : "mr-auto items-start"
                    )}
                  >
                    <div className={cn(
                      "px-4 py-2.5 rounded-2xl shadow-sm text-sm leading-relaxed",
                      isMine 
                        ? "bg-primary text-on-primary rounded-tr-none" 
                        : "bg-surface-container-highest text-on-surface rounded-tl-none border border-outline-variant/30"
                    )}>
                      {msg.text}
                    </div>
                    <span className="text-[10px] text-on-surface-variant opacity-60 px-1">
                      {msg.createdAt ? new Date(msg.createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Sending...'}
                    </span>
                  </motion.div>
                );
              })}
              <div ref={scrollRef} />
            </div>

            {/* Message Input */}
            <div className="p-6 bg-surface border-t border-outline-variant">
              <form 
                onSubmit={handleSendMessage}
                className="flex items-center gap-3 bg-surface-container-low p-2 pr-2 h-14 rounded-2xl border border-outline-variant focus-within:ring-2 focus-within:ring-primary shadow-inner"
              >
                <button type="button" className="p-2 hover:bg-surface-container h-10 w-10 flex items-center justify-center rounded-xl text-on-surface-variant">
                  <Info className="w-5 h-5" />
                </button>
                <input 
                  type="text" 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a blessing..."
                  className="flex-1 bg-transparent border-none outline-none text-sm px-2 font-inter"
                />
                <button 
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="bg-primary text-on-primary h-10 px-6 rounded-xl font-label-lg hover:shadow-lg transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
                >
                  <span className="hidden sm:inline">Send</span>
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
