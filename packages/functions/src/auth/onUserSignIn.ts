import type { UserDocument } from '@armadillo/shared';

import { logger } from 'firebase-functions/v2';
import { beforeUserSignedIn } from 'firebase-functions/v2/identity';

import { FieldValue } from 'firebase-admin/firestore';
import { FS_COLLECTION_USERS } from '@armadillo/shared';

import { firestore } from '../firebase';

export const auth_onUserSignIn = beforeUserSignedIn(async (event) => {
  logger.log(event);

  const {
    data: { uid, emailVerified },
  } = event;

  const user: Pick<UserDocument, 'email_verified' | 'updated_at'> = {
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
