import type {
  FSAudit,
  FSFile,
  CFCallableGetClassificationRequest,
  CFCallableGetClassificationResponse,
} from '@armadillo/shared';

import { FS_COLLECTION_AUDITS, FS_COLLECTION_FILES } from '@armadillo/shared';

import { logger } from 'firebase-functions/v2';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { FieldValue } from 'firebase-admin/firestore';

import { firestore } from '../../../firebase';

/**
 * Retrieves the classification of a file for the wrapper.
 *
 * @param   auth        The authentication data.
 * @param   data        The request data containing the origin, client ID, and file ID.
 * @param   rawRequest  The raw HTTP request object.
 * @returns The classification of the file.
 * @throws  If there is an authentication error, invalid origin, invalid client ID, file not found, or internal server error.
 */
export const https_onCall_file_getClassification = onCall<CFCallableGetClassificationRequest>(
  { cors: true },
  async ({ auth, data, rawRequest }): Promise<CFCallableGetClassificationResponse> => {
    logger.log(rawRequest);

    const { origin, clientId, fileId } = data;

    // Check if user is already authenticated
    if (auth) throw new HttpsError('failed-precondition', 'Authentication Error');

    // Check if origin is valid
    if (!origin || (origin !== 'web' && origin !== 'wrapper'))
      throw new HttpsError('failed-precondition', 'Origin Invalid');

    // Check if request includes a client id
    if (!clientId) throw new HttpsError('failed-precondition', 'Client ID Invalid');

    const fsFileRef = firestore.collection(FS_COLLECTION_FILES).doc(fileId);
    const fsAuditRef = firestore
      .collection(FS_COLLECTION_AUDITS)
      .doc(`fileClassification-${clientId}`);

    const auditDoc: FSAudit = {
      origin,
      client_id: clientId,
      audit_step: 'FCLAS',
      audit_info: {
        file_id: fileId,
      },
      accessed_at: FieldValue.serverTimestamp(),
    };

    try {
      await fsAuditRef.set(auditDoc, { merge: true });

      const fileSnapshot = await fsFileRef.get();
      const fileExists = fileSnapshot.exists;
      if (!fileExists) throw new HttpsError('not-found', 'File Not Found');

      const fileData = fileSnapshot.data() as FSFile;
      if (!fileData.file_classification) throw new HttpsError('internal', 'Internal Server Error');

      return { classification: fileData.file_classification };
    } catch (error) {
      logger.error(error);
      throw new HttpsError('internal', 'Internal Server Error');
    }
  }
);
