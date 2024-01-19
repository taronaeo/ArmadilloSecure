import { writable } from 'svelte/store';

export const appState = writable<AppState>({
  passedCheck: true,
  currentState: 'checkInternet',
  pingFailed: false,
});
