'use server';

import { genkit, Ai } from '@genkit-ai/ai';
import { configureGenkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

// Adds a `jsonStringify` helper to the Handlebars templating engine.
// This is required to pass complex objects to the LLM prompt.
import {
  registerHandlebarsHelpers,
} from '@genkit-ai/google-genai';
registerHandlebarsHelpers();

export const ai: Ai = genkit({
  plugins: [
    googleAI(),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});
