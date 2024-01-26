import type { CFCallableBase } from '@armadillo/shared';

interface CFCallableGetAuthTokenRequest extends CFCallableBase {
  sessionId: string;
}

interface CFCallableGetAuthTokenResponse {
  token: string;
}

export type { CFCallableGetAuthTokenRequest, CFCallableGetAuthTokenResponse };
