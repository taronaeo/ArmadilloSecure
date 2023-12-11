import { contextBridge, ipcRenderer } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';
// Custom APIs for renderer

interface IpcResponse {
  code: number;
  message: string;
}

const api = {
  getFileClass: async (channel: string, fileId: string): Promise<IpcResponse> => {
    if (channel === 'getFileClass') {
      await ipcRenderer.invoke('getFileClass', fileId);
      return {
        code: 200,
        message: 'getFileClass invoked',
      };
    }
    return {
      code: 500,
      message: 'Internal Server Error',
    };
  },
  checkFileClass: async (channel: string): Promise<IpcResponse> => {
    if (channel === 'checkFileClass') {
      const response = await ipcRenderer.invoke('checkFileClass');
      return response;
    }
    return {
      code: 500,
      message: 'Internal Server Error',
    };
  },
  getAppName: async (channel: string): Promise<IpcResponse> => {
    const response = await ipcRenderer.invoke('getAppName');
    if (channel === 'getAppName') {
      return response;
    }
    return 'Wrong Channel Received';
  },
  secretChecks: async (channel: string): Promise<IpcResponse> => {
    if (channel === 'secretChecks') {
      const dns = await ipcRenderer.invoke('secretChecks');
      return dns;
    }
    return {
      code: 500,
      message: 'Internal Server Error',
    };
  },
  ping: async (channel: string): Promise<IpcResponse> => {
    if (channel === 'ping') {
      await ipcRenderer.invoke('ping');
      return {
        code: 200,
        message: 'Ping Successful',
      };
    }
    return {
      code: 500,
      message: 'Internal Server Error',
    };
  },
  checkPing: async (channel: string): Promise<IpcResponse> => {
    if (channel === 'checkPing') {
      const response = await ipcRenderer.invoke('checkPing');
      return response;
    }
    return {
      code: 500,
      message: 'Internal Server Error',
    };
  },
  checkCompromisation: async (channel: string): Promise<IpcResponse> => {
    if (channel === 'checkCompromisation') {
      const response = await ipcRenderer.invoke('checkCompromisation');
      return response;
    }
    return {
      code: 500,
      message: 'Internal Server Error',
    };
  },
  launchFile: async (channel: string, fileId: string): Promise<IpcResponse> => {
    if (channel === 'launchFile') {
      await ipcRenderer.invoke('launchFile', fileId);
      return {
        code: 200,
        message: 'launchFile invoked',
      };
    }
    return {
      code: 500,
      message: 'Internal Server Error',
    };
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
