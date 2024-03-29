import type { FieldValue } from 'firebase/firestore';

interface FSAuditBase {
  /**
   * Origin of the request. Can be either 'web' or 'wrapper'.
   */
  origin: 'web' | 'wrapper';
  /**
   * Unique random client id generated by the wrapper application.
   */
  client_id: string;
  /**
   * Date and time of when the operation was done.
   */
  accessed_at: FieldValue;
}

interface FSAuditFileClassification extends FSAuditBase {
  /**
   * Represents file classification step of the audit.
   */
  audit_step: 'FILE_CLASSIFICATION';
  /**
   * Represents the audit information for the file classification step.
   */
  audit_info: {
    file_id: string;
    client_os: string;
    client_ipv4_address: string;
    client_dns_suffix: string;
  };
}

interface FSAuditDeviceCompromisation extends FSAuditBase {
  /**
   * Represents device compromisation step of the audit.
   */
  audit_step: 'FACE_SESSION';
  /**
   * Represents the audit information for the device compromisation step.
   */
  audit_info: {
    full_scan_end_time: number;
    antivirus_signature_last_updated: number;
    antispyware_signature_last_updated: number;
  };
}

interface FSAuditFaceAuthentication extends FSAuditBase {
  /**
   * Represents face authentication step of the audit.
   */
  audit_step: 'FACE_AUTHENTICATION';
  /**
   * Represents the audit information for the face authentication step.
   */
  audit_info: unknown;
}

interface FSAuditFilePassword extends FSAuditBase {
  /**
   * Represents file password step of the audit.
   */
  audit_step: 'FILE_PASSWORD';
  /**
   * Represents the audit information for the file password step.
   */
  audit_info: {
    file_id: string;
    file_encryption_hash: string;
  };
}

type FSAudit =
  | FSAuditFileClassification
  | FSAuditDeviceCompromisation
  | FSAuditFaceAuthentication
  | FSAuditFilePassword;

export type { FSAudit };
