import { NextResponse } from 'next/server';
import { suggestMeals } from '@/ai/flows/suggest-meals-flow';
import { UserProfileSchema } from '@/types/user';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userProfile, day } = body;

    // We'll rely on Genkit's own error handling if the API key is missing.
    // The server-side Genkit flow is the correct place for that to be handled.
    if (!userProfile || !day) {
      return NextResponse.json(
        { error: 'Missing userProfile or day' },
        { status: 400 }
      );
    }
    
    // Validate the user profile against the schema to ensure it has the expected structure
    const validation = UserProfileSchema.safeParse(userProfile);
    if (!validation.success) {
      return NextResponse.json(
          { error: 'Invalid userProfile data', details: validation.error.flatten() },
          { status: 400 }
      );
    }

    const result = await suggestMeals({ userProfile, day });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error('Error in /api/meal-suggestions:', err);
    
    // Check for a specific Genkit/Gemini auth error
    if (err.message && err.message.includes('API key')) {
        return NextResponse.json(
            { error: 'AI service is not configured. Please ensure your GEMINI_API_KEY is set in the .env file.' },
            { status: 500 }
        );
    }
    
    return NextResponse.json(
      { error: 'An internal server error occurred while fetching AI suggestions.', details: err.message },
      { status: 500 }
    );
  }
}
