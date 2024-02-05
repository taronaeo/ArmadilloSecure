import { dev } from '$app/environment';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

import { getApp, getApps, initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: 'AIzaSyC6gzoI-LndCYQ_QDiFlAkvIoTRq05my8c',
  authDomain: 'it2566-armadillo.firebaseapp.com',
  projectId: 'it2566-armadillo',
  storageBucket: 'it2566-armadillo.appspot.com',
  messagingSenderId: '515917548885',
  appId: '1:515917548885:web:6d518785d21891c81a33dc',
};

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const storage = getStorage(app);
export const firestore = getFirestore(app);
export const functions = getFunctions(app, 'asia-southeast1');

if (dev) {
  console.warn(`
    !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    ! DEVELOPMENT MODE DETECTED.          !
    ! IF YOU'RE BUILDING FOR PRODUCTION,  !
    ! THIS SHOULD BE A WARNING!           !
    !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  `);

  connectAuthEmulator(auth, 'http://127.0.0.1:9099');
  connectStorageEmulator(storage, '127.0.0.1', 9199);
  connectFirestoreEmulator(firestore, '127.0.0.1', 8080);
  connectFunctionsEmulator(functions, '127.0.0.1', 5001);
}
