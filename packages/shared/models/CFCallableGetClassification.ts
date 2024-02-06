import type { FSFileClass, CFCallableBase } from '@armadillo/shared';

interface CFCallableGetClassificationRequest extends CFCallableBase {
  fileId: string;
  clientOS: 'win32' | 'darwin' | 'linux';
  clientIPv4Address: string;
  clientDnsSuffix: string;
}

interface CFCallableGetClassificationResponse {
  classification: FSFileClass;
}

export type { CFCallableGetClassificationRequest, CFCallableGetClassificationResponse };
