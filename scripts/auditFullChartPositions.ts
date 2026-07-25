/**
 * Are the 71 full-chart agents' natal_positions REAL, or placeholders?
 *
 * READ-ONLY. Only SELECTs.
 *
 * Why this must run before any birth data is authored: a placeholder chart makes
 * its monica fabricated no matter how accurate the birth time is. Authoring
 * birth data for a placeholder chart just adds precision to an invented number.
 *
 * The trigger: Alexander the Great, Archimedes and Aristotle all produced
 * monica_full_chart = 0.003160 with diurnal 0.009703 / nocturnal -0.003383 —
 * byte-identical. Three different people cannot share a chart. And the backfill
 * reported only 63 DISTINCT values across 71 rows, so there are at least 8
 * collisions, not 3.
 *
 * Tests, in increasing strength:
 *   1. Do any two agents share an identical positions BLOB? (exact clone)
 *   2. Do any share an identical monica but differ in blob? (different route in)
 *   3. Does any chart use suspiciously round longitudes (0, 15, 30...)?
 *   4. How many bodies does each chart actually resolve?
 *   5. Is any position list identical to a KNOWN default (all-zero, all-Aries)?
 */
import { Client } from "pg";
import { createHash } from "node:crypto";

const url = process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL;
if (!url) {
  console.error("No DATABASE_PUBLIC_URL in env");
  process.exit(1);
}

interface Row {
  name: string;
  positions: unknown;
  full_chart: string | null;
  diurnal: string | null;
  nocturnal: string | null;
}

const hash = (v: unknown) =>
  createHash("sha256").update(JSON.stringify(v ?? null)).digest("hex").slice(0, 12);

const SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
];

/**
 * ⚠️ Longitude MUST be derived from sign + degree.
 *
 * The stored `longitude` field is **0 for every body in every one of the 71
 * charts** — present in the JSON, never populated. Reading it directly reports
 * all 71 charts as identical all-zero placeholders, which is false: the real
 * data is in `sign` + `degree` (Adam Smith: Sun Gemini 25°, Mars Taurus 22°).
 *
 * A `p.position ?? p.longitude ?? ...` chain does NOT save you here, because
 * `0` is not nullish — the chain stops at the zero and never reaches `degree`.
 * That is how the first version of this script "found" 71 all-zero charts.
 */
function longitudes(positions: unknown): Array<{ body: string; lon: number }> {
  if (!Array.isArray(positions)) return [];
  const out: Array<{ body: string; lon: number }> = [];
  for (const p of positions as Array<Record<string, unknown>>) {
    if (!p || typeof p !== "object") continue;
    const body = String(p.planet ?? p.name ?? p.body ?? "?");
    const signIdx = SIGNS.indexOf(String(p.sign));
    const degree = Number(p.degree);
    if (signIdx < 0 || !Number.isFinite(degree)) continue;
    out.push({ body, lon: signIdx * 30 + degree });
  }
  return out;
}

/** How many bodies carry a non-zero stored `longitude`? Expect 0 everywhere. */
function storedLongitudeNonZero(positions: unknown): number {
  if (!Array.isArray(positions)) return 0;
  return (positions as Array<Record<string, unknown>>).filter(
    (p) => p && typeof p === "object" && Number(p.longitude) !== 0,
  ).length;
}

