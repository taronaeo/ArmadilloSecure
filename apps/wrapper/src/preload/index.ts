import { contextBridge, ipcRenderer } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';
import { CFCallableGetSessionIdResponse } from '@armadillo/shared';

const api = {
  selfDestruct: async () => {
    await ipcRenderer.invoke('selfDestruct');
  },
  getPrivIpHostName: async () => {
    const privIpHostnameObj = await ipcRenderer.invoke('getPrivIpHostName');
    return privIpHostnameObj;
  },
  getBackendStore: async () => {
    return ipcRenderer.invoke('getBackendStore');
  },
  checkPassword: async (fileEncryptionHash) => {
    return ipcRenderer.invoke('checkPassword', fileEncryptionHash);
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
  getFileClass: async (): Promise<string> => {
    return await ipcRenderer.invoke('getFileClass');
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
  defaultProgram: async (fileExt: string): Promise<string> => {
    return await ipcRenderer.invoke('hasDefaultProgram', fileExt);
  },
  launchFile: async (
    encKey: string,
    iv: string,
    fileArrayBuffer: ArrayBuffer
  ): Promise<boolean> => {
    return await ipcRenderer.invoke('launchFile', encKey, iv, fileArrayBuffer);
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
