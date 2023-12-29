import { writable } from 'svelte/store';

export const appState = writable({
  passedCheck: true,
  currentState: 'checkInternet',
});
