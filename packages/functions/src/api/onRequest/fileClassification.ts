import type { FSFileDocument, CFApiWrapperResponse } from '@armadillo/shared';

import * as logger from 'firebase-functions/logger';

import { onRequest } from 'firebase-functions/v2/https';
import { FS_COLLECTION_FILES } from '@armadillo/shared';

import { firestore } from '../../firebase';

export const http_onRequest_fileClassification = onRequest({ cors: true }, async (req, res) => {
  logger.log(req);

  const apiClientId = req.get('X-ARMADILLO-CLIENTID');
  const apiFileUUID = req.get('X-ARMADILLO-FILEUUID');

  if (req.method !== 'POST') {
    const responseJson: CFApiWrapperResponse = {
      status: 405,
      message: 'Invalid request, please refer to the documentation for more information.',
      data: null,
    };

    res.status(responseJson.status).json(responseJson);
    return;
  }

  if (!apiClientId || !apiFileUUID || !apiClientId.length || !apiFileUUID.length) {
    const responseJson: CFApiWrapperResponse = {
      status: 412,
      message: 'Invalid request, please refer to the documentation for more information.',
      data: null,
    };

    res.status(responseJson.status).json(responseJson);
    return;
  }

  try {
    const fileSnapshot = await firestore.collection(FS_COLLECTION_FILES).doc(apiFileUUID).get();
    const fileExists = fileSnapshot.exists;

    if (!fileExists) {
      const responseJson: CFApiWrapperResponse = {
        status: 404,
        message: 'Invalid request, file not found.',
        data: null,
      };

      res.status(responseJson.status).json(responseJson);
      return;
    }

    const fileData = fileSnapshot.data() as FSFileDocument;
    if (!fileData.file_classification) {
      const responseJson: CFApiWrapperResponse = {
        status: 500,
        message: 'Internal server error, please try again in awhile.',
        data: null,
      };

      res.status(responseJson.status).json(responseJson);
      return;
    }

    const responseJson: CFApiWrapperResponse = {
      status: 200,
      message: `File classification for ${apiFileUUID} successfully retrieved.`,
      data: fileData.file_classification,
    };

    res.status(responseJson.status).json(responseJson);
    return;
  } catch (error) {
    logger.error(error);
  }
});
