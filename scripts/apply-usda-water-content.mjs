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
/**
 * Replace blocks whose stored value no longer matches the fetched one.
 *
 * Needed whenever a figure is CORRECTED rather than added — e.g. after a target
 * is re-pointed at a different FDC record. Without it the idempotent skip means
 * a corrected value silently never lands.
 *
 * ⚠️ The old block is located with the SAME depth-aware scan used to insert it,
 * never a regex. `[MEASURED 2026-08-18]` A lazy multi-line regex written to
 * delete exactly one block instead spanned from one entry to the next and
 * removed 214 lines of unrelated ingredient data. If insertion needs a
 * structure-aware parser, so does removal.
 */
const REPLACE = process.argv.includes("--replace");

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
/** Multi-line form: `nutritionalProfile: {` with the brace ending the line. */
const PROFILE_RE = /^\s*nutritionalProfile:\s*\{\s*$/;
/**
 * Single-line form: the whole object on one line.
 *
 * `[MEASURED 2026-08-18]` 370 of 1,435 profiles are written this way — 26 % of
 * the corpus. Matching only the multi-line form skipped every one of them
 * SILENTLY; `potato` exists in no other form and simply never received a value.
 * It surfaced only because the unmatched-value report names what it could not
 * place. A coverage gap that reports itself is survivable; this one nearly did
 * not.
 */
const PROFILE_INLINE_RE = /^(\s*)nutritionalProfile:\s*\{(?!\s*$)/;

/** Compact one-line form, for profiles that are themselves one line. */
function renderInline(row) {
  return (
    `waterContent: { fraction: ${row.fraction}, basis: "usda-fdc", ` +
    `fdcId: ${row.fdcId}, fdcDescription: ${JSON.stringify(row.fdcDescription)}, ` +
    `retrieved: ${JSON.stringify(row.retrieved)} },`
  );
}

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
const replacedNames = [];

for (const file of walk(ROOT)) {
  const src = readFileSync(file, "utf8");
  if (!src.includes("nutritionalProfile")) continue;
  const lines = src.split("\n");

  // Pass 1: map each object depth to the most recent `name:` seen AT that depth,
  // then find `nutritionalProfile:` keys at the same depth.
  const nameAtDepth = new Map();
  const insertions = [];
  const inlineEdits = [];
  const replacements = [];
  let depth = 0;
  let alreadyHas = new Set();

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const nameMatch = NAME_RE.exec(line);
    if (nameMatch) nameAtDepth.set(depth, nameMatch[1]);

    const inline = PROFILE_INLINE_RE.exec(line);
    if (inline && !PROFILE_RE.test(line)) {
      const owner = nameAtDepth.get(depth);
      const row = owner ? byName.get(owner.toLowerCase()) : undefined;
      if (row) {
        if (line.includes("waterContent:")) {
          alreadyHas.add(owner);
        } else {
          inlineEdits.push({ at: i, row, owner });
        }
      }
    }

    if (PROFILE_RE.test(line)) {
      const owner = nameAtDepth.get(depth);
      const row = owner ? byName.get(owner.toLowerCase()) : undefined;
      if (row) {
        // Does this profile object already carry waterContent? Scan to its close,
        // capturing the block's exact span so `--replace` can swap it in place.
        let d = 1;
        let has = false;
        for (let j = i + 1; j < lines.length && d > 0; j += 1) {
          if (/^\s*waterContent:\s*\{/.test(lines[j]) && d === 1) {
            // Walk to this block's own closing brace, tracking depth from it.
            let bd = 0;
            let end = j;
            for (let k = j; k < lines.length; k += 1) {
              bd += braceDelta(lines[k]);
              if (bd === 0) {
                end = k;
                break;
              }
            }
            const stored = /fraction:\s*([\d.]+)/.exec(lines[j + 1] ?? "");
            has = {
              start: j,
              end,
              indent: (/^(\s*)/.exec(lines[j]) ?? ["", ""])[1].length,
              differs: !stored || Number(stored[1]) !== row.fraction,
            };
          }
          d += braceDelta(lines[j]);
        }
        if (has) {
          alreadyHas.add(owner);
          if (REPLACE && has.differs) replacements.push({ ...has, row, owner });
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
  if (insertions.length === 0 && inlineEdits.length === 0 && replacements.length === 0) continue;

  // Apply back-to-front so earlier indices stay valid.
  const out = [...lines];
  for (const edit of inlineEdits) {
    // Splice the block in immediately after the profile's opening brace.
    out[edit.at] = out[edit.at].replace(
      /nutritionalProfile:\s*\{/,
      `nutritionalProfile: { ${renderInline(edit.row)}`,
    );
    appliedNames.push(edit.owner);
    satisfied.add(edit.owner.toLowerCase());
  }
  applied += inlineEdits.length;
  if (inlineEdits.length > 0) touchedFiles.add(file);
  for (const rep of [...replacements].sort((a, b) => b.start - a.start)) {
    out.splice(rep.start, rep.end - rep.start + 1, ...render(rep.row, rep.indent));
    replacedNames.push(rep.owner);
    touchedFiles.add(file);
  }
  applied += replacements.length;

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
if (replacedNames.length > 0) {
  console.log(`  REPLACED (stored value differed): ${replacedNames.sort().join(", ")}`);
}
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
