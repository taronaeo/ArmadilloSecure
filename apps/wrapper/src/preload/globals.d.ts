import { ElectronAPI } from '@electron-toolkit/preload';

declare global {
  interface Window {
    electron: ElectronAPI;
    api: IpcRequest;
  }

  interface IpcRequest {
    getAppName: () => Promise<IpcResponse>;
    getFileClass: (fileId: string) => Promise<IpcResponse>;
    checkFileClass: () => Promise<IpcResponse>;
    secretChecks: () => Promise<IpcResponse>;
    ping: () => Promise<IpcResponse>;
    checkPing: () => Promise<IpcResponse>;
    checkCompromisation: () => Promise<IpcResponse>;
    hasDefaultProgram: () => Promise<IpcResponse>;
    launchFile: (fileId: string) => Promise<IpcResponse>;
  }

  interface IpcResponse {
    code: number;
    message: string;
  }
}
