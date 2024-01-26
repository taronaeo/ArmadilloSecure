import type { FSUser } from '@armadillo/shared';

import { FS_COLLECTION_USERS } from '@armadillo/shared';
import { FieldValue } from 'firebase-admin/firestore';

import { logger } from 'firebase-functions/v2';
import { beforeUserSignedIn } from 'firebase-functions/v2/identity';

import { firestore } from '../firebase';

/**
 * Updates the email_verified and updated_at fields of a user document in Firestore when a user signs in.
 *
 * @param   event The event object containing information about the signed-in user.
 * @returns A user override object when the user document is updated.
 */
export const auth_beforeUserSignIn = beforeUserSignedIn(async (event) => {
  logger.log(event);

  const {
    data: { uid, emailVerified },
  } = event;

  const user: Pick<FSUser, 'email_verified' | 'updated_at'> = {
    email_verified: emailVerified,
    updated_at: FieldValue.serverTimestamp(),
  };

  try {
    logger.log(user);
    await firestore.collection(FS_COLLECTION_USERS).doc(uid).set(user, { merge: true });
  } catch (error) {
    logger.error(error);
  }

  return {};
});
