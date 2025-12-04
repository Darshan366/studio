
'use client';

import N8nChat from '@/components/n8n-chat';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function AISuggestionsPage() {

  return (
    <div className="w-full h-full flex flex-col">
       <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">AI Assistant</h1>
        <p className="text-muted-foreground">
            Your personal AI-powered fitness and nutrition guide. Ask me anything!
        </p>
      </div>
      <Card className="flex-1 h-[75vh]">
        <CardContent className="p-0 h-full">
            <N8nChat />
        </CardContent>
      </Card>
    </div>
  );
}
