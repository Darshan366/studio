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
  exercise: z.string().describe('The user\'s preferred exercise.'),
  availableEquipment: z.string().describe('A comma-separated list of available equipment.'),
  workoutHistory: z.string().describe('The user\'s past workout data.'),
});

export type SuggestExerciseAlternativesInput = z.infer<
  typeof SuggestExerciseAlternativesInputSchema
>;

// Define the output schema
const SuggestExerciseAlternativesOutputSchema = z.object({
  alternativeExercises: z
    .string()
    .describe('A comma-separated list of suggested alternative exercises.'),
  reasoning: z.string().describe('The AI reasoning for suggesting these alternatives.'),
});

export type SuggestExerciseAlternativesOutput = z.infer<
  typeof SuggestExerciseAlternativesOutputSchema
>;

// Define the tool
const getExerciseAlternatives = ai.defineTool(
  {
    name: 'getExerciseAlternatives',
    description:
      'Suggests alternative exercises based on the user\'s preferred exercise and available equipment.',
    inputSchema: SuggestExerciseAlternativesInputSchema,
    outputSchema: SuggestExerciseAlternativesOutputSchema,
  },
  async input => {
    // This can call any typescript function.
    // Return suggested alternative exercises...
    return {
      alternativeExercises: 'Squats, Lunges, Deadlifts',
      reasoning: 'These exercises target similar muscle groups and require minimal equipment.',
    };
  }
);

// Define the prompt
const suggestExerciseAlternativesPrompt = ai.definePrompt({
  name: 'suggestExerciseAlternativesPrompt',
  tools: [getExerciseAlternatives],
  input: {schema: SuggestExerciseAlternativesInputSchema},
  output: {schema: SuggestExerciseAlternativesOutputSchema},
  prompt: `You are a personal trainer. A user wants to do {{{exercise}}} but does not have the required equipment.

  The user has the following equipment available: {{{availableEquipment}}}.

  Here is their workout history: {{{workoutHistory}}}.

  Suggest alternative exercises they can do, taking the above into account. Use the getExerciseAlternatives tool to get the alternative exercises and reasoning.
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
 * @param input - The input object containing the exercise, available equipment, and workout history.
 * @returns A promise that resolves to an object containing the alternative exercises and reasoning.
 */
export async function suggestExerciseAlternatives(
  input: SuggestExerciseAlternativesInput
): Promise<SuggestExerciseAlternativesOutput> {
  return suggestExerciseAlternativesFlow(input);
}

