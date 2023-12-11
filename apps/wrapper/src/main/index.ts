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
const { copyFile } = fsPromises;
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
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron');

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  createWindow();

  ipcMain.handle('getAppName', (): Promise<IpcResponse> => {
    return {
      code: 200,
      message: app.getName(),
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
    const nonLocalInterfaces = {};
    for (const inet in networkInterfaces) {
      const addresses = networkInterfaces[inet];
      for (let i = 0; i < addresses.length; i++) {
        const address = addresses[i];
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
      mainIntType = 'Ethernet';
    }
    let ipv4 = '';
    mainInt.forEach((adrs) => {
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
          console.log(`ethernet dns: ${dns}`);
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
    function convertToMillis(str) {
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
    let fullScanEndTime: string = '';
    defenderStatusArr.forEach((property) => {
      if (property.includes('AntivirusSignatureLastUpdated')) {
        antivirusSignatures = property.split(': ')[1];
      } else if (property.includes('QuickScanEndTime')) {
        fullScanEndTime = property.split(': ')[1];
      }
      //must change to full scan during production
    });

    const monthInMillis: number = 2629800000;
    const dayInMillis: number = 86400000;
    const antivirusSignaturesMillis: number = convertToMillis(antivirusSignatures);
    const fullScanEndTimeMillis: number = convertToMillis(fullScanEndTime);
    if (+new Date().getTime() - antivirusSignaturesMillis >= monthInMillis) {
      return {
        code: 403,
        message: 'Signatures Outdated',
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

  ipcMain.handle('launchFile', async (): Promise<void> => {
    //code to get file from firebase and decrypt
    const filePath =
      'C:\\Users\\dexte\\Documents\\Year 2 Sem 2\\InfoSecurity Project\\Tutorials\\T01A.pdf';
    const tempPath = 'C:\\Users\\dexte\\Pictures\\testFile';
    //const tempPath = app.getPath('temp');
    //WIP TEST CODE

    const filePathArr = filePath.split('.');
    const fileExtension = filePathArr[filePathArr.length - 1];

    function genRandomString() {
      const length = 16;
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let randomString = '';
      const charactersLength = characters.length;
      const randomValues1 = new Uint8Array(length);
      crypto.getRandomValues(randomValues1);
      for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor((randomValues1[i] / 256) * charactersLength);
        randomString += characters.charAt(randomIndex);
      }
      return randomString;
    }

    const randomFilePath = tempPath + `\\${genRandomString()}.${fileExtension}`;
    let validFilePath = '';
    await copyFile(filePath, randomFilePath);

    for (const path of paths[fileExtension]) {
      if (fs.existsSync(path)) {
        validFilePath = path;
        break;
      }
    }
    if (validFilePath === '') {
      return;
    }

    const child = execFile(validFilePath, [randomFilePath]);

    child.on('exit', () => console.log(`exited process with pid ${child.pid}`));

    // const child = spawn('cmd', ['/c', 'start', '""', randomFilePath], {
    //   shell: false,
    // });

    // const regKey = new Winreg({
    //   hive: Winreg.HKCU,
    //   key: `\\Software\\Microsoft\\Windows\\CurrentVersion\\Run`,
    // });
    // console.log(`.${fileExtension}`);
    // regKey.values((err, items) => {
    //   if (err) {
    //     console.log(`ERROR: ${err}`);
    //   } else {
    //     items.forEach((item) => {
    //       console.log(item.value);
    //     });
    //   }
    // });

    /*shell.openPath(randomFilePath).then((pid) => {
      console.log(pid);
    });*/

    /*
    function launch() {
      return new Promise((resolve, reject) => {
        const notepad = spawn('notepad');

        let launched = false;
        notepad.stdout.on('data', (data) => {
          launched = process.openStdin(notepad.pid) !== null;
        });
        notepad.on('close', () => {
          if (launched) {
            resolve('close' + notepad.pid);
          } else {
            reject(new Error('Process closed before launch'));
          }
        });
      });
    }

    console.log(await launch());*/
    // exec(`start explorer.exe ${randomFilePath}`);
    /*
    const child = exec('start' + ' ' + randomFilePath);
    console.log(child.pid);
    try {
      const child = spawn('cmd', ['/c', 'start', '""', randomFilePath]);
      console.log(child.pid);
    } catch (err) {
      console.log(err);
    }
    
    const child = exec('start' + ' ' + randomFilePath);
    console.log(`PID: ${child.pid}`);
    child.on('exit', (code) => {
      console.log(code);
    });
    

    function writeFileToFolder(buffer: Buffer) {
      fs.writeFile(randomFile, buffer, (err) => {
        if (err) {
          console.error(err);
          return;
        }
        fs.open(randomFile);
      });
    }
    fs.readFile(filePath, async (err, data) => {
      const blob = new Blob([data], { type: 'application/octet-stream' });
      const arrayBuffer = await blob.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      if (err) {
        console.error(err);
        return;
      }

      writeFileToFolder(buffer);
    });*/
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
