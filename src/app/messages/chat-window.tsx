
'use client';
import { useState } from 'react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface Conversation {
  id: number;
  name: string;
}

interface Message {
  id: number;
  text: string;
  sender: 'me' | 'them';
  timestamp: string;
}

interface ChatWindowProps {
  conversation: Conversation;
}

const initialMessages: Message[] = [
    { id: 1, text: "Hey! Saw we matched. Ready to hit the gym?", sender: 'them', timestamp: '10:00 AM' },
    { id: 2, text: "Yeah, absolutely! I'm free tomorrow morning. How about 8am at the downtown gym?", sender: 'me', timestamp: '10:01 AM' },
    { id: 3, text: "Sounds good! See you then.", sender: 'them', timestamp: '10:02 AM' },
];


export default function ChatWindow({ conversation }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;

    const message: Message = {
      id: messages.length + 1,
      text: newMessage,
      sender: 'me',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages([...messages, message]);
    setNewMessage('');
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
        <ScrollArea className="h-full">
            <div className="p-4 space-y-4">
                {messages.map((message) => (
                    <div
                    key={message.id}
                    className={cn(
                        'flex items-end gap-2',
                        message.sender === 'me' ? 'justify-end' : 'justify-start'
                    )}
                    >
                    <div
                        className={cn(
                        'max-w-xs rounded-lg p-3 lg:max-w-md',
                        message.sender === 'me'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        )}
                    >
                        <p>{message.text}</p>
                        <p className="mt-1 text-xs text-right opacity-70">{message.timestamp}</p>
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
          />
          <Button type="submit" size="icon" disabled={!newMessage.trim()}>
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
