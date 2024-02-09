import { execSync } from 'child_process';
import { getHttpsCallable } from './firebase/functions';
import { CFCallableGetSessionIdRequest, CFCallableGetSessionIdResponse } from '@armadillo/shared';
import { appStore } from '../renderer/src/lib/stores';
import { get } from 'svelte/store';

function convertToMillis(dateStr: string) {
  const dateInMillis = execSync(`Get-Date -date "${dateStr}" -UFormat %s`, {
    shell: 'powershell.exe',
  }).toString();
  return Number(dateInMillis) * 1000;
}

export async function checkCompromisation() {
  const getSessionIdAPI = getHttpsCallable<
    CFCallableGetSessionIdRequest,
    CFCallableGetSessionIdResponse
  >('https_onCall_rekognition_getSessionId');

  const defenderStatus = execSync('Get-MpComputerStatus', { shell: 'powershell.exe' }).toString();
  const defenderStatusArr = defenderStatus.split('\n');

  let antivirusSignatures: string = '';
  let antispywareSignatures: string = '';
  let fullScanEndTime: string = '';

  defenderStatusArr.forEach((property) => {
    if (property.includes('AntivirusSignatureLastUpdated')) {
      antivirusSignatures = property.split(': ')[1];
    } else if (property.includes('FullScanEndTime')) {
      fullScanEndTime = property.split(': ')[1];
    } else if (property.includes('AntispywareSignatureLastUpdated')) {
      antispywareSignatures = property.split(': ')[1];
    }
    //must change to full scan during production
  });

  const antivirusSignaturesMillis: number = convertToMillis(antivirusSignatures);
  const antispywareSignaturesMillis: number = convertToMillis(antispywareSignatures);
  const fullScanEndTimeMillis: number = convertToMillis(fullScanEndTime);

  const { clientId, fileId } = get(appStore);

  const sessionId = await getSessionIdAPI({
    origin: 'wrapper',
    clientId: clientId,
    fileId: fileId,
    fullScanEndTime: fullScanEndTimeMillis,
    antivirusSignaturesLastUpdated: antivirusSignaturesMillis,
    antispywareSignaturesLastUpdated: antispywareSignaturesMillis,
  });
  console.log(sessionId.data);
  return sessionId.data;
}
