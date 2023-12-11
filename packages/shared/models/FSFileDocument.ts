import { FSMetadata, FSFileClassification } from '@armadillo/shared';

interface FSFileDocument extends FSMetadata {
  readonly file_id: string;
  readonly file_classification: FSFileClassification;
  readonly file_name: string;
  readonly file_ext: string;
  readonly file_owner_id: string;
  readonly file_encryption_hash: string;
  readonly file_permissions: [];
}

export type { FSFileDocument };
