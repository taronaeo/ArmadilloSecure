import { contextBridge, ipcRenderer } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';
import { CFCallableGetSessionIdResponse } from '@armadillo/shared';

const api = {
  getPrivIpHostName: async () => {
    const privIpHostnameObj = await ipcRenderer.invoke('getPrivIpHostName');
    return privIpHostnameObj;
  },
  getFaceLivenessSessionId: async () => {
    return ipcRenderer.invoke('getFaceLivenessSessionId');
  },
  getClientId: async () => {
    return await ipcRenderer.invoke('getClientId');
  },
  refreshApp: async () => {
    await ipcRenderer.invoke('refreshApp');
  },
  getFileClass: async (fileId: string): Promise<string> => {
    return await ipcRenderer.invoke('getFileClass', fileId);
  },
  getAppName: async (): Promise<string> => {
    return await ipcRenderer.invoke('getAppName');
  },
  ping: async (): Promise<void> => {
    ipcRenderer.invoke('ping');
  },
  checkPing: async (): Promise<boolean> => {
    return await ipcRenderer.invoke('checkPing');
  },
  checkCompromisation: async (): Promise<CFCallableGetSessionIdResponse> => {
    return await ipcRenderer.invoke('checkCompromisation');
  },
  defaultProgram: async (): Promise<string> => {
    return await ipcRenderer.invoke('hasDefaultProgram');
  },
  launchFile: async (fileId: string): Promise<boolean> => {
    return await ipcRenderer.invoke('launchFile', fileId);
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
  window.electron = electronAPI;
  window.api = api;
}
