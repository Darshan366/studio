"use client";

import { useState } from "react";
import { Send, Loader2 } from "lucide-react";

export default function AISuggestionsPage() {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!input.trim()) return;

    setLoading(true);
    setResponse("");

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        body: JSON.stringify({ prompt: input }),
      });
      
      if (!res.body) {
        throw new Error("No response body");
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
      console.error("Error fetching AI response:", error);
      setResponse("Sorry, something went wrong. Please try again.");
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

      {/* RESPONSE AREA */}
      { (loading || response) && (
        <div className="mt-8 max-w-3xl w-full bg-[#121212] border border-neutral-700 p-4 rounded-xl whitespace-pre-wrap text-neutral-200">
          {response}
          {loading && !response && <span className="animate-pulse">|</span>}
        </div>
      )}
    </div>
  );
}
