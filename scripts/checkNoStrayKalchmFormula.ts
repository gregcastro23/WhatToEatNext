/**
 * CI gate: the kalchm formula lives in ONE module.
 *
 * `kalchm = (S^S · E^E) / (M^M · Su^Su)` is the signature of this codebase's
 * thermodynamics, and the self-exponentiation `x^x` is what makes it recognisable.
 * Every re-implementation of it has diverged: the audit behind #643 found four
 * different zero-axis strategies (no floor / 0.001 / 0.01 / 0.1) plus one that
 * returns 0, differing by exactly `eps^(-eps) - 1` per zeroed axis — up to 25.89%
 * — and one that makes monica non-finite.
 *
 * So this fails on any NEW self-exponentiation outside the canonical module. The
 * existing ones are allowlisted BY LOCATION, and each entry says why it still
 * exists. The list only shrinks: delete an entry when that site is delegated.
 *
 * ⚠️ AST-based, not regex. A regex cannot tell `Math.pow(s, s)` from
 * `Math.pow(s, e)` without a backreference, and this repo's grep (ugrep) rejects
 * backreferences outright — an earlier attempt returned a silent 0 matches, which
 * looks identical to a clean repo. Comparing normalised expression TEXT from the
 * AST also catches `Math.pow(safeSpirit, safeSpirit)` and `spirit ** spirit`, and
 * ignores whitespace and comments.
 *
 * Usage: bunx tsx scripts/checkNoStrayKalchmFormula.ts [--list]
 *   exit 0 = no unexpected sites; exit 1 = a new site, or a stale allowlist entry
 */
import * as ts from "typescript";
import path from "path";
import fs from "fs";

const ROOT = process.cwd();
const LIST_ONLY = process.argv.includes("--list");

/** The one module allowed to define the formula. */
const CANONICAL = "src/data/unified/alchemicalCalculations.ts";

/**
 * Known self-exponentiation sites outside the canonical module, with the reason
 * each survives. Keyed by file; the count is asserted so a file cannot quietly
 * gain a second copy.
 *
 * ⚠️ Do not add to this list to make CI green. Adding an entry means "a new
 * divergent copy of the thermodynamics is now permanent", which is the thing the
 * gate exists to prevent. Delegate to the canonical engine instead.
 */
const ALLOWLIST: Record<string, { count: number; why: string }> = {
  // ── characterised: floor strategy measured, divergence known ──────────────
  "src/utils/monicaKalchmCalculations.ts": {
    count: 4,
    why: "calculateKAlchm, floor 0.01 (+4.7129% at a zeroed axis). 8 calling files incl. 3 React components — the most-used copy in the repo.",
  },
  "src/calculations/core/kalchmEngine.ts": {
    count: 4,
    why: "calculateKAlchm, floor 0.1 (+25.8925%). Its floored |ln kalchm| of 0.2303 exceeds the healthy floor 0.2188, so a degenerate chart reads as HEALTHY. Highest-priority delegation.",
  },
  "src/data/unified/ingredients.ts": {
    count: 4,
    why: "file-local calculateKalchm, floor 0.001 (+0.6932%). One caller, same file.",
  },
  "src/data/unified/flavorProfileMigration.ts": {
    count: 4,
    why: "file-local calculateKalchm. Not a floor — returns 1.0 when Matter or Substance is 0, which at least keeps monica defined at the equilibrium value.",
  },
  "src/calculations/alchemicalCalculations.ts": {
    count: 4,
    why: "UNREACHABLE (verified: no call, no value reference, no string dispatch). Returns 0 at a zeroed axis => ln(kalchm) -Infinity => monica non-finite, a totality-contract violation. DELETE rather than delegate.",
  },

  // ── found by this gate, NOT yet characterised ─────────────────────────────
  // ⚠️ These were missed by the earlier grep-based audits that reported "8
  // duplicates". Each still needs its zero-axis behaviour measured before it can
  // be delegated. Do not assume they match any of the strategies above.
  "src/calculations/core/alchemicalEngine.ts": { count: 4, why: "not yet characterised" },
  "src/data/unified/recipeBuilding.ts": { count: 4, why: "not yet characterised" },
  "src/lib/core-energy-rules.ts": {
    count: 4,
    why: "not yet characterised. Live via galileo-logger ANumberCalculator — previously deferred from a dead-code sweep for that reason.",
  },
  "src/services/RealAlchemizeService.ts": {
    count: 8,
    why: "TWO copies. The production ESMS path — treat any change here as behaviour-affecting for live surfaces.",
  },
  "src/services/UnifiedScoringService.ts": { count: 4, why: "not yet characterised" },
  "src/utils/alchemy/derivedStats.ts": { count: 8, why: "TWO copies. Not yet characterised." },
  "src/utils/astrologyUtils.ts": {
    count: 4,
    why: "not yet characterised. NO floor at all (Math.pow(Spirit, Spirit) on the raw axes), so post-#642 it may already agree with canonical exactly.",
  },
  "src/utils/recommendation/ingredientRecommendation.ts": {
    count: 12,
    why: "THREE copies in one file (:1109, :1182, :1280). The worst single concentration in the repo.",
  },

  // ── legitimate restatements ───────────────────────────────────────────────
  "src/__tests__/kalchmFloorDivergence.test.ts": {
    count: 4,
    why: "the characterisation test's own reference implementation of the DEFINITION (no floor). It must restate the formula in order to measure the others against it.",
  },
};

