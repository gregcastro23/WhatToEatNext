/**
 * Purge the fabricated chart ANGLES from the 71 agents that carry them.
 *
 *   DRY RUN (default):
 *     railway run --service Postgres -- bun scripts/purgeFabricatedAscendants.ts
 *   WRITE:
 *     railway run --service Postgres -- bun scripts/purgeFabricatedAscendants.ts --write
 *
 * ── Why these values are being removed rather than corrected ────────────────
 *
 * `[MEASURED 2026-07-29]` `natal_chart.ascendant` is not a measured angle:
 *
 *   71 rows carry one, and they hold only 29 DISTINCT values
 *   28 of 71 are exact multiples of 30 — i.e. sign boundaries
 *   0 of 71 carry 4+ decimals (real pyswisseph output does)
 *   `houses` holds ONLY {ASC, MC} — never 12 cusps — and ASC is byte-identical
 *   to `ascendant` in 71/71, so it carries no independent information
 *   `midheaven` is identical to `houses.MC` in 71/71, is ASC-90 in 51/71, and has
 *   the same signature: 32 distinct values, 28 at multiples of 30
 *
 * And the unit was WRONG, not merely imprecise. Every reader took the scalar for
 * an absolute ecliptic longitude; it is a degree WITHIN a sign. The proof is one
 * chart's own stored aspect — `Greg Castro` holds
 * `Sun sextile Ascendant, orb 0.65, exact`, with Sun at Cancer 1.63° (91.63°
 * absolute) and `ascendant: 0.98`:
 *
 *   read as a longitude    separation 90.65°  (a SQUARE)   orb error 30.65°
 *   read as Taurus 0.98°   separation 60.65°               orb error  0.65°  ✓
 *   read as Virgo  0.98°   separation 59.35°               orb error  0.65°  ✓
 *
 * Only the degree-within-sign reading reproduces the stored orb. So the readers
 * were assigning the wrong SIGN, and the sign is the dominant lever on monica
 * (±37-43%) while sub-degree precision is noise (0.98° vs 1.0° differ by 1.5e-7).
 *
 * WTEN is not the writer of these values, so there is no correct value to restore
 * — two candidate signs fit even the one row with independent evidence. Writing a
 * "corrected" number would fabricate a placement, which is the §18k k12 class this
 * programme exists to remove. Absence is the only honest state, and per k13 an
 * absent JSONB member is REMOVED, not set to `{}` or to JSON null.
 *
 * ── What is deliberately NOT removed ────────────────────────────────────────
 *
 * `planets` and `natal_positions` are untouched. They are the trustworthy half:
 * `fullChartMonica` reads only `natal_positions` and reproduces all 71 stored
 * `monica_full_chart` values to 4.85e-7, and it never dereferences the ascendant
 * (control: recomputing WITH an Aries-15° ascendant matches 0 of 71).
 *
 * `Greg Castro`'s `Sun sextile Ascendant` aspect is KEPT. It is the only surviving
 * evidence of what that row's ascendant actually was, and a dangling reference is
 * inert — `flattenNatalChart` builds points from `planets` plus the angles, never
 * from `aspects`. Removing it would destroy the recovery basis.
 *
 * ── Idempotent ──────────────────────────────────────────────────────────────
 *
 * The `-` operator on a missing key is a no-op, so re-running converges. The
 * predicate below also narrows to rows that still carry a key, so a second run
 * reports 0 affected.
 */
import pg from "pg";

const WRITE = process.argv.includes("--write");

const url = process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL;
if (!url) {
  console.error("FATAL: no DATABASE_PUBLIC_URL / DATABASE_URL.");
  process.exit(1);
}

/** The three top-level natal_chart members being removed. */
const KEYS = ["ascendant", "midheaven", "houses"] as const;

const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
await client.connect();

// ⚠️ Digits ONLY. `toISOString().replace(/[-:T]/g,"").slice(0,15)` leaves the
// fractional-seconds DOT at index 14, producing `..._20260729212834.` — which is
// a syntax error at CREATE TABLE, caught only after the survey had already run.
// Strip to digits and take a fixed width instead of trusting an index.
const stamp = new Date().toISOString().replace(/\D/g, "").slice(0, 14);
if (!/^\d{14}$/.test(stamp)) {
  console.error(`FATAL: bad snapshot stamp ${JSON.stringify(stamp)}`);
  process.exit(1);
}
const SNAPSHOT = `natal_chart_preascpurge_${stamp}`;
// The identifier is interpolated into DDL, so prove it is a plain identifier
// before any statement runs rather than discovering it mid-transaction.
if (!/^[a-z][a-z0-9_]*$/.test(SNAPSHOT)) {
  console.error(`FATAL: unsafe snapshot identifier ${JSON.stringify(SNAPSHOT)}`);
  process.exit(1);
}

