import type { CFCallableWrapperRequest } from '@armadillo/shared';

interface CFCallableAuthLoginTokenRequest extends CFCallableWrapperRequest {
  rekognition_session_id: string;
  antivirus: {
    full_scan_end_time: number;
    last_updated_anti_virus: number;
    last_updated_anti_spyware: number;
  };
}

export type { CFCallableAuthLoginTokenRequest };
