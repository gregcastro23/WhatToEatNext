/**
 * Determinism guards for the Recipe-NFT fingerprint.
 *
 * `src/lib/recipe-nft/fingerprint.ts` documents computeRecipeFingerprint as
 * "Deterministic for a given recipe + ingredient catalog, so it is safe to hash
 * into `contentHash`". That claim was FALSE: herb potency was computed with
 * Math.random() at module load, so the value differed per process and the
 * contentHash — the mint deduplication key and the on-chain commitment — was
 * not reproducible from the recipe it described.
 *
 * `[MEASURED 2026-07-31]` before the fix, three separate processes:
 *   basil=6 mint=6 rosemary=5 curry_leaves=4 lemongrass=5 shiso=5
 *   basil=4 mint=4 rosemary=5 curry_leaves=6 lemongrass=4 shiso=4
 *   basil=3 mint=5 rosemary=6 curry_leaves=4 lemongrass=4 shiso=5
 *
 * The load-bearing tests here spawn a SEPARATE PROCESS and compare. An
 * in-process test cannot catch this class of defect at all: a module-load
 * random is computed once per process, so repeated calls within one test run
 * agree with each other while disagreeing with every other process.
 *
 * @file src/__tests__/recipeNftDeterminism.test.ts
 */

import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const REPO_ROOT = join(__dirname, "..", "..");

/**
 * Run a snippet in a fresh process against this repo, returning its stdout.
 *
 * The file is written INSIDE the repo so the "@/..." path alias resolves; it is
 * removed afterwards regardless of outcome.
 */
function runInFreshProcess(snippet: string, label: string): string {
  const dir = mkdtempSync(join(tmpdir(), "nft-determinism-"));
  const scriptPath = join(REPO_ROOT, `.determinism-${label}-${process.pid}.ts`);
  try {
    writeFileSync(scriptPath, snippet, "utf8");
    return execFileSync("bunx", ["tsx", scriptPath], {
      cwd: REPO_ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      timeout: 120_000,
    }).trim();
  } finally {
    rmSync(scriptPath, { force: true });
    rmSync(dir, { recursive: true, force: true });
  }
}

const POTENCY_SNIPPET = `
import { herbs } from "@/data/ingredients/herbs";
const names = ["basil", "mint", "rosemary", "curry_leaves", "lemongrass", "shiso"];
const out: Record<string, unknown> = {};
for (const n of names) out[n] = (herbs as Record<string, { potency?: number }>)[n]?.potency ?? null;
console.log(JSON.stringify(out));
`;

const FINGERPRINT_SNIPPET = `
import { computeRecipeFingerprint } from "@/lib/recipe-nft/fingerprint";
const recipe = {
  title: "Determinism Probe",
  yields: 4,
  // These three are the herbs that ACTUALLY reach the fingerprint through
  // resolveIngredient. [MEASURED 2026-07-31] on unmodified master they varied
  // per process — rosemary 3/6/5, curry_leaves 5/4/3, shiso 4/3/5 — while
  // "basil" and "mint" resolve to fresh_basil / fresh_mint instead and were
  // never affected. A fixture built from basil and mint passes whether or not
  // the defect is present, which is how the first draft of this test fooled
  // its own control.
  ingredients: [
    { name: "rosemary", quantity: "1", unit: "tsp" },
    { name: "curry_leaves", quantity: "2", unit: "tbsp" },
    { name: "shiso", quantity: "3", unit: "tbsp" },
  ],
};
const fp = computeRecipeFingerprint(recipe as never);
console.log(JSON.stringify({ totals: fp.totals, aSharp: fp.aSharp }));
`;

describe("herb potency is stable across processes", () => {
  it("returns identical potency in two independent processes", () => {
    const a = runInFreshProcess(POTENCY_SNIPPET, "pot-a");
    const b = runInFreshProcess(POTENCY_SNIPPET, "pot-b");
    expect(a).toBe(b);
  }, 180_000);

  it("keeps basil's authored potency rather than deriving one", () => {
    // freshHerbs.ts:265 authors `potency: 7`. The index.ts entry shadows that
    // record, so the authored figure is restored explicitly there.
    const parsed = JSON.parse(runInFreshProcess(POTENCY_SNIPPET, "pot-c"));
    expect(parsed.basil).toBe(7);
  }, 180_000);

  it("leaves unsourced herbs absent rather than inventing a number", () => {
    // Absent resolves to NEUTRAL_POTENCY at fingerprint.ts, which is an honest
    // "unknown". Filling these in by hand would fabricate the same values the
    // random generator did, just more slowly.
    const parsed = JSON.parse(runInFreshProcess(POTENCY_SNIPPET, "pot-d"));
    for (const herb of ["mint", "rosemary", "curry_leaves", "lemongrass", "shiso"]) {
      expect(parsed[herb]).toBeNull();
    }
  }, 180_000);
});

describe("recipe fingerprint is reproducible across processes", () => {
  it("produces an identical fingerprint in two independent processes", () => {
    // This is the property fingerprint.ts documents and that contentHash —
    // the mint dedup key and the on-chain commitment — depends on.
    const a = runInFreshProcess(FINGERPRINT_SNIPPET, "fp-a");
    const b = runInFreshProcess(FINGERPRINT_SNIPPET, "fp-b");
    expect(a).toBe(b);
  }, 180_000);
});

describe("no fabricated values remain in the herbs module", () => {
  it("contains no Math.random call", () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const source: string = require("node:fs").readFileSync(
      join(REPO_ROOT, "src/data/ingredients/herbs/index.ts"),
      "utf8",
    );
    // Strip line comments before checking: the file documents the removed
    // Math.random() in prose, and that mention must not trip this guard.
    const withoutComments = source
      .split("\n")
      .filter((line) => !line.trim().startsWith("//"))
      .join("\n");
    expect(withoutComments).not.toContain("Math.random");
  });
});
