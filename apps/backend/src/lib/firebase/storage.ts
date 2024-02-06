import { getStorage } from 'firebase/storage';

import { app } from '$lib/firebase';
import { BUCKET_TEMP, BUCKET_FILES, BUCKET_HEADSHOTS } from '@armadillo/shared';

export const tempStorage = getStorage(app, `gs://${BUCKET_TEMP}`);
export const fileStorage = getStorage(app, `gs://${BUCKET_FILES}`);
export const headshotStorage = getStorage(app, `gs://${BUCKET_HEADSHOTS}`);
