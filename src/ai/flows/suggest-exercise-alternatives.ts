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
  prompt: z.string().describe("The user's full request for exercise suggestions."),
  userName: z.string().describe('The name of the user making the request.'),
});

export type SuggestExerciseAlternativesInput = z.infer<
  typeof SuggestExerciseAlternativesInputSchema
>;

// Define the output schema
const SuggestExerciseAlternativesOutputSchema = z.object({
  response: z
    .string()
    .describe("A conversational and helpful response to the user's prompt."),
});

export type SuggestExerciseAlternativesOutput = z.infer<
  typeof SuggestExerciseAlternativesOutputSchema
>;

// Define the prompt
const suggestExerciseAlternativesPrompt = ai.definePrompt({
  name: 'suggestExerciseAlternativesPrompt',
  input: {schema: SuggestExerciseAlternativesInputSchema},
  output: {schema: SuggestExerciseAlternativesOutputSchema},
  model: 'gemini-pro',
  prompt: `You are a friendly and expert personal trainer. A user named {{{userName}}} is asking for fitness advice.

  Their request is: "{{{prompt}}}"

  Provide a helpful, encouraging, and conversational response to their request. If they ask for alternatives, provide them with clear reasoning.
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
