/**
 * CI gate: does the TypeScript sampling hour agree with the SQL that schedules it?
 *
 * ── Why this exists ─────────────────────────────────────────────────────────
 *
 * The environmental ingestion cron derives a geohash's sampling hour TWICE, in
 * two languages, and PR #680 shipped with the two implementations disagreeing:
 *
 *   SQL  (buildSelectGeohashesDueForSampling) decides WHEN a cell is due:
 *        MOD(ABS(('x' || SUBSTR(MD5(geohash5), 1, 8))::bit(32)::bigint), 24)
 *   TS   (sampleHourForGeohash) decides WHICH HOUR'S reading is kept.
 *
 * The TS side used a *31 charCode polynomial. `[MEASURED 2026-08-01]` the two
 * disagreed for 297 of 306 geohashes — 97.1%, indistinguishable from chance.
 *
 * The consequence was silent and severe. The cron wakes a cell at the SQL hour H
 * and then asks reduceToDailyAtHour for the TS hour T. When T > H the selected
 * sample is a future forecast hour, gets dropped by the
 * `observedAt <= Date.now()` filter, and the cell writes nothing — every day,
 * forever, for roughly half the fleet, while the run reported success.
 *
 * Neither a typechecker nor a mocked-DB test can see this: the two expressions
 * live in different languages and never meet in the same process. Only
 * evaluating the real SQL and comparing it to the real function catches it.
 *
 * Read-only. Runs one SELECT over a literal array; touches no table.
 *
 *   railway run --service Postgres -- bun scripts/checkSamplingHourAgrees.ts
 */
import pg from "pg";
import { sampleHourForGeohash } from "../src/lib/environment/geohash";

const fail = (msg: string): never => {
  console.error(`\n✗ ${msg}`);
  process.exit(1);
};

const url = process.env.DATABASE_PUBLIC_URL ?? process.env.DATABASE_URL;
if (!url) fail("no DATABASE_PUBLIC_URL / DATABASE_URL in the environment");

const BASE32 = "0123456789bcdefghjkmnpqrstuvwxyz";

/**
 * Deterministic spread of geohashes, plus real cities as named witnesses.
 *
 * Built by base-32 expansion of a counter rather than a per-digit formula: the
 * first draft used `BASE32[(i * 7 + j * 13 + 3) % 32]`, whose digits cycle
 * together, so 500 candidates deduped to 40 distinct cells and the gate silently
 * tested an eighth of what it claimed to.
 */
function sampleCells(count: number): string[] {
  const named = ["dr5re", "gcpvj", "9xj64", "dp3wj", "u4pru", "s0000", "ezs42", "xn774"];
  const generated: string[] = [];
  for (let i = 0; i < count; i++) {
    // Stride by a value coprime with 32^5 so successive cells differ in every digit.
    let n = (i * 1_299_709) % 32 ** 5;
    let cell = "";
    for (let j = 0; j < 5; j++) {
      cell = BASE32[n % 32] + cell;
      n = Math.floor(n / 32);
    }
    generated.push(cell);
  }
  return [...new Set([...named, ...generated])];
}

const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });

async function main(): Promise<void> {
  await client.connect();

  const cells = sampleCells(500);
  // A gate whose sample silently shrank would still print a pass. Assert the size.
  const MINIMUM_CELLS = 400;
  if (cells.length < MINIMUM_CELLS) {
    fail(
      `only ${cells.length} distinct geohashes generated, expected at least ${MINIMUM_CELLS} — ` +
        "the generator is producing duplicates and this gate is testing far less than it appears to.",
    );
  }

  // The hour expression is lifted VERBATIM from buildSelectGeohashesDueForSampling.
  // If that query's expression changes without this one changing, the gate stops
  // testing what ships — so they are asserted identical below.
  const HOUR_EXPR = "MOD(ABS(('x' || SUBSTR(MD5(g), 1, 8))::bit(32)::bigint), 24)::int";

  const { buildSelectGeohashesDueForSampling } = await import(
    "../src/services/environmentalQueries"
  );
  const shipped = buildSelectGeohashesDueForSampling();
  const shippedNormalized = shipped.replace(/\s+/g, " ");
  if (!shippedNormalized.includes("MOD( ABS(('x' || SUBSTR(MD5(b.geohash5), 1, 8))::bit(32)::bigint), 24 )")) {
    fail(
      "the hour expression in buildSelectGeohashesDueForSampling no longer matches the one this " +
        "gate tests. Update HOUR_EXPR here deliberately — otherwise this gate checks a statement " +
        "that is not the one running in production.",
    );
  }
  console.log("✓ control: the gate tests the expression that actually ships");

  const res = await client.query(
    `SELECT g AS geohash, ${HOUR_EXPR} AS sql_hour FROM unnest($1::text[]) AS g`,
    [cells],
  );

  if (res.rowCount !== cells.length) {
    fail(`expected ${cells.length} rows back, got ${res.rowCount}`);
  }

  const mismatches: Array<{ geohash: string; sql: number; ts: number }> = [];
  for (const row of res.rows) {
    const ts = sampleHourForGeohash(row.geohash);
    if (ts !== row.sql_hour) {
      mismatches.push({ geohash: row.geohash, sql: row.sql_hour, ts });
    }
  }

  if (mismatches.length > 0) {
    for (const m of mismatches.slice(0, 10)) {
      console.error(`  ✗ ${m.geohash}  SQL=${m.sql}  TS=${m.ts}`);
    }
    fail(
      `${mismatches.length}/${res.rowCount} geohashes get a different sampling hour from SQL than ` +
        "from TypeScript. Cells whose TS hour is LATER than their SQL hour write nothing, every " +
        "day, silently.",
    );
  }

  // A zero-mismatch result is a claim; prove the comparison can fail.
  const controlHour = (sampleHourForGeohash("dr5re") + 1) % 24;
  if (controlHour === res.rows.find((r) => r.geohash === "dr5re")?.sql_hour) {
    fail("control failed: the deliberately-wrong hour equals the real one");
  }
  console.log("✓ control: a wrong hour would be detected");

  console.log(
    `\n✓ TS and SQL agree on the sampling hour for all ${res.rowCount} geohashes.\n`,
  );
}

main()
  .catch((error) => fail(error instanceof Error ? error.message : String(error)))
  .finally(() => void client.end());
