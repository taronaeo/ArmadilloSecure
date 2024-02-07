import type { FSUser, FSDomain } from '@armadillo/shared';

import { FS_COLLECTION_USERS, FS_COLLECTION_DOMAINS } from '@armadillo/shared';
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

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-non-null-asserted-optional-chain
  const domainAddress = email?.split('@').pop()!; // Bad practice, but should change later.

  const batch = firestore.batch();
  const userRef = firestore.collection(FS_COLLECTION_USERS).doc(uid);
  const domainRef = firestore.collection(FS_COLLECTION_DOMAINS).doc(domainAddress);
  const domainSnapshot = await domainRef.get();

  const user: FSUser = {
    uid,
    faceId: null,
    email,
    email_verified: false,
    full_name: null,
    headshot_url: null,
    is_onboarded: false,
    is_suspended: false,
    updated_at: FieldValue.serverTimestamp(),
    created_at: FieldValue.serverTimestamp(),
  };
  batch.set(userRef, user);

  if (!domainSnapshot.exists) {
    const domain: FSDomain = {
      domain_dns_suffix: null,
      domain_ipv4_start: null,
      domain_ipv4_end: null,
      domain_administrators: [uid],
      updated_at: FieldValue.serverTimestamp(),
      created_at: FieldValue.serverTimestamp(),
    };

    batch.set(domainRef, domain, { merge: true });
  }

  try {
    logger.log(user);
    await batch.commit();
  } catch (error) {
    logger.error(error);
  }

  return {};
});
