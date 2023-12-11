import { FSFileDocument } from '@armadillo/shared';

interface CFCallableFileClassificationResponse
  extends Pick<FSFileDocument, 'file_classification'> {}

export type { CFCallableFileClassificationResponse };
