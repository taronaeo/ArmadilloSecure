import { DEV as dev } from 'esm-env';
import { FirebaseError } from 'firebase/app';
import { signOut as _signOut, signInWithCustomToken } from 'firebase/auth';

import { auth } from '../firebase';

type ErrorCallback = FirebaseError | null;

/**
 * Signs out the current user.
 *
 * @param errorCb   A callback function to be called with any errors encountered during sign-out.
 *
 * @callback ErrorCallback
 * @property code   The error code provided by Firebase.
 *
 * @returns Resolves if sign-out is successful, rejects with an error if any occurs.
 */
export async function signOut(errorCb: (error: ErrorCallback) => void) {
  try {
    errorCb(null);
    await _signOut(auth);
  } catch (error) {
    if (dev) console.error(error);
    if (!(error instanceof FirebaseError)) throw new Error('Caught unknown error!');

    return errorCb(error);
  }
}

/**
 * Signs in a user using a server-generated custom token.
 *
 * @param authToken The server-generated custom token for user authentication.
 * @param errorCb   A callback function to be called with any errors encountered during sign-in.
 *
 * @callback ErrorCallback
 * @property code   The error code provided by Firebase.
 *
 * @returns Resolves if sign-in is successful, rejects with an error if any occurs.
 */
export async function signInServerToken(
  authToken: string,
  errorCb: (error: ErrorCallback) => void
) {
  try {
    errorCb(null);
    await signInWithCustomToken(auth, authToken);
  } catch (error) {
    if (dev) console.error(error);
    if (!(error instanceof FirebaseError)) throw new Error('Caught non-firebase error!');

    return errorCb(error);
  }
}
