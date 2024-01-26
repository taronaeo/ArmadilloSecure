import type { FSFileClass, CFCallableBase } from '@armadillo/shared';

interface CFCallableGetClassificationRequest extends CFCallableBase {
  fileId: string;
}

interface CFCallableGetClassificationResponse {
  classification: FSFileClass;
}

export type { CFCallableGetClassificationRequest, CFCallableGetClassificationResponse };
