import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAuth, type Auth } from 'firebase/auth';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { getFunctions, type Functions } from 'firebase/functions';

// ─── Firebase Client Config ───────────────────────────────────────────────────
// All values come from NEXT_PUBLIC_ env vars — safe to expose in browser.

const firebaseConfig = {
  apiKey:            process.env['NEXT_PUBLIC_FIREBASE_API_KEY']!,
  authDomain:        process.env['NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN']!,
  projectId:         process.env['NEXT_PUBLIC_FIREBASE_PROJECT_ID']!,
  storageBucket:     process.env['NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET']!,
  messagingSenderId: process.env['NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID']!,
  appId:             process.env['NEXT_PUBLIC_FIREBASE_APP_ID']!,
  measurementId:     process.env['NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID'],
};

// ─── Singleton Initialization ─────────────────────────────────────────────────
// Prevents re-initialization in Next.js hot-reload / dev mode.

function getFirebaseApp(): FirebaseApp {
  if (getApps().length > 0) return getApp();
  return initializeApp(firebaseConfig);
}

const app = getFirebaseApp();

// ─── Exported Service Instances ───────────────────────────────────────────────

export const db: Firestore       = getFirestore(app);
export const auth: Auth          = getAuth(app);
export const storage: FirebaseStorage = getStorage(app);
export const functions: Functions     = getFunctions(app, 'us-central1');

export default app;
