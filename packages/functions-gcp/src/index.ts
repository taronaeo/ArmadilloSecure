// Auto-init Firebase Admin
import './firebase';
import { setGlobalOptions } from 'firebase-functions/v2';

setGlobalOptions({
  maxInstances: 1,
  concurrency: 1000,
  timeoutSeconds: 60,
  region: 'asia-southeast1',
});

// Export Cloud Functions below
export * from './auth/onUserCreate';
