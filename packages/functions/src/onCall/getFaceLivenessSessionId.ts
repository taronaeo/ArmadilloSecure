import type { CFCallableFaceLivenessSessionRequest } from '@armadillo/shared';

import { logger } from 'firebase-functions/v2';
import { HttpsError, onCall } from 'firebase-functions/v2/https';

import { RekognitionClient, CreateFaceLivenessSessionCommand } from '@aws-sdk/client-rekognition';

export const onCall_getFaceLivenessSessionId = onCall<CFCallableFaceLivenessSessionRequest>(
  { cors: true, secrets: ['REKOGNITION_ACCESS_KEY_ID', 'REKOGNITION_ACCESS_KEY_SECRET'] },
  async ({ auth, data, rawRequest }) => {
    logger.log(rawRequest);

    const { client_id: clientId } = data;
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

    // Check if request is already authenticated
    if (auth) throw new HttpsError('failed-precondition', 'Authentication Error');

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

    const { SessionId } = await rekognitionClient.send(rekognitionCommand);
    return { sessionId: SessionId };
  }
);
