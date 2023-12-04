import type { UserDocument } from '@armadillo/shared';

import * as logger from 'firebase-functions/logger';
import { USERS_COLLECTION } from '@armadillo/shared';

import { FieldValue } from 'firebase-admin/firestore';
import { beforeUserCreated } from 'firebase-functions/v2/identity';

import { firestore } from '../firebase';

export const auth_onUserCreate = beforeUserCreated(async (event) => {
  logger.log(event);

  const {
    data: { uid, email },
  } = event;

  const user: UserDocument = {
    uid,
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
    await firestore.collection(USERS_COLLECTION).doc(uid).set(user, { merge: true });
  } catch (error) {
    logger.error(error);
  }

  return {};
});
