interface AppState {
  passedCheck: boolean | null;
  currentState: string | null;
  pingFailed: boolean | null;
  privIp: string | null;
  hostname: string | null;
  clientId: string;
  fileId: string;
  errorMsg: string;
  sessionId: string;
  fileHash: string;
  fileExt: string;
}

export type { AppState };
