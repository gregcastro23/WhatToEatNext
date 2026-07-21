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
 * To restore a row from a snapshot:
 *   UPDATE user_profiles up SET
 *     monica_constant = s.monica_constant,
 *     monica_diurnal = s.monica_diurnal,
 *     monica_nocturnal = s.monica_nocturnal,
 *     monica_method = s.monica_method
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
         up.monica_constant, up.monica_diurnal, up.monica_nocturnal, up.monica_method,
         now() AS snapshotted_at
    FROM user_profiles up JOIN users u ON u.id = up.user_id
`);

const { rows } = await client.query<{ n: string; agents: string; with_monica: string }>(
  `SELECT count(*)::text AS n,
          count(*) FILTER (WHERE is_agent)::text AS agents,
          count(*) FILTER (WHERE monica_constant IS NOT NULL)::text AS with_monica
     FROM ${tableName}`,
);
console.log(`Snapshotted: ${rows[0].n} total rows (${rows[0].agents} agents, ${rows[0].with_monica} with a monica_constant).`);
console.log(`Table: ${tableName}`);

await client.end();
