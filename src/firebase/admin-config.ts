
import { initializeApp, getApps, App, cert } from 'firebase-admin/app';

// IMPORTANT: Do not expose this service account key to the client-side.
// It should only be used in server-side environments (e.g., Next.js API routes, Firebase Functions).
// The key is fetched from environment variables for security.

const serviceAccount = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};


export function initializeAdminApp(): App {
  if (getApps().some(app => app.name === 'admin')) {
    return getApps().find(app => app.name === 'admin')!;
  }

  return initializeApp({
    credential: cert(serviceAccount),
  }, 'admin');
}
