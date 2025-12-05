
import { NextResponse } from 'next/server';
import { ai } from '@/ai/genkit';

// This API route is no longer used by the AI Suggestions page,
// but is kept for potential future use.

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return NextResponse.json({ error: 'prompt required' }, { status: 400 });
    }
    
    // Use the modern Genkit AI SDK to generate content
    const response = await ai.generate({
      prompt: prompt,
    });

    const reply = response.text;
    
    if (!reply) {
      return NextResponse.json(
        { error: 'Sorry, I couldn’t generate a response at this time.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ reply });
  } catch (err: any) {
    console.error('Error in /api/ai:', err);

    // Provide a more specific error message if the API key is missing
    if (err.message && err.message.includes('API key')) {
      return NextResponse.json(
        { error: 'The AI service is not configured. Please add your GEMINI_API_KEY to your environment variables.' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error while contacting AI service.' },
      { status: 500 }
    );
  }
}
