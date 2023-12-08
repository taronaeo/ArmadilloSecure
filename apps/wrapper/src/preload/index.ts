import { contextBridge, ipcRenderer } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';
// Custom APIs for renderer

const api = {
  getAppName: async (channel: string): Promise<string> => {
    const appName = await ipcRenderer.invoke('getAppName');
    if (channel === 'getAppName') {
      return appName;
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
  ping: async (channel: string): Promise<Response> => {
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
  checkPing: async (channel: string): Promise<Response> => {
    if (channel === 'checkPing') {
      const response = await ipcRenderer.invoke('checkPing');
      return response;
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
