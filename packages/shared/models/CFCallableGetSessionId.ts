import type { CFCallableBase } from '@armadillo/shared';

interface CFCallableGetSessionIdRequest extends CFCallableBase {
  origin: 'web' | 'wrapper';
  clientId: string;
}

interface CFCallableGetSessionIdResponse {
  sessionId: string;
}

export type { CFCallableGetSessionIdRequest, CFCallableGetSessionIdResponse };
