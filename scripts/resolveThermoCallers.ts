/**
 * Who actually calls each thermodynamic implementation?
 *
 * ⚠️ grep CANNOT answer this. `calculateKalchm` is declared in THREE separate
 * modules (src/calculations/alchemicalCalculations.ts, the canonical
 * src/data/unified/alchemicalCalculations.ts, and a file-local one in
 * src/data/unified/ingredients.ts), and `calculateKalchmResonance` in three more.
 * A grep for the name cannot tell which declaration a given call site reaches, so
 * every caller count produced that way this session was unreliable and was not
 * acted on.
 *
 * This resolves call sites through the TypeScript type checker instead: for each
 * call expression it takes the callee symbol, follows import aliases to the real
 * declaration, and reports the declaration's file:line. That is the ground truth
 * needed before delegating any duplicate to the canonical engine, because the
 * duplicates differ in BEHAVIOUR (4 floor strategies: none / 0.001 / 0.01 / 0.1,
 * plus one Math.abs) by up to 20.57% on a zeroed axis.
 *
 * Read-only. Prints a report; changes nothing.
 *
 * Usage: bunx tsx scripts/resolveThermoCallers.ts [nameRegex]
 *   default nameRegex: kalchm|monica
 */
import * as ts from "typescript";
import path from "path";
import fs from "fs";

const ROOT = process.cwd();
const NAME_RE = new RegExp(process.argv[2] ?? "kalchm|monica", "i");

// ── load the real tsconfig, so path aliases (@/...) resolve ────────────────
const configPath = ts.findConfigFile(ROOT, ts.sys.fileExists, "tsconfig.json");
if (!configPath) throw new Error("no tsconfig.json found");
const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
if (configFile.error) {
  throw new Error(ts.flattenDiagnosticMessageText(configFile.error.messageText, "\n"));
}
const parsed = ts.parseJsonConfigFileContent(configFile.config, ts.sys, path.dirname(configPath));

// src/ AND scripts/ — including .next/ or node_modules would swamp the report, but
// leaving scripts/ out would make every "0 callers" line a lie for anything a
// backfill or audit script consumes. Two of the declarations here are only ever
// called from scripts/.
const IN_SCOPE = [`${path.sep}src${path.sep}`, `${path.sep}scripts${path.sep}`];
const extra = fs.existsSync(path.join(ROOT, "scripts"))
  ? fs
      .readdirSync(path.join(ROOT, "scripts"))
      .filter((f) => f.endsWith(".ts"))
      .map((f) => path.join(ROOT, "scripts", f))
  : [];
const rootNames = [
  ...new Set([
    ...parsed.fileNames.filter(
      (f) => IN_SCOPE.some((d) => f.includes(d)) && !f.includes("node_modules"),
    ),
    ...extra,
  ]),
];
console.log(`program: ${rootNames.length} files under src/ + scripts/`);

const program = ts.createProgram({ rootNames, options: parsed.options });
const checker = program.getTypeChecker();

const rel = (f: string) => path.relative(ROOT, f);
const inScope = (r: string) => r.startsWith("src") || r.startsWith("scripts");
function loc(node: ts.Node): string {
  const sf = node.getSourceFile();
  const { line } = sf.getLineAndCharacterOfPosition(node.getStart());
  return `${rel(sf.fileName)}:${line + 1}`;
}

// ── every DECLARATION whose name matches ───────────────────────────────────
interface Decl {
  name: string;
  where: string;
  exported: boolean;
  /** Distinct files containing a resolved call to this declaration. */
  callerFiles: Set<string>;
  /** Every resolved call site. */
  callSites: string[];
  /**
   * References that are NOT calls — the function used as a VALUE: passed to
   * memoize(), `.bind(this)`, stored in a table, re-exported. These make a
   * declaration live with zero call expressions pointing at it, so a
   * "0 callers => dead" conclusion that ignores them is wrong. Real example here:
   * `_calculateKalchmSeasonalCompatibility` has 0 calls and is very much alive via
   * `memoize(this._calculateKalchmSeasonalCompatibility.bind(this))`.
   */
  valueRefs: string[];
}
const decls = new Map<ts.Node, Decl>();

function isDeclarationOfInterest(node: ts.Node): ts.Node | null {
  if (ts.isFunctionDeclaration(node) && node.name && NAME_RE.test(node.name.text)) return node;
  if (
    ts.isVariableDeclaration(node) &&
    ts.isIdentifier(node.name) &&
    NAME_RE.test(node.name.text) &&
    node.initializer &&
    (ts.isArrowFunction(node.initializer) || ts.isFunctionExpression(node.initializer))
  ) {
    return node;
  }
  if (ts.isMethodDeclaration(node) && ts.isIdentifier(node.name) && NAME_RE.test(node.name.text)) {
    return node;
  }
  return null;
}

function declName(node: ts.Node): string {
  const n = node as ts.FunctionDeclaration | ts.VariableDeclaration | ts.MethodDeclaration;
  return n.name && ts.isIdentifier(n.name) ? n.name.text : "<anon>";
}

