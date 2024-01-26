import type { IpcResponse, AppState } from '@armadillo/shared';

import { join } from 'path';
import { ChildProcess } from 'child_process';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron';
import { appState } from '../renderer/src/stores';

import icon from '../../resources/icon.png?asset';
import { getAppName } from './getAppName';
import { ping, checkPing } from './ping';
import { checkCompromisation } from './checkCompromisation';
import { checkFileClass, getFileClass, secretChecks } from './fileClass';
import { defaultProgram, viewFileInSeparateProcess, delFiles } from './viewDoc';
import { loadState } from './loadState';

let childKilled = false;
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

  mainWindow.on('close', async function (e) {
    if (fileOpened) {
      childKilled = true;
      process.kill(pid, 'SIGTERM');
      setTimeout(async () => {
        await delFiles();
      }, 2000);
    }
    const choice = dialog.showMessageBoxSync(mainWindow, {
      type: 'question',
      buttons: ['Confirm', 'Cancel'],
      message: 'Are you sure you want to close the wrapper?',
    });
    if (choice === 1) {
      e.preventDefault();
    }
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.

let child: ChildProcess | null = null;
let pid: number = 0;
let fileOpened: boolean = false;

app.whenReady().then(() => {
  loadState();

  let appStateObj: AppState = {
    passedCheck: null,
    currentState: null,
    pingFailed: null,
    privIp: null,
    hostname: null,
  };

  let privIp: string | null = null;
  let hostname: string | null = null;

  appState.subscribe((state) => {
    appStateObj = state;
    privIp = appStateObj.privIp;
    hostname = appStateObj.hostname;
  });

  let randomDigits = '';
  for (let i = 0; i < 4; i++) {
    randomDigits += Math.floor(Math.random() * 10).toString();
  }

  const clientId = `${hostname}::${privIp}::${randomDigits}`;
  console.log(clientId);

  let pingFailed: boolean = false;
  let validFilePath: string = '';
  // Set app user model id for windows
  electronApp.setAppUserModelId('app.web.it2566-armadillo');

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  createWindow();

  ipcMain.handle('getAppName', (): IpcResponse => {
    return getAppName(process);
  });

  ipcMain.handle('getFileClass', (_, fileId): void => {
    getFileClass(fileId);
  });

  ipcMain.handle('checkFileClass', (): IpcResponse => {
    return checkFileClass();
  });

  ipcMain.handle('secretChecks', async (): Promise<IpcResponse> => {
    return secretChecks();
  });

  ipcMain.handle('ping', (): void => {
    pingFailed = ping();
  });

  ipcMain.handle('checkPing', (): IpcResponse => {
    return checkPing();
  });

  ipcMain.handle('checkCompromisation', (): IpcResponse => {
    return checkCompromisation();
  });

  ipcMain.handle('hasDefaultProgram', (): IpcResponse => {
    validFilePath = defaultProgram();

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

  ipcMain.handle('launchFile', async (): Promise<boolean> => {
    //TODO code to get file from firebase and decrypt
    if (!fileOpened) {
      child = await viewFileInSeparateProcess();
      fileOpened = true;
    } else if (fileOpened) {
      console.log('File Already Opened!');
    }

    if (!child || !child.pid) {
      return false;
    }

    pid = child.pid;

    setInterval(async () => {
      if (fileOpened && pingFailed) {
        child!.kill();
        setTimeout(async () => await delFiles(), 2000);
      }
    }, 2000);

    child.on('exit', async () => {
      if (!childKilled) {
        await delFiles();
        fileOpened = false;
      }
    });
    return true;
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

app.on('window-all-closed', async () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
