
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Bot, Loader2 } from 'lucide-react';

export default function AISuggestionsPage() {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit() {
    if (!input) return;
    setIsLoading(true);
    setResponse('');

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        body: JSON.stringify({ prompt: input }),
      });

      if (!res.body) {
        throw new Error('No response body');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        const chunk = decoder.decode(value, { stream: true });
        setResponse((prev) => prev + chunk);
      }
    } catch (error) {
      console.error('Error fetching AI response:', error);
      setResponse('Sorry, something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Sparkles className="h-8 w-8 text-purple-400" />
        <div>
            <h1 className="text-2xl font-bold tracking-tight">AI Exercise Suggestions</h1>
            <p className="text-muted-foreground">Get expert fitness advice powered by AI.</p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <Textarea
              className="h-32 w-full resize-none"
              placeholder="e.g., Give me a 5-day workout split for building muscle."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <Button onClick={handleSubmit} disabled={isLoading} className="bg-purple-600 hover:bg-purple-700">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Thinking...
                </>
              ) : (
                <>
                  <Bot className="mr-2 h-4 w-4" />
                  Ask AI
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {(isLoading || response) && (
         <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Bot className="h-5 w-5" />
                    AI Response
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="prose prose-invert max-w-none whitespace-pre-wrap">
                    {response}
                    {isLoading && !response && <span className="animate-pulse">|</span>}
                </div>
            </CardContent>
         </Card>
      )}
    </div>
  );
}
