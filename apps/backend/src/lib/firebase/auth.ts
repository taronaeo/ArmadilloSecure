import { dev } from '$app/environment';
import { FirebaseError } from 'firebase/app';
import {
  signOut as _signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth';

import { auth } from '$lib/firebase';

type ErrorCallback = FirebaseError | null;

/**
 * Signs out the current user.
 *
 * @param errorCb A callback function to be called with any errors encountered during sign-out.
 *
 * @callback ErrorCallback
 * @property code   The error code provided by Firebase.
 *
 * @returns Resolves if sign-out is successful, rejects with an error if any occurs.
 */
export function signOut(errorCb: (error: ErrorCallback) => void) {
  try {
    errorCb(null);
    return _signOut(auth);
  } catch (error) {
    if (dev) console.error(error);
    if (!(error instanceof FirebaseError)) throw new Error('Caught unknown error!');

    return errorCb(error);
  }
}

/**
 * Handles user sign-up with email and password.
 *
 * @param email     The user's email address.
 * @param password  The user's password.
 * @param errorCb   A callback function to be called with any errors encountered during sign-up.
 *
 * @callback ErrorCallback
 * @property code   The error code provided by Firebase.
 *
 * @returns Resolves if sign-up is successful, rejects with an error if any occurs.
 */
export async function signUpEmailPassword(
  email: string,
  password: string,
  errorCb: (error: ErrorCallback) => void
) {
  try {
    errorCb(null);
    await createUserWithEmailAndPassword(auth, email, password);
  } catch (error) {
    if (dev) console.error(error);
    if (!(error instanceof FirebaseError)) throw new Error('Caught unknown error!');

    return errorCb(error);
  }
}

/**
 * Handles user sign-in with email and password.
 *
 * @param email     The user's email address.
 * @param password  The user's password.
 * @param errorCb   A callback function to be called with any errors encountered during sign-in.
 *
 * @callback ErrorCallback
 * @property code   The error code provided by Firebase.
 *
 * @returns Resolves if sign-in is successful, rejects with an error if any occurs.
 */
export async function signInEmailPassword(
  email: string,
  password: string,
  errorCb: (error: ErrorCallback) => void
) {
  try {
    errorCb(null);
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    if (dev) console.error(error);
    if (!(error instanceof FirebaseError)) throw new Error('Caught non-Firebase error!');

    return errorCb(error);
  }
}
