import type { CFCallableBase } from '@armadillo/shared';

interface CFCallableGetPasswordRequest extends CFCallableBase {
  fileId: string;
  fileEncryptionHash: string;
}

interface CFCallableGetPasswordResponse {
  fileId: string;
  fileExt: string;
  fileEncryptionHash: string;
  fileOwner: string;
}

export type { CFCallableGetPasswordRequest, CFCallableGetPasswordResponse };
