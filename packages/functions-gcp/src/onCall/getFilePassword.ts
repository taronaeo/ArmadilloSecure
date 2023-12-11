import type { FSFileDocument, CFCallableFilePasswordRequest } from '@armadillo/shared';

import { logger } from 'firebase-functions/v2';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { FS_COLLECTION_FILES } from '@armadillo/shared';

import { firestore } from '../firebase';

/**
 * Cloud Function Callable triggered by Armadillo Wrapper
 *
 * @param auth        The authentication data.
 * @param data        The request data.
 * @param rawRequest  The raw HTTP request object.
 */
export const onCall_getFilePassword = onCall<CFCallableFilePasswordRequest>(
  { cors: true },
  async ({ auth, data, rawRequest }) => {
    logger.log(rawRequest);

    const { clientId, file_id: fileId, file_encryption_hash: fileEncryptionHash } = data;

    // Check if request is authenticated
    if (!auth) throw new HttpsError('failed-precondition', 'Authentication Error');

    // Check if request includes a client id
    if (!clientId) throw new HttpsError('failed-precondition', 'Client ID Invalid');

    // Check if request includes a file id
    if (!fileId) throw new HttpsError('failed-precondition', 'File ID Invalid');

    // Check if request includes a file encryption hash
    if (!fileEncryptionHash)
      throw new HttpsError('failed-precondition', 'File Encryption Hash Invalid');

    try {
      const fileRef = firestore.collection(FS_COLLECTION_FILES).doc(fileId);
      const fileSnapshot = await fileRef.get();

      // Check if file exists in Firestore
      const fileExists = fileSnapshot.exists;
      if (!fileExists) throw new HttpsError('not-found', 'File Not Found');

      // Check if file is structured properly
      const fileData = fileSnapshot.data() as FSFileDocument;
      if (!fileData.file_id || !fileData.file_encryption_hash || !fileData.file_permissions)
        throw new HttpsError('internal', 'Internal Server Error');

      // TODO: Check authentication object against file permission

      // Check if the file encryption hash provided is the same as in Firestore
      if (fileEncryptionHash !== fileData.file_encryption_hash)
        throw new HttpsError('permission-denied', 'Unauthorised Error');

      return {
        file_id: fileData.file_id,
        file_encryption_hash: fileData.file_encryption_hash,
      } as FSFileDocument;
    } catch (error) {
      logger.error(error);
      throw new HttpsError('unknown', 'Unknown Error', error);
    }
  }
);
