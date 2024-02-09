import { exec } from 'child_process';
import { appStore } from '../renderer/src/lib/stores';

let pingFailed = false;
export function ping(): void {
  const host = 'www.google.com';

  exec(`ping ${host}`, (error, stdout) => {
    if (error) {
      pingFailed = true;
    } else if (
      !stdout.includes('Packets: Sent = 4, Received = 4' || 'Packets: Sent = 4, Received = 3')
    ) {
      pingFailed = true;
    } else {
      pingFailed = false;
    }
  });
}

export function checkPing(): boolean {
  appStore.update((state) => ({
    ...state,
    pingFailed: pingFailed,
  }));

  return pingFailed;
}
