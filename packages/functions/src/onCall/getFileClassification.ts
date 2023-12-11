import type { FSFileDocument } from '@armadillo/shared';

import { logger } from 'firebase-functions/v2';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { FS_COLLECTION_FILES, CFCallableFileClassificationRequest } from '@armadillo/shared';

import { firestore } from '../firebase';

/**
 * Cloud Function Callable triggered by Armadillo Wrapper
 *
 * @param auth        The authentication data.
 * @param data        The request data.
 * @param rawRequest  The raw HTTP request object.
 */
export const onCall_getFileClassification = onCall<CFCallableFileClassificationRequest>(
  { cors: true },
  async ({ auth, data, rawRequest }) => {
    logger.log(rawRequest);

    const { client_id: clientId, file_id: fileId } = data;

    // Check if request is authenticated
    if (auth) throw new HttpsError('failed-precondition', 'Authentication Error');

    // Check if request includes client id
    if (!clientId) throw new HttpsError('failed-precondition', 'Client ID Invalid');

    // Check if request includes a file id
    if (!fileId) throw new HttpsError('failed-precondition', 'File ID Invalid');

    try {
      const fileRef = firestore.collection(FS_COLLECTION_FILES).doc(fileId);
      const fileSnapshot = await fileRef.get();

      // Check if file exists in Firestore
      const fileExists = fileSnapshot.exists;
      if (!fileExists) throw new HttpsError('not-found', 'File Not Found');

      // Check if file is structured properly
      const fileData = fileSnapshot.data() as FSFileDocument;
      if (!fileData.file_classification) throw new HttpsError('internal', 'Internal Server Error');

      return { file_classification: fileData.file_classification } as FSFileDocument;
    } catch (error) {
      logger.error(error);
      throw new HttpsError('unknown', 'Unknown Error', error);
    }
  }
);
