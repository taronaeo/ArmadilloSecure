import type {
  FSUser,
  CFCallableGetAuthTokenRequest,
  CFCallableGetAuthTokenResponse,
} from '@armadillo/shared';

import {
  AWS_REKOGNITION_REGION,
  AWS_REKOGNITION_COLLECTION_ID,
  AWS_REKOGNITION_COLLECTION_DEV_ID,
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

    const DEV = process.env.FUNCTIONS_EMULATOR === 'true';
    const REKOGNITION_ACCESS_KEY_ID = process.env.REKOGNITION_ACCESS_KEY_ID;
    const REKOGNITION_ACCESS_KEY_SECRET = process.env.REKOGNITION_ACCESS_KEY_SECRET;
    const REKOGNITION_COLLECTION_ID = !DEV
      ? AWS_REKOGNITION_COLLECTION_ID
      : AWS_REKOGNITION_COLLECTION_DEV_ID;

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

    // TODO: Check with Firestore if auth flow has been done prior.

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
      CollectionId: REKOGNITION_COLLECTION_ID,
      Image: {
        Bytes: auditImages[0].Bytes,
      },
    });

    const { FaceMatches: faceMatches } = await rekognitionClient.send(rekognitionSearchCmd);
    if (!faceMatches) throw new HttpsError('internal', 'Internal Error');

    for (const faceMatch of faceMatches) {
      if (!faceMatch.Face) continue;

      const snapshot = await fsUserCol
        .where('rekognitionId', '==', faceMatch.Face.FaceId)
        .limit(1)
        .get();

      const users = snapshot.docs.map((doc) => doc.data() as FSUser);
      if (users.length < 1) continue;

      const user = users[0];
      const authToken = await adminAuth.createCustomToken(user.uid);

      return { token: authToken };
    }

    throw new HttpsError('unauthenticated', 'Unable to authenticate user');
  }
);
