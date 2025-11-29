'use server';
/**
 * @fileOverview A meal suggestion AI flow.
 *
 * This file defines a Genkit flow that suggests meals based on a user's
 * profile and a given prompt.
 *
 * - suggestMeals - A function that handles the meal suggestion process.
 * - SuggestMealsInput - The input type for the suggestMeals function.
 * - SuggestMealsOutput - The return type for the suggestMeals function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';
import type { UserProfile } from '@/types/user';


const SuggestMealsInputSchema = z.object({
  prompt: z.string().describe('The user\'s request for meal suggestions, e.g., "Suggest meals for Monday".'),
  userId: z.string().describe("The user's unique ID to fetch their profile data."),
});
export type SuggestMealsInput = z.infer<typeof SuggestMealsInputSchema>;

const SuggestMealsOutputSchema = z.object({
  suggestions: z.array(z.string()).describe('A list of 4-6 meal suggestions.'),
});
export type SuggestMealsOutput = z.infer<typeof SuggestMealsOutputSchema>;

// Wrapper function to be called from the API route
export async function suggestMeals(input: SuggestMealsInput): Promise<SuggestMealsOutput> {
  return suggestMealsFlow(input);
}

// Define the Genkit Prompt
const mealSuggestionPrompt = ai.definePrompt({
  name: 'mealSuggestionPrompt',
  input: {
    schema: z.object({
        prompt: z.string(),
        userProfile: z.any().describe('A JSON object representing the user\'s profile, including fitness goals, preferences, etc.')
    })
  },
  output: { schema: SuggestMealsOutputSchema },
  prompt: `You are an expert nutritionist designing a meal plan for a user.

Analyze the user's profile: {{jsonStringify userProfile}}

Based on their profile and their request, suggest 4 to 6 meals.

User's request: "{{prompt}}"

Return ONLY the list of meal names in the 'suggestions' array. Do not include meal times like "Breakfast:". Just the meal name.`,
});

// Define the Genkit Flow
const suggestMealsFlow = ai.defineFlow(
  {
    name: 'suggestMealsFlow',
    inputSchema: SuggestMealsInputSchema,
    outputSchema: SuggestMealsOutputSchema,
  },
  async (input) => {
    // In a real Genkit flow, you'd initialize this once.
    const { firestore } = initializeFirebase();
    
    // Fetch the user's profile from Firestore
    const userDocRef = doc(firestore, 'users', input.userId);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
        throw new Error('User profile not found.');
    }
    const userProfile = userDocSnap.data() as UserProfile;

    // Call the prompt with the user's profile and the original prompt
    const { output } = await mealSuggestionPrompt({
        prompt: input.prompt,
        userProfile: userProfile
    });

    return output!;
  }
);
