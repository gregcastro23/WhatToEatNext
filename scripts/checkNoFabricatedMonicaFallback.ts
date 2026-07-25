/**
 * Static guard against the defect that produced every monica incident in §18:
 * a read of a monica field whose fallback is an INVENTED NUMBER.
 *
 * Needs no database and no secrets, so it runs on every PR. That matters,
 * because the data-side tools (checkAgentMonicaDrift, auditAgentDataIntegrity)
 * structurally CANNOT catch this class: the data was correct in every one of
 * these incidents. An integrity audit reported "ALL CLEAR — 22 checks" while
 * 584 agents were being served a fabricated 3.5.
 *
 *   bun scripts/checkNoFabricatedMonicaFallback.ts
 *
 * Exits non-zero on any finding. Two patterns are rejected:
 *
 *   1. NUMERIC FALLBACK   `x.monica_constant ? f(x) : 3.5`   `monica ?? 0`
 *      A NULL becomes a plausible-looking number. Worse than a crash, because
 *      nothing reports it and the value is in-range.
 *
 *   2. TRUTHINESS TEST    `row.monica_constant ? ... : ...`
 *      Rejected even when the fallback is honest, because monica is legitimately
 *      0 for 284 single-body agents and 0 is falsy. Whether this bites depends
 *      on whether pg hands NUMERIC back as a string — i.e. on a driver detail,
 *      not on anything the code states. Use an explicit `=== null` test.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = "src";
const EXTS = [".ts", ".tsx"];
const SKIP_DIRS = new Set(["node_modules", ".next", "__tests__", "__mocks__"]);

/** Fields whose fallback must never be a literal. */
const MONICA_FIELD = /monica(_constant|_single|_two_body|_full_chart|Constant|Score)?/i;

interface Finding {
  file: string;
  line: number;
  kind: "numeric-fallback" | "truthiness-test";
  text: string;
  why: string;
}

/**
 * Only the AGENT monica read path FAILS the build.
 *
 * That is where every §18 incident happened, and there the correct fallback is
 * unambiguous: an agent either has a stored monica or it does not.
 *
 * The recipe/cuisine/cooking-method engine also defaults monica — to 1.0, in
 * ~15 places — but there `1.0` is the multiplicative identity, so in a multiplier
 * it may be exactly right and in an average it is fabrication. Deciding that
 * needs a domain ruling per site, and failing CI on all of them today would just
 * get this check disabled. They are REPORTED, loudly, and left to the recipes
 * pass.
 */
const AGENT_READ_PATH = /monica(_constant|_single|_two_body|_full_chart|Constant)\b/;

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const p = join(dir, entry);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (EXTS.some((e) => p.endsWith(e))) out.push(p);
  }
  return out;
}

const findings: Finding[] = [];
const files = walk(ROOT);

for (const file of files) {
  const lines = readFileSync(file, "utf8").split("\n");

  lines.forEach((raw, i) => {
    const line = raw.trim();
    if (line.startsWith("//") || line.startsWith("*")) return;
    if (!MONICA_FIELD.test(line)) return;

    // ── 1. `?? <number>` or `: <number>` used as a monica fallback ───────────
    //    Excludes `?? null` and `: null`, which are the correct forms.
    const nullish = /\?\?\s*(-?\d+(\.\d+)?)\b/.exec(line);
    if (nullish) {
      findings.push({
        file,
        line: i + 1,
        kind: "numeric-fallback",
        text: line,
        why: `\`?? ${nullish[1]}\` invents a monica when the real one is absent. Use \`?? null\`.`,
      });
    }

    const ternaryLiteral = /\?[^?:]*:\s*(-?\d+(\.\d+)?)\s*[,;)]/.exec(line);
    if (ternaryLiteral) {
      findings.push({
        file,
        line: i + 1,
        kind: "numeric-fallback",
        text: line,
        why: `ternary falls back to the literal ${ternaryLiteral[1]}. Use null.`,
      });
    }

    // ── 2. truthiness test on a monica field ────────────────────────────────
    //    `row.monica_constant ? a : b` — falsy for a real 0.
    //
    //    `(?![.:])` is what keeps this precise. Two constructs look identical to
    //    a naive `monica...\?` pattern and are both CORRECT:
    //      `monicaConstant?: number`      optional PROPERTY in a type — `?:`
    //      `monicaConstant?.toFixed(2)`   optional CHAINING — `?.`
    //    Without the lookahead this reported 31 false positives against 2 real
    //    ones, which is the kind of noise that gets a check switched off.
    //    `(?![.:?])` — the third exclusion is `??`. A nullish coalesce is not a
    //    truthiness test: `monicaConstant ?? null` is the CORRECT form, and
    //    flagging it told me to "fix" a line that was already right.
    const truthy = /\b(\w+\.)?monica(_constant|_single|_two_body|_full_chart|Constant)\s*\?(?![.:?])/.exec(
      line,
    );
    if (truthy) {
      findings.push({
        file,
        line: i + 1,
        kind: "truthiness-test",
        text: line,
        why: "truthiness test is false for a real monica of 0 (284 agents). Use `=== null`.",
      });
    }
  });
}

// ---------------------------------------------------------------- report ----
console.log(`fabricated-monica-fallback scan: ${files.length} files under ${ROOT}/`);

if (findings.length === 0) {
  // A zero result is a claim. Prove the scanner can still fire, so a silent
  // regression in the scanner itself cannot read as a clean bill of health.
  const CONTROL = `monicaConstant: row.monica_constant ? parseFloat(row.monica_constant) : 3.5,`;
  const controlFires =
    /\?\?\s*(-?\d+(\.\d+)?)\b/.test(CONTROL) ||
    /\?[^?:]*:\s*(-?\d+(\.\d+)?)\s*[,;)]/.test(CONTROL);
  if (!controlFires) {
    console.error(
      "\nFATAL: the scanner did not flag its own control case.\n" +
        "The 0 findings above mean nothing. Fix the patterns before trusting this.",
    );
    process.exit(1);
  }
  console.log("control case (the real 3.5 regression) IS flagged — scanner is live");
  console.log("\nno fabricated monica fallbacks found");
  process.exit(0);
}

const blocking = findings.filter((f) => AGENT_READ_PATH.test(f.text));
const reported = findings.filter((f) => !AGENT_READ_PATH.test(f.text));

if (reported.length) {
  console.log(`\n${reported.length} finding(s) OUTSIDE the agent read path — reported, not blocking:`);
  console.log(`(the recipe/cuisine engine's monica defaults — see the note in this file)\n`);
  for (const f of reported) console.log(`  ${f.file}:${f.line}  ${f.text}`);
}

if (blocking.length === 0) {
  console.log(`\nno fabricated fallbacks on the AGENT monica read path`);
  process.exit(0);
}

console.error(`\n${blocking.length} BLOCKING finding(s) on the agent monica read path:\n`);
for (const f of blocking) {
  console.error(`  ${f.file}:${f.line}  [${f.kind}]`);
  console.error(`    ${f.text}`);
  console.error(`    -> ${f.why}\n`);
}
console.error(
  "An agent monica that is absent must read as null, not as a number. See §18 and PR #637.",
);
process.exit(1);
