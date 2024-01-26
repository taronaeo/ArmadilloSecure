import type { CFCallableBase } from '@armadillo/shared';

interface CFCallableGetPasswordRequest extends CFCallableBase {
  fileId: string;
  fileEncryptionHash: string;
}

interface CFCallableGetPasswordResponse {
  fileId: string;
  fileEncryptionHash: string;
}

export type { CFCallableGetPasswordRequest, CFCallableGetPasswordResponse };
