import https from 'https';
import { networkInterfaces, platform } from 'os';
import type { NetworkInterfaceInfo } from 'os';
import { BlockList } from 'net';
import { execSync } from 'child_process';
// import { getHttpsCallable } from '../renderer/src/lib/firebase/functions';
// import type { FSFileDocument } from '@armadillo/shared';

let fileClass = '';

// const getFileClassificationApi = getHttpsCallable('onCall_getFileClassification');
export async function getFileClass(fileId: string) {
  // const response = await getFileClassificationApi({
  //   client_id: 'helloworld',
  //   file_id: fileId,
  // });
  // const { file_classification } = response.data as FSFileDocument;
  // fileClass = file_classification;
  const options = {
    hostname: 'asia-southeast1-it2566-armadillo.cloudfunctions.net',
    path: '/http_onRequest_fileClassification',
    method: 'POST',
    headers: {
      'X-ARMADILLO-CLIENTID': 'helloworld',
      'X-ARMADILLO-FILEUUID': fileId,
      'Content-Length': 0,
    },
  };
  const req = https.request(options, (res) => {
    res.on('data', (chunk) => {
      fileClass = JSON.parse(chunk).data;
    });
  });
  req.end();
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

  const osNetworkInterfaces = networkInterfaces();

  if (!osNetworkInterfaces) {
    return {
      code: 403,
      message: 'No Network Interfaces Found',
    };
  }

  const nonLocalInterfaces = {};

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
        code: 403,
        message: 'No Valid Network Interfaces Found',
      };
    }
  }

  let ipv4 = '';

  mainInt.forEach((adrs: NetworkInterfaceInfo) => {
    if (adrs.family === 'IPv4') {
      ipv4 = adrs.address;
    }
  });

  const blockList = new BlockList();

  blockList.addRange(domainIpRange[0], domainIpRange[1]);

  if (!blockList.check(ipv4)) {
    return {
      code: 403,
      message: 'IP Address not part of Organization IP Address Range',
    };
  }

  const userOS = platform();

  if (userOS != 'win32') {
    return {
      code: 403,
      message: 'OS must be Windows',
    };
  }

  let primaryDnsSuffix = '';

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
