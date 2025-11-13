import { getExerciseSuggestion } from '@/ai/flows/exercise-suggestion-flow';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return new NextResponse('Prompt is required', { status: 400 });
    }

    const stream = await getExerciseSuggestion(prompt);

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });
  } catch (e: any) {
    console.error('Error in AI API route:', e);
    return new NextResponse(`Error: ${e.message}`, { status: 500 });
  }
}
