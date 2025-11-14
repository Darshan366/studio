
"use client";

import { useState } from "react";
import { Send, Loader2 } from "lucide-react";

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

    try {
        const res = await fetch("/api/ai", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt: input }),
        });

        const data = await res.json();

        if (!res.ok) {
            if (res.status === 501) { // 501 for Not Implemented (or not configured)
                throw new Error("501");
            }
            throw new Error(data.error || "An unknown error occurred.");
        }
        
        setResponse(data.output);

    } catch (err: any) {
        console.error("Error fetching AI response:", err);
        setError(err.message || "Failed to fetch response from the server.");
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
      
      {/* TOP ICON */}
      <div className="text-4xl mb-4">✨</div>

      {/* TITLE */}
      <h1 className="text-2xl font-semibold mb-8 text-center">
        What can I help you with today?
      </h1>

      {/* TEXTBOX CONTAINER */}
      <div className="w-full max-w-3xl bg-[#1A1A1A] rounded-2xl p-5 border border-neutral-700 shadow-xl relative">

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full bg-transparent outline-none resize-none h-40 text-base"
          placeholder="Ask anything about workouts, exercises, bodybuilding..."
        />

        {/* Send Button */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="absolute bottom-4 right-4 bg-[#3A3A3A] p-3 rounded-full hover:bg-[#4A4A4A] transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
        </button>
      </div>

      {/* CATEGORY TABS */}
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
      
      {/* ERROR MESSAGE */}
      {error === "501" && (
        <div className="mt-8 max-w-3xl w-full bg-blue-900/30 border border-blue-500/50 text-blue-200 p-6 rounded-2xl space-y-4">
          <h3 className="font-semibold text-lg text-white">🚀 AI Feature Requires Deployment</h3>
          <p className="text-blue-300">This feature uses a backend Cloud Function to connect to the AI. To use it, you first need to deploy the function to get its public URL.</p>
          <div className="space-y-2 text-sm">
              <p>1. Open a terminal and run the following command to deploy:</p>
              <code className="block bg-black/50 px-3 py-2 rounded-md text-blue-100 font-mono text-xs">firebase deploy --only functions</code>
              <p>2. After deployment, the terminal will show you a "Function URL" for `exerciseAI`.</p>
              <p>3. Create a file named `.env.local` in the root of your project and add the URL:</p>
              <code className="block bg-black/50 px-3 py-2 rounded-md text-blue-100 font-mono text-xs">NEXT_PUBLIC_FIREBASE_AI_URL="YOUR_FUNCTION_URL_HERE"</code>
              <p>4. Restart your local development server for the change to take effect.</p>
          </div>
        </div>
      )}
      {error && error !== "501" && (
        <div className="mt-8 max-w-3xl w-full bg-destructive/20 border border-destructive/50 text-destructive-foreground p-4 rounded-xl">
          <p className="font-semibold">An Error Occurred</p>
          <p>{error}</p>
        </div>
      )}


      {/* RESPONSE AREA */}
      { (loading && !response) && (
        <div className="mt-8 max-w-3xl w-full text-center text-muted-foreground">
            <Loader2 className="animate-spin inline-block h-6 w-6" />
            <p>Generating advice...</p>
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
