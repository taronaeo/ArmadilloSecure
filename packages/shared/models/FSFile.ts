import type { FSMetadata, FSFileClass } from '@armadillo/shared';

interface FSFile extends FSMetadata {
  readonly file_id: string;
  readonly file_classification: FSFileClass;
  readonly file_name: string;
  readonly file_ext: string;
  readonly file_owner_id: string;
  readonly file_encryption_hash: string;
  readonly file_permissions: string[];
}

export type { FSFile };
