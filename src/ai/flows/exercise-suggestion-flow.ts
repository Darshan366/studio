'use server';
/**
 * @fileOverview A flow for generating exercise suggestions.
 *
 * - getExerciseSuggestion - A function that streams exercise advice.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const suggestionPrompt = ai.definePrompt(
  {
    name: 'exerciseSuggestionPrompt',
    input: { schema: z.string() },
    prompt: `You are a world-class fitness expert and personal trainer. Your goal is to provide clear, safe, and actionable exercise advice.

    IMPORTANT:
    - Always prioritize safety. If a user asks for something dangerous, advise against it and provide a safer alternative.
    - Be encouraging and positive.
    - Format your response using markdown for readability (e.g., use lists, bold text).
    - If suggesting an exercise, briefly explain its benefits and proper form.

    User's question:
    "{{{input}}}"
    `,
  },
);

export async function getExerciseSuggestion(prompt: string) {
  const { stream } = await ai.generate({
    prompt: suggestionPrompt,
    input: prompt,
    model: 'gemini-1.5-flash',
    stream: true,
  });

  const webStream = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        controller.enqueue(chunk.text);
      }
      controller.close();
    },
  });

  return webStream;
}
