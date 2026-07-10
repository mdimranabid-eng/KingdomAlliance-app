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
  setDoc,
  updateDoc,
  writeBatch,
  or,
  and
} from 'firebase/firestore';
import { db, rtdb } from '../lib/firebase';
import { ref, set, onValue, onDisconnect, remove, get } from 'firebase/database';
import { useAuth } from '../lib/AuthContext';
import { sendEmail } from '../lib/email';
import { motion, AnimatePresence } from 'motion/react';
import { Send, User, ChevronLeft, Info, Search, Heart, MessageCircle } from 'lucide-react';
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
  const [connectionState, setConnectionState] = useState<any | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isOnline, setIsOnline] = useState(false);

  // If chatWith query param exists, redirect to the actual channel if allowed
  useEffect(() => {
    if (chatWithQuery) {
      navigate(`/messages/${chatWithQuery}`, { replace: true });
    }
  }, [chatWithQuery, navigate]);

  // Auto-clear message notifications
  useEffect(() => {
    if (!currentUser) return;
    const clearMessageNotifications = async () => {
      try {
        const q = query(
          collection(db, 'notifications'),
          where('userId', '==', currentUser.uid),
          where('read', '==', false),
          where('type', '==', 'message')
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          const batch = writeBatch(db);
          snap.docs.forEach(docSnap => {
            batch.update(docSnap.ref, { read: true });
          });
          await batch.commit();
        }
      } catch (err) {
        console.error("Error clearing message notifications:", err);
      }
    };
    clearMessageNotifications();
  }, [currentUser]);

  // Fetch all chats/matches
  // Fetch all chats/matches in real-time
  useEffect(() => {
    if (!currentUser) return;

    const q1 = query(
      collection(db, 'interests'),
      where('status', '==', 'accepted'),
      where('fromId', '==', currentUser.uid)
    );
    const q2 = query(
      collection(db, 'interests'),
      where('status', '==', 'accepted'),
      where('toId', '==', currentUser.uid)
    );

    let unsubUnreads: (() => void)[] = [];
    
    // Function to build and set the chat list
    const updateChatList = async (docs1: any[], docs2: any[]) => {
      // Clear previous unread status listeners
      unsubUnreads.forEach(unsub => unsub());
      unsubUnreads = [];

      const otherUserIds = new Set<string>();
      docs1.forEach(d => otherUserIds.add(d.toId));
      docs2.forEach(d => otherUserIds.add(d.fromId));

      const chatList: any[] = [];
      for (const uid of otherUserIds) {
        const uDoc = await getDoc(doc(db, 'users', uid));
        if (uDoc.exists()) {
          chatList.push({ 
            id: uDoc.id, 
            ...uDoc.data(),
            hasUnread: false // Will be updated by real-time listeners
          });
        }
      }
      
      // Set the initial list first so mapping in snapshots finds existing chats
      setChats(chatList);
      setLoading(false);

      // Now register the real-time unread messages listener for each conversation
      for (const uid of otherUserIds) {
        const chatId = [currentUser.uid, uid].sort().join('_');
        const unreadQ = query(
          collection(db, `chats/${chatId}/messages`),
          where('receiverId', '==', currentUser.uid),
          where('read', '==', false),
          limit(1)
        );

        const unsubUnread = onSnapshot(unreadQ, (snap) => {
          setChats(prev => prev.map(c =>
            c.id === uid ? { ...c, hasUnread: !snap.empty } : c
          ));
        });
        unsubUnreads.push(unsubUnread);
      }
    };

    let snapshotDocs1: any[] = [];
    let snapshotDocs2: any[] = [];

    // Setup real-time listener for accepted interests (sent)
    const unsubQ1 = onSnapshot(q1, (snap1) => {
      snapshotDocs1 = snap1.docs.map(d => d.data());
      updateChatList(snapshotDocs1, snapshotDocs2);
    });

    // Setup real-time listener for accepted interests (received)
    const unsubQ2 = onSnapshot(q2, (snap2) => {
      snapshotDocs2 = snap2.docs.map(d => d.data());
      updateChatList(snapshotDocs1, snapshotDocs2);
    });

    return () => {
      unsubQ1();
      unsubQ2();
      unsubUnreads.forEach(unsub => unsub());
    };
  }, [currentUser?.uid]);

  // Fetch active chat user
  useEffect(() => {
    if (!activeChatUserId) {
      setActiveChatUser(null);
      setMessages([]);
      return;
    }

    async function fetchUser() {
      try {
        const uDoc = await getDoc(doc(db, 'users', activeChatUserId!));
        if (uDoc.exists()) setActiveChatUser({ id: uDoc.id, ...uDoc.data() });
        setChats(prev => prev.map(c => 
          c.id === activeChatUserId 
            ? { ...c, hasUnread: false } 
            : c
        ));
      } catch (err) {
        console.error("DEBUG: Failed to fetch active chat user details:", err);
      }
    }
    fetchUser();

    if (!currentUser?.uid) return;

    // Set up real-time message listener
    const chatId = [currentUser.uid, activeChatUserId].sort().join('_');
    const msgsQuery = query(
      collection(db, `chats/${chatId}/messages`),
      orderBy('createdAt', 'asc')
    );

    console.log(`DEBUG: Setting up messages listener for chatId: ${chatId}`);

    const unsubscribeMessages = onSnapshot(msgsQuery, (snapshot) => {
      console.log(`DEBUG: onSnapshot message event fired for ${chatId}! Total messages:`, snapshot.size);
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
      setMessages(msgs);
    }, (err) => {
      console.error(`DEBUG: onSnapshot message listener failed for ${chatId} with error:`, err);
      handleFirestoreError(err, OperationType.LIST, `chats/${chatId}/messages`);
    });

    // Real-Time Connection Listener & Memory Management
    const q = query(
      collection(db, 'interests'),
      or(
        and(where('fromId', '==', currentUser.uid), where('toId', '==', activeChatUserId)),
        and(where('fromId', '==', activeChatUserId), where('toId', '==', currentUser.uid))
      )
    );
    const unsubConnection = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const docSnap = snapshot.docs[0];
        setConnectionState({ id: docSnap.id, ...docSnap.data() });
      } else {
        setConnectionState({ status: 'none' });
      }
    });

    return () => {
      console.log(`DEBUG: Unsubscribing messages listener for chatId: ${chatId}`);
      unsubscribeMessages();
      unsubConnection();
    };
  }, [activeChatUserId, currentUser?.uid]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!activeChatUserId || !currentUser?.uid) return;
    const sharedChatId = [currentUser.uid, activeChatUserId].sort().join('_');

    // Register disconnect cleanup ONCE when chat opens
    const typingRef = ref(rtdb, `typingStatus/${sharedChatId}/${currentUser.uid}`);
    onDisconnect(typingRef).remove();

    // Listen for other person typing
    const chatTypingRef = ref(rtdb, `typingStatus/${sharedChatId}`);
    const unsubscribe = onValue(chatTypingRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setIsOtherTyping(false);
        return;
      }
      const otherIsTyping = Object.entries(data).some(
        ([uid, value]) => uid !== currentUser.uid && value === true
      );
      setIsOtherTyping(otherIsTyping);
    });

    // Cleanup on unmount or chat change
    return () => {
      unsubscribe();
      set(typingRef, false);
    };
  }, [activeChatUserId, currentUser?.uid]);

  // Mark messages as read when viewing a chat
  useEffect(() => {
    if (!activeChatUserId || !currentUser || messages.length === 0) return;

    const unreadMessages = messages.filter(m => m.receiverId === currentUser.uid && m.read === false);

    if (unreadMessages.length > 0) {
      const chatId = [currentUser.uid, activeChatUserId].sort().join('_');
      unreadMessages.forEach(async (msg) => {
        try {
          await updateDoc(doc(db, `chats/${chatId}/messages`, msg.id), { read: true });
        } catch (err) {
          console.error(`DEBUG: Failed to mark message ${msg.id} as read:`, err);
        }
      });
    }
  }, [messages, activeChatUserId, currentUser?.uid]);

  useEffect(() => {
    if (!activeChatUser?.id) return;

    const statusRef = ref(rtdb, `status/${activeChatUser.id}`);
    const unsubscribe = onValue(statusRef, (snapshot) => {
      const data = snapshot.val();
      setIsOnline(data?.state === 'online');
    });

    return () => unsubscribe();
  }, [activeChatUser?.id]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser || !activeChatUserId) return;

    // Hard Database Gate: Abort immediately if connection state isn't accepted locally
    if (!connectionState || connectionState.status !== 'accepted') {
      return;
    }

    const chatId = [currentUser.uid, activeChatUserId].sort().join('_');
    const msgData = {
      text: newMessage,
      senderId: currentUser.uid,
      receiverId: activeChatUserId,
      createdAt: serverTimestamp(),
      chatId,
      read: false
    };

    setNewMessage('');
    try {
      await addDoc(collection(db, `chats/${chatId}/messages`), msgData);

      // Create a real-time alert for the recipient
      await addDoc(collection(db, 'notifications'), {
        userId: activeChatUserId,
        fromId: currentUser.uid,
        type: 'message',
        title: 'New Message',
        message: `You have a new message from ${currentUser.displayName || 'a member'}`,
        read: false,
        createdAt: serverTimestamp()
      });

      // Fetch recipient email to dispatch notification
      // --- SESSION-BASED EMAIL DIGEST START ---
      // Check recipient's live status in RTDB
      const recipientStatusRef = ref(rtdb, `status/${activeChatUserId}`);
      const statusSnapshot = await get(recipientStatusRef);
      const statusData = statusSnapshot.val();

      // --- DEBUG LOGS START ---
      console.log("DEBUG: Checking status for:", activeChatUserId);
      console.log("DEBUG: Status data:", statusData);

      // Only proceed if recipient is offline
      if (!statusData || statusData.state === 'offline') {
        console.log("DEBUG: Recipient is offline. Checking timestamps...");
        const recipientSnap = await getDoc(
          doc(db, 'users', activeChatUserId)
        );
        if (recipientSnap.exists()) {
          const userData = recipientSnap.data();

          const lastActive = userData?.lastActive?.toMillis() || 0;
          const lastEmailSent = userData?.lastEmailSent?.toMillis() || 0;

          console.log("DEBUG: lastEmailSent:", lastEmailSent, "lastActive:", lastActive);

          // Send ONE email per offline session only
          // lastEmailSent < lastActive means no email sent
          // since they last logged in
          if (lastEmailSent < lastActive) {
            console.log("DEBUG: Condition met. Calling sendEmail...");
            await sendEmail({
              to_email: userData.email,
              type: 'new_message',
              senderName: currentUser.displayName || 'A member'
            });
            await updateDoc(doc(db, 'users', activeChatUserId), {
              lastEmailSent: serverTimestamp()
            });
          } else {
            console.log("DEBUG: Condition failed. Email already sent in this session.");
          }
        }
      } else {
         console.log("DEBUG: Recipient is online. Skipping email.");
      }
      // --- DEBUG LOGS END ---
      // --- SESSION-BASED EMAIL DIGEST END ---
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `chats/${chatId}/messages`);
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex glass-card rounded-[2.5rem] overflow-hidden">
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
              {chats.map((chat) => {
                const isActive = connectionState?.status === 'accepted';
                const isLocked = activeChatUserId === chat.id && !isActive;
                return (
                  <Link
                    key={chat.id}
                    to={`/messages/${chat.id}`}
                    className={cn(
                      "flex items-center gap-4 p-4 hover:bg-surface-variant transition-colors",
                      activeChatUserId === chat.id && "bg-primary/5",
                      isLocked && "opacity-50 grayscale pointer-events-none"
                    )}
                  >
                    <div className="w-12 h-12 rounded-full border border-primary-container overflow-hidden flex-shrink-0">
                      <img src={chat.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${chat.id}`} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <h4 className="font-bold text-on-surface truncate">
                          {chat.name}
                        </h4>
                        {chat.hasUnread && (
                          <span className="w-2.5 h-2.5 rounded-full bg-red-500 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-on-surface-variant truncate">Click to start chatting</p>
                    </div>
                  </Link>
                );
              })}
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
                      <div className="flex items-center">
                        <h4 className="font-bold text-on-surface group-hover:text-primary transition-colors">{activeChatUser.name}</h4>
                        {isOnline && (
                          <span className="relative flex h-2.5 w-2.5 ml-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
                          </span>
                        )}
                      </div>
                      {isOnline && (
                        <p className="text-[10px] text-green-600 font-bold uppercase tracking-widest">
                          Active Now
                        </p>
                      )}
                    </div>
                  </Link>
                )}
              </div>
              <div className="flex items-center gap-2">
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
              {isOtherTyping && (
                <div className="text-sm text-gray-400 italic mb-2 px-4">
                  {activeChatUser?.name || 'Someone'} is typing...
                </div>
              )}
              <div ref={scrollRef} />
            </div>
            {/* Message Input */}
            <div className="p-6 bg-surface border-t border-outline-variant">
              {connectionState?.status === 'accepted' ? (
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
                    onChange={(e) => {
                      // --- TYPING INDICATOR START ---
                      const sharedChatId = [currentUser.uid, activeChatUserId].sort().join('_');
                      const typingRef = ref(rtdb, `typingStatus/${sharedChatId}/${currentUser.uid}`);
                      if (e.target.value.trim().length > 0) {
                        if (!typingTimeoutRef.current) {
                          set(typingRef, true);
                        }
                        if (typingTimeoutRef.current) {
                          clearTimeout(typingTimeoutRef.current);
                        }
                        typingTimeoutRef.current = setTimeout(() => {
                          set(typingRef, false);
                          typingTimeoutRef.current = null;
                        }, 2000);
                      } else {
                        // Input cleared — instantly turn off typing indicator
                        set(typingRef, false);
                        if (typingTimeoutRef.current) {
                          clearTimeout(typingTimeoutRef.current);
                          typingTimeoutRef.current = null;
                        }
                      }
                      // --- TYPING INDICATOR END ---
                      setNewMessage(e.target.value);
                    }}
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
              ) : (
                <div className="p-4 bg-error/10 text-error rounded-xl text-center font-bold text-sm border border-error/20">
                  This chat is no longer active.
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
