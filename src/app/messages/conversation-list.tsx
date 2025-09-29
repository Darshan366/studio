
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Conversation {
  id: number;
  name: string;
  lastMessage: string;
  avatarUrl: string;
  unreadCount: number;
}

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  onSelectConversation: (conversation: Conversation) => void;
}

export default function ConversationList({
  conversations,
  selectedConversation,
  onSelectConversation,
}: ConversationListProps) {
  return (
    <Card className="w-80 border-r">
      <ScrollArea className="h-full">
        <CardContent className="p-2">
          {conversations.map((convo) => (
            <div
              key={convo.id}
              className={cn(
                'flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted/50',
                selectedConversation?.id === convo.id && 'bg-muted'
              )}
              onClick={() => onSelectConversation(convo)}
            >
              <Avatar>
                <AvatarImage src={convo.avatarUrl} alt={convo.name} />
                <AvatarFallback>{convo.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <p className="font-semibold truncate">{convo.name}</p>
                <p className="text-sm text-muted-foreground truncate">
                  {convo.lastMessage}
                </p>
              </div>
              {convo.unreadCount > 0 && (
                <Badge className="flex h-5 w-5 items-center justify-center p-0">
                  {convo.unreadCount}
                </Badge>
              )}
            </div>
          ))}
        </CardContent>
      </ScrollArea>
    </Card>
  );
}
