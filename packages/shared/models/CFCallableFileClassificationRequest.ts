import type { FSFileDocument, CFCallableWrapperRequest } from '@armadillo/shared';

interface CFCallableFileClassificationRequest
  extends CFCallableWrapperRequest,
    Pick<FSFileDocument, 'file_id'> {}

export type { CFCallableFileClassificationRequest };
