import { tmpdir } from 'os';
import { dirname, basename, resolve } from 'path';
import { getRandomValues, randomBytes, createDecipheriv } from 'crypto';
import { ChildProcess, execFile } from 'child_process';

import { existsSync, promises as fsPromises } from 'fs';
const { writeFile, copyFile, stat, unlink } = fsPromises;

import { paths } from './absolutePaths';
interface RandomFileProperties {
  randomFileName: string;
  randomExt: string;
}

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

export function genRandomFileAndExtension(): RandomFileProperties {
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

export function defaultProgram(fileExt: string): string {
  for (const path of paths[fileExt]) {
    if (existsSync(path)) {
      validFilePath = path;
      break;
    }
  }
  return validFilePath;
}

export async function viewFileInSeparateProcess(
  encKey: string,
  iv: string,
  fileArray: ArrayBuffer
): Promise<ChildProcess> {
  const keyBuffer = Buffer.from(encKey, 'hex');
  const ivBuffer = Buffer.from(iv, 'hex');

  const decipher = createDecipheriv('aes-256-cbc', keyBuffer, ivBuffer);

  const decryptedData = Buffer.concat([decipher.update(Buffer.from(fileArray)), decipher.final()]);

  const decryptedUint8Array = new Uint8Array(
    decryptedData.buffer.slice(
      decryptedData.byteOffset,
      decryptedData.byteOffset + decryptedData.byteLength
    )
  );

  writeFile(randomFilePath, decryptedUint8Array);
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
    await writeFile(resolve(tempPath, obscurityFile), cryptoRandomBytes);
  }

  return child;
}

export async function delFiles(): Promise<void> {
  try {
    obscurityFiles.forEach(async (file) => {
      await unlink(resolve(tempPath, file));
    });
    await unlink(randomFilePath);
  } catch (err) {
    console.error(err);
  }
}
