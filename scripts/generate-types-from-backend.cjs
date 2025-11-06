/* eslint-disable no-console */
const { exec } = require("child_process");

function run(cmd, label) {
  return new Promise((resolve) => {
    const child = exec(cmd, (err, stdout, stderr) => {
      if (err) {
        console.error(`❌ ${label} failed`, stderr || err.message);
      } else {
        if (stdout?.trim()) console.log(stdout.trim());
        console.log(`✅ ${label} completed`);
      }
      resolve();
    });
    if (child.stdout) child.stdout.pipe(process.stdout);
    if (child.stderr) child.stderr.pipe(process.stderr);
  });
}

async function main() {
  await run(
    "npx openapi-typescript http://localhost:8000/openapi.json -o src/types/api/alchemical.ts",
    "Alchemical API types generated",
  );
  await run(
    "npx openapi-typescript http://localhost:8100/openapi.json -o src/types/api/kitchen.ts",
    "Kitchen API types generated",
  );
}

main();
