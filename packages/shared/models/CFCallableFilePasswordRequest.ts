import { FSFileDocument, CFCallableWrapperRequest } from '@armadillo/shared';

interface CFCallableFilePasswordRequest
  extends CFCallableWrapperRequest,
    Pick<FSFileDocument, 'file_id' | 'file_encryption_hash'> {}

export type { CFCallableFilePasswordRequest };
