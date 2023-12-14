import type { User } from 'firebase/auth';

import { dev } from '$app/environment';
import { FirebaseError } from 'firebase/app';
import {
  signOut as _signOut,
  applyActionCode,
  sendEmailVerification,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth';

import { auth } from '$lib/firebase';

type ErrorCallback = FirebaseError | null;

/**
 * Sends an email verification request to a registered user.
 *
 * @param user      The Firebase user object for whom to send the verification email.
 * @param errorCb   A callback function to be called with any errors encountered during verification request.
 *
 * @callback ErrorCallback
 * @property code   The error code provided by Firebase.
 *
 * @returns Resolves if the verification email is sent successfully, rejects with an error if any occurs.
 */
export async function verifyEmail(user: User, errorCb: (error: ErrorCallback) => void) {
  try {
    errorCb(null);
    await sendEmailVerification(user);
  } catch (error) {
    if (dev) console.error(error);
    if (!(error instanceof FirebaseError)) throw new Error('Caught unknown error!');

    return errorCb(error);
  }
}

/**
 * @deprecated This function is deprecated and will be removed in the future. All email
 *             verifications will automatically be handled by Firebase Hosting.
 *
 * Verifies a user's email address using an out-of-band (OOB) code received through email.
 *
 * @param oobCode The OOB code received in the email verification link.
 * @param errorCb A callback function called with any errors encountered during verification.
 *
 * @callback ErrorCallback
 * @property code The error code provided by Firebase.
 *
 * @returns Resolves if the email address is successfully verified, rejects with an error if any occurs.
 */
export async function verifyEmailOob(oobCode: string, errorCb: (error: ErrorCallback) => void) {
  try {
    errorCb(null);
    await applyActionCode(auth, oobCode);
  } catch (error) {
    if (dev) console.error(error);
    if (!(error instanceof FirebaseError)) throw new Error('Caught unknown error!');

    return errorCb(error);
  }
}

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
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    if (!user.emailVerified) sendEmailVerification(user);
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
