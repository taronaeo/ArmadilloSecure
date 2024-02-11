import type { FSMetadata, FSFileClass } from '@armadillo/shared';

interface FSFile extends FSMetadata {
  readonly file_id: string;
  readonly file_status: 'UPLOADED' | 'ENCRYPTED' | 'READY';
  readonly file_domain: string;
  readonly file_classification: FSFileClass;
  readonly file_name: string;
  readonly file_ext: string;
  readonly file_owner_id: string;
  readonly file_encryption_hash: string;
  readonly file_encryption_iv: string;
  readonly file_permissions: string[];
  readonly self_destruct: boolean;
}

export type { FSFile };