function isExported(node: ts.Node): boolean {
  const mods = ts.getCombinedModifierFlags(node as ts.Declaration);
  if (mods & ts.ModifierFlags.Export) return true;
  // `export const x = …` puts the modifier on the statement, not the declaration.
  let p: ts.Node | undefined = node.parent;
  while (p) {
    if (ts.isVariableStatement(p) || ts.isFunctionDeclaration(p)) {
      if (ts.getCombinedModifierFlags(p as ts.Declaration) & ts.ModifierFlags.Export) return true;
    }
    p = p.parent;
  }
  return false;
}

for (const sf of program.getSourceFiles()) {
  if (sf.isDeclarationFile || !inScope(rel(sf.fileName))) continue;
  const visit = (node: ts.Node) => {
    const d = isDeclarationOfInterest(node);
    if (d) {
      decls.set(d, {
        name: declName(d),
        where: loc(d),
        exported: isExported(d),
        callerFiles: new Set(),
        callSites: [],
        valueRefs: [],
      });
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
}
console.log(`declarations matching /${NAME_RE.source}/i: ${decls.size}`);

// ── resolve every call expression to its declaration ───────────────────────
let callsSeen = 0;
let callsUnresolved = 0;
const unresolvedNames = new Map<string, number>();

/** Resolve an identifier to a tracked declaration, following import aliases. */
function resolveToTracked(nameNode: ts.Identifier): Decl[] {
  let sym = checker.getSymbolAtLocation(nameNode);
  if (sym && sym.flags & ts.SymbolFlags.Alias) {
    try {
      sym = checker.getAliasedSymbol(sym);
    } catch {
      /* not an alias after all */
    }
  }
  const out: Decl[] = [];
  for (const t of sym?.declarations ?? []) {
    const entry = decls.get(t);
    if (entry) out.push(entry);
  }
  return out;
}

for (const sf of program.getSourceFiles()) {
  if (sf.isDeclarationFile || !inScope(rel(sf.fileName))) continue;
  const visit = (node: ts.Node) => {
    // ── non-call references: the function used as a VALUE ──────────────────
    if (ts.isIdentifier(node) && NAME_RE.test(node.text)) {
      const parent = node.parent;
      const isCallee =
        (ts.isCallExpression(parent) && parent.expression === node) ||
        (ts.isPropertyAccessExpression(parent) &&
          ts.isCallExpression(parent.parent) &&
          parent.parent.expression === parent);
      const isOwnName =
        (ts.isFunctionDeclaration(parent) ||
          ts.isVariableDeclaration(parent) ||
          ts.isMethodDeclaration(parent) ||
          ts.isPropertyDeclaration(parent)) &&
        (parent as { name?: ts.Node }).name === node;
      if (!isCallee && !isOwnName) {
        for (const entry of resolveToTracked(node)) entry.valueRefs.push(loc(node));
      }
    }
    if (ts.isCallExpression(node)) {
      const callee = node.expression;
      const nameNode = ts.isPropertyAccessExpression(callee)
        ? callee.name
        : ts.isIdentifier(callee)
          ? callee
          : null;
      if (nameNode && NAME_RE.test(nameNode.text)) {
        callsSeen++;
        let sym = checker.getSymbolAtLocation(nameNode);
        // Follow `import { x } from …` to the real declaration.
        if (sym && sym.flags & ts.SymbolFlags.Alias) {
          try {
            sym = checker.getAliasedSymbol(sym);
          } catch {
            /* not an alias after all */
          }
        }
        const targets = sym?.declarations ?? [];
        let matched = false;
        for (const t of targets) {
          // A VariableDeclaration target may be recorded under itself; a
          // FunctionDeclaration likewise. Match on identity.
          const entry = decls.get(t);
          if (entry) {
            entry.callerFiles.add(rel(sf.fileName));
            entry.callSites.push(loc(node));
            matched = true;
          }
        }
        if (!matched) {
          callsUnresolved++;
          unresolvedNames.set(nameNode.text, (unresolvedNames.get(nameNode.text) ?? 0) + 1);
        }
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
}

// ── report ─────────────────────────────────────────────────────────────────
const rows = [...decls.values()].sort(
  (a, b) => b.callerFiles.size - a.callerFiles.size || a.name.localeCompare(b.name),
);

console.log("");
console.log("=".repeat(90));
console.log("DECLARATIONS, by number of distinct calling files");
console.log("=".repeat(90));
for (const r of rows) {
  const tag = r.exported ? "exported" : "LOCAL   ";
  console.log(
    `${String(r.callerFiles.size).padStart(3)} files ${String(r.callSites.length).padStart(4)} calls  ${tag}  ${r.name}  @ ${r.where}`,
  );
}

console.log("");
console.log("=".repeat(90));
console.log("DUPLICATE NAMES — the reason grep cannot attribute these");
console.log("=".repeat(90));
const byName = new Map<string, Decl[]>();
for (const r of rows) {
  if (!byName.has(r.name)) byName.set(r.name, []);
  byName.get(r.name)!.push(r);
}
for (const [name, group] of [...byName].sort((a, b) => b[1].length - a[1].length)) {
  if (group.length < 2) continue;
  console.log(`\n${name} — ${group.length} declarations:`);
  for (const g of group) {
    console.log(
      `   ${g.exported ? "exported" : "LOCAL   "}  ${g.where}   ${g.callerFiles.size} calling files, ${g.callSites.length} calls`,
    );
    for (const f of [...g.callerFiles].sort()) console.log(`        <- ${f}`);
  }
}

console.log("");
console.log("=".repeat(90));
console.log("ZERO-CALLER DECLARATIONS — split by whether anything references them at all");
console.log("=".repeat(90));
const noCalls = rows.filter((x) => x.callerFiles.size === 0);
const trulyUnreferenced = noCalls.filter((x) => x.valueRefs.length === 0);
const referencedNotCalled = noCalls.filter((x) => x.valueRefs.length > 0);

console.log(`\nNo calls AND no value references — ${trulyUnreferenced.length} (deletion candidates):`);
for (const r of trulyUnreferenced) {
  console.log(`   ${r.exported ? "exported" : "LOCAL   "}  ${r.name}  @ ${r.where}`);
}
console.log(
  `\n⚠️ No calls BUT referenced as a value — ${referencedNotCalled.length} (LIVE, do NOT delete):`,
);
for (const r of referencedNotCalled) {
  console.log(`   ${r.exported ? "exported" : "LOCAL   "}  ${r.name}  @ ${r.where}`);
  for (const v of r.valueRefs) console.log(`        referenced at ${v}`);
}
if (trulyUnreferenced.some((r) => r.exported)) {
  console.log(
    "\n⚠️ Some are EXPORTED with no reference anywhere in src/ or scripts/. That is still not\n" +
      "   proof of death: this program excludes .tsx outside src/, config files, and any\n" +
      "   dynamic import(). Check those before deleting.",
  );
}

console.log("");
console.log("=".repeat(90));
console.log(`call expressions matching the name filter : ${callsSeen}`);
console.log(`  resolved to a declaration in src/       : ${callsSeen - callsUnresolved}`);
console.log(`  NOT resolved (see below)                : ${callsUnresolved}`);
if (callsUnresolved) {
  // ⚠️ Do NOT read this as "no caller". Unresolved means the callee is declared
  // outside src/ (a dependency), is a method on a type rather than a tracked
  // declaration, or the symbol could not be followed. Any conclusion that a
  // declaration is dead must account for these, or it repeats the
  // zero-result-without-a-control-test mistake.
  console.log("  unresolved by callee name:");
  for (const [n, c] of [...unresolvedNames].sort((a, b) => b[1] - a[1])) {
    console.log(`     ${String(c).padStart(4)}  ${n}`);
  }
}

// ── control test: the resolver must find a call it is KNOWN to have ────────
console.log("");
console.log("=".repeat(90));
console.log("CONTROL — a zero-result report is only trustworthy if the resolver works");
console.log("=".repeat(90));
const canonical = rows.find(
  (r) => r.name === "calculateKalchm" && r.where.includes("data/unified/alchemicalCalculations.ts"),
);
if (!canonical) {
  console.log("✗ FAILED: did not even find the canonical calculateKalchm declaration");
  process.exitCode = 1;
} else if (canonical.callerFiles.size === 0) {
  console.log(`✗ FAILED: canonical calculateKalchm resolved 0 callers, which cannot be true`);
  process.exitCode = 1;
} else {
  console.log(
    `✓ canonical calculateKalchm @ ${canonical.where} resolved ${canonical.callerFiles.size} calling files`,
  );
  // Second control: the value-reference pass must find the memoize/bind case,
  // which is the one construct that makes a live function look dead.
  const memoized = rows.find((r) => r.name === "_calculateKalchmSeasonalCompatibility");
  if (memoized) {
    console.log(
      memoized.valueRefs.length > 0
        ? `✓ value-reference pass works: ${memoized.name} has 0 calls but ${memoized.valueRefs.length} value ref(s) — correctly NOT reported dead`
        : `✗ FAILED: ${memoized.name} is live via memoize(...bind(this)) but shows 0 calls AND 0 value refs`,
    );
    if (memoized.valueRefs.length === 0) process.exitCode = 1;
  }
  const selfFile = "src/data/unified/alchemicalCalculations.ts";
  console.log(
    `✓ cross-file resolution works: ${[...canonical.callerFiles].some((f) => f !== selfFile) ? "yes" : "NO — only same-file calls found, aliases may not be following"}`,
  );
}

// Opt-in only — this script is read-only by default and must not drop a generated
// artifact into the repo just for being run.
const jsonFlag = process.argv.indexOf("--json");
if (jsonFlag !== -1 && process.argv[jsonFlag + 1]) {
  const out = process.argv[jsonFlag + 1];
  fs.writeFileSync(
    out,
    JSON.stringify(
      rows.map((r) => ({ ...r, callerFiles: [...r.callerFiles].sort() })),
      null,
      2,
    ),
  );
  console.log(`\nfull map written to ${out}`);
} else {
  console.log("\n(pass --json <path> to write the full map)");
}
