/**
 * §18h safety net — snapshot every agent's current monica_* columns to a
 * timestamped side table before the backfill writes anything.
 *
 * Read + one CREATE/INSERT, no mutation of user_profiles. Idempotent: running
 * it twice creates two distinctly-named tables (timestamp in the name), never
 * overwrites a prior snapshot.
 *
 *   railway run --service Postgres -- bun scripts/snapshotAgentMonica.ts
 *
 * ⚠️ THIS SCRIPT WAS SILENTLY INCOMPLETE FROM §18o UNTIL 2026-07-25. It captured
 * only monica_constant / monica_diurnal / monica_nocturnal / monica_method — the
 * pre-split column set. §18o moved each construction into its own column, so
 * every snapshot taken in between could not restore **623 two-body and 71
 * full-chart rows**: their values simply were not in the table. The snapshots
 * looked healthy (correct row count, joinable on user_id, monica_constant
 * matching), which is why this went unnoticed across two of them.
 *
 * The lesson generalises: a snapshot is only a safety net for the columns it
 * actually contains, and "the row is present" is not the same as "the value is
 * recoverable". After ANY schema change that adds or splits a column, re-check
 * this SELECT against `information_schema.columns` for user_profiles.
 *
 * To restore a row from a snapshot (all seven value columns):
 *   UPDATE user_profiles up SET
 *     monica_constant   = s.monica_constant,
 *     monica_single     = s.monica_single,
 *     monica_two_body   = s.monica_two_body,
 *     monica_full_chart = s.monica_full_chart,
 *     monica_diurnal    = s.monica_diurnal,
 *     monica_nocturnal  = s.monica_nocturnal,
 *     monica_method     = s.monica_method
 *   FROM agent_monica_snapshot_<timestamp> s
 *   WHERE up.user_id = s.user_id;
 */
import pg from "pg";

const client = new pg.Client({
  connectionString: process.env.DATABASE_PUBLIC_URL,
  ssl: { rejectUnauthorized: false },
});
await client.connect();

// Deterministic-enough for a single manual run: seconds since epoch, embedded
// in the table name. No Date.now() ambiguity concerns here — this is a script,
// not a workflow body.
const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\..+/, "").replace("T", "_");
const tableName = `agent_monica_snapshot_${stamp}`;

// Guard: table names can't be parameterized, so validate the derived name is
// exactly the safe shape we generated before interpolating it.
if (!/^agent_monica_snapshot_\d{8}_\d{6}$/.test(tableName)) {
  throw new Error(`unexpected snapshot table name shape: ${tableName}`);
}

console.log(`Creating ${tableName}...`);
await client.query(`
  CREATE TABLE ${tableName} AS
  SELECT up.user_id, up.name, u.is_agent,
         -- ALL SEVEN value columns. monica_single / monica_two_body /
         -- monica_full_chart were added by the §18o split and were missing here
         -- until 2026-07-25; without them a snapshot cannot restore the two-body
         -- or full-chart populations at all. Asserted below against
         -- information_schema, so a future column cannot go missing silently.
         up.monica_constant, up.monica_single, up.monica_two_body, up.monica_full_chart,
         up.monica_diurnal, up.monica_nocturnal, up.monica_method,
         now() AS snapshotted_at
    FROM user_profiles up JOIN users u ON u.id = up.user_id
`);

/**
 * COMPLETENESS GATE. Compare the snapshot's monica_* columns against the live
 * table's. A snapshot missing a column looks perfectly healthy — right row count,
 * joinable on user_id, monica_constant matching — while being unable to restore
 * an entire population. That is exactly how two prior snapshots passed review.
 *
 * This throws AFTER the table is created, deliberately: the incomplete table is
 * left behind as evidence rather than silently dropped, and no backfill should
 * proceed on the strength of it.
 */
const { rows: colDiff } = await client.query<{ missing: string[] }>(
  // ::text is load-bearing. information_schema.columns.column_name is
  // `sql_identifier`, and node-postgres has no parser for sql_identifier[], so it
  // hands back the raw string "{}" instead of an array — whose .length is 2, which
  // made this gate fire on a COMPLETE snapshot and then crash on .join.
  `SELECT coalesce(array_agg(live.column_name::text ORDER BY live.column_name), '{}') AS missing
     FROM information_schema.columns live
    WHERE live.table_name = 'user_profiles'
      AND live.column_name LIKE 'monica%'
      AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns snap
         WHERE snap.table_name = $1 AND snap.column_name = live.column_name
      )`,
  [tableName],
);
if (colDiff[0].missing.length > 0) {
  throw new Error(
    `INCOMPLETE SNAPSHOT ${tableName}: user_profiles has monica columns this ` +
      `snapshot does not capture: ${colDiff[0].missing.join(", ")}.\n` +
      `Rows in those populations would be UNRECOVERABLE. Add them to the SELECT ` +
      `above before running any backfill. The incomplete table has been left in ` +
      `place as evidence — drop it manually once the fix is in.`,
  );
}
console.log(`Column completeness: every monica_* column on user_profiles is captured.`);

const { rows } = await client.query<{ n: string; agents: string; with_monica: string }>(
  `SELECT count(*)::text AS n,
          count(*) FILTER (WHERE is_agent)::text AS agents,
          count(*) FILTER (WHERE monica_constant IS NOT NULL)::text AS with_monica
     FROM ${tableName}`,
);
console.log(`Snapshotted: ${rows[0].n} total rows (${rows[0].agents} agents, ${rows[0].with_monica} with a monica_constant).`);
console.log(`Table: ${tableName}`);

await client.end();
