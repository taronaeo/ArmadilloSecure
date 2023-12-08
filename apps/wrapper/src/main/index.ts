import { app, shell, BrowserWindow, ipcMain } from 'electron';
import { join } from 'path';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import icon from '../../resources/icon.png?asset';
import os from 'os';
import { BlockList } from 'net';
import { exec, execSync } from 'child_process';
import systeminformation from 'systeminformation';

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
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron');

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  createWindow();

  ipcMain.handle('getAppName', () => {
    return app.getName();
  });

  ipcMain.handle('secretChecks', async () => {
    const orgDNS = '';
    const domainIpRange = ['192.168.1.0', '192.168.1.255'];
    //to be changed when firestore cloud func is up

    const response: { code?: number; message?: string } = {};

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
      response.code = 403;
      response.message = 'IP Address not part of Organization IP Address Range';
      return response;
    }

    const userOS = os.platform();

    if (userOS != 'win32') {
      response.code = 403;
      response.message = 'Operating System is not Windows';
      return response;
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
          console.log(`wifi dns: ${dns}`);
        }
      }
    });
    if (dns != orgDNS) {
      response.code = 403;
      response.message = 'Invalid Domain Name';
      return response;
    }

    response.code = 200;
    response.message = 'Check Successful';
    return response;
  });

  ipcMain.handle('ping', async () => {
    const host = 'www.google.com';
    exec(`ping ${host}`, (error, stdout, stderr) => {
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

  ipcMain.handle('checkPing', async () => {
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

  ipcMain.handle('checkCompromisation', async () => {
    const response: { code?: number; message?: string } = {};
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
      response.code = 403;
      response.message = 'Signatures Outdated';
      return response;
    }
    if (+new Date().getTime() - fullScanEndTimeMillis >= dayInMillis) {
      response.code = 403;
      response.message = 'Full System Scan Outdated';
      return response;
    }
    response.code = 200;
    response.message = 'Compromisation Check Passed';
    return response;
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
