import type { IpcResponse } from '@armadillo/shared';

import { exec } from 'child_process';
import { appStore } from '../renderer/src/lib/stores';

let pingFailed = false;
export function ping(): boolean {
  const host = 'www.google.com';

  exec(`ping ${host}`, (error, stdout) => {
    if (error) {
      pingFailed = true;
    } else if (!stdout.includes('Packets: Sent = 4, Received = 4')) {
      pingFailed = true;
    } else {
      pingFailed = false;
    }
  });

  appStore.update((state) => ({
    ...state,
    pingFailed: pingFailed,
  }));

  return pingFailed;
}

export function checkPing(): IpcResponse {
  if (pingFailed)
    return {
      code: 400,
      message: 'Loss of Internet Connection',
    };

  return {
    code: 200,
    message: 'Client Has Internet Connection',
  };
}
