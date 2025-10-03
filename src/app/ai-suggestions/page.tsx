// src/app/ai-suggestions/page.tsx
'use client';
import { useUser } from '@/firebase';
import AiSuggestionForm from './ai-suggestion-form';
import { format } from 'date-fns';

export default function AiSuggestionsPage() {
  const { user } = useUser();

  return (
    <div className="flex h-[calc(100vh-8rem)] w-full flex-col">
      <div className="flex-shrink-0 text-center text-sm text-muted-foreground">
        {format(new Date(), 'eeee, MMM d')}・Notion AI
      </div>
      <div className="flex-1 overflow-y-auto">
        <AiSuggestionForm />
      </div>
    </div>
  );
}
