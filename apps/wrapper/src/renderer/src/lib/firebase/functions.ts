// import { DEV as dev } from 'esm-env';
import { httpsCallable } from 'firebase/functions';

import { functions } from '../firebase';

const HTTPS_ENDPOINTS = {
  http_onRequest_fileClassification: 'DEPRECATING_SOON',
};

const HTTPS_CALLABLES = {
  getAuthLoginToken: 'NOT_DEPLOYED',
  onCall_getFilePassword: 'DEPLOYED',
  onCall_getFileClassification: 'DEPLOYED',
};

export const getHttpsCallable = (endpoint: keyof typeof HTTPS_CALLABLES) =>
  httpsCallable(functions, endpoint, {
    timeout: 60000,
  });

export const getHttpsEndpoint = (
  endpoint: keyof typeof HTTPS_ENDPOINTS,
  region = 'asia-southeast1'
) => {
  if (typeof endpoint === 'undefined' || !endpoint) throw new Error('Missing `endpoint parameter`');

  if (dev) return `http://127.0.0.1:5000/it2566-armadillo/${region}/${endpoint}`;
  return `https://${region}-it2566-armadillo.cloudfunctions.net/${endpoint}`;
};
