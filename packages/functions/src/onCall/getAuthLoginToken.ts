import type { CFCallableAuthLoginTokenRequest } from '@armadillo/shared';

import { logger } from 'firebase-functions/v2';
import { HttpsError, onCall } from 'firebase-functions/v2/https';

/**
 * Cloud Function Callable triggered by Armadillo Wrapper
 *
 * @param auth        The authentication data.
 * @param data        The request data.
 * @param rawRequest  The raw HTTP request object.
 */
export const onCall_getAuthLoginToken = onCall<CFCallableAuthLoginTokenRequest>(
  { cors: true },
  async ({ auth, data, rawRequest }) => {
    logger.log(rawRequest);

    const {
      client_id: clientId,
      rekognition_session_id: rekognitionSessionId,
      antivirus: {
        full_scan_end_time: fullScanEndTime,
        last_updated_anti_virus: lastUpdatedAntivirus,
        last_updated_anti_spyware: lastUpdatedAntispyware,
      },
    } = data;

    // Check if required data is provided
    if (
      auth ||
      !clientId ||
      !rekognitionSessionId ||
      !fullScanEndTime ||
      !lastUpdatedAntivirus ||
      !lastUpdatedAntispyware
    )
      throw new HttpsError('failed-precondition', 'Bad Request');

    // TODO: Implement AWS Rekognition Liveness check and SearchFacesByImage
  }
);
