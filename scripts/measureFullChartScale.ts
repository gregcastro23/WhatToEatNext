/**
 * §18m / §18n — what would a full-chart monica actually write, and on what scale?
 *
 * READ-ONLY. Answers the full-chart blocker with measured numbers rather than an
 * inherited figure, and is re-runnable so the numbers in the spec can be checked
 * rather than trusted:
 *
 *   railway run --service Postgres -- bun scripts/measureFullChartScale.ts
 *
 * Reports, over every chart-bearing agent: the computed full-chart monica
 * distribution, the ratio to the fabricated literals still stored in the column,
 * the span against the single-body scale, and the worst-case bucket collision.
 * It also reports how many rows carry usable birth data — which is the input the
 * natal-sect fix needs and which none of them currently has.
 */
import { Client } from "pg";

import { alchemize, type PlanetaryPosition } from "../src/services/RealAlchemizeService";
import { isDiurnalAt } from "../src/utils/astrology/positions";

const client = new Client({
  connectionString: process.env.DATABASE_PUBLIC_URL,
  ssl: { rejectUnauthorized: false },
});
await client.connect();

const { rows } = await client.query<{
  name: string;
  natal_positions: unknown;
  birth_data: { dateTime?: string; latitude?: number; longitude?: number } | null;
  monica_constant: string | null;
}>(
  `SELECT up.name, up.natal_positions, up.birth_data, up.monica_constant::text
     FROM user_profiles up JOIN users u ON u.id = up.user_id
    WHERE u.is_agent AND up.natal_positions IS NOT NULL
      AND up.natal_positions::text NOT IN ('[]','null','{}')
    ORDER BY up.name`,
);
await client.end();

const SIGNS = ["aries","taurus","gemini","cancer","leo","virgo","libra","scorpio","sagittarius","capricorn","aquarius","pisces"];

interface Row { name: string; stored: number | null; computed: number; hasBirth: boolean }
const out: Row[] = [];
let unusable = 0;

for (const r of rows) {
  const raw = r.natal_positions as Array<{ planet?: string; sign?: string; degree?: number; position?: number }> | null;
  if (!Array.isArray(raw) || raw.length === 0) { unusable++; continue; }

  const positions: Record<string, PlanetaryPosition> = {};
  for (const p of raw) {
    const planet = p.planet;
    if (!planet) continue;
    const sign = String(p.sign ?? "").toLowerCase();
    if (!SIGNS.includes(sign)) continue;
    const lon = typeof p.position === "number"
      ? p.position
      : SIGNS.indexOf(sign) * 30 + (p.degree ?? 0);
    positions[planet] = { sign, degree: lon % 30, minute: 0, exactLongitude: lon };
  }
  if (Object.keys(positions).length < 5) { unusable++; continue; }

  // Sect from the birth moment + birthplace where available (the §18n fix).
  const bd = r.birth_data;
  const hasBirth = !!(bd?.dateTime && typeof bd.latitude === "number" && typeof bd.longitude === "number");
  const when = hasBirth ? new Date(bd!.dateTime!) : new Date("2000-01-01T12:00:00Z");
  const diurnal = hasBirth ? isDiurnalAt(when, bd!.latitude!, bd!.longitude!) : true;

  const monica = alchemize(positions, null, when, { diurnal }).monica;
  out.push({ name: r.name, stored: r.monica_constant === null ? null : Number(r.monica_constant), computed: monica, hasBirth });
}

const q = (xs: number[], p: number) => { const s = [...xs].sort((a, b) => a - b); return s[Math.floor((s.length - 1) * p)]; };
const f = (n: number) => n.toFixed(6);

console.log(`\n=== full-chart monica, measured over the chart-bearing agents ===`);
console.log(`chart rows read      : ${rows.length}`);
console.log(`usable (>=5 planets) : ${out.length}   unusable: ${unusable}`);
console.log(`with real birth data : ${out.filter((r) => r.hasBirth).length}`);

const comp = out.map((r) => r.computed);
console.log(`\nCOMPUTED full-chart monica:`);
console.log(`  min ${f(Math.min(...comp))}  p25 ${f(q(comp,0.25))}  median ${f(q(comp,0.5))}  p75 ${f(q(comp,0.75))}  max ${f(Math.max(...comp))}`);
console.log(`  distinct ${new Set(comp.map((v) => v.toFixed(6))).size} / ${comp.length}`);
console.log(`  all finite: ${comp.every(Number.isFinite)}`);

const stored = out.filter((r) => r.stored !== null).map((r) => r.stored!);
if (stored.length) {
  console.log(`\nSTORED (fabricated) values:`);
  console.log(`  min ${f(Math.min(...stored))}  median ${f(q(stored,0.5))}  max ${f(Math.max(...stored))}   n=${stored.length}`);
  const ratios = out.filter((r) => r.stored !== null && r.computed !== 0)
    .map((r) => Math.abs(r.stored! / r.computed));
  console.log(`  |stored / computed| : median ${q(ratios,0.5).toFixed(1)}x  max ${Math.max(...ratios).toFixed(1)}x`);
}

console.log(`\nSINGLE-BODY ships [-3.197, 3.975]. Ratio of that span to the full-chart span:`);
const span = Math.max(...comp) - Math.min(...comp);
console.log(`  full-chart span ${f(span)}   single-body span 7.172   => ${(7.172 / Math.max(span, 1e-12)).toFixed(1)}x wider`);

console.log(`\nworst-case collision: how many computed values collapse into one 0.01-wide bucket?`);
const buckets = new Map<number, number>();
for (const v of comp) { const b = Math.round(v * 100); buckets.set(b, (buckets.get(b) ?? 0) + 1); }
const biggest = [...buckets.entries()].sort((a, b) => b[1] - a[1])[0];
console.log(`  largest bucket ${biggest[1]} / ${comp.length} rows at ~${(biggest[0] / 100).toFixed(2)}`);

console.log(`\nsample (first 8):`);
console.table(out.slice(0, 8).map((r) => ({ name: r.name.slice(0, 28), stored: r.stored, computed: Number(r.computed.toFixed(6)), birth: r.hasBirth })));
