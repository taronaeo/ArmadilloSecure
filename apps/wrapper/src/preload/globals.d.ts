import { ElectronAPI } from '@electron-toolkit/preload';
import { IpcRequest } from '@armadillo/shared';

declare global {
  interface Window {
    electron: ElectronAPI;
    api: IpcRequest;
  }

  interface AppState {
    passedCheck: boolean | undefined;
    currentState: string | undefined;
    pingFailed: boolean | undefined;
  }
}
