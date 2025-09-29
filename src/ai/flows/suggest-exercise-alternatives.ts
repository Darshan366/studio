// src/ai/flows/suggest-exercise-alternatives.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting alternative exercises based on user input.
 *
 * It takes into account the user's preferred exercise, available equipment, and workout history to provide suitable alternatives.
 *
 * @exports {
 *   suggestExerciseAlternatives,
 *   SuggestExerciseAlternativesInput,
 *   SuggestExerciseAlternativesOutput
 * }
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the input schema
const SuggestExerciseAlternativesInputSchema = z.object({
  prompt: z.string().describe('The user\'s full request for exercise suggestions.'),
});

export type SuggestExerciseAlternativesInput = z.infer<
  typeof SuggestExerciseAlternativesInputSchema
>;

// Define the output schema
const SuggestExerciseAlternativesOutputSchema = z.object({
  alternativeExercises: z
    .string()
    .describe('A comma-separated list of 2-4 suggested alternative exercises.'),
  reasoning: z.string().describe('The AI reasoning for suggesting these alternatives.'),
});

export type SuggestExerciseAlternativesOutput = z.infer<
  typeof SuggestExerciseAlternativesOutputSchema
>;

// Define the prompt
const suggestExerciseAlternativesPrompt = ai.definePrompt({
  name: 'suggestExerciseAlternativesPrompt',
  input: {schema: SuggestExerciseAlternativesInputSchema},
  output: {schema: SuggestExerciseAlternativesOutputSchema},
  prompt: `You are an expert personal trainer. A user wants an alternative to an exercise, a new workout routine, or some other fitness advice.

  Analyze the user's request and provide a helpful response.

  User's request:
  "{{{prompt}}}"

  Based on their request, suggest 2-4 alternative exercises and provide a clear reasoning for your suggestions. Consider the muscle groups targeted, the equipment mentioned, and the user's likely fitness level.
  `,
});

// Define the flow
const suggestExerciseAlternativesFlow = ai.defineFlow(
  {
    name: 'suggestExerciseAlternativesFlow',
    inputSchema: SuggestExerciseAlternativesInputSchema,
    outputSchema: SuggestExerciseAlternativesOutputSchema,
  },
  async input => {
    const {output} = await suggestExerciseAlternativesPrompt(input);
    return output!;
  }
);

/**
 * Suggests alternative exercises based on user input.
 * @param input - The input object containing the user's prompt.
 * @returns A promise that resolves to an object containing the alternative exercises and reasoning.
 */
export async function suggestExerciseAlternatives(
  input: SuggestExerciseAlternativesInput
): Promise<SuggestExerciseAlternativesOutput> {
  return suggestExerciseAlternativesFlow(input);
}
