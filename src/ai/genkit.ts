'use server';

import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { Ai } from '@genkit-ai/ai';

// In Genkit v1.x, the 'ai' object is the modern replacement for 'configureGenkit'.
// Options like 'logLevel' and 'enableTracingAndMetrics' are configured differently
// or are enabled by default in production environments.
export const ai: Ai = genkit({
  plugins: [
    googleAI(),
  ],
});
