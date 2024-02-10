import type {
  CFCallableGetClassificationRequest,
  CFCallableGetClassificationResponse,
} from '@armadillo/shared';

import { platform } from 'os';
import { execSync } from 'child_process';
import { get } from 'svelte/store';

import { getHttpsCallable } from './firebase/functions';
import { appStore } from '../renderer/src/lib/stores';

const getFileClassificationApi = getHttpsCallable<
  CFCallableGetClassificationRequest,
  CFCallableGetClassificationResponse
>('https_onCall_file_getClassification');

export async function getFileClass(fileId: string) {
  const { privIp, clientId } = get(appStore);

  if (!privIp) return null;

  const userOS = platform();

  const ipConfigAll = execSync('ipconfig /all').toString();
  const ipConfigLines = ipConfigAll.split('\n');

  let primaryDnsSuffix = '';
  let primaryDnsSuffixLine = '';

  ipConfigLines.forEach((line) => {
    if (line.includes('Primary Dns Suffix')) {
      primaryDnsSuffixLine = line;
    }
  });

  primaryDnsSuffix = primaryDnsSuffixLine.split(': ')[1].trim();

  const response = await getFileClassificationApi({
    origin: 'wrapper',
    clientId: clientId,
    fileId: fileId,
    clientDnsSuffix: primaryDnsSuffix,
    clientIPv4Address: privIp,
    clientOS: userOS,
  });
  console.log(response);

  const { classification } = response.data;
  return classification;
}
