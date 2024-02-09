import type {
  FSFile,
  CFCallableGetPasswordRequest,
  CFCallableGetPasswordResponse,
} from '@armadillo/shared';

import { FS_COLLECTION_FILES } from '@armadillo/shared';

import { logger } from 'firebase-functions/v2';
import { HttpsError, onCall } from 'firebase-functions/v2/https';

import { firestore } from '../../../firebase';

/**
 * Compares the provided password hash with the one stored in Firestore.
 *
 * @param   auth        The authentication context of the request.
 * @param   data        The request data.
 * @param   rawRequest  The raw HTTP request object.
 * @returns The response containing the file ID and encryption hash.
 * @throws  If the request fails any of the precondition checks or encounters an internal error.
 * @throws  If the file is not found, the request is unauthorized, or an internal server error occurs.
 */
export const https_onCall_getPassword = onCall<CFCallableGetPasswordRequest>(
  { cors: true },
  async ({ auth, data, rawRequest }): Promise<CFCallableGetPasswordResponse> => {
    logger.log(rawRequest);

    const { origin, clientId, fileId, fileEncryptionHash } = data;

    // Check if origin is valid
    if (!origin || (origin !== 'web' && origin !== 'wrapper'))
      throw new HttpsError('failed-precondition', 'Origin Invalid');

    // Check if request includes a client id
    if (!clientId) throw new HttpsError('failed-precondition', 'Client ID Invalid');

    // Check if request includes a file id
    if (!fileId) throw new HttpsError('failed-precondition', 'File ID Invalid');

    // Check if request includes a file encryption hash
    if (!fileEncryptionHash)
      throw new HttpsError('failed-precondition', 'File Encryption Hash Invalid');

    try {
      const fsFileRef = firestore.collection(FS_COLLECTION_FILES).doc(fileId);
      const fsFileSnapshot = await fsFileRef.get();

      // Check if file exists in Firestore
      const fsFileExists = fsFileSnapshot.exists;
      if (!fsFileExists) throw new HttpsError('not-found', 'File Not Found');

      const fsFileData = fsFileSnapshot.data() as FSFile;
      if (fsFileData.file_classification !== 'OPEN' && !auth)
        throw new HttpsError('failed-precondition', 'Authentication Error');

      //If file class is not 'OPEN' and user is authenticated but not authorized to access file
      if (auth && !fsFileData.file_permissions.includes(auth.uid))
        throw new HttpsError('permission-denied', 'Unauthorised Error');

      if (!fsFileData.file_id || !fsFileData.file_encryption_hash || !fsFileData.file_permissions)
        throw new HttpsError('internal', 'Internal Server Error');

      if (fileEncryptionHash !== fsFileData.file_encryption_hash)
        throw new HttpsError('permission-denied', 'Unauthorised Error');

      return {
        fileId: fsFileData.file_id,
        fileExt: fsFileData.file_ext,
        fileEncryptionHash: fsFileData.file_encryption_hash,
        fileOwner: fsFileData.file_owner_id,
      };
    } catch (error) {
      logger.error(error);
      throw new HttpsError('internal', 'Internal Error');
    }
  }
);
