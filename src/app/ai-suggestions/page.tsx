
"use client";

import { useState } from "react";
import { Send, Loader2, Bot } from "lucide-react";

export default function AISuggestionsPage() {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!input.trim()) return;

    setLoading(true);
    setResponse("");
    setError(null);
    
    const webhookUrl = "https://rahul264.app.n8n.cloud/webhook/ea211a1a-1318-4ecf-af86-ce2d24dcb5ba";

    try {
        const res = await fetch(webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: input }),
        });

        if (!res.ok) {
            const errorText = await res.text();
            console.error("Webhook server response:", errorText);
            throw new Error(`The webhook server responded with status ${res.status}.`);
        }
        
        // Check if the response has content before trying to parse it
        const responseText = await res.text();
        if (!responseText) {
          setResponse("The webhook returned an empty response.");
          return;
        }

        try {
          const data = JSON.parse(responseText);
          if (data && data.GYM) {
            setResponse(data.GYM);
          } else {
             setResponse(`Webhook response: ${JSON.stringify(data, null, 2)}`);
             setError("The response from the webhook was not in the expected format of { GYM: 'value' }.");
          }
        } catch (jsonError) {
          // If parsing fails, it's not JSON. Display the raw text.
          console.error("Failed to parse JSON:", jsonError);
          setResponse(`Received non-JSON response from webhook: ${responseText}`);
          setError("The webhook did not return valid JSON.");
        }

    } catch (err: any) {
        console.error("Error sending to webhook:", err);
        setError(err.message || "Failed to send request to the webhook.");
    } finally {
        setLoading(false);
    }
  }
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-white px-4 pt-10">
      
      <div className="text-4xl mb-4">✨</div>

      <h1 className="text-2xl font-semibold mb-8 text-center">
        What can I help you with today?
      </h1>

      <div className="w-full max-w-3xl bg-[#1A1A1A] rounded-2xl p-5 border border-neutral-700 shadow-xl relative">

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full bg-transparent outline-none resize-none h-40 text-base"
          placeholder="Ask anything about workouts, exercises, bodybuilding..."
        />

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="absolute bottom-4 right-4 bg-[#3A3A3A] p-3 rounded-full hover:bg-[#4A4A4A] transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
        </button>
      </div>

      <div className="flex gap-3 mt-4 text-sm">
        {["Exercises", "Workouts", "Nutrition", "Form Tips"].map((tab) => (
          <div
            key={tab}
            className="px-4 py-1.5 bg-[#222222] rounded-full border border-neutral-700 text-neutral-300"
          >
            {tab}
          </div>
        ))}
      </div>
      
      {error && (
        <div className="mt-8 max-w-3xl w-full bg-destructive/20 border border-destructive/50 text-destructive-foreground p-4 rounded-xl space-y-2">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5"/>
            <p className="font-semibold">Webhook Error</p>
          </div>
          <p className="text-sm">{error}</p>
        </div>
      )}


      { (loading && !response) && (
        <div className="mt-8 max-w-3xl w-full text-center text-muted-foreground">
            <Loader2 className="animate-spin inline-block h-6 w-6" />
            <p>Waiting for the webhook...</p>
        </div>
      )}
      {response && (
        <div className="mt-8 max-w-3xl w-full bg-[#121212] border border-neutral-700 p-4 rounded-xl whitespace-pre-wrap text-neutral-200">
          {response}
        </div>
      )}
    </div>
  );
}
