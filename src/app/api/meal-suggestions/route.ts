import { NextResponse } from 'next/server';
import { suggestMeals, SuggestMealsInput } from '@/ai/flows/suggest-meals-flow';

export async function POST(req: Request) {
  try {
    const body: SuggestMealsInput = await req.json();

    if (!body.prompt || !body.userId) {
      return NextResponse.json({ error: 'Prompt and userId are required' }, { status: 400 });
    }

    const result = await suggestMeals(body);

    return NextResponse.json(result);

  } catch (err: any) {
    console.error("Error in /api/meal-suggestions:", err);
    return NextResponse.json({ error: err.message || 'An internal server error occurred.' }, { status: 500 });
  }
}
