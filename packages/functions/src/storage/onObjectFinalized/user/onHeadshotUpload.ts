import type { FSUser } from '@armadillo/shared';

import { BUCKET_HEADSHOTS, FS_COLLECTION_USERS } from '@armadillo/shared';
import { dirname, basename } from 'path';

import { logger } from 'firebase-functions/v2';
import { onObjectFinalized } from 'firebase-functions/v2/storage';

import { RekognitionClient, IndexFacesCommand } from '@aws-sdk/client-rekognition';

import { firestore, bucketHeadshots } from '../../../firebase';

/**
 * Handles the event when a headshot image is uploaded to the user's storage bucket.
 *
 * This function performs the following tasks:
 * 1. Validates the content type of the uploaded file.
 * 2. Ignores folder or unknown file creations.
 * 3. Checks if the uploaded file is an image.
 * 4. Retrieves the necessary environment variables from Secret Manager.
 * 5. Checks if the uploaded image is named 'headshot.png'.
 * 6. Downloads the headshot image from the storage bucket.
 * 7. Uses AWS Rekognition to index the face in the headshot image.
 * 8. Stores the face ID in the Firestore database for the corresponding user.
 *
 * @param {Object} data - The event data containing information about the uploaded file.
 * @param {string} data.name - The name of the uploaded file.
 * @param {string} data.contentType - The content type of the uploaded file.
 * @returns {Promise<void>} - A promise that resolves when the operation is complete.
 */
export const storage_onObjectFinalized_user_onHeadshotUpload = onObjectFinalized(
  {
    bucket: BUCKET_HEADSHOTS,
    secrets: ['REKOGNITION_ACCESS_KEY_ID', 'REKOGNITION_ACCESS_KEY_SECRET'],
  },
  async ({ data }) => {
    const { name, contentType } = data;
    const REKOGNITION_ACCESS_KEY_ID = process.env.REKOGNITION_ACCESS_KEY_ID;
    const REKOGNITION_ACCESS_KEY_SECRET = process.env.REKOGNITION_ACCESS_KEY_SECRET;

    // Check if content type is valid
    if (!contentType) return;

    // Ignore folder or unknown file creations
    if (contentType === 'application/octet-stream') return;

    // Check if file is an image
    if (!contentType.startsWith('image/')) return;

    // Check if environment variables are fetched from Secret Manager
    if (!REKOGNITION_ACCESS_KEY_ID || !REKOGNITION_ACCESS_KEY_SECRET)
      return logger.error(`
        Missing REKOGNITION_ACCESS_KEY_ID or REKOGNITION_ACCESS_KEY_SECRET from environment variables!

        You are seeing this message because REKOGNITION_ACCESS_KEY_ID or REKOGNITION_ACCESS_KEY_SECRET
        is not set in GCP Secret Manager (production) or .env.local (development). Please ensure that
        the values are set before deploying or running locally.
      `);

    const headshotName = basename(name);
    const headshotUserId = dirname(name);
    if (headshotName !== 'headshot.png') return;

    const headshotObject = await bucketHeadshots.file(name).download();
    const [headshotPhoto] = headshotObject;

    const rekognitionClient = new RekognitionClient({
      region: 'ap-northeast-1',
      credentials: {
        accessKeyId: REKOGNITION_ACCESS_KEY_ID,
        secretAccessKey: REKOGNITION_ACCESS_KEY_SECRET,
      },
    });

    const rekognitionCommand = new IndexFacesCommand({
      MaxFaces: 1,
      CollectionId: 'users',
      ExternalImageId: headshotUserId,
      Image: {
        Bytes: headshotPhoto,
      },
    });

    const { FaceRecords: faceRecords } = await rekognitionClient.send(rekognitionCommand);
    if (!faceRecords || !faceRecords.length)
      return logger.error(`No face records found for ${headshotUserId}`);

    const [{ Face: face }] = faceRecords;
    if (!face) return logger.error(`No face found for ${headshotUserId}`);

    const { FaceId: faceId } = face;
    if (!faceId) return logger.error(`No face ID found for ${headshotUserId}`);

    const user: Pick<FSUser, 'faceId'> = {
      faceId: faceId,
    };

    try {
      return await firestore
        .collection(FS_COLLECTION_USERS)
        .doc(headshotUserId)
        .set(user, { merge: true });
    } catch (error) {
      return logger.error(error);
    }
  }
);
