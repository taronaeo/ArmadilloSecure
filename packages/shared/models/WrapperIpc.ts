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
  getPrivIpHostName: () => Promise<IpcResponse>;
}

interface IpcResponse {
  code: number;
  message: string;
}

export type { IpcRequest, IpcResponse };
