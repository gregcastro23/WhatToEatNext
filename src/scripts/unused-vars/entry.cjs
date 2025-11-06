// Bridge runner to execute the TypeScript CLI using Node's ESM loader for ts-node.
const { execSync } = require("node:child_process");
const path = require("node:path");

const args = process.argv.slice(2).join(" ");
const cliPath = path.posix.join("src", "scripts", "unused-vars", "cli.ts");
const cmd = `node --enable-source-maps --loader ts-node/esm ${cliPath} ${args}`;
execSync(cmd, { stdio: "inherit" });
