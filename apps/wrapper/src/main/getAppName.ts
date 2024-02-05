export function getAppName(process: NodeJS.Process) {
  const fullExecPath = process.execPath;
  const fullExecPathArr = fullExecPath.split('\\');
  const execNameWithExt = fullExecPathArr[fullExecPathArr.length - 1];
  const execName = execNameWithExt.slice(0, -4);
  return execName;
}
