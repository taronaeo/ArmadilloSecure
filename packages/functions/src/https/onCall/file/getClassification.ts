import type {
  FSAudit,
  FSDomain,
  FSFile,
  CFCallableGetClassificationRequest,
  CFCallableGetClassificationResponse,
} from '@armadillo/shared';

import { BlockList } from 'net';
import {
  FS_COLLECTION_AUDITS,
  FS_COLLECTION_DOMAINS,
  FS_COLLECTION_FILES,
} from '@armadillo/shared';

import { logger } from 'firebase-functions/v2';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { FieldValue } from 'firebase-admin/firestore';

import { firestore } from '../../../firebase';

/**
 * Retrieves the classification of a file for the wrapper.
 *
 * @param   auth        The authentication data.
 * @param   data        The request data containing the origin, client ID, and file ID.
 * @param   rawRequest  The raw HTTP request object.
 * @returns The classification of the file.
 * @throws  If there is an authentication error, invalid origin, invalid client ID, file not found, or internal server error.
 */
export const https_onCall_file_getClassification = onCall<CFCallableGetClassificationRequest>(
  { cors: true },
  async ({ auth, data, rawRequest }): Promise<CFCallableGetClassificationResponse> => {
    logger.log(rawRequest);

    const { origin, clientId, clientOS, clientIPv4Address, clientDnsSuffix, fileId } = data;

    // Check if user is already authenticated
    if (auth) throw new HttpsError('failed-precondition', 'Authentication Error');

    // Check if origin is valid
    if (!origin || (origin !== 'web' && origin !== 'wrapper'))
      throw new HttpsError('failed-precondition', 'Origin Invalid');

    // Check if request includes a client id
    if (!clientId) throw new HttpsError('failed-precondition', 'Client ID Invalid');

    // Check if client OS is valid
    if (!clientOS) throw new HttpsError('failed-precondition', 'Client OS Invalid');

    // Check if client IPv4 address is valid
    if (!clientIPv4Address)
      throw new HttpsError('failed-precondition', 'Client IPv4 Address Invalid');

    // Check if client DNS suffix is valid
    if (!clientDnsSuffix) throw new HttpsError('failed-precondition', 'Client DNS Suffix Invalid');

    // Check if file id is valid
    if (!fileId) throw new HttpsError('failed-precondition', 'File ID Invalid');

    const fsFileRef = firestore.collection(FS_COLLECTION_FILES).doc(fileId);
    const fsAuditRef = firestore
      .collection(FS_COLLECTION_AUDITS)
      .doc(`FILE_CLASSIFICATION-${clientId}`);


    const auditDoc: FSAudit = {
      origin,
      client_id: clientId,
      audit_step: 'FILE_CLASSIFICATION',
      audit_info: {
        file_id: fileId,
        client_os: clientOS,
        client_ipv4_address: clientIPv4Address,
        client_dns_suffix: clientDnsSuffix,
      },
      accessed_at: FieldValue.serverTimestamp(),
    };

    try {
      await fsAuditRef.set(auditDoc, { merge: true });

      const fileSnapshot = await fsFileRef.get();
      const fileExists = fileSnapshot.exists;
      if (!fileExists) throw new HttpsError('not-found', 'File Not Found');

      const fileData = fileSnapshot.data() as FSFile;
      if (fileData.file_classification !== 'TOPSECRET')
        return { classification: fileData.file_classification };

      if (clientOS !== 'win32') throw new HttpsError('not-found', 'Client OS Not Supported');

      const fileDomainRef = firestore.collection(FS_COLLECTION_DOMAINS).doc(fileData.file_domain);
      const fileDomainSnapshot = await fileDomainRef.get();
      const fileDomainData = fileDomainSnapshot.data() as FSDomain;

      const {
        domain_dns_suffix: domainDnsSuffix,
        domain_ipv4_start: domainIPv4Start,
        domain_ipv4_end: domainIPv4End,
      } = fileDomainData;

      if (!domainDnsSuffix) throw new HttpsError('not-found', 'Domain Not Found');
      if (!domainIPv4Start) throw new HttpsError('not-found', 'Domain IPv4 Start Not Found');
      if (!domainIPv4End) throw new HttpsError('not-found', 'Domain IPv4 End Not Found');

      if (clientDnsSuffix !== domainDnsSuffix) throw new HttpsError('not-found', 'Domain Mismatch');

      const domainBlockList = new BlockList();
      domainBlockList.addRange(domainIPv4Start, domainIPv4End);
      if (!domainBlockList.check(clientIPv4Address, 'ipv4'))
        throw new HttpsError('not-found', 'Client IPv4 Address Not In Domain');

      return { classification: fileData.file_classification };
    } catch (error) {
      logger.error(error);
      throw new HttpsError('internal', 'Internal Server Error');
    }
  }
);
