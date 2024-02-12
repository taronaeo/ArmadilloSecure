import type { FSFile } from '@armadillo/shared';
import type { google } from '@google-cloud/dlp/build/protos/protos';
import type { DocumentSnapshot, DocumentData } from 'firebase-admin/firestore';

import { DlpServiceClient } from '@google-cloud/dlp';
import {
  BUCKET_FILES,
  DLP_INFOTYPES_SENSITIVITY_MODERATE,
  DLP_INFOTYPES_SENSITIVITY_HIGH,
} from '@armadillo/shared';

import { parse, basename, dirname } from 'path';

import { FieldValue } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions/v2';
import { onObjectFinalized } from 'firebase-functions/v2/storage';

import { firestore, bucketFiles } from '../../../firebase';

export const storage_onObjectFinalized_file_onFileUploadRedact = onObjectFinalized(
  {
    bucket: BUCKET_FILES,
  },
  async ({ data }) => {
    const { name, size, contentType } = data;

    // Checks if the file uploaded is a directory or unknown file type
    if (!contentType || contentType === 'application/octet-stream')
      return logger.log(
        `File ${name} is being ignored. It is either a folder creation, or does not have a valid content type!`
      );

    // Checks if the file uploaded is larger than 32MB
    if (size > 32 * 33554432)
      return logger.log(`File ${name} is being ignored. It is bigger than 32MB!`);

    // Extracts the file name and extension
    // E.g., /ownerid/filename.ext -> filename.ext
    const fileName = basename(name);
    const fileOwner = basename(dirname(name));

    // Checks if the file is already redacted
    if (fileName.startsWith('red_'))
      return logger.log(`File ${name} is being ignored. It is already redacted!`);

    // Checks if the file is already encrypted
    if (fileName.startsWith('enc_'))
      return logger.log(`File ${name} is being ignored. It is an encrypted file!`);

    // Checks if the file is owned by any user
    if (fileOwner === '.')
      return logger.log(`File ${name} is being ignored. It is not owned by any user!`);

    const { name: csFileName, base: csFileBase } = parse(fileName);
    const csFileRef = bucketFiles.file(name);
    const fsFileRef = firestore.collection('files').doc(csFileName);

    let fsFileSnapshot: DocumentSnapshot<DocumentData>;
    try {
      fsFileSnapshot = await fsFileRef.get();
    } catch (error) {
      return logger.error(`Unable to retrieve file ${csFileName} from Firestore: ${error}`);
    }

    // Skip redaction process if file does not exist in Firestore
    const fsFileExists = fsFileSnapshot.exists;
    if (!fsFileExists) return logger.error(`File ${fsFileRef.path} does not exist in Firestore!`);

    let fsFileData: FSFile;
    try {
      fsFileData = fsFileSnapshot.data() as FSFile;
    } catch (error) {
      return logger.error(`Unable to retrieve data from file ${csFileName} in Firestore: ${error}`);
    }

    let csFileExists: boolean;
    try {
      [csFileExists] = await csFileRef.exists();
      if (!csFileExists)
        return logger.error(
          `Aborting redaction process. File ${csFileRef.name} does not exist in Cloud Storage!`
        );
    } catch (error) {
      return logger.error(
        `Unable to retrieve existence of file ${csFileRef.name} from Cloud Storage: ${error}`
      );
    }

    // Skip redaction process if file is classified as TOP SECRET
    if (fsFileData.file_classification === 'TOPSECRET') {
      try {
        await csFileRef.rename(`${fileOwner}/red_${csFileBase}`);
        return logger.log(`File ${csFileName} is classified as TOP SECRET! Redaction skipped!`);
      } catch (error) {
        return logger.error(
          `Unable to rename file ${csFileName} to redacted version in Cloud Storage: ${error}`
        );
      }
    }

    // Skip redaction process if file content type is not 'text/plain'
    if (contentType !== 'text/plain') {
      try {
        await csFileRef.rename(`${fileOwner}/red_${csFileBase}`);
        return logger.log(
          `File ${csFileName} is not content type 'text/plain'! Redaction skipped!`
        );
      } catch (error) {
        return logger.error(
          `Unable to rename file ${csFileName} to redacted version in Cloud Storage: ${error}`
        );
      }
    }

    let csFileObject: Buffer;
    try {
      [csFileObject] = await csFileRef.download();
    } catch (error) {
      return logger.error(`Unable to download file ${csFileRef.name} from Cloud Storage: ${error}`);
    }

    const dlpClient = new DlpServiceClient();
    const redactTypes: google.privacy.dlp.v2.IInfoType[] =
      fsFileData.file_classification === 'SENSITIVE'
        ? [...DLP_INFOTYPES_SENSITIVITY_MODERATE]
        : [...DLP_INFOTYPES_SENSITIVITY_MODERATE, ...DLP_INFOTYPES_SENSITIVITY_HIGH];

    let dlpRedactResponse: google.privacy.dlp.v2.IDeidentifyContentResponse;
    try {
      [dlpRedactResponse] = await dlpClient.deidentifyContent({
        parent: 'projects/it2566-armadillo/locations/global',
        inspectConfig: {
          infoTypes: redactTypes,
          minLikelihood: 'VERY_UNLIKELY',
        },
        deidentifyConfig: {
          infoTypeTransformations: {
            transformations: [
              {
                infoTypes: redactTypes,
                primitiveTransformation: {
                  replaceConfig: {
                    newValue: {
                      stringValue: '********',
                    },
                  },
                },
              },
            ],
          },
        },
        item: {
          byteItem: {
            type: 'TEXT_UTF8',
            data: csFileObject,
          },
        },
      });
    } catch (error) {
      return logger.error(`Unable to redact file ${csFileName} using DLP: ${error}`);
    }

    const dlpRedactObject = dlpRedactResponse.item?.byteItem?.data;
    if (!dlpRedactObject)
      return logger.error(`Unable to retrieve redacted file ${csFileName} from DLP!`);

    const dlpRedactObjectBuffer = Buffer.from(dlpRedactObject);
    const csFileRedactName = `${fileOwner}/red_${csFileBase}`;
    const csFileRedactRef = bucketFiles.file(csFileRedactName);

    try {
      await csFileRedactRef.save(dlpRedactObjectBuffer, { contentType });
    } catch (error) {
      logger.error(`Error saving redacted file ${csFileRedactName}!`);
      return logger.error(error);
    }

    const fsFileUpdate: Partial<FSFile> = {
      file_status: 'REDACTED',
      updated_at: FieldValue.serverTimestamp(),
    };

    return fsFileRef.set(fsFileUpdate, { merge: true });
  }
);
