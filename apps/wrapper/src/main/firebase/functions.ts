import { httpsCallable } from 'firebase/functions';

import { functions } from '../firebase';

const dev = import.meta.env.DEV;

const HTTPS_ENDPOINTS = {};
const HTTPS_CALLABLES = {
  http_onRequest_fileClassification: 'DEPLOYED',
  https_onCall_file_getClassification: 'DEPLOYED',
  https_onCall_rekognition_getSessionId: 'DEPLOYED',
  https_onCall_rekognition_getAuthToken: 'DEPLOYED',
  https_onCall_getPassword: 'DEPLOYED',
};

export const getHttpsCallable = <RQ, RS>(endpoint: keyof typeof HTTPS_CALLABLES) =>
  httpsCallable<RQ, RS>(functions, endpoint, {
    timeout: 60000,
  });

export const getHttpsEndpoint = (
  endpoint: keyof typeof HTTPS_ENDPOINTS,
  region = 'asia-southeast1'
) => {
  if (typeof endpoint === 'undefined' || !endpoint) throw new Error('Missing `endpoint` parameter');

  if (dev) return `http://127.0.0.1:5000/it2566-armadillo/${region}/${endpoint}`;
  return `https://${region}-it2566-armadillo.cloudfunctions.net/${endpoint}`;
};