const configPath = ts.findConfigFile(ROOT, ts.sys.fileExists, "tsconfig.json");
if (!configPath) throw new Error("no tsconfig.json found");
const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
if (configFile.error) {
  throw new Error(ts.flattenDiagnosticMessageText(configFile.error.messageText, "\n"));
}
const parsed = ts.parseJsonConfigFileContent(configFile.config, ts.sys, path.dirname(configPath));

const inScope = (r: string) => r.startsWith("src") || r.startsWith("scripts");

/**
 * tsconfig EXCLUDES `scripts/**` and `__tests__/**`, so `parsed.fileNames` alone
 * leaves both out — and a gate that silently skips the test tree would let a new
 * private copy of the formula land there unchallenged. Walk them in explicitly.
 * The `filesScanned` counts below are asserted so this cannot regress to zero.
 */
function walk(dir: string, match: (f: string) => boolean): string[] {
  if (!fs.existsSync(dir)) return [];
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".next") continue;
      out.push(...walk(full, match));
    } else if (match(entry.name)) {
      out.push(full);
    }
  }
  return out;
}
const extra = [
  ...walk(path.join(ROOT, "scripts"), (f) => f.endsWith(".ts")),
  ...walk(path.join(ROOT, "src"), (f) => /\.(test|spec)\.tsx?$/.test(f)),
];
const rootNames = [
  ...new Set([
    ...parsed.fileNames.filter(
      (f) =>
        !f.includes("node_modules") &&
        (f.includes(`${path.sep}src${path.sep}`) || f.includes(`${path.sep}scripts${path.sep}`)),
    ),
    ...extra,
  ]),
];
const program = ts.createProgram({ rootNames, options: parsed.options });
const rel = (f: string) => path.relative(ROOT, f);

/**
 * Normalise an expression to text, so `a` and ` a ` compare equal.
 *
 * The SourceFile must be passed explicitly: `n.getText()` alone resolves it by
 * walking `.parent`, which is undefined for some nodes in a full program and
 * throws `Cannot read properties of undefined (reading 'text')`.
 */
const norm = (n: ts.Node, sf: ts.SourceFile) => n.getText(sf).replace(/\s+/g, "");

interface Hit {
  file: string;
  line: number;
  text: string;
}
const hits: Hit[] = [];

