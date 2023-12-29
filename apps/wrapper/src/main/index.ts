import { app, shell, BrowserWindow, ipcMain } from 'electron';
import { join } from 'path';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import icon from '../../resources/icon.png?asset';
import os from 'os';
import fs, { promises as fsPromises } from 'fs';
import { BlockList } from 'net';
import { exec, execFile, execSync } from 'child_process';
import systeminformation from 'systeminformation';
import crypto from 'crypto';
const { writeFile, copyFile, unlink, stat } = fsPromises;
import https from 'https';
import { paths } from './absolutePaths';

interface IpcResponse {
  code: number;
  message: string;
}

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 600,
    show: false,
    resizable: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
    },
  });

  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
    mainWindow.removeMenu();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.

app.whenReady().then(() => {
  let pingFailed: boolean = false;
  let fileClass: string = '';
  let validFilePath: string = '';
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron');

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  createWindow();

  ipcMain.handle('getAppName', (): IpcResponse => {
    const fullExecPath = process.execPath;
    const fullExecPathArr = fullExecPath.split('\\');
    const execNameWithExt = fullExecPathArr[fullExecPathArr.length - 1];
    const execName = execNameWithExt.slice(0, -4);
    return {
      code: 200,
      message: execName,
    };
  });

  ipcMain.handle('getFileClass', async (_, fileId): Promise<void> => {
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
  });

  ipcMain.handle('checkFileClass', async (): Promise<IpcResponse> => {
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
  });

  ipcMain.handle('secretChecks', async (): Promise<IpcResponse> => {
    const orgDNS = '';
    const domainIpRange = ['192.168.1.0', '192.168.1.255'];
    //to be changed when firestore cloud func is up

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
  });

  ipcMain.handle('ping', async (): Promise<void> => {
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
  });

  ipcMain.handle('checkPing', async (): Promise<IpcResponse> => {
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
  });

  ipcMain.handle('checkCompromisation', async (): Promise<IpcResponse> => {
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
    if (+new Date().getTime() - fullScanEndTimeMillis >= dayInMillis) {
      return {
        code: 403,
        message: 'Full System Scan Outdated',
      };
    }
    return {
      code: 200,
      message: 'Compromisation Check Passed',
    };
  });

  ipcMain.handle('hasDefaultProgram', (): IpcResponse => {
    const fileExtension = 'docx';
    for (const path of paths[fileExtension]) {
      if (fs.existsSync(path)) {
        validFilePath = path;
        break;
      }
    }
    if (validFilePath === '') {
      return {
        code: 412,
        message: 'User Does Not Have the Default Program for the File',
      };
    }
    return {
      code: 200,
      message: 'User Has Default Program',
    };
  });

  ipcMain.handle('launchFile', async (): Promise<void> => {
    //TODO code to get file from firebase and decrypt
    const filePath =
      'C:\\Users\\dexte\\Documents\\Year 2 Sem 2\\InfoSecurity Project\\Tutorials\\T01A';
    // const tempPath = 'C:\\Users\\dexte\\Pictures\\testFile';
    const tempPath = app.getPath('temp');
    //const filePathArr = filePath.split('.');
    //const fileExtension = filePathArr[filePathArr.length - 1];

    const obscurityFiles: string[] = [];

    function genRandomFileAndExtension(): { randomFileName: string; randomExt: string } {
      const randomFileLength = 16;
      const randomExtLength = 4;
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let randomFileName = '';
      let randomExt = '';
      const charactersLength = characters.length;
      const randomValues1 = new Uint8Array(randomFileLength);
      crypto.getRandomValues(randomValues1);
      for (let i = 0; i < randomFileLength; i++) {
        const randomIndex = Math.floor((randomValues1[i] / 256) * charactersLength);
        randomFileName += characters.charAt(randomIndex);
      }
      for (let i = 0; i < randomExtLength; i++) {
        const randomIndex = Math.floor((randomValues1[i] / 256) * charactersLength);
        randomExt += characters.charAt(randomIndex);
      }
      return {
        randomFileName: randomFileName,
        randomExt: randomExt,
      };
    }

    const randomFileInfo = genRandomFileAndExtension();
    const randomFilePath =
      tempPath + `\\${randomFileInfo.randomFileName}.${randomFileInfo.randomExt}`;
    const fileStats = await stat(filePath);
    const fileSize = fileStats.size;

    await copyFile(filePath, randomFilePath);

    for (let i = 0; i < 10; i++) {
      const obscurityFileName = genRandomFileAndExtension().randomFileName;
      const obscurityFileExt = genRandomFileAndExtension().randomExt;
      const obscurityFile = `${obscurityFileName}.${obscurityFileExt}`;
      obscurityFiles[i] = obscurityFile;
      const randomBytes = crypto.randomBytes(fileSize);
      await writeFile(`${tempPath}\\${obscurityFile}`, randomBytes);
    }

    async function delFiles() {
      try {
        await unlink(randomFilePath);
        obscurityFiles.forEach(async (file) => {
          await unlink(`${tempPath}\\${file}`);
        });
      } catch (err) {
        console.error(err);
      }
    }

    const child = execFile(validFilePath, [randomFilePath]);

    setInterval(async () => {
      if (pingFailed) {
        child.kill(child.pid!);
        await delFiles();
      }
    }, 2000);

    child.on('exit', async () => {
      console.log(`Process: ${child.pid} exited successfully`);
      await delFiles();
    });

    // app.on('before-quit', async () => {
    //   try {
    //     process.kill(child.pid!);
    //     process.on('SIGTERM', () => {
    //       delFiles()
    //         .then(() => console.log('Deleted Files'))
    //         .catch((err) => {
    //           console.log(err);
    //         });
    //     });
    //   } catch (err) {
    //     console.log(err);
    //   }
    // });
  });

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
