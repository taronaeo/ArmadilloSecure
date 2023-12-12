import { FirebaseError } from 'firebase/app';
import { signOut as _signOut, signInWithCustomToken } from 'firebase/auth';

import { auth } from '../firebase';
import { authStatusStore } from '../stores';

export function signOut() {
  return _signOut(auth);
}

export async function signInServerToken(authToken: string) {
  try {
    authStatusStore.set(null);
    await signInWithCustomToken(auth, authToken);
    return authStatusStore.set(null);
  } catch (error) {
    if (!(error instanceof FirebaseError)) throw new Error('Caught non-firebase error!');

    return authStatusStore.set({
      code: error.code,
      message: error.message,
    });
  }
}
