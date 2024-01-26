import type {
  IpcResponse,
  CFCallableGetClassificationRequest,
  CFCallableGetClassificationResponse,
} from '@armadillo/shared';

import { platform } from 'os';
import { BlockList } from 'net';
import { execSync } from 'child_process';
import { get } from 'svelte/store';

import { getHttpsCallable } from './firebase/functions';
import { appStore } from '../renderer/src/lib/stores';

let fileClass = '';

const getFileClassificationApi = getHttpsCallable<
  CFCallableGetClassificationRequest,
  CFCallableGetClassificationResponse
>('https_onCall_file_getClassification');

export async function getFileClass(fileId: string) {
  const response = await getFileClassificationApi({
    origin: 'wrapper',
    clientId: 'helloworld',
    fileId: fileId,
  });

  const { classification } = response.data;
  fileClass = classification;
}

export function checkFileClass(): IpcResponse {
  if (fileClass != '') {
    return {
      code: 200,
      message: fileClass,
    };
  }

  return {
    code: 503,
    message: 'File Class Unavailable',
  };
}

export async function secretChecks(): Promise<IpcResponse> {
  const orgDNS = '';
  //TODO change to actual org DNS when firebase cloud func is up
  const domainIpRange = ['192.168.1.0', '192.168.1.255'];
  //TODO be changed when firestore cloud func is up

  const ipv4 = get(appStore).privIp;
  const blockList = new BlockList();
  const userOS = platform();

  let primaryDnsSuffix = '';

  blockList.addRange(domainIpRange[0], domainIpRange[1]);

  if (ipv4 && !blockList.check(ipv4)) {
    return {
      code: 403,
      message: 'IP Address not part of Organization IP Address Range',
    };
  }

  if (userOS != 'win32') {
    return {
      code: 403,
      message: 'OS must be Windows',
    };
  }

  const ipConfigAll = execSync('ipconfig /all').toString();
  const ipConfigLines = ipConfigAll.split('\n');
  let primaryDnsSuffixLine = '';

  ipConfigLines.forEach((line) => {
    if (line.includes('Primary Dns Suffix')) {
      primaryDnsSuffixLine = line;
    }
  });

  primaryDnsSuffix = primaryDnsSuffixLine.split(': ')[1].trim();

  if (primaryDnsSuffix != orgDNS) {
    return {
      code: 403,
      message: 'Invalid Domain Name',
    };
  }

  return {
    code: 200,
    message: 'Top Secret Checks Successful',
  };
}