const targetPredicate = `
  u.is_agent AND (
    up.natal_chart ? 'ascendant' OR
    up.natal_chart ? 'midheaven' OR
    up.natal_chart ? 'houses'
  )`;

const purgeExpr = KEYS.reduce((acc, k) => `(${acc}) - '${k}'`, "up.natal_chart");

console.log(`\n=== fabricated-angle purge ${WRITE ? "WRITE" : "DRY RUN"} ===\n`);

// ── survey ──────────────────────────────────────────────────────────────────
const { rows: survey } = await client.query<Record<string, string>>(`
  SELECT count(*)::text affected,
         count(*) FILTER (WHERE up.natal_chart ? 'ascendant')::text has_ascendant,
         count(*) FILTER (WHERE up.natal_chart ? 'midheaven')::text has_midheaven,
         count(*) FILTER (WHERE up.natal_chart ? 'houses')::text has_houses,
         count(*) FILTER (WHERE up.monica_full_chart IS NOT NULL)::text full_chart
    FROM user_profiles up JOIN users u ON u.id = up.user_id
   WHERE ${targetPredicate}`);
console.log("rows in scope:", JSON.stringify(survey[0]));

const { rows: [{ n: agentTotal }] } = await client.query<{ n: string }>(
  `SELECT count(*)::text n FROM users WHERE is_agent`,
);
console.log(`agent population: ${agentTotal} (scope must be far smaller)`);

// What the chart looks like after — computed, not assumed.
const { rows: preview } = await client.query<{ name: string; before: string; after: string }>(`
  SELECT up.name,
         (SELECT string_agg(k, ',' ORDER BY k) FROM jsonb_object_keys(up.natal_chart) k) AS before,
         (SELECT string_agg(k, ',' ORDER BY k) FROM jsonb_object_keys(${purgeExpr}) k) AS after
    FROM user_profiles up JOIN users u ON u.id = up.user_id
   WHERE ${targetPredicate}
   ORDER BY up.name LIMIT 3`);
console.table(preview);

const affected = Number(survey[0].affected);
if (affected === 0) {
  console.log("\nNothing to purge — already converged. (This script is idempotent.)");
  await client.end();
  process.exit(0);
}

// ── the restore rehearsal, ALWAYS, in both modes ────────────────────────────
//
// A snapshot is a safety net only for the columns it contains, and a previous
// snapshot in this repo silently omitted three columns leaving 694 rows
// unrecoverable while every check passed. So the restore is exercised here, on a
// real table, inside a transaction that is always rolled back.
console.log("\n── restore rehearsal (rolled back) ──");
await client.query("BEGIN");
try {
  await client.query(`
    CREATE TEMP TABLE _rehearsal AS
    SELECT up.user_id, up.natal_chart
      FROM user_profiles up JOIN users u ON u.id = up.user_id
     WHERE ${targetPredicate}`);
  const { rows: [{ n: snapN }] } = await client.query<{ n: string }>(
    `SELECT count(*)::text n FROM _rehearsal`,
  );
  console.log(`  snapshot captured ${snapN} rows (expected ${affected})`);
  if (Number(snapN) !== affected) throw new Error("snapshot row count != scope");

  await client.query(`
    UPDATE user_profiles up SET natal_chart = ${purgeExpr}
      FROM users u WHERE u.id = up.user_id AND ${targetPredicate}`);
  const { rows: [{ n: leftAfter }] } = await client.query<{ n: string }>(`
    SELECT count(*)::text n FROM user_profiles up JOIN users u ON u.id = up.user_id
     WHERE ${targetPredicate}`);
  console.log(`  after purge, rows still carrying a key: ${leftAfter} (must be 0)`);
  if (Number(leftAfter) !== 0) throw new Error("purge left keys behind");

  await client.query(`
    UPDATE user_profiles up SET natal_chart = r.natal_chart
      FROM _rehearsal r WHERE r.user_id = up.user_id`);
  const { rows: [{ n: mismatched }] } = await client.query<{ n: string }>(`
    SELECT count(*)::text n
      FROM _rehearsal r JOIN user_profiles up ON up.user_id = r.user_id
     WHERE up.natal_chart <> r.natal_chart`);
  console.log(`  after restore, rows differing from the snapshot: ${mismatched} (must be 0)`);
  if (Number(mismatched) !== 0) throw new Error("restore did not reproduce the original");

  // CONTROL: the comparison must be able to report a difference, or "0
  // mismatched" proves nothing.
  await client.query(`
    UPDATE user_profiles up SET natal_chart = up.natal_chart || '{"_control":1}'::jsonb
      FROM _rehearsal r WHERE r.user_id = up.user_id`);
  const { rows: [{ n: ctl }] } = await client.query<{ n: string }>(`
    SELECT count(*)::text n
      FROM _rehearsal r JOIN user_profiles up ON up.user_id = r.user_id
     WHERE up.natal_chart <> r.natal_chart`);
  console.log(`  CONTROL: after perturbing every row, differences = ${ctl} (must be ${affected})`);
  if (Number(ctl) !== affected) throw new Error("comparison cannot detect a difference");

  console.log("  ✓ restore rehearsal passed");
} finally {
  await client.query("ROLLBACK");
}

