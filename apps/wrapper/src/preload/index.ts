import { contextBridge, ipcRenderer } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';
// Custom APIs for renderer

interface IpcResponse {
  code: number;
  message: string;
}

const api = {
  getFileClass: async (fileId: string): Promise<IpcResponse> => {
    try {
      await ipcRenderer.invoke('getFileClass', fileId);
      return {
        code: 200,
        message: 'Get File Class Invoked',
      };
    } catch {
      return {
        code: 500,
        message: 'Internal Server Error',
      };
    }
  },
  checkFileClass: async (): Promise<IpcResponse> => {
    try {
      const response = await ipcRenderer.invoke('checkFileClass');
      return response;
    } catch {
      return {
        code: 500,
        message: 'Internal Server Error',
      };
    }
  },
  getAppName: async (): Promise<IpcResponse> => {
    try {
      const response = await ipcRenderer.invoke('getAppName');
      return response;
    } catch {
      return {
        code: 500,
        message: 'Internal Server Error',
      };
    }
  },
  secretChecks: async (): Promise<IpcResponse> => {
    try {
      const responseWithDns = await ipcRenderer.invoke('secretChecks');
      return responseWithDns;
    } catch {
      return {
        code: 500,
        message: 'Internal Server Error',
      };
    }
  },
  ping: async (): Promise<IpcResponse> => {
    try {
      await ipcRenderer.invoke('ping');
      return {
        code: 200,
        message: 'Ping Successful',
      };
    } catch {
      return {
        code: 500,
        message: 'Internal Server Error',
      };
    }
  },
  checkPing: async (): Promise<IpcResponse> => {
    try {
      const response = await ipcRenderer.invoke('checkPing');
      return response;
    } catch {
      return {
        code: 500,
        message: 'Internal Server Error',
      };
    }
  },
  checkCompromisation: async (): Promise<IpcResponse> => {
    try {
      const response = await ipcRenderer.invoke('checkCompromisation');
      return response;
    } catch {
      return {
        code: 500,
        message: 'Internal Server Error',
      };
    }
  },
  hasDefaultProgram: async (): Promise<IpcResponse> => {
    try {
      const response = await ipcRenderer.invoke('hasDefaultProgram');
      return response;
    } catch {
      return {
        code: 500,
        message: 'Internal Server Error',
      };
    }
  },
  launchFile: async (fileId: string): Promise<IpcResponse> => {
    try {
      const fileIsLaunched = await ipcRenderer.invoke('launchFile', fileId);
      if (fileIsLaunched) {
        return {
          code: 200,
          message: 'File Launched Successfully',
        };
      }
      return {
        code: 400,
        message: 'File Could Not Be Launched',
      };
    } catch {
      return {
        code: 500,
        message: 'Internal Server Error',
      };
    }
  },
};

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI);
    contextBridge.exposeInMainWorld('api', api);
  } catch (error) {
    console.error(error);
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI;
  // @ts-ignore (define in dts)
  window.api = api;
}
