interface AppState {
  passedCheck: boolean | null;
  currentState: string | null;
  pingFailed: boolean | null;
  privIp: string | null;
  hostname: string | null;
  clientId: string | null;
}

export type { AppState };
