'use server';

import { genkit, Ai } from '@genkit-ai/ai';
import { configureGenkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

export const ai: Ai = genkit({
  plugins: [
    googleAI(),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});
