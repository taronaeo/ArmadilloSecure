import { win32 } from 'path';

export function getAppName(appPath: string) {
  const execName = win32.basename(appPath);
  const appName = execName.slice(0, -4);
  return appName;
}
