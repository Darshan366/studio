
'use client';

import React, { useEffect, useRef } from 'react';

// This is a client component that will dynamically load and initialize the n8n chat script.

const N8nChat = () => {
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Ensure this runs only on the client side
    if (typeof window === 'undefined' || !chatContainerRef.current) {
      return;
    }
    
    // Check if the chat has already been initialized to prevent duplicates
    if (chatContainerRef.current.querySelector('[data-n8n-chat-id]')) {
        return;
    }

    const script = document.createElement('script');
    script.type = 'module';
    script.innerHTML = `
      import { createChat } from 'https://cdn.jsdelivr.net/npm/@n8n/chat/dist/chat.bundle.es.js';
      
      createChat({
        webhookUrl: 'https://rahul264.app.n8n.cloud/webhook/b1226f26-e76b-4c8d-8d55-9a0704f903c6/chat',
        initialData: {
          // You can pass initial data to your workflow here if needed
          source: 'gym-grinders-app'
        },
        host: document.getElementById('n8n-chat-container'),
      });
    `;

    chatContainerRef.current.appendChild(script);

    // No cleanup function needed as we are directly mounting it into the div
    // and want it to persist.

  }, []);

  // The container div that the n8n chat will be mounted into.
  // Style it to take up the full height of its parent.
  return <div id="n8n-chat-container" ref={chatContainerRef} style={{ height: '100%', width: '100%' }}></div>;
};

export default N8nChat;
