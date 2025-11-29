'use server';
/**
 * @fileOverview A meal suggestion AI agent.
 *
 * - suggestMeals - A function that handles the meal suggestion process.
 * - SuggestMealsInput - The input type for the suggestMeals function.
 * - SuggestMealsOutput - The return type for the suggestMeals function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { UserProfileSchema } from '@/types/user';

export const SuggestMealsInputSchema = z.object({
  userProfile: UserProfileSchema.describe('The user profile object.'),
  day: z.string().describe('The day of the week to suggest meals for.'),
});

export type SuggestMealsInput = z.infer<typeof SuggestMealsInputSchema>;

export const SuggestMealsOutputSchema = z.object({
  suggestions: z.array(z.string()).describe('A list of 4-6 meal suggestions.'),
});

export type SuggestMealsOutput = z.infer<typeof SuggestMealsOutputSchema>;

export async function suggestMeals(
  input: SuggestMealsInput
): Promise<SuggestMealsOutput> {
  return suggestMealsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestMealsPrompt',
  input: { schema: SuggestMealsInputSchema },
  output: { schema: SuggestMealsOutputSchema },
  prompt: `You are an expert nutritionist designing a meal plan.

User's fitness goal: {{{userProfile.fitnessGoal}}}
User's dietary preference: {{{userProfile.dietaryPreference}}}

Please suggest 4 to 6 meal ideas suitable for {{day}}.

Return a list of meal names in the 'suggestions' array. Do not return markdown or any other formatting, just the JSON object.`,
});

const suggestMealsFlow = ai.defineFlow(
  {
    name: 'suggestMealsFlow',
    inputSchema: SuggestMealsInputSchema,
    outputSchema: SuggestMealsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    // If the output is null or undefined, return a default empty response
    // to prevent the API route from crashing.
    if (!output) {
      return { suggestions: [] };
    }
    return output;
  }
);
