/**
 * Environment access for one-off scripts that run outside Next.js and so do not
 * get `.env*.local` loaded for them.
 *
 * The dotenv reader is deliberately minimal: one assignment per line,
 * surrounding quotes stripped, no interpolation or multi-line values. An empty
 * value (`KEY=`) is kept as the empty string, not dropped.
 */
import fs from "node:fs";
import path from "node:path";

export function parseEnvFileText(text: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const line of text.split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
    const key = m?.[1];
    const raw = m?.[2];
    if (key !== undefined && raw !== undefined) {
      out[key] = raw.replace(/^["']|["']$/g, "").trim();
    }
  }
  return out;
}

/** `file` resolves against the working directory; a missing file yields `{}`. */
export function loadEnvFile(file: string): Record<string, string> {
  const abs = path.resolve(process.cwd(), file);
  if (!fs.existsSync(abs)) return {};
  return parseEnvFileText(fs.readFileSync(abs, "utf8"));
}

/** The named environment variable, or a thrown error naming it when unset or empty. */
export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required — set it in the environment before running this script.`);
  }
  return value;
}
