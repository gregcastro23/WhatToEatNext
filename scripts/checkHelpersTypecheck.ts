import { spawnSync } from "node:child_process";

const TSCONFIG_PATH = "tests/helpers/tsconfig.json";

function fail(message: string): never {
  console.error(`check:helpers-typecheck FAILED: ${message}`);
  process.exit(1);
}

console.log(`Running tests/helpers/** typecheck gate against ${TSCONFIG_PATH}...`);

const result = spawnSync(
  "bunx",
  ["tsc", "--noEmit", "--incremental", "false", "--project", TSCONFIG_PATH],
  {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
    env: {
      ...process.env,
      NODE_OPTIONS: process.env.NODE_OPTIONS ?? "--max-old-space-size=8192",
    },
  },
);

if (result.error) {
  fail(`Failed to invoke tsc: ${result.error.message}`);
}

if (result.signal !== null || result.status === null) {
  fail(
    `tsc terminated abnormally (signal=${result.signal ?? "none"}, status=${String(result.status)})`,
  );
}

const stdout = result.stdout ?? "";
const stderr = result.stderr ?? "";

if (stderr.trim().length > 0) {
  fail(`tsc emitted unexpected output to stderr:\n${stderr}`);
}

if (result.status !== 0 || stdout.trim().length > 0) {
  fail(`tsc exited with status ${result.status}:\n${stdout}`);
}

console.log(`check:helpers-typecheck PASSED: 0 type errors in ${TSCONFIG_PATH}.`);
