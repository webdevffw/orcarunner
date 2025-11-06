import path from "path";
import { MODULES_DIR } from "@/server/lib/data/constants";
import { runScript } from "@/server/lib/utils/scripting";

export const createLogFile = async ({ LOG_DIR, LOG_FILE }): Promise<string> => {
  try {
    const scriptPath = path.join(MODULES_DIR, "logger", "scripts");

    await runScript("create.sh", scriptPath, [LOG_DIR, LOG_FILE]);

    return `✅ Log file active at ${path.join(LOG_DIR, LOG_FILE)}`;
  } catch (error) {
    console.error(`❌ Error creating log file: ${error.message}`);
    throw error;
  }
};
