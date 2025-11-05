'use client';
import { useState, useEffect, useRef } from 'react';
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';

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
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';

interface Conversation {
  id: string; // matchId
  name: string;
  otherUserId: string;
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

export default function ChatWindow({ conversation }: ChatWindowProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [newMessage, setNewMessage] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const messagesCollectionRef = useMemoFirebase(() => {
    if (!firestore || !conversation) return null;
    return collection(firestore, 'conversations', conversation.id, 'messages');
  }, [firestore, conversation]);

  const messagesQuery = useMemoFirebase(() => {
    if (!messagesCollectionRef) return null;
    return query(messagesCollectionRef, orderBy('timestamp', 'asc'));
  }, [messagesCollectionRef]);

  const { data: messages, isLoading: loading, error } = useCollection<Message>(messagesQuery);
  
  useEffect(() => {
    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not load messages.",
      });
    }
  }, [error, toast]);


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
    if (newMessage.trim() === '' || !user || !messagesCollectionRef) return;

    addDocumentNonBlocking(messagesCollectionRef, {
        text: newMessage,
        senderId: user.uid,
        timestamp: serverTimestamp(),
    });
    setNewMessage('');
  };

  return (
    <Card className="flex h-full flex-col border-0 md:border">
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
                {!loading && messages && messages.length === 0 && (
                    <div className="flex justify-center items-center h-full">
                        <p className="text-muted-foreground">No messages yet. Say hello!</p>
                    </div>
                )}
                {messages && messages.map((message) => (
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
                        {message.timestamp && (
                          <p className="mt-1 text-xs text-right opacity-70">
                              {message.timestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        )}
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
