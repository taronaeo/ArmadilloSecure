// import https from 'https';
import type { IpcResponse, FSFileDocument, AppState } from '@armadillo/shared';

import { platform } from 'os';
import { BlockList } from 'net';
import { execSync } from 'child_process';

import { getHttpsCallable } from './firebase/functions';
import { appState } from '../renderer/src/stores';

let fileClass = '';
const getFileClassificationApi = getHttpsCallable('onCall_getFileClassification');
export async function getFileClass(fileId: string) {
  const response = await getFileClassificationApi({
    client_id: 'helloworld',
    file_id: fileId,
  });
  const { file_classification } = response.data as FSFileDocument;
  fileClass = file_classification;
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

  let appStateObj: AppState = {
    passedCheck: null,
    currentState: null,
    pingFailed: false,
    privIp: null,
    hostname: null,
  };

  appState.subscribe((state) => {
    appStateObj = state;
  });

  const ipv4 = appStateObj.privIp;
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
