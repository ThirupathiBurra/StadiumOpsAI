import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './client';

// ─── Auth Helpers ─────────────────────────────────────────────────────────────

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

/**
 * Initiates Google sign-in popup flow.
 * On success, upserts the user document in Firestore.
 */
export async function signInWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;

  // Upsert user profile in Firestore (doesn't overwrite role/assignedZones)
  await setDoc(
    doc(db, 'users', user.uid),
    {
      uid:         user.uid,
      email:       user.email,
      displayName: user.displayName,
      photoURL:    user.photoURL,
      lastLoginAt: serverTimestamp(),
    },
    { merge: true }  // Never overwrite role — set by admin only
  );

  return user;
}

export async function signOutUser(): Promise<void> {
  await signOut(auth);
}

/**
 * Subscribe to auth state changes.
 * Returns unsubscribe function — call on component unmount.
 */
export function subscribeToAuthState(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}

export { auth };
