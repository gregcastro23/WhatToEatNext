/**
 * Compute the keccak256 hashes the recipe-protocol deploy needs, and print them
 * as ready-to-paste env vars for DeployRecipeProtocol.s.sol.
 *
 *   bun run scripts/recipe-nft/compute-deploy-hashes.ts \
 *     --license docs/recipe-nft/ALCHM-RECIPE-LICENSE-v1.md \
 *     --work path/to/canonical-work.bin \
 *     --evidence path/to/copyright-certificate.pdf
 *
 * --license defaults to the bundled v1 manifest. --work and --evidence are the
 * canonical deposited work and the copyright evidence bundle; supply the real
 * files before a mainnet deploy (on Base Sepolia you may hash placeholders).
 *
 * The work/evidence/license FILES stay off-chain — only their hashes (and the
 * public license URI you host) are anchored on-chain.
 */

import { readFileSync } from "node:fs";
import { keccak256, toHex } from "viem";

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

function hashFile(path: string): `0x${string}` {
  const bytes = new Uint8Array(readFileSync(path));
  return keccak256(toHex(bytes));
}

const licensePath = arg("license") ?? "docs/recipe-nft/ALCHM-RECIPE-LICENSE-v1.md";
const workPath = arg("work");
const evidencePath = arg("evidence");

const licenseHash = hashFile(licensePath);
console.log("# Recipe-protocol deploy hashes (Base Sepolia DeployRecipeProtocol.s.sol)\n");
console.log(`ALCHM_LICENSE_HASH=${licenseHash}   # keccak256(${licensePath})`);

if (workPath) {
  console.log(`ALCHM_WORK_HASH=${hashFile(workPath)}   # keccak256(${workPath})`);
} else {
  console.log("ALCHM_WORK_HASH=        # supply --work <file> (canonical deposited work)");
}

if (evidencePath) {
  console.log(`ALCHM_EVIDENCE_HASH=${hashFile(evidencePath)}   # keccak256(${evidencePath})`);
} else {
  console.log("ALCHM_EVIDENCE_HASH=    # supply --evidence <file> (copyright certificate bundle)");
}

console.log("\n# Also set: ALCHM_LICENSE_URI (where you host the manifest above), RIGHTS_HOLDER, DEPLOYER_PRIVATE_KEY");
