import type {
  FSUser,
  CFCallableGetAuthTokenRequest,
  CFCallableGetAuthTokenResponse,
} from '@armadillo/shared';

import {
  AWS_REKOGNITION_REGION,
  AWS_REKOGNITION_COLLECTION_ID,
  FS_COLLECTION_AUDITS,
} from '@armadillo/shared';

import { logger } from 'firebase-functions/v2';
import { HttpsError, onCall } from 'firebase-functions/v2/https';

import {
  RekognitionClient,
  GetFaceLivenessSessionResultsCommand,
  SearchFacesByImageCommand,
} from '@aws-sdk/client-rekognition';

import { auth as adminAuth, firestore } from '../../../firebase';

/**
 * Generates a custom login token using a completed Rekognition session id.
 *
 * @param   data    The request data.
 * @param   context The context object.
 * @returns The authentication token.
 * @throws  If there is an error during the authentication process.
 */
export const https_onCall_rekognition_getAuthToken = onCall<CFCallableGetAuthTokenRequest>(
  { cors: true, secrets: ['REKOGNITION_ACCESS_KEY_ID', 'REKOGNITION_ACCESS_KEY_SECRET'] },
  async ({ auth, data, rawRequest }): Promise<CFCallableGetAuthTokenResponse> => {
    logger.log(rawRequest);

    const { origin, clientId, sessionId } = data;
    const fsUserCol = firestore.collection('users');

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

    // Check if request includes a session id
    if (!sessionId) throw new HttpsError('failed-precondition', 'Session ID Invalid');

    const fsAuditRef = firestore.collection(FS_COLLECTION_AUDITS);
    const fsAuditFileClassification = fsAuditRef.doc(`FILE_CLASSIFICATION-${clientId}`);
    const fsAuditFaceSession = fsAuditRef.doc(`FACE_SESSION-${clientId}`);

    //! PROBLEMATIC
    const [fileClassificationSnapshot, faceSessionSnapshot] = await Promise.all([
      fsAuditFileClassification.get(),
      fsAuditFaceSession.get(),
    ]);

    if (!fileClassificationSnapshot.exists || !faceSessionSnapshot.exists)
      throw new HttpsError('internal', 'Audit Sequence Incomplete');

    const rekognitionClient = new RekognitionClient({
      region: AWS_REKOGNITION_REGION,
      credentials: {
        accessKeyId: REKOGNITION_ACCESS_KEY_ID,
        secretAccessKey: REKOGNITION_ACCESS_KEY_SECRET,
      },
    });

    const rekognitionLivenessCmd = new GetFaceLivenessSessionResultsCommand({
      SessionId: sessionId,
    });

    const {
      Status: status,
      Confidence: confidence,
      AuditImages: auditImages,
    } = await rekognitionClient.send(rekognitionLivenessCmd);

    if (!status || !confidence || !auditImages) throw new HttpsError('internal', 'Internal Error');
    if (status !== 'SUCCEEDED') throw new HttpsError('internal', 'Unable to retrieve session data');
    if (confidence < 95) throw new HttpsError('failed-precondition', 'Liveness check failed');
    if (auditImages.length < 1) throw new HttpsError('internal', 'Unable to retrieve audit images');

    const rekognitionSearchCmd = new SearchFacesByImageCommand({
      CollectionId: AWS_REKOGNITION_COLLECTION_ID,
      Image: {
        Bytes: auditImages[0].Bytes,
      },
    });

    const { FaceMatches: faceMatches } = await rekognitionClient.send(rekognitionSearchCmd);
    if (!faceMatches) throw new HttpsError('unauthenticated', 'Unable to authenticate face');

    for (const faceMatch of faceMatches) {
      if (!faceMatch.Face) continue;

      const { ExternalImageId: externalImageId } = faceMatch.Face;
      if (!externalImageId) continue;

      try {
        const fsUserSnapshot = await fsUserCol.doc(externalImageId).get();
        const fsUserData = fsUserSnapshot.data() as FSUser;
        const authToken = await adminAuth.createCustomToken(fsUserData.uid);

        return { token: authToken };
      } catch (error) {
        logger.error(error);
        throw new HttpsError('internal', 'Internal Error');
      }
    }

    throw new HttpsError('unauthenticated', 'Unable to authenticate face');
  }
);
