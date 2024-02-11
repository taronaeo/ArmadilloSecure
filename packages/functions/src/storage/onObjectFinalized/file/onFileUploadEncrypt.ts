import type { FSFile } from '@armadillo/shared';

import { BUCKET_FILES, FS_COLLECTION_FILES } from '@armadillo/shared';

import { subtle, getRandomValues } from 'crypto';
import { parse, basename, dirname } from 'path';

import { FieldValue } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions/v2';
import { onObjectFinalized } from 'firebase-functions/v2/storage';

import { bucketFiles, firestore } from '../../../firebase';

export const storage_onObjectFinalized_file_onFileUploadEncrypt = onObjectFinalized(
  {
    bucket: BUCKET_FILES,
  },
  async ({ data }) => {
    const { name, size, contentType } = data;

    // Checks if the file uploaded is a directory
    if (!contentType || contentType === 'application/octet-stream')
      return logger.log(
        `File ${name} is being ignored. It is either a folder creation, or does not have a valid content type!`
      );

    // Checks if the file uploaded is larger than 32MB
    if (size > 32 * 33554432)
      return logger.log(`File ${name} is being ignored. It is bigger than 32MB!`);

    const fileName = basename(name);
    const fileOwner = basename(dirname(name));
    if (fileName.startsWith('enc_')) return logger.log(`File ${fileName} is already encrypted!`);
    if (fileOwner === '.') return logger.log(`File ${fileName} is not owned by any user!`);

    const { name: fsFileName } = parse(fileName);
    const fsFileRef = firestore.collection(FS_COLLECTION_FILES).doc(fsFileName);
    const fsFileSnapshot = await fsFileRef.get();
    const fsFileData = fsFileSnapshot.data() as FSFile;

    if (!fsFileSnapshot.exists)
      return logger.log(`File ${fsFileSnapshot.ref.path} does not exist in Firestore!`);

    const csFileRef = bucketFiles.file(name);
    const csFileExists = await csFileRef.exists();
    if (!csFileExists)
      return logger.log(
        `File ${JSON.stringify(csFileRef.name, null, 2)} does not exist in Cloud Storage!`
      );

    const [csFileObject] = await bucketFiles.file(name).download();
    const fsFileKey = fsFileData.file_encryption_hash;
    const fsFileKeyArray = Uint8Array.from(Buffer.from(fsFileKey, 'hex'));
    const fsFileKeyCrypto = await subtle.importKey(
      'raw',
      fsFileKeyArray,
      { name: 'AES-CBC' },
      false,
      ['encrypt']
    );

    const fsFileIv = getRandomValues(new Uint8Array(16));
    const fsFileIvHex = Buffer.from(fsFileIv).toString('hex');
    const fsFileEncObject = await subtle.encrypt(
      { name: 'AES-CBC', iv: fsFileIv },
      fsFileKeyCrypto,
      csFileObject
    );

    const csFileEncName = `${fileOwner}/enc_${fileName}`;
    const csFileEncRef = bucketFiles.file(csFileEncName);

    try {
      await Promise.all([csFileRef.delete(), csFileEncRef.save(Buffer.from(fsFileEncObject))]);
    } catch (error) {
      logger.error(`Error encrypting file ${fileName}!`);
      logger.error(error);
    }

    const fsFileUpdate: Partial<FSFile> = {
      file_status: 'ENCRYPTED',
      file_encryption_iv: fsFileIvHex,
      updated_at: FieldValue.serverTimestamp(),
    };

    return fsFileRef.set(fsFileUpdate, { merge: true });
  }
);