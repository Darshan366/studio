
'use client';

import { useState } from 'react';
import ConversationList from './conversation-list';
import ChatWindow from './chat-window';

const conversations = [
  {
    id: 1,
    name: 'Jessica',
    lastMessage: 'Sounds good! See you then.',
    avatarUrl: 'https://picsum.photos/seed/jessica/200/200',
    unreadCount: 0,
  },
  {
    id: 2,
    name: 'Mike',
    lastMessage: 'Can you show me how to do deadlifts?',
    avatarUrl: 'https://picsum.photos/seed/mike/200/200',
    unreadCount: 2,
  },
];

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState(
    conversations[0]
  );

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
            <p>Select a conversation to start chatting.</p>
          </div>
        )}
      </div>
    </div>
  );
}
