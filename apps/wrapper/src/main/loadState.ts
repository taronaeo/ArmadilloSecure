import type { NetworkInterfaceInfo } from 'os';

import { networkInterfaces, hostname } from 'os';
import { appStore } from '../renderer/src/lib/stores';

export function getPrivIpHostName() {
  const osNetworkInterfaces = networkInterfaces();
  const nonLocalInterfaces = {};
  const clientHostname = hostname();

  let ipv4: string = '';

  if (!osNetworkInterfaces) {
    return {
      privIp: null,
      passedCheck: false,
      hostname: clientHostname,
    };
  }

  for (const inet in osNetworkInterfaces) {
    const addresses = osNetworkInterfaces[inet];
    for (let i = 0; i < addresses!.length; i++) {
      const address = addresses![i];
      if (!address.internal) {
        if (!nonLocalInterfaces[inet]) {
          nonLocalInterfaces[inet] = [];
        }
        nonLocalInterfaces[inet].push(address);
      }
    }
  }

  let mainInt = nonLocalInterfaces['Wi-Fi'];
  if (!mainInt) {
    mainInt = nonLocalInterfaces['Ethernet'];
    if (!mainInt) {
      return {
        privIp: null,
        passedCheck: false,
        hostname: clientHostname,
      };
    }
  }

  mainInt.forEach((adrs: NetworkInterfaceInfo) => {
    if (adrs.family === 'IPv4') {
      ipv4 = adrs.address;
    }
  });
  return {
    privIp: ipv4,
    passedCheck: true,
    hostname: clientHostname,
  };
}

export function loadState() {
  const { passedCheck, privIp, hostname } = getPrivIpHostName();
  let randomDigits = '';

  for (let i = 0; i < 4; i++) {
    randomDigits += Math.floor(Math.random() * 10).toString();
  }

  const clientId = `${hostname}::${privIp}::${randomDigits}`;

  appStore.update((state) => ({
    ...state,
    privIp,
    hostname,
    passedCheck,
    clientId,
  }));
}
