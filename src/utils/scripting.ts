import path from "path";
import { spawn } from "child_process";
import { IEventAction } from "@models/interfaces";

export interface IRunScriptFn {
  (script: string, dirPath?: string, args?: string[], action?: IEventAction): void;
}

export const runScript: IRunScriptFn = async (script, dirPath = "", args = [], action?: IEventAction): Promise<void> => {
  const scriptPath = path.join(dirPath, script);

  return new Promise((resolve, reject) => {
    const { logger, log } = action || {};
    const child = spawn("bash", [scriptPath, ...args], { stdio: ["ignore", "pipe", "pipe"] });

    child.stdout.on("data", data => {
      const msg = data.toString().trim();
      logger?.info({ ...log, status: 'start', stream: "stdout" }, msg);
    });

    child.stderr.on("data", data => {
      const msg = data.toString().trim();
      logger?.error({ ...log, status: 'error', stream: "stderr" }, msg);
    });

    child.on("error", err => {
      logger?.error({ ...log }, `Error running script: ${err.message}`);
      reject(err);
    });

    child.on("close", code => {
      if (code === 0) {
        logger?.info({ ...log, status: "end" }, `${script} completed`);
        resolve();
      } else {
        reject(new Error(`Script exited with code ${code}`));
      }
    });
  });
};
