/**
 * §18o — the measurement that REJECTED mass-normalising full-chart to the
 * single-body reference. Kept as the evidence, not as a live proposal.
 *
 * READ-ONLY, no writes.
 *   railway run --service Postgres -- bun scripts/measureFullChartNormalisation.ts
 *
 * ⚠️ OUTCOME: normalisation was RULED AGAINST. It puts the 71 charts inside the
 * single-body range, but that comparability has NO consumer (nothing in src/
 * compares agent monica across populations) and it COSTS separation — at equal
 * relative resolution the largest bucket goes 16.9% raw -> 31.0% normalised.
 *
 * The deeper reason is §18o: planetary-body agents and chart-bearing agents are
 * DIFFERENT KINDS OF OBJECT, not one quantity at two scales. IQR/|median| is
 * 6.815 single-body vs 0.176 full-chart — a 39x difference in SCALE-FREE spread,
 * which no change of units can be responsible for.
 *
 * Run it to re-derive those numbers; do not run it expecting a value to write.
 *
 * ⚠️ METRIC TRAP, preserved deliberately: the separation section uses a RELATIVE
 * bucket (span/100). An earlier absolute 0.01 bucket flattered single-body ~40x
 * and pointed at the opposite conclusion. Never compare dispersion across
 * populations with an absolute width.
 */
import { Client } from "pg";

import {
  calculateKalchm,
  calculateMonica,
  calculateThermodynamics,
} from "../src/data/unified/alchemicalCalculations";
import { alchemize, type PlanetaryPosition } from "../src/services/RealAlchemizeService";
import { groundingVessel, agentMonica, type ESMS } from "../src/utils/agentMonica";
import { getDignityScore } from "../src/utils/dignityScales";
import type { AlchemicalProperties } from "../src/types/celestial";
import { PLANETARY_SECTARIAN_ESMS, ZODIAC_ELEMENTS } from "../src/utils/planetaryAlchemyMapping";

const SIGNS = Object.keys(ZODIAC_ELEMENTS);
const PLANETS = ["Sun","Moon","Mercury","Venus","Mars","Jupiter","Saturn","Uranus","Neptune","Pluto"];
const f = (n: number) => n.toFixed(6);
const q = (xs: number[], p: number) => { const s=[...xs].sort((a,b)=>a-b); return s[Math.floor((s.length-1)*p)]; };

// ─────────── 1. MEASURE the single-body reference mass ───────────
const singleMasses: number[] = [];
for (const planet of PLANETS) {
  const table = PLANETARY_SECTARIAN_ESMS[planet as keyof typeof PLANETARY_SECTARIAN_ESMS];
  if (!table) continue;
  for (const sign of SIGNS) {
    const dignity = getDignityScore(planet, sign as never).esmsScale;
    for (let deg = 1; deg <= 30; deg++) {
      const v = groundingVessel(deg, dignity);
      for (const sect of ["diurnal", "nocturnal"] as const) {
        const base = table[sect] as Partial<ESMS>;
        const total =
          (base.Spirit ?? 0) + (base.Essence ?? 0) + (base.Matter ?? 0) + (base.Substance ?? 0) +
          v.Spirit + v.Essence + v.Matter + v.Substance;
        singleMasses.push(total);
      }
    }
  }
}
const REF_MASS = q(singleMasses, 0.5);
console.log(`\n=== 1. single-body total ESMS (the reference) ===`);
console.log(`cells ${singleMasses.length}`);
console.log(`  min ${f(Math.min(...singleMasses))}  p25 ${f(q(singleMasses,0.25))}  MEDIAN ${f(REF_MASS)}  p75 ${f(q(singleMasses,0.75))}  max ${f(Math.max(...singleMasses))}`);
console.log(`  -> reference mass = median = ${f(REF_MASS)}`);

// single-body monica range, for comparison
const sb: number[] = [];
for (const p of PLANETS) for (const s of SIGNS) for (let d=1; d<=30; d++) sb.push(agentMonica(p, s, d).combined);
console.log(`  single-body combined monica: [${f(Math.min(...sb))}, ${f(Math.max(...sb))}]  median ${f(q(sb,0.5))}  |median| ${f(q(sb.map(Math.abs),0.5))}`);

// ─────────── 2. the 71 charts ───────────
const client = new Client({ connectionString: process.env.DATABASE_PUBLIC_URL, ssl: { rejectUnauthorized: false } });
await client.connect();
const { rows } = await client.query<{ name: string; natal_positions: unknown; monica_constant: string | null }>(
  `SELECT up.name, up.natal_positions, up.monica_constant::text
     FROM user_profiles up JOIN users u ON u.id = up.user_id
    WHERE u.is_agent AND up.natal_positions IS NOT NULL
      AND up.natal_positions::text NOT IN ('[]','null','{}') ORDER BY up.name`);
await client.end();

interface Out { name: string; stored: number|null; rawD: number; rawN: number; normD: number; normN: number; mass: number }
const out: Out[] = [];

