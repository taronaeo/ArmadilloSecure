import type { ElectronAPI } from '@electron-toolkit/preload';
import type { IpcRequest } from '@armadillo/shared';

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
