
import { NextResponse } from "next/server";
import axios from 'axios';

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return NextResponse.json({ error: "prompt required" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY not configured.");
      return NextResponse.json({ error: "The AI service is not configured correctly. Please check server logs." }, { status: 500 });
    }

    const geminiResponse = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        contents: [{ parts: [{ text: prompt }]}]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    const reply =
      geminiResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Sorry, I couldn’t generate a response at this time.";


    return NextResponse.json({ reply });

  } catch (err: any) {
    console.error("Error in /api/ai:", err.response ? err.response.data : err.message);
    return NextResponse.json({ error: "Internal server error while contacting AI service." }, { status: 500 });
  }
}
