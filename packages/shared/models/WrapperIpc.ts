import type { CFCallableGetPasswordResponse } from './CFCallableGetPassword';
import type { CFCallableGetSessionIdResponse } from './CFCallableGetSessionId';
import type { AppState } from './WrapperAppState';

interface IpcRequest {
  getAppName: () => Promise<string>;
  getFileClass: () => Promise<string | null>;
  getClientId: () => Promise<string>;
  ping: () => Promise<void>;
  checkPing: () => Promise<boolean>;
  checkCompromisation: () => Promise<CFCallableGetSessionIdResponse>;
  defaultProgram: (fileExt: string) => Promise<string>;
  launchFile: (encKey: string, iv: string, fileArrayBuffer: ArrayBuffer) => Promise<boolean>;
  getPrivIpHostName: () => Promise<PrivIpHostName>;
  getFaceLivenessSessionId: () => Promise<string>;
  checkPassword: (fileEncryptionHash: string) => Promise<CFCallableGetPasswordResponse>;
  getBackendStore: () => Promise<AppState>;
  selfDestruct: () => Promise<void>;
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
