import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron';
import { join } from 'path';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import icon from '../../resources/icon.png?asset';
import { ChildProcess } from 'child_process';
import { getAppName } from './getAppName';
import { checkFileClass, getFileClass, secretChecks } from './fileClass';
import { ping, checkPing } from './ping';
import { checkCompromisation } from './checkCompromisation';
import { defaultProgram, viewFileInSeparateProcess, delFiles } from './viewDoc';

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

  mainWindow.on('close', function (e) {
    process.kill(pid, 'SIGTERM');
    const choice = dialog.showMessageBoxSync(mainWindow, {
      type: 'question',
      buttons: ['Yes', 'No'],
      message: 'Are you sure you want to close the wrapper?',
    });
    if (choice === 1) {
      e.preventDefault();
    } else if (choice === 0) {
      delFiles().then(() => console.log('Files Deleted Succesfully'));
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
  let pingFailed: boolean = false;
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
    const appNameRes = getAppName(process);
    return appNameRes;
  });

  ipcMain.handle('getFileClass', (_, fileId): void => {
    getFileClass(fileId);
  });

  ipcMain.handle('checkFileClass', (): IpcResponse => {
    const fileClassRes = checkFileClass();
    return fileClassRes;
  });

  ipcMain.handle('secretChecks', async (): Promise<IpcResponse> => {
    const secretChecksRes = secretChecks();
    return secretChecksRes;
  });

  ipcMain.handle('ping', (): void => {
    pingFailed = ping();
  });

  ipcMain.handle('checkPing', (): IpcResponse => {
    return checkPing();
  });

  ipcMain.handle('checkCompromisation', (): IpcResponse => {
    const checkCompromisationRes = checkCompromisation();
    return checkCompromisationRes;
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
    // const tempPath = app.getPath('temp');
    //const filePathArr = filePath.split('.');
    //const fileExtension = filePathArr[filePathArr.length - 1];

    if (!fileOpened) {
      child = await viewFileInSeparateProcess();
      fileOpened = true;
    } else if (fileOpened) {
      console.log('File Already Opened!');
    }
    if (child && !child.pid) {
      return false;
    }
    pid = child!.pid!;
    setInterval(async () => {
      if (pingFailed) {
        child!.kill();
        await delFiles();
      }
    }, 2000);

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