for (const sf of program.getSourceFiles()) {
  if (sf.isDeclarationFile) continue;
  const file = rel(sf.fileName);
  if (!inScope(file)) continue;

  const visit = (node: ts.Node) => {
    let selfExp: ts.Node | null = null;

    // Math.pow(x, x)
    if (
      ts.isCallExpression(node) &&
      ts.isPropertyAccessExpression(node.expression) &&
      node.expression.name.text === "pow" &&
      norm(node.expression.expression, sf) === "Math" &&
      node.arguments.length === 2 &&
      norm(node.arguments[0], sf) === norm(node.arguments[1], sf)
    ) {
      selfExp = node;
    }

    // x ** x
    if (
      ts.isBinaryExpression(node) &&
      node.operatorToken.kind === ts.SyntaxKind.AsteriskAsteriskToken &&
      norm(node.left, sf) === norm(node.right, sf)
    ) {
      selfExp = node;
    }

    if (selfExp) {
      const { line } = sf.getLineAndCharacterOfPosition(selfExp.getStart(sf));
      hits.push({ file, line: line + 1, text: norm(selfExp, sf) });
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
}

// ── coverage: the trees tsconfig excludes must actually be in the program ─────
const scanned = program
  .getSourceFiles()
  .map((sf) => rel(sf.fileName))
  .filter((f) => inScope(f));
const testFiles = scanned.filter((f) => /\.(test|spec)\.tsx?$/.test(f)).length;
const scriptFiles = scanned.filter((f) => f.startsWith("scripts")).length;
if (testFiles === 0 || scriptFiles === 0) {
  console.error(
    `\u2717 COVERAGE FAILED: ${testFiles} test file(s) and ${scriptFiles} script file(s) in the\n` +
      `  program. tsconfig excludes both trees, so they are walked in explicitly — if\n` +
      `  either is 0 that walk is broken and this gate is not looking where it claims.`,
  );
  process.exit(1);
}

// ── control: the gate must find the formula where it is KNOWN to be ───────────
const canonicalHits = hits.filter((h) => h.file === CANONICAL);
if (canonicalHits.length === 0) {
  console.error(
    `✗ CONTROL FAILED: found no self-exponentiation in ${CANONICAL}.\n` +
      `  The canonical engine defines kalchm, so this cannot be true. The detector\n` +
      `  is not working, and a clean report from it would be meaningless.`,
  );
  process.exit(1);
}

const byFile = new Map<string, Hit[]>();
for (const h of hits) {
  if (h.file === CANONICAL) continue;
  if (!byFile.has(h.file)) byFile.set(h.file, []);
  byFile.get(h.file)!.push(h);
}

if (LIST_ONLY) {
  console.log(`canonical ${CANONICAL}: ${canonicalHits.length} site(s)`);
  for (const [file, fh] of [...byFile].sort()) {
    console.log(`\n${file}  (${fh.length})`);
    for (const h of fh) console.log(`   :${h.line}  ${h.text}`);
  }
  process.exit(0);
}

const problems: string[] = [];

// New or grown sites.
for (const [file, fh] of [...byFile].sort()) {
  const allowed = ALLOWLIST[file];
  if (!allowed) {
    problems.push(
      `NEW self-exponentiation outside the canonical engine:\n` +
        `   ${file}\n` +
        fh.map((h) => `     :${h.line}  ${h.text}`).join("\n") +
        `\n   Import calculateKalchm from @/data/unified/alchemicalCalculations instead.\n` +
        `   Every re-implementation audited so far has diverged from it.`,
    );
  } else if (fh.length !== allowed.count) {
    problems.push(
      `${file} has ${fh.length} self-exponentiation site(s), allowlisted for ${allowed.count}.\n` +
        fh.map((h) => `     :${h.line}  ${h.text}`).join("\n") +
        (fh.length > allowed.count
          ? `\n   A new copy was added to a file that already had one.`
          : `\n   Fewer than expected — if a site was delegated or deleted, LOWER the\n` +
            `   allowlist count in this script so the reduction is locked in.`),
    );
  }
}

// Stale entries: an allowlisted file that no longer has the formula (or is gone).
for (const [file, entry] of Object.entries(ALLOWLIST)) {
  if (entry.count === 0) continue;
  if (!byFile.has(file)) {
    problems.push(
      `STALE allowlist entry: ${file} is listed for ${entry.count} site(s) but has none` +
        `${fs.existsSync(path.join(ROOT, file)) ? "" : " (file no longer exists)"}.\n` +
        `   Remove the entry — leaving it lets a future copy slip in unnoticed.`,
    );
  }
}

if (problems.length === 0) {
  const total = [...byFile.values()].reduce((n, f) => n + f.length, 0);
  console.log(`✓ canonical engine: ${canonicalHits.length} site(s) in ${CANONICAL}`);
  console.log(`✓ ${total} allowlisted site(s) across ${byFile.size} file(s), all accounted for`);
  console.log(`✓ no new self-exponentiation outside the canonical engine`);
  process.exit(0);
}

console.error(`✗ ${problems.length} problem(s):\n`);
for (const p of problems) console.error(`  ${p}\n`);
console.error(
  `The kalchm formula belongs in ${CANONICAL}. If you genuinely need a second copy,\n` +
    `say why in the ALLOWLIST — but delegation is almost always the right answer.`,
);
process.exit(1);
