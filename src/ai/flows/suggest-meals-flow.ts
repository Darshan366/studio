'use server';
/**
 * @fileOverview A meal suggestion AI flow.
 *
 * This file defines a Genkit flow that suggests meals based on a user's
 * profile, a given prompt, and a predefined list of meals.
 *
 * - suggestMeals - A function that handles the meal suggestion process.
 * - SuggestMealsInput - The input type for the suggestMeals function.
 * - SuggestMealsOutput - The return type for the suggestMeals function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { UserProfile } from '@/types/user';
import { allMeals, Meal } from '@/lib/meal-data';

const SuggestMealsInputSchema = z.object({
  prompt: z.string().describe('The user\'s request for meal suggestions, e.g., "Suggest meals for Monday".'),
  userProfile: z.custom<UserProfile>(),
});
export type SuggestMealsInput = z.infer<typeof SuggestMealsInputSchema>;

const SuggestMealsOutputSchema = z.object({
  suggestions: z.array(z.string()).describe('A list of 4-6 meal suggestions based on the user profile.'),
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
        userProfile: z.any().describe('A JSON object representing the user\'s profile, including fitness goals, preferences, etc.'),
        mealList: z.any().describe('A JSON object of available meals to choose from.')
    })
  },
  output: { schema: SuggestMealsOutputSchema },
  prompt: `You are an expert nutritionist designing a meal plan for a user.

Your task is to select 4 to 6 meal suggestions from the provided meal list that best fit the user's profile and their request.

Analyze the user's profile:
- Fitness Goal: {{userProfile.fitnessGoal}}
- Dietary Preference: {{userProfile.dietaryPreference}}

Here is the list of available meals you can choose from: {{jsonStringify mealList}}

User's request: "{{prompt}}"

Based on their profile and request, select the most appropriate meals.

Return ONLY the list of meal names in the 'suggestions' array. Do not include meal times like "Breakfast:". Just the meal name.`,
});

// Define the Genkit Flow
const suggestMealsFlow = ai.defineFlow(
  {
    name: 'suggestMealsFlow',
    inputSchema: SuggestMealsInputSchema,
    outputSchema: SuggestMealsOutputSchema,
  },
  async ({ userProfile, prompt }) => {
    
    // Filter meals based on dietary preference
    const filteredMeals = allMeals.filter(meal => {
        if (userProfile.dietaryPreference === 'Vegetarian') {
            return meal.type === 'vegetarian' || meal.type === 'vegan';
        }
        if (userProfile.dietaryPreference === 'Vegan') {
            return meal.type === 'vegan';
        }
        return true; // 'Anything'
    });

    // Call the prompt with the user's profile, the prompt, and the filtered meal list
    const { output } = await mealSuggestionPrompt({
        prompt: prompt,
        userProfile: userProfile,
        mealList: filteredMeals
    });

    return output!;
  }
);
