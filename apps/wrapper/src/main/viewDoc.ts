import { paths } from './absolutePaths';

import { tmpdir } from 'os';
import { dirname, basename, resolve } from 'path';
import { getRandomValues, randomBytes } from 'crypto';
import { ChildProcess, execFile } from 'child_process';

import { existsSync, promises as fsPromises } from 'fs';
const { writeFile, copyFile, stat, unlink } = fsPromises;

let validFilePath = '';

const obscurityFiles: string[] = [];
const tempPath = tmpdir();
const fileDir = dirname('C:\\Users\\dexte\\Pictures\\testFile\\Testfile');
const fileName = basename('C:\\Users\\dexte\\Pictures\\testFile\\Testfile');
const filePath = resolve(fileDir, fileName);
const randomFileInfo = genRandomFileAndExtension();

const randomFilePath = resolve(
  tempPath,
  `${randomFileInfo.randomFileName}.${randomFileInfo.randomExt}`
);

export function genRandomFileAndExtension(): { randomFileName: string; randomExt: string } {
  const randomFileLength = 16;
  const randomExtLength = 4;
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  const randomValues1 = new Uint8Array(randomFileLength);

  let randomFileName = '';
  let randomExt = '';

  getRandomValues(randomValues1);
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

export function defaultProgram(): string {
  const fileExtension = 'docx';
  for (const path of paths[fileExtension]) {
    if (existsSync(path)) {
      validFilePath = path;
      break;
    }
  }
  return validFilePath;
}

export async function viewFileInSeparateProcess(): Promise<ChildProcess> {
  console.log('viewFileInSeparateProcess Invoked');
  await copyFile(filePath, randomFilePath);
  const child = execFile(validFilePath, [randomFilePath]);

  const fileStats = await stat(filePath);
  const fileSize = fileStats.size;

  for (let i = 0; i < 10; i++) {
    const obscurityFileName = genRandomFileAndExtension().randomFileName;
    const obscurityFileExt = genRandomFileAndExtension().randomExt;
    const obscurityFile = `${obscurityFileName}.${obscurityFileExt}`;
    obscurityFiles[i] = obscurityFile;
    const cryptoRandomBytes = randomBytes(fileSize);
    await writeFile(`${tempPath}\\${obscurityFile}`, cryptoRandomBytes);
  }

  return child;
}

export async function delFiles(): Promise<void> {
  try {
    obscurityFiles.forEach(async (file) => {
      await unlink(`${tempPath}\\${file}`);
    });
    await unlink(randomFilePath);
  } catch (err) {
    console.error(err);
  }
}