const { rows: [{ n: postRehearsal }] } = await client.query<{ n: string }>(`
  SELECT count(*)::text n FROM user_profiles up JOIN users u ON u.id = up.user_id
   WHERE ${targetPredicate}`);
console.log(`rollback verified: ${postRehearsal} rows still in scope (must be ${affected})`);
if (Number(postRehearsal) !== affected) {
  console.error("FATAL: the rehearsal was not rolled back. Refusing to continue.");
  await client.end();
  process.exit(1);
}

if (!WRITE) {
  console.log(`\nDRY RUN — nothing written. Re-run with --write to commit.`);
  await client.end();
  process.exit(0);
}

// ── the real write ──────────────────────────────────────────────────────────
console.log(`\n── writing, snapshot -> ${SNAPSHOT} ──`);
await client.query("BEGIN");
try {
  await client.query(`
    CREATE TABLE ${SNAPSHOT} AS
    SELECT up.user_id, up.name, up.natal_chart, now() AS snapshotted_at
      FROM user_profiles up JOIN users u ON u.id = up.user_id
     WHERE ${targetPredicate}`);
  const { rows: [{ n: snapN }] } = await client.query<{ n: string }>(
    `SELECT count(*)::text n FROM ${SNAPSHOT}`,
  );
  if (Number(snapN) !== affected) throw new Error(`snapshot ${snapN} != scope ${affected}`);
  console.log(`  snapshot holds ${snapN} rows, full natal_chart per row`);

  const res = await client.query(`
    UPDATE user_profiles up SET natal_chart = ${purgeExpr}
      FROM users u WHERE u.id = up.user_id AND ${targetPredicate}`);
  console.log(`  updated ${res.rowCount} rows`);
  if (res.rowCount !== affected) throw new Error(`updated ${res.rowCount} != scope ${affected}`);

  // Verify INSIDE the transaction, before committing.
  const { rows: [chk] } = await client.query<Record<string, string>>(`
    SELECT count(*) FILTER (WHERE up.natal_chart ? 'ascendant')::text asc_left,
           count(*) FILTER (WHERE up.natal_chart ? 'midheaven')::text mc_left,
           count(*) FILTER (WHERE up.natal_chart ? 'houses')::text houses_left,
           count(*) FILTER (WHERE up.natal_chart ? 'planets')::text planets_kept,
           count(*)::text n
      FROM user_profiles up JOIN users u ON u.id = up.user_id
     WHERE u.is_agent AND up.monica_full_chart IS NOT NULL`);
  console.log("  in-transaction check:", JSON.stringify(chk));
  if (Number(chk.asc_left) || Number(chk.mc_left) || Number(chk.houses_left)) {
    throw new Error("angles survived the purge");
  }
  if (Number(chk.planets_kept) !== Number(chk.n)) {
    throw new Error("planets were lost — the purge is too wide");
  }
  await client.query("COMMIT");
  console.log("  COMMIT ok");
} catch (err) {
  await client.query("ROLLBACK");
  console.error("  ROLLED BACK:", (err as Error).message);
  await client.end();
  process.exit(1);
}

console.log(
  `\nTo reverse:\n` +
    `  UPDATE user_profiles up SET natal_chart = s.natal_chart\n` +
    `    FROM ${SNAPSHOT} s WHERE s.user_id = up.user_id;\n`,
);
await client.end();
