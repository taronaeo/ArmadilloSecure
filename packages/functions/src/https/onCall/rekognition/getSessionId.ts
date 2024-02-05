import type {
  FSAudit,
  CFCallableGetSessionIdRequest,
  CFCallableGetSessionIdResponse,
} from '@armadillo/shared';

import { FS_COLLECTION_AUDITS, FS_COLLECTION_FILES } from '@armadillo/shared';
import { RekognitionClient, CreateFaceLivenessSessionCommand } from '@aws-sdk/client-rekognition';

import { logger } from 'firebase-functions/v2';
import { onCall, HttpsError } from 'firebase-functions/v2/https';

import { firestore } from '../../../firebase';
import { FieldValue } from 'firebase-admin/firestore';

/**
 * Retrieves a session ID from AWS Rekognition for the wrapper.
 *
 * @param   auth        The authentication data.
 * @param   data        The request data containing the client ID.
 * @param   rawRequest  The raw HTTP request object.
 * @returns The session ID object.
 * @throws  Throws an error if there is an internal error, authentication error, or invalid client ID.
 */
export const https_onCall_rekognition_getSessionId = onCall<CFCallableGetSessionIdRequest>(
  { cors: true, secrets: ['REKOGNITION_ACCESS_KEY_ID', 'REKOGNITION_ACCESS_KEY_SECRET'] },
  async ({ auth, data, rawRequest }): Promise<CFCallableGetSessionIdResponse> => {
    logger.log(rawRequest);

    const {
      origin,
      clientId,
      fileId,
      fullScanEndTime,
      antivirusSignaturesLastUpdated,
      antispywareSignaturesLastUpdated,
    } = data;
    console.log(data);

    const DAY_IN_MILLISECONDS = 86400000; // 24 hours
    const MONTH_IN_MILLISECONDS = 2592000000; // 30 days
    const REKOGNITION_ACCESS_KEY_ID = process.env.REKOGNITION_ACCESS_KEY_ID;
    const REKOGNITION_ACCESS_KEY_SECRET = process.env.REKOGNITION_ACCESS_KEY_SECRET;

    // Check if environment variables are fetched from Secret Manager
    if (!REKOGNITION_ACCESS_KEY_ID || !REKOGNITION_ACCESS_KEY_SECRET) {
      logger.error(`
        Missing REKOGNITION_ACCESS_KEY_ID or REKOGNITION_ACCESS_KEY_SECRET from environment variables!

        You are seeing this message because REKOGNITION_ACCESS_KEY_ID or REKOGNITION_ACCESS_KEY_SECRET
        is not set in GCP Secret Manager (production) or .env.local (development). Please ensure that
        the values are set before deploying or running locally.
      `);

      throw new HttpsError('internal', 'Internal Error');
    }

    // Check if user is already authenticated
    if (auth) throw new HttpsError('failed-precondition', 'Authentication Error');

    // Check if origin is valid
    if (!origin || (origin !== 'web' && origin !== 'wrapper'))
      throw new HttpsError('failed-precondition', 'Origin Invalid');

    // Check if request includes a client id
    if (!clientId) throw new HttpsError('failed-precondition', 'Client ID Invalid');

    // Check if file id is valid
    if (!fileId) throw new HttpsError('failed-precondition', 'File ID Invalid');

    // Check if full scan end time is valid
    if (!fullScanEndTime) throw new HttpsError('failed-precondition', 'Full Scan End Time Invalid');

    // Check if antivirus signatures last updated is valid
    if (!antivirusSignaturesLastUpdated)
      throw new HttpsError('failed-precondition', 'Antivirus Signatures Last Updated Invalid');

    // Check if antispyware signatures last updated is valid
    if (!antispywareSignaturesLastUpdated)
      throw new HttpsError('failed-precondition', 'Antispyware Signatures Last Updated Invalid');

    const currentTime = new Date().getTime();
    const fsFileRef = firestore.collection(FS_COLLECTION_FILES).doc(fileId);
    const fsAuditRef = firestore.collection(FS_COLLECTION_AUDITS).doc(`FACE_SESSION-${clientId}`);

    const auditDoc: FSAudit = {
      origin,
      client_id: clientId,
      audit_step: 'FACE_SESSION',
      audit_info: {
        full_scan_end_time: fullScanEndTime,
        antivirus_signature_last_updated: antivirusSignaturesLastUpdated,
        antispyware_signature_last_updated: antispywareSignaturesLastUpdated,
      },
      accessed_at: FieldValue.serverTimestamp(),
    };

    const rekognitionClient = new RekognitionClient({
      region: 'ap-northeast-1',
      credentials: {
        accessKeyId: REKOGNITION_ACCESS_KEY_ID,
        secretAccessKey: REKOGNITION_ACCESS_KEY_SECRET,
      },
    });

    const rekognitionCommand = new CreateFaceLivenessSessionCommand({
      Settings: {
        AuditImagesLimit: 2,
      },
    });

    const { SessionId: sessionId } = await rekognitionClient.send(rekognitionCommand);
    if (!sessionId) throw new HttpsError('internal', 'Unable to retrieve Session ID');

    try {
      await fsAuditRef.set(auditDoc, { merge: true });

      const fileSnapshot = await fsFileRef.get();
      const fileExists = fileSnapshot.exists;
      if (!fileExists) throw new HttpsError('not-found', 'File Not Found');

      // Check if full scan end time is outdated
      if (currentTime - fullScanEndTime <= DAY_IN_MILLISECONDS)
        throw new HttpsError('failed-precondition', 'Full Scan Outdated');

      // Check if antivirus signatures last updated is outdated
      if (currentTime - antivirusSignaturesLastUpdated >= MONTH_IN_MILLISECONDS)
        throw new HttpsError('failed-precondition', 'Antivirus Signatures Outdated');

      // Check if antispyware signatures last updated is outdated
      if (currentTime - antispywareSignaturesLastUpdated >= MONTH_IN_MILLISECONDS)
        throw new HttpsError('failed-precondition', 'Antispyware Signatures Outdated');

      return { sessionId };
    } catch (error) {
      logger.error(error);
      throw new HttpsError('internal', 'Internal Error');
    }
  }
);
