import { FirebaseError } from 'firebase/app';
import {
  signOut as _signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth';

import { auth } from '../firebase';
import { authStatusStore } from '../stores';

export function signOut() {
  return _signOut(auth);
}

export async function signUpEmailPassword(email: string, password: string) {
  try {
    authStatusStore.set(null);
    await createUserWithEmailAndPassword(auth, email, password);
    return authStatusStore.set(null);
  } catch (error) {
    if (!(error instanceof FirebaseError)) {
      throw new Error('Caught non-Firebase error!');
    }

    return authStatusStore.set({
      code: error.code,
      message: error.message,
    });
  }
}

export async function signInEmailPassword(email: string, password: string) {
  try {
    authStatusStore.set(null);
    await signInWithEmailAndPassword(auth, email, password);
    return authStatusStore.set(null);
  } catch (error) {
    if (!(error instanceof FirebaseError)) {
      throw new Error('Caught non-Firebase error!');
    }

    return authStatusStore.set({
      code: error.code,
      message: error.message,
    });
  }
}
