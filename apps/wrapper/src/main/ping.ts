import { exec } from 'child_process';

let pingFailed = false;
export function ping(): boolean {
  const host = 'www.google.com';
  exec(`ping ${host}`, (error, stdout) => {
    if (error) {
      pingFailed = true;
    } else if (
      !(
        stdout.includes('Packets: Sent = 4, Received = 4') ||
        stdout.includes('Packets: Sent = 4, Received = 3')
      )
    ) {
      //received = 3 just incase 1 packet is not received
      pingFailed = true;
    } else {
      pingFailed = false;
    }
  });
  return pingFailed;
}

export function checkPing(): IpcResponse {
  if (pingFailed) {
    return {
      code: 400,
      message: 'Loss of Internet Connection',
    };
  }
  return {
    code: 200,
    message: 'Client Has Internet Connection',
  };
}
