import { NextResponse } from 'next/server';
import { suggestMeals } from '@/ai/flows/suggest-meals-flow';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userProfile, day } = body;

    if (!userProfile || !day) {
      return NextResponse.json(
        { error: 'Missing userProfile or day' },
        { status: 400 }
      );
    }
    
    // Check if the API key is available.
    if (!process.env.GEMINI_API_KEY) {
        console.error('GEMINI_API_KEY is not set.');
        return NextResponse.json({ error: 'Server not configured: Missing API key.' }, { status: 500 });
    }

    const result = await suggestMeals({ userProfile, day });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error('Error in /api/meal-suggestions:', err);
    return NextResponse.json(
      { error: 'Internal server error', details: err.message },
      { status: 500 }
    );
  }
}
