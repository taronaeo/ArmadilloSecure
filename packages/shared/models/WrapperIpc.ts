import type { CFCallableGetSessionIdResponse } from './CFCallableGetSessionId';

interface IpcRequest {
  getAppName: () => Promise<string>;
  getFileClass: (fileId: string) => Promise<string | null>;
  getClientId: () => Promise<string>;
  ping: () => Promise<void>;
  checkPing: () => Promise<boolean>;
  checkCompromisation: () => Promise<CFCallableGetSessionIdResponse>;
  defaultProgram: () => Promise<string>;
  launchFile: (fileId: string) => Promise<boolean>;
  getPrivIpHostName: () => Promise<PrivIpHostName>;
  getFaceLivenessSessionId: () => Promise<string>;
}

interface PrivIpHostName {
  privIp: string | null;
  hostname: string;
  passedCheck: boolean;
}
interface IpcResponse {
  code: number;
  message: string;
}

export type { IpcRequest, IpcResponse };
