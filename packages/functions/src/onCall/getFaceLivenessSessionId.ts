import type { CFCallableFaceLivenessSessionRequest } from '@armadillo/shared';

import { logger } from 'firebase-functions/v2';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { defineString } from 'firebase-functions/params';

import { RekognitionClient, CreateFaceLivenessSessionCommand } from '@aws-sdk/client-rekognition';

const rekognitionAccessKeyId = defineString('REKOGNITION_ACCESS_KEY_ID');
const rekognitionSecretAccessKey = defineString('REKOGNITION_SECRET_ACCESS_KEY');

export const onCall_getFaceLivenessSessionId = onCall<CFCallableFaceLivenessSessionRequest>(
  { cors: true },
  async ({ auth, data, rawRequest }) => {
    logger.log(rawRequest);

    const { client_id: clientId } = data;

    // Check if request is already authenticated
    if (auth) throw new HttpsError('failed-precondition', 'Authentication Error');

    // Check if request includes a client id
    if (!clientId) throw new HttpsError('failed-precondition', 'Client ID Invalid');

    const rekognitionClient = new RekognitionClient({
      region: 'ap-northeast-1',
      credentials: {
        accessKeyId: rekognitionAccessKeyId.value(),
        secretAccessKey: rekognitionSecretAccessKey.value(),
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
