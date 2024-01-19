import { execSync } from 'child_process';
import dayjs from 'dayjs';

function convertToMillis(str: string) {
  const dateObj = dayjs(str).format('D/M/YYYY h:mm:ss a');
  const dateInMillis = new Date(dateObj).getTime();
  return dateInMillis;
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

  const monthInMillis: number = 2629800000;
  const dayInMillis: number = 86400000;
  const antivirusSignaturesMillis: number = convertToMillis(antivirusSignatures);
  const antispywareSignaturesMillis: number = convertToMillis(antispywareSignatures);
  const fullScanEndTimeMillis: number = convertToMillis(fullScanEndTime);
  const currentTime = new Date().getTime();

  if (currentTime - antivirusSignaturesMillis >= monthInMillis) {
    return {
      code: 403,
      message: 'Antivirus Signatures Outdated',
    };
  }

  if (currentTime - antispywareSignaturesMillis >= monthInMillis) {
    return {
      code: 403,
      message: 'Antispyware Signatures Outdated',
    };
  }

  if (currentTime - fullScanEndTimeMillis <= dayInMillis) {
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
