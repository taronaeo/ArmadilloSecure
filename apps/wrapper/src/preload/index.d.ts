import { ElectronAPI } from '@electron-toolkit/preload';

declare global {
  interface Window {
    electron: ElectronAPI;
    api: IpcRequest;
  }

  interface IpcRequest {
    getAppName: () => IpcResponse;
    getFileClass: (_, fileId: string) => Promise<void>;
    checkFileClass: () => Promise<IpcResponse>;
    secretChecks: () => Promise<IpcResponse>;
    ping: () => Promise<void>;
    checkPing: () => Promise<IpcResponse>;
    checkCompromisation: () => Promise<IpcResponse>;
    hasDefaultProgram: () => IpcResponse;
    launchFile: () => Promise<void>;
  }

  interface IpcResponse {
    code: number;
    message: string;
  }
}
