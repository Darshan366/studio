'use server';
import { genkit, type Plugin } from '@genkit-ai/core';
import { googleAI } from '@genkit-ai/google-genai';

const plugins: Plugin<any>[] = [googleAI()];
if (process.env.NODE_ENV === 'development') {
  const { devLogger } = await import('genkit/dev-logger');
  plugins.push(devLogger);
}

// In Next.js, we must use a singleton to prevent re-initialization on hot reloads.
// See: https://github.com/firebase/genkit/issues/1126
export const ai =
  (globalThis as any).genkitAiInstance ??
  genkit({
    plugins,
    logLevel: 'debug',
    enableTracingAndMetrics: true,
  });

if (process.env.NODE_ENV !== 'production') {
  (globalThis as any).genkitAiInstance = ai;
}
