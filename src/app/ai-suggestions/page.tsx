import AiSuggestionForm from './ai-suggestion-form';

export default function AiSuggestionsPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-3xl font-bold">AI Exercise Suggestions</h1>
        <p className="text-muted-foreground">
          Don&apos;t have the right equipment? Get alternative exercise
          suggestions from our AI.
        </p>
      </div>
      <AiSuggestionForm />
    </div>
  );
}
