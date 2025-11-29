import { NextResponse } from 'next/server';
import { suggestMeals, SuggestMealsInput } from '@/ai/flows/suggest-meals-flow';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';
import type { UserProfile } from '@/types/user';

export async function POST(req: Request) {
  try {
    const body: Omit<SuggestMealsInput, 'userProfile'> & { userId: string } = await req.json();

    if (!body.prompt || !body.userId) {
      return NextResponse.json({ error: 'Prompt and userId are required' }, { status: 400 });
    }

    // This is a server-side route, so we can initialize Firebase here
    const { firestore } = initializeFirebase();
    const userDocRef = doc(firestore, 'users', body.userId);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
        return NextResponse.json({ error: 'User profile not found.' }, { status: 404 });
    }
    const userProfile = userDocSnap.data() as UserProfile;

    const result = await suggestMeals({
        prompt: body.prompt,
        userProfile: userProfile
    });

    return NextResponse.json(result);

  } catch (err: any) {
    console.error("Error in /api/meal-suggestions:", err);
    return NextResponse.json({ error: err.message || 'An internal server error occurred.' }, { status: 500 });
  }
}