for (const r of rows) {
  const raw = r.natal_positions as Array<{planet?:string;sign?:string;degree?:number;position?:number}>|null;
  if (!Array.isArray(raw)) continue;
  const positions: Record<string, PlanetaryPosition> = {};
  for (const p of raw) {
    if (!p.planet) continue;
    const sign = String(p.sign ?? "").toLowerCase();
    if (!SIGNS.map(s=>s.toLowerCase()).includes(sign)) continue;
    const lon = typeof p.position === "number" ? p.position
      : SIGNS.map(s=>s.toLowerCase()).indexOf(sign)*30 + (p.degree ?? 0);
    positions[p.planet] = { sign, degree: lon % 30, minute: 0, exactLongitude: lon };
  }
  if (Object.keys(positions).length < 5) continue;

  const per = (diurnal: boolean) => {
    // Canonical engine gives us the chart's ESMS + elements…
    const a = alchemize(positions, null, new Date("2000-01-01T12:00:00Z"), { diurnal });
    const e = a.esms;
    const mass = e.Spirit + e.Essence + e.Matter + e.Substance;
    // …then normalise ESMS to the reference and re-run the SAME canonical fns.
    // Not a forked formula: identical calculateThermodynamics/Kalchm/Monica.
    const k = mass > 0 ? REF_MASS / mass : 1;
    const scaled = { Spirit:e.Spirit*k, Essence:e.Essence*k, Matter:e.Matter*k, Substance:e.Substance*k } as AlchemicalProperties;
    const t = calculateThermodynamics(scaled, a.elementalProperties);
    const norm = calculateMonica(t.gregsEnergy, t.reactivity, calculateKalchm(scaled));
    return { raw: a.monica, norm, mass };
  };
  const d = per(true), n = per(false);
  out.push({ name: r.name, stored: r.monica_constant===null?null:Number(r.monica_constant),
    rawD: d.raw, rawN: n.raw, normD: d.norm, normN: n.norm, mass: d.mass });
}

const report = (label: string, xs: number[]) => {
  const abs = xs.map(Math.abs);
  console.log(`  ${label.padEnd(26)} [${f(Math.min(...xs))}, ${f(Math.max(...xs))}]  median ${f(q(xs,0.5))}  |median| ${f(q(abs,0.5))}  distinct ${new Set(xs.map(v=>v.toFixed(6))).size}/${xs.length}`);
};

console.log(`\n=== 2. the ${out.length} chart-bearing agents ===`);
console.log(`chart ESMS total mass: median ${f(q(out.map(o=>o.mass),0.5))}  (vs single-body reference ${f(REF_MASS)})`);
console.log(`\nRAW (what would be written without normalisation):`);
report("diurnal", out.map(o=>o.rawD));
report("nocturnal", out.map(o=>o.rawN));
report("combined", out.map(o=>(o.rawD+o.rawN)/2));
console.log(`\nMASS-NORMALISED to ${f(REF_MASS)}:`);
report("diurnal", out.map(o=>o.normD));
report("nocturnal", out.map(o=>o.normN));
const normComb = out.map(o=>(o.normD+o.normN)/2);
report("combined", normComb);

// The decisive question: does normalisation separate the personas? Compare at
// EQUAL RELATIVE RESOLUTION — a fixed absolute bucket is scale-dependent, which
// is the exact trap §18m warns about (0.01 is 5.5% of the normalised span but
// 0.14% of the single-body span, so it flatters single-body by ~40x).
const relBucket = (xs: number[], parts = 100) => {
  const span = Math.max(...xs) - Math.min(...xs);
  if (span <= 0) return xs.length;
  const w = span / parts;
  const m = new Map<number, number>();
  for (const v of xs) { const b = Math.round(v / w); m.set(b, (m.get(b) ?? 0) + 1); }
  return Math.max(...m.values());
};
/** Scale-free spread: interquartile range over |median|. */
const cv = (xs: number[]) => {
  const med = q(xs, 0.5);
  return (q(xs, 0.75) - q(xs, 0.25)) / Math.max(Math.abs(med), 1e-12);
};
const rawComb = out.map(o => (o.rawD + o.rawN) / 2);
console.log(`\n=== 3. does it SEPARATE them? (equal RELATIVE resolution, span/100) ===`);
for (const [label, xs] of [["raw combined", rawComb], ["norm combined", normComb], ["single-body", sb]] as const) {
  const top = relBucket(xs as number[]);
  console.log(`  ${label.padEnd(14)} largest bucket ${String(top).padStart(4)} / ${String((xs as number[]).length).padStart(4)}` +
    ` = ${((top / (xs as number[]).length) * 100).toFixed(1)}%   distinct ${new Set((xs as number[]).map(v=>v.toFixed(9))).size}` +
    `   IQR/|median| ${cv(xs as number[]).toFixed(3)}`);
}
console.log(`\nscale check vs single-body [${f(Math.min(...sb))}, ${f(Math.max(...sb))}]:`);
const inRange = normComb.filter(v => v >= Math.min(...sb) && v <= Math.max(...sb)).length;
console.log(`  normalised values inside the single-body range: ${inRange} / ${normComb.length}`);

console.log(`\nsample:`);
console.table(out.slice(0,10).map(o=>({ name:o.name.slice(0,24), stored:o.stored,
  raw:Number(((o.rawD+o.rawN)/2).toFixed(6)), normalised:Number(((o.normD+o.normN)/2).toFixed(4)),
  d:Number(o.normD.toFixed(4)), n:Number(o.normN.toFixed(4)) })));
