import fs from "fs";
import path from "path";

export const createLogFile = async ({ LOG_DIR, LOG_FILE }: { LOG_DIR: string, LOG_FILE: string}): Promise<string> => {
  if (!LOG_DIR || !LOG_FILE) {
    throw new Error('Need both arguments `LOG_DIR` & `LOG_FILE`');
  }

  try {
    const filePath = path.join(LOG_DIR, LOG_FILE);

    // Create directory recursively
    fs.mkdirSync(LOG_DIR, { recursive: true });

    // Create file if it doesn't exist
    if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, '');

    // Set permissions
    fs.chmodSync(filePath, 0o666);

    return `✅ Log file active at ${path.join(LOG_DIR, LOG_FILE)}`;
  } catch (error: any) {
    console.error(`❌ Error creating log file: ${error.message}`);
    throw error;
  }
};
