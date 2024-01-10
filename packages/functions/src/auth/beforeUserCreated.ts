import type { FSUser } from '@armadillo/shared';

import { FS_COLLECTION_USERS } from '@armadillo/shared';
import { FieldValue } from 'firebase-admin/firestore';

import { logger } from 'firebase-functions/v2';
import { beforeUserCreated } from 'firebase-functions/v2/identity';

import { firestore } from '../firebase';

/**
 * Creates a new user document in Firestore when a new user is created.
 *
 * @param   event The event object containing information about the new user.
 * @returns A user override object when the user document is created.
 */
export const auth_beforeUserCreated = beforeUserCreated(async (event) => {
  logger.log(event);

  const {
    data: { uid, email },
  } = event;

  const user: FSUser = {
    uid,
    rekognitionId: null,
    email,
    email_verified: false,
    full_name: null,
    headshot_url: null,
    is_onboarded: false,
    is_suspended: false,
    updated_at: FieldValue.serverTimestamp(),
    created_at: FieldValue.serverTimestamp(),
  };

  try {
    logger.log(user);
    await firestore.collection(FS_COLLECTION_USERS).doc(uid).set(user, { merge: true });
  } catch (error) {
    logger.error(error);
  }

  return {};
});
