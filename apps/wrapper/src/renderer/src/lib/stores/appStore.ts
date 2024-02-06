import { writable } from 'svelte/store';

const appStore = writable<AppState>({
  passedCheck: true,
  currentState: 'checkInternet',
  pingFailed: false,
  privIp: null,
  hostname: null,
  clientId: '',
  fileId: '',
  errorMsg: '',
  sessionId: '',
  fileHash: '',
  fileExt: '',
});

export { appStore };
