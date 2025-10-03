'use client';

import { useState, useEffect } from 'react';
import ConversationList from './conversation-list';
import ChatWindow from './chat-window';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';

interface Conversation {
  id: string; // matchId
  name: string;
  lastMessage: string;
  avatarUrl: string;
  unreadCount: number;
  otherUserId: string;
}

export default function MessagesPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const matchesQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, 'matches'), where('users', 'array-contains', user.uid));
  }, [user, firestore]);

  const { data: matches } = useCollection(matchesQuery);

  useEffect(() => {
    if (!matches || !firestore) {
      setLoading(false);
      return;
    };

    const fetchConversations = async () => {
      setLoading(true);
      const convos: Conversation[] = [];
      for (const match of matches) {
        const otherUserId = match.users.find((uid: string) => uid !== user?.uid);
        if (!otherUserId) continue;

        const userDocRef = doc(firestore, 'users', otherUserId);
        const conversationDocRef = doc(firestore, 'conversations', match.id);
        
        try {
          const [userDoc, conversationDoc] = await Promise.all([
            getDoc(userDocRef),
            getDoc(conversationDocRef)
          ]);
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const conversationData = conversationDoc.exists() ? conversationDoc.data() : { lastMessage: "You've matched! Say hello." };
            
            convos.push({
              id: match.id,
              otherUserId: otherUserId,
              name: userData.name || 'Unknown User',
              avatarUrl: userData.photoURL || `https://picsum.photos/seed/${otherUserId}/200/200`,
              lastMessage: conversationData.lastMessage || "You've matched! Say hello.",
              unreadCount: 0, // Implement unread count logic if needed
            });
          }
        } catch (error) {
            console.error("Error fetching conversation details:", error);
        }
      }
      setConversations(convos);
      if (convos.length > 0 && !selectedConversation) {
        setSelectedConversation(convos[0]);
      }
      setLoading(false);
    };

    fetchConversations();
  }, [matches, firestore, user?.uid]);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-6rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-6rem)]">
      <ConversationList
        conversations={conversations}
        selectedConversation={selectedConversation}
        onSelectConversation={setSelectedConversation}
      />
      <div className="flex-1">
        {selectedConversation ? (
          <ChatWindow conversation={selectedConversation} />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <p>No conversations yet. Start matching!</p>
          </div>
        )}
      </div>
    </div>
  );
}
