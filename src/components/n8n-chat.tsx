
'use client';

import React, { useEffect, useRef } from 'react';

// This is a client component that will dynamically load and initialize the n8n chat script.

const N8nChat = () => {
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const isInitialized = useRef(false); // Add a ref to track initialization

  useEffect(() => {
    // Ensure this runs only on the client side
    if (typeof window === 'undefined' || !chatContainerRef.current) {
      return;
    }
    
    // The main fix: Use a short timeout to ensure the dialog animation is complete
    // before the n8n script tries to find its container element.
    const timer = setTimeout(() => {
        // Check if the chat has already been initialized to prevent duplicates
        if (isInitialized.current || !chatContainerRef.current) {
            return;
        }

        const script = document.createElement('script');
        script.type = 'module';
        script.innerHTML = `
          import { createChat } from 'https://cdn.jsdelivr.net/npm/@n8n/chat/dist/chat.bundle.es.js';
          
          createChat({
            webhookUrl: 'https://rahul264.app.n8n.cloud/webhook/b1226f26-e76b-4c8d-8d55-9a0704f903c6/chat',
            initialData: {
              source: 'gym-grinders-app'
            },
            host: document.getElementById('n8n-chat-container'),
          });
        `;

        chatContainerRef.current.appendChild(script);
        isInitialized.current = true; // Mark as initialized
    }, 100); // 100ms delay is usually enough

    return () => clearTimeout(timer); // Cleanup the timer

  }, []);

  // The container div that the n8n chat will be mounted into.
  // Style it to take up the full height of its parent.
  return <div id="n8n-chat-container" ref={chatContainerRef} style={{ height: '100%', width: '100%' }}></div>;
};

export default N8nChat;
