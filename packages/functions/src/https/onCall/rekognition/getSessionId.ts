import type {
  CFCallableGetSessionIdRequest,
  CFCallableGetSessionIdResponse,
} from '@armadillo/shared';

import { logger } from 'firebase-functions/v2';
import { onCall, HttpsError } from 'firebase-functions/v2/https';

import { RekognitionClient, CreateFaceLivenessSessionCommand } from '@aws-sdk/client-rekognition';

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

    const { origin, clientId } = data;
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

    // TODO: Check with Firestore if auth flow has been done prior.

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

    return { sessionId };
  }
);
