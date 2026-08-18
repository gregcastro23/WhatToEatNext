#!/usr/bin/env node
/**
 * Write fetched USDA water fractions into the ingredient data files as
 * `nutritionalProfile.waterContent`.
 *
 * Reads `scripts/data/usda-water-content.json` (produced by
 * `scripts/fetch-usda-water-content.mjs`) and edits `src/data/ingredients/**.ts`
 * in place.
 *
 * ── Why this is depth-aware and not a regex over the file ───────────────────
 *
 * Ingredient files nest: a top-level entry has a `name:` and a
 * `nutritionalProfile:`, and it may ALSO carry a `varieties: { ribeye: { name:
 * "Ribeye", … } }`. A naive "find name, then find the next nutritionalProfile"
 * would happily attach beef's water content to a variety, or attach a variety's
 * name to the next entry's profile. So the scanner tracks brace depth and only
 * accepts a `name:` and a `nutritionalProfile:` that sit at the SAME depth in
 * the SAME object.
 *
 * Idempotent: an entry that already has `waterContent` is left alone and
 * reported as skipped, so a re-run after a partial fetch is safe.
 *
 * Usage:
 *   node scripts/apply-usda-water-content.mjs --dry-run   # report only
 *   node scripts/apply-usda-water-content.mjs             # write
 *
 * @file scripts/apply-usda-water-content.mjs
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const HERE = dirname(fileURLToPath(import.meta.url));
const DATA = join(HERE, "data", "usda-water-content.json");
const ROOT = join(HERE, "..", "src", "data", "ingredients");
const DRY = process.argv.includes("--dry-run");

const fetched = JSON.parse(readFileSync(DATA, "utf8"));
/** Keyed by the exact `name:` value the ingredient files use. */
const byName = new Map(fetched.results.map((r) => [r.ingredient.toLowerCase(), r]));

if (byName.size === 0) {
  console.error("No fetched results. Run scripts/fetch-usda-water-content.mjs first.");
  process.exit(1);
}

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (entry.endsWith(".ts") && !entry.endsWith(".test.ts")) out.push(full);
  }
  return out;
}

/** Brace delta for a line, ignoring braces inside string literals and comments. */
function braceDelta(line) {
  let depth = 0;
  let inStr = null;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    const prev = line[i - 1];
    if (inStr) {
      if (ch === inStr && prev !== "\\") inStr = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") {
      inStr = ch;
      continue;
    }
    if (ch === "/" && line[i + 1] === "/") break;
    if (ch === "{") depth += 1;
    if (ch === "}") depth -= 1;
  }
  return depth;
}

const NAME_RE = /^\s*name:\s*"([^"]+)"\s*,?\s*$/;
const PROFILE_RE = /^\s*nutritionalProfile:\s*\{\s*$/;

function render(row, indent) {
  const pad = " ".repeat(indent);
  const inner = " ".repeat(indent + 2);
  const lines = [
    `${pad}waterContent: {`,
    `${inner}fraction: ${row.fraction},`,
    `${inner}basis: "usda-fdc",`,
    `${inner}fdcId: ${row.fdcId},`,
    `${inner}fdcDescription: ${JSON.stringify(row.fdcDescription)},`,
    `${inner}retrieved: ${JSON.stringify(row.retrieved)},`,
    `${pad}},`,
  ];
  return lines;
}

let applied = 0;
let skipped = 0;
/** Fetched names that landed somewhere — this run OR a previous one. */
const satisfied = new Set();
const touchedFiles = new Set();
const appliedNames = [];

for (const file of walk(ROOT)) {
  const src = readFileSync(file, "utf8");
  if (!src.includes("nutritionalProfile")) continue;
  const lines = src.split("\n");

  // Pass 1: map each object depth to the most recent `name:` seen AT that depth,
  // then find `nutritionalProfile:` keys at the same depth.
  const nameAtDepth = new Map();
  const insertions = [];
  let depth = 0;
  let alreadyHas = new Set();

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const nameMatch = NAME_RE.exec(line);
    if (nameMatch) nameAtDepth.set(depth, nameMatch[1]);

    if (PROFILE_RE.test(line)) {
      const owner = nameAtDepth.get(depth);
      const row = owner ? byName.get(owner.toLowerCase()) : undefined;
      if (row) {
        // Does this profile object already carry waterContent? Scan to its close.
        let d = 1;
        let has = false;
        for (let j = i + 1; j < lines.length && d > 0; j += 1) {
          if (/^\s*waterContent:\s*\{/.test(lines[j]) && d === 1) has = true;
          d += braceDelta(lines[j]);
        }
        if (has) {
          alreadyHas.add(owner);
        } else {
          const indent = (/^(\s*)/.exec(line) ?? ["", ""])[1].length + 2;
          insertions.push({ after: i, row, indent, owner });
        }
      }
    }
    depth += braceDelta(line);
  }

  for (const n of alreadyHas) satisfied.add(n.toLowerCase());
  skipped += alreadyHas.size;
  if (insertions.length === 0) continue;

  // Apply back-to-front so earlier indices stay valid.
  const out = [...lines];
  for (const ins of [...insertions].sort((a, b) => b.after - a.after)) {
    out.splice(ins.after + 1, 0, ...render(ins.row, ins.indent));
    appliedNames.push(ins.owner);
    satisfied.add(ins.owner.toLowerCase());
  }
  applied += insertions.length;
  touchedFiles.add(file);
  if (!DRY) writeFileSync(file, out.join("\n"));
}

const rel = (f) => f.replace(join(HERE, ".."), "").replace(/^\//, "");
console.log(`${DRY ? "[dry run] would apply" : "applied"} ${applied} waterContent block(s)`);
console.log(`  ingredients: ${appliedNames.sort().join(", ") || "(none)"}`);
console.log(`  files touched: ${touchedFiles.size}`);
for (const f of [...touchedFiles].sort()) console.log(`    ${rel(f)}`);
if (skipped > 0) console.log(`  already had waterContent, left alone: ${skipped}`);

// A fetched value counts as placed if it landed in THIS run or a previous one.
// Comparing only against this run's insertions reported every already-applied
// ingredient as unmatched, which reads as data loss and is the opposite of true.
const unmatched = [...byName.keys()].filter((k) => !satisfied.has(k));
if (unmatched.length > 0) {
  // NOT a silent drop: a fetched value with nowhere to go means the ingredient
  // name in the fetch list matches no `name:` in the data files.
  console.log(`  fetched but no matching ingredient entry: ${unmatched.join(", ")}`);
} else {
  console.log(`  every fetched value (${byName.size}) is placed in the data files`);
}
