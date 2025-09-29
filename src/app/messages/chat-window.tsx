
'use client';
import { useState, useEffect, useRef } from 'react';
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  Timestamp,
  where,
  getDocs,
  limit,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface Conversation {
  id: number;
  name: string;
}

interface Message {
  id: string;
  text: string;
  senderId: string;
  timestamp: Timestamp;
}

interface ChatWindowProps {
  conversation: Conversation;
}

// A simple representation of another user. In a real app, this would come from your user database.
const otherUser = {
  id: 'jessica_id', // A static ID for the other user for this example
  name: 'Jessica',
};


export default function ChatWindow({ conversation }: ChatWindowProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const getChatId = (uid1: string, uid2: string) => {
    return [uid1, uid2].sort().join('_');
  };

  useEffect(() => {
    if (!user) return;

    const chatId = getChatId(user.uid, otherUser.id);
    const messagesCollection = collection(db, 'chats', chatId, 'messages');
    const q = query(messagesCollection, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const msgs: Message[] = [];
      querySnapshot.forEach((doc) => {
        msgs.push({ id: doc.id, ...doc.data() } as Message);
      });
      setMessages(msgs);
      setLoading(false);
    }, (error) => {
        console.error("Error fetching messages:", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not load messages.",
        });
        setLoading(false);
    });

    return () => unsubscribe();
  }, [user, toast]);

  useEffect(() => {
    // Scroll to the bottom when messages change
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages]);


  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !user) return;

    const chatId = getChatId(user.uid, otherUser.id);
    const messagesCollection = collection(db, 'chats', chatId, 'messages');

    try {
        await addDoc(messagesCollection, {
            text: newMessage,
            senderId: user.uid,
            timestamp: Timestamp.now(),
        });
        setNewMessage('');
    } catch (error) {
        console.error("Error sending message:", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not send message.",
        });
    }
  };

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="flex flex-row items-center gap-3 border-b p-4">
        <Avatar>
          <AvatarImage alt={conversation.name} />
          <AvatarFallback>{conversation.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <h2 className="text-lg font-semibold">{conversation.name}</h2>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
            <div className="p-4 space-y-4">
                {loading && (
                    <div className="flex justify-center items-center h-full">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                )}
                {!loading && messages.length === 0 && (
                    <div className="flex justify-center items-center h-full">
                        <p className="text-muted-foreground">No messages yet. Say hello!</p>
                    </div>
                )}
                {messages.map((message) => (
                    <div
                    key={message.id}
                    className={cn(
                        'flex items-end gap-2',
                        message.senderId === user?.uid ? 'justify-end' : 'justify-start'
                    )}
                    >
                    <div
                        className={cn(
                        'max-w-xs rounded-lg p-3 lg:max-w-md',
                        message.senderId === user?.uid
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        )}
                    >
                        <p>{message.text}</p>
                        <p className="mt-1 text-xs text-right opacity-70">
                            {message.timestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                    </div>
                ))}
            </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="border-t p-4">
        <form onSubmit={handleSendMessage} className="flex w-full items-center gap-2">
          <Input
            autoComplete="off"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={!user}
          />
          <Button type="submit" size="icon" disabled={!newMessage.trim() || !user}>
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
