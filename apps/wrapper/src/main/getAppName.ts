import { parse } from 'path';

export function getAppName(appPath: string) {
  const parsedPath = parse(appPath);
  const appName = parsedPath.name;
  return appName;
}