async function main() {
  const c = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
  await c.connect();

  const { rows } = await c.query<Row>(`
    SELECT min(up.name) AS name,
           up.natal_positions   AS positions,
           up.monica_full_chart::text AS full_chart,
           up.monica_diurnal::text    AS diurnal,
           up.monica_nocturnal::text  AS nocturnal
    FROM user_profiles up
    WHERE up.monica_method = 'full-chart'
    GROUP BY up.natal_positions, up.monica_full_chart, up.monica_diurnal, up.monica_nocturnal, up.user_id
    ORDER BY min(up.name)
  `);

  console.log(`full-chart agents: ${rows.length}`);
  console.log("=".repeat(74));

  // ── 1. identical positions blobs ──────────────────────────────────────────
  const byBlob = new Map<string, string[]>();
  for (const r of rows) {
    const h = hash(r.positions);
    byBlob.set(h, [...(byBlob.get(h) ?? []), r.name]);
  }
  const clonedBlobs = [...byBlob.entries()].filter(([, names]) => names.length > 1);

  console.log(`\n1. IDENTICAL natal_positions blobs: ${clonedBlobs.length} group(s)`);
  let clonedRows = 0;
  for (const [h, names] of clonedBlobs) {
    clonedRows += names.length;
    console.log(`   [${h}] x${names.length}: ${names.join(", ")}`);
  }
  console.log(`   rows involved: ${clonedRows} of ${rows.length}`);

  // ── 2. identical monica, different blob ───────────────────────────────────
  const byMonica = new Map<string, Array<{ name: string; blob: string }>>();
  for (const r of rows) {
    const k = String(r.full_chart);
    byMonica.set(k, [...(byMonica.get(k) ?? []), { name: r.name, blob: hash(r.positions) }]);
  }
  const monicaCollisions = [...byMonica.entries()].filter(([, v]) => v.length > 1);
  console.log(`\n2. IDENTICAL monica_full_chart: ${monicaCollisions.length} group(s)`);
  for (const [val, members] of monicaCollisions) {
    const distinctBlobs = new Set(members.map((m) => m.blob)).size;
    const verdict = distinctBlobs === 1 ? "same chart (clone)" : `DIFFERENT charts, same monica (!)`;
    console.log(`   ${val}  x${members.length}  ${verdict}`);
    console.log(`      ${members.map((m) => m.name).join(", ")}`);
  }

  // ── 3. body count per chart ───────────────────────────────────────────────
  const counts = rows.map((r) => longitudes(r.positions).length);
  const byCount = new Map<number, number>();
  for (const n of counts) byCount.set(n, (byCount.get(n) ?? 0) + 1);
  console.log(`\n3. RESOLVABLE BODY COUNT (MIN_CHART_BODIES = 5)`);
  for (const [n, freq] of [...byCount.entries()].sort((a, b) => a[0] - b[0])) {
    console.log(`   ${String(n).padStart(2)} bodies: ${freq} chart(s)`);
  }

  // ── 4. the always-zero stored `longitude` field ──────────────────────────
  const withRealLongitude = rows.filter((r) => storedLongitudeNonZero(r.positions) > 0);
  console.log(`\n4. STORED \`longitude\` FIELD (separate defect)`);
  console.log(`   charts with ANY non-zero stored longitude: ${withRealLongitude.length} / ${rows.length}`);
  if (withRealLongitude.length === 0) {
    console.log(`   => the field exists in every body object and is ALWAYS 0.`);
    console.log(`      Any consumer reading .longitude instead of sign+degree gets 0 for`);
    console.log(`      every planet in every chart. Derive it, or drop the field.`);
  }

  // ── 4b. suspiciously round degrees ───────────────────────────────────────
  console.log(`\n4b. DEGREE GRANULARITY (whole degrees => low-precision source)`);
  let allWhole = 0;
  for (const r of rows) {
    const ls = longitudes(r.positions);
    if (ls.length && ls.every((x) => Number.isInteger(x.lon))) allWhole++;
  }
  console.log(`   charts whose every position is a whole degree: ${allWhole} / ${rows.length}`);
  if (allWhole === rows.length) {
    console.log(`   => all positions are whole degrees. Consistent with hand-authored or`);
    console.log(`      low-precision ephemeris data, NOT a computed chart (which would`);
    console.log(`      carry fractional degrees).`);
  }
  const suspicious = allWhole;

  // ── 5. summary verdict ───────────────────────────────────────────────────
  const distinctBlobs = byBlob.size;
  const distinctMonica = new Set(rows.map((r) => String(r.full_chart))).size;
  console.log("\n" + "=".repeat(74));
  console.log(`distinct positions blobs : ${distinctBlobs} / ${rows.length}`);
  console.log(`distinct monica values   : ${distinctMonica} / ${rows.length}`);
  console.log(`rows sharing a blob      : ${clonedRows}`);
  console.log(`suspicious longitudes    : ${suspicious}`);
  console.log("");
  if (clonedRows > 0) {
    console.log(`VERDICT: ${clonedRows} rows do NOT have their own chart. Their full-chart`);
    console.log(`monica is not derived from their own birth data, so authoring birth data`);
    console.log(`for them would add precision to a value that is not theirs.`);
  } else {
    console.log(`VERDICT: every chart is distinct. Monica collisions (if any) come from the`);
    console.log(`formula, not from shared positions.`);
  }

  await c.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
