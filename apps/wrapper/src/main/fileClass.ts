import https from 'https';
import os from 'os';
import { BlockList } from 'net';
import systeminformation from 'systeminformation';
// import { getHttpsCallable } from '../renderer/src/lib/firebase/functions';
// import { FSFileDocument } from '@armadillo/shared';

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
  const domainIpRange = ['172.26.182.0', '172.26.182.255'];
  //TODO be changed when firestore cloud func is up

  const networkInterfaces = os.networkInterfaces();
  if (!networkInterfaces) {
    return {
      code: 403,
      message: 'No Network Interfaces Found',
    };
  }
  const nonLocalInterfaces = {};
  for (const inet in networkInterfaces) {
    const addresses = networkInterfaces[inet];
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
  let mainIntType = 'Wi-Fi';
  let mainInt = nonLocalInterfaces['Wi-Fi'];
  if (!mainInt) {
    mainInt = nonLocalInterfaces['Ethernet'];
    if (!mainInt) {
      return {
        code: 403,
        message: 'No Valid Network Interfaces Found',
      };
    }
    mainIntType = 'Ethernet';
  }
  let ipv4 = '';
  mainInt.forEach((adrs: os.NetworkInterfaceInfo) => {
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

  const userOS = os.platform();

  if (userOS != 'win32') {
    return {
      code: 403,
      message: 'OS must be Windows',
    };
  }
  const si = await systeminformation.networkInterfaces();
  const siArr = Object.values(si);
  let dns = '';
  siArr.forEach((iface) => {
    if (mainIntType === 'Ethernet') {
      if (iface.iface === 'Ethernet') {
        dns = iface.dnsSuffix;
      }
    } else if (mainIntType === 'Wi-Fi') {
      if (iface.iface === 'Wi-Fi') {
        dns = iface.dnsSuffix;
      }
    }
  });
  if (dns != orgDNS) {
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
