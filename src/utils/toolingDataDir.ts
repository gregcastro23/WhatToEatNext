import fs from "fs";
import path from "path";

const PRIMARY_TOOLING_DIR = ".local/ai";

function resolveToolingDir(...segments: string[]) {
  return path.join(process.cwd(), PRIMARY_TOOLING_DIR, ...segments);
}

export function getToolingDir(...segments: string[]) {
  return resolveToolingDir(...segments);
}

export function ensureToolingDir(...segments: string[]) {
  const dirPath = getToolingDir(...segments);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  return dirPath;
}

export function getToolingFilePath(subdir: string[], filename: string) {
  return path.join(resolveToolingDir(...subdir), filename);
}
