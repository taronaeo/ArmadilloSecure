// import { dev } from '$app/environment';
import { functions } from '../firebase';

import { httpsCallable } from 'firebase/functions';

const endpoints = {
  // TODO: Populate all Cloud Functions endpoints
};

export const getHttpsCallable = (endpoint: keyof typeof endpoints) =>
  httpsCallable(functions, endpoint, {
    timeout: 60000,
  });

export const getHttpsEndpoint = (endpoint: keyof typeof endpoints, region = 'asia-southeast1') => {
  if (typeof endpoint === 'undefined' || !endpoint) throw new Error('Missing `endpoint parameter`');

  // TODO: Re-enable when emulators are setup
  // if (dev) return `http://127.0.0.1:5000/it2566-armadillo/${region}/${endpoint}`;
  return `https://${region}-it2566-armadillo.cloudfunctions.net/${endpoint}`;
};
