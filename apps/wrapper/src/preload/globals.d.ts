import type { ElectronAPI } from '@electron-toolkit/preload';
import type { IpcRequest } from '@armadillo/shared';

declare global {
  interface Window {
    electron: ElectronAPI;
    api: IpcRequest;
  }

  interface AppState {
    passedCheck: boolean | null;
    currentState: string | null;
    pingFailed: boolean | null;
    privIp: string | null;
    hostname: string | null;
    clientId: string;
    fileId: string;
    errorMsg: string;
    sessionId: string;
    fileHash: string;
  }
}
