import { execSync } from 'child_process';

function convertToMillis(str: string) {
  const dateStr = str.split(' ')[0];
  const dateParts = dateStr.split('/');
  const newDateStr =
    dateParts[1] +
    '/' +
    dateParts[0] +
    '/' +
    dateParts[2] +
    ' ' +
    str.split(' ')[1] +
    ' ' +
    str.split(' ')[2];
  const date = new Date(newDateStr);

  return date.getTime();
}

export function checkCompromisation() {
  const defenderStatus = execSync('Get-MpComputerStatus', { shell: 'powershell.exe' }).toString();
  const defenderStatusArr = defenderStatus.split('\n');
  let antivirusSignatures: string = '';
  let antispywareSignatures: string = '';
  let fullScanEndTime: string = '';
  defenderStatusArr.forEach((property) => {
    if (property.includes('AntivirusSignatureLastUpdated')) {
      antivirusSignatures = property.split(': ')[1];
    } else if (property.includes('QuickScanEndTime')) {
      fullScanEndTime = property.split(': ')[1];
    } else if (property.includes('AntispywareSignatureLastUpdated')) {
      antispywareSignatures = property.split(': ')[1];
    }
    //must change to full scan during production
  });
  // console.log({
  //   antispywareSignatures: antispywareSignatures,
  //   antivirusSignatures: antivirusSignatures,
  //   fullScanEndTime: fullScanEndTime,
  // });

  const monthInMillis: number = 2629800000;
  const dayInMillis: number = 86400000;
  const antivirusSignaturesMillis: number = convertToMillis(antivirusSignatures);
  const antispywareSignaturesMillis: number = convertToMillis(antispywareSignatures);
  const fullScanEndTimeMillis: number = convertToMillis(fullScanEndTime);
  if (+new Date().getTime() - antivirusSignaturesMillis >= monthInMillis) {
    return {
      code: 403,
      message: 'Antivirus Signatures Outdated',
    };
  }
  if (+new Date().getTime() - antispywareSignaturesMillis >= monthInMillis) {
    return {
      code: 403,
      message: 'Antispyware Signatures Outdated',
    };
  }
  if (+new Date().getTime() - fullScanEndTimeMillis <= dayInMillis) {
    return {
      code: 403,
      message: 'Full System Scan Outdated',
    };
  }
  return {
    code: 200,
    message: 'Compromisation Check Passed',
  };
}
