import type { CFCallableBase } from '@armadillo/shared';

interface CFCallableGetSessionIdRequest extends CFCallableBase {
  fileId: string;
  fullScanEndTime: number;
  antivirusSignaturesLastUpdated: number;
  antispywareSignaturesLastUpdated: number;
}

interface CFCallableGetSessionIdResponse {
  sessionId: string;
}

export type { CFCallableGetSessionIdRequest, CFCallableGetSessionIdResponse };
