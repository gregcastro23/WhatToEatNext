/**
 * §18 / task #10 — what does the REAL monica do to Sacred-7 stats?
 *
 * READ-ONLY. `sacred-7-stats.ts` mixes monica into seven stats as `monica/10`,
 * assuming a [0,10] range. The real single-body range is [-3.197, 3.975] and the
 * two-body range is [-5.419, 1.800] — both include NEGATIVES, which the [0,10]
 * assumption never anticipated.
 *
 *   railway run --service Postgres -- bun scripts/measureSacred7Distributions.ts
 *
 * Ruled 2026-07-22: measure the distributions across every backfilled agent
 * FIRST, then pick the mapping from real numbers.
 *
 * Reports, per monica_method, how much of each stat's range monica actually
 * moves, and how often a stat is pinned at a clamp boundary (a clamped stat is
 * one the input can no longer influence — the failure mode that matters).
 */
import { Client } from "pg";

/** The seven monica coefficients, read from src/lib/sacred-7-stats.ts. */
const MONICA_TERMS: Array<{ stat: string; coeff: number; note: string }> = [
  { stat: "(line 266)",        coeff: 25, note: "monica/10 * 25" },
  { stat: "(line 272)",        coeff: 10, note: "monica/10 * 10" },
  { stat: "(line 277)",        coeff: 5,  note: "monica/10 * 5" },
  { stat: "solarAgency",       coeff: 20, note: "monica/10 * 20" },
  { stat: "jovianExpansion",   coeff: 30, note: "monica/10 * 30" },
  { stat: "(line 313)",        coeff: 15, note: "monica/10 * 15" },
  { stat: "kineticAlignment",  coeff: 50, note: "monica * 5  == monica/10 * 50" },
];

const client = new Client({ connectionString: process.env.DATABASE_PUBLIC_URL, ssl: { rejectUnauthorized: false } });
await client.connect();
const { rows } = await client.query<{ monica_method: string | null; monica_constant: string | null }>(
  `SELECT up.monica_method, up.monica_constant::text
     FROM user_profiles up JOIN users u ON u.id = up.user_id
    WHERE u.is_agent AND up.monica_constant IS NOT NULL`);
await client.end();

const byMethod = new Map<string, number[]>();
for (const r of rows) {
  const v = Number(r.monica_constant);
  if (!Number.isFinite(v)) continue;
  const k = r.monica_method ?? "(null — fabricated)";
  if (!byMethod.has(k)) byMethod.set(k, []);
  byMethod.get(k)!.push(v);
}

const q = (xs: number[], p: number) => { const s=[...xs].sort((a,b)=>a-b); return s[Math.floor((s.length-1)*p)]; };
const f = (n: number) => n.toFixed(4);

console.log(`\n=== monica by construction (what sacred-7 actually receives) ===`);
for (const [m, xs] of [...byMethod.entries()].sort((a,b)=>b[1].length-a[1].length)) {
  console.log(`  ${m.padEnd(22)} n=${String(xs.length).padStart(5)}  [${f(Math.min(...xs))}, ${f(Math.max(...xs))}]  median ${f(q(xs,0.5))}  negative ${xs.filter(v=>v<0).length}`);
}

// The assumption sacred-7 encodes, vs reality.
console.log(`\n=== the [0,10] assumption vs reality ===`);
const all = [...byMethod.values()].flat();
console.log(`  assumed input range : [0, 10]   -> monica/10 in [0, 1]`);
console.log(`  ACTUAL input range  : [${f(Math.min(...all))}, ${f(Math.max(...all))}]   -> monica/10 in [${f(Math.min(...all)/10)}, ${f(Math.max(...all)/10)}]`);
console.log(`  negatives           : ${all.filter(v=>v<0).length} / ${all.length} (${(all.filter(v=>v<0).length/all.length*100).toFixed(1)}%) — never anticipated`);
console.log(`  fraction of assumed range used: ${((Math.max(...all)-Math.min(...all))/10*100).toFixed(1)}%`);

// Per-stat contribution: how many POINTS (out of 100) does monica actually move?
console.log(`\n=== how much does monica actually move each stat? (stat scale is 0-100) ===`);
console.log(`  ${"term".padEnd(20)} ${"coeff".padStart(6)}  ${"intended swing".padStart(15)}  ${"ACTUAL swing".padStart(13)}  ${"% of intent".padStart(11)}`);
for (const t of MONICA_TERMS) {
  const intended = t.coeff;                                   // monica/10 over [0,10] -> full coeff
  const actual = ((Math.max(...all) - Math.min(...all)) / 10) * t.coeff;
  console.log(`  ${t.stat.padEnd(20)} ${String(t.coeff).padStart(6)}  ${(intended.toFixed(1)+" pts").padStart(15)}  ${(actual.toFixed(2)+" pts").padStart(13)}  ${((actual/intended)*100).toFixed(1).padStart(10)}%`);
}

// Clamp analysis — the failure mode that matters. A stat pinned at 0 or 100 is
// one the chart can no longer influence.
console.log(`\n=== clamp risk: does the real monica push any stat past a boundary? ===`);
const base = 50; // every stat starts at 50 before its terms
for (const t of MONICA_TERMS) {
  const lo = base + (Math.min(...all) / 10) * t.coeff;
  const hi = base + (Math.max(...all) / 10) * t.coeff;
  const flag = lo < 0 || hi > 100 ? "  <-- CAN CLAMP" : "";
  console.log(`  ${t.stat.padEnd(20)} monica-only contribution spans [${f(lo)}, ${f(hi)}]${flag}`);
}
console.log(`  (other terms add up to ~+45 more, so the real ceiling is nearer 95 than 50)`);

console.log(`\n=== candidate mappings, scored on the SAME data ===`);
const lo = Math.min(...all), hi = Math.max(...all);
const cands: Array<{ name: string; fn: (v: number) => number }> = [
  { name: "current: monica/10",        fn: v => v / 10 },
  { name: "linear [min,max] -> [0,1]", fn: v => (v - lo) / (hi - lo) },
  { name: "linear, 0 -> 0.5 (signed)", fn: v => 0.5 + v / (2 * Math.max(Math.abs(lo), Math.abs(hi))) },
  { name: "tanh(monica)",              fn: v => (Math.tanh(v) + 1) / 2 },
];
for (const c of cands) {
  const ys = all.map(c.fn);
  const outOfUnit = ys.filter(y => y < 0 || y > 1).length;
  console.log(`  ${c.name.padEnd(28)} -> [${f(Math.min(...ys))}, ${f(Math.max(...ys))}]  median ${f(q(ys,0.5))}  IQR ${f(q(ys,0.75)-q(ys,0.25))}  outside [0,1]: ${outOfUnit}`);
}
console.log(`\n  (IQR is the discriminating one: a mapping that squashes everyone into a`);
console.log(`   narrow band makes the stat carry no information, whatever its range.)`);
