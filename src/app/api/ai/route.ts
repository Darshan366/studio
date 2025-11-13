
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return NextResponse.json({ error: "prompt required" }, { status: 400 });
    }

    const functionUrl = process.env.NEXT_PUBLIC_FIREBASE_AI_URL;
    if (!functionUrl) {
        console.error("Firebase AI function URL not configured.");
        return NextResponse.json({ error: "Server not configured" }, { status: 500 });
    }

    const response = await fetch(functionUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt })
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error("Error from Firebase Function:", errorData);
        return NextResponse.json({ error: "AI backend error", detail: errorData }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json({ output: data.reply });

  } catch (err) {
    console.error("Error in /api/ai:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
