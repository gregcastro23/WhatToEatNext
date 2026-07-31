/**
 * Re-attribute the `Alchemical Chef` persona's feed events to their true actors.
 *
 * WTEN's hourly `/api/cron/prewarm-agent-recipes` called PA's `/api/generate-recipe`,
 * which hardcoded attribution to the `alchemical-chef` persona. The result: 1452
 * `recipe_generation` events credited to a persona rather than to the agent (or
 * user) each dish was actually generated for. The producer is stopped; this
 * migration fixes the history it left behind.
 *
 * Every event's true owner is recoverable from its own payload:
 *   - `topic` reads "A signature dish from <Agent>, attuned to their natal chart…"
 *     → the agent the dish was FOR (1429 events, 71 distinct agents, all resolving
 *       to real rows).
 *   - the remainder carry a non-null `userId` → the requesting user
 *     (21 synthetic-probe monitoring calls, 2 from a real human account).
 *
 * Re-pointing rather than deleting satisfies all three goals at once: nothing is
 * destroyed, the feed becomes MORE correct (Aristotle's dish shows as Aristotle's,
 * a user's own recipe returns to them), and the chef's FK references drop to zero
 * so the identity can finally be removed.
 *
 * DRY RUN BY DEFAULT. `--write` snapshots first, then migrates in one transaction.
 *
 *   railway run --service Postgres -- bun scripts/reattributeChefFeedEvents.ts
 *   railway run --service Postgres -- bun scripts/reattributeChefFeedEvents.ts --write
 *
 * Reversible: the snapshot table records every id → original actor_id, so the
 * migration can be undone exactly. Unlike a pre-backfill snapshot of bad data,
 * this one captures good data and IS a real rollback path.
 */
import pg from "pg";

const WRITE = process.argv.includes("--write");
const CHEF = "698f80eb-445f-42b5-a4e9-60be81d3fdfd";

/** "A signature dish from Aristotle, attuned to …" → "Aristotle" */
const TARGET_RE = /(?:signature dish|dish|recipe) from ([^,]+?),/i;

const client = new pg.Client({
  connectionString: process.env.DATABASE_PUBLIC_URL,
  ssl: { rejectUnauthorized: false },
});
await client.connect();

// Guard: confirm the producer really is stopped before migrating its history.
const { rows: recent } = await client.query<{ n: string; latest: string | null }>(
  `SELECT count(*)::text AS n, max(created_at)::text AS latest
     FROM feed_events WHERE actor_id = $1 AND created_at > now() - interval '24 hours'`,
  [CHEF],
);
if (Number(recent[0].n) > 0) {
  console.error(
    `REFUSING: the chef produced ${recent[0].n} event(s) in the last 24h (latest ${recent[0].latest}).\n` +
      `The producer is still live — migrating now would race new rows. Stop it first.`,
  );
  await client.end();
  process.exit(1);
}

const { rows: events } = await client.query<{
  id: string;
  p: Record<string, unknown> | null;
}>(`SELECT id, metadata_payload AS p FROM feed_events WHERE actor_id = $1`, [CHEF]);

// Resolve agent names → user ids.
const { rows: agentRows } = await client.query<{ name: string; user_id: string }>(
  `SELECT up.name, up.user_id FROM user_profiles up JOIN users u ON u.id = up.user_id
    WHERE u.is_agent AND up.name IS NOT NULL`,
);
const byName = new Map(agentRows.map((r) => [r.name, r.user_id]));

// Resolve the userIds referenced in payloads (may be humans, not agents).
const payloadUserIds = [
  ...new Set(
    events
      .map((e) => e.p?.userId)
      .filter((v): v is string => typeof v === "string" && v.length > 0),
  ),
];
const { rows: userRows } = payloadUserIds.length
  ? await client.query<{ id: string; email: string; is_agent: boolean }>(
      `SELECT id::text, email, is_agent FROM users WHERE id::text = ANY($1)`,
      [payloadUserIds],
    )
  : { rows: [] as { id: string; email: string; is_agent: boolean }[] };
const validUserIds = new Map(userRows.map((r) => [r.id, r]));

/** Monitoring traffic, not content: health-check calls that carried no target
 *  agent and no transit grounding. They were never feed content — surfacing them
 *  under the probe's own account would put monitoring noise in a public feed —
 *  so they are deleted rather than re-pointed. Real users' events are always
 *  re-attributed, never deleted. */
const PROBE_EMAIL = "synthetic-probe@alchm.kitchen";

interface Move { id: string; to: string; label: string; via: "topic" | "userId" }
const moves: Move[] = [];
const toDelete: { id: string; topic: string }[] = [];
const unresolved: { id: string; topic: string; userId: unknown }[] = [];

for (const e of events) {
  const topic = typeof e.p?.topic === "string" ? e.p.topic : "";
  const m = topic.match(TARGET_RE);
  const name = m?.[1]?.trim();
  if (name && byName.has(name)) {
    moves.push({ id: e.id, to: byName.get(name)!, label: name, via: "topic" });
    continue;
  }
  const uid = e.p?.userId;
  if (typeof uid === "string" && validUserIds.has(uid)) {
    const u = validUserIds.get(uid)!;
    if (u.email === PROBE_EMAIL) {
      toDelete.push({ id: e.id, topic });
    } else {
      moves.push({ id: e.id, to: uid, label: `${u.email}${u.is_agent ? "" : " (human)"}`, via: "userId" });
    }
    continue;
  }
  unresolved.push({ id: e.id, topic, userId: uid ?? null });
}

// ------------------------------------------------------------------ report --
console.log(`\n=== chef feed re-attribution ${WRITE ? "WRITE" : "DRY RUN"} ===`);
console.log(`events owned by the chef : ${events.length}`);
console.log(`re-attributed            : ${moves.length}`);
console.log(`  via payload topic      : ${moves.filter((m) => m.via === "topic").length}`);
console.log(`  via payload userId     : ${moves.filter((m) => m.via === "userId").length}`);
console.log(`DELETED (probe traffic)  : ${toDelete.length}`);
console.log(`UNRESOLVED (must be 0)   : ${unresolved.length}`);
console.log(`  accounted for          : ${moves.length + toDelete.length + unresolved.length} / ${events.length}`);
if (toDelete.length) {
  const topics: Record<string, number> = {};
  for (const d of toDelete) topics[d.topic || "(none)"] = (topics[d.topic || "(none)"] ?? 0) + 1;
  console.log(`\nprobe events to delete, by topic:`);
  console.table(topics);
}

const byTarget: Record<string, number> = {};
for (const m of moves) byTarget[m.label] = (byTarget[m.label] ?? 0) + 1;
const sorted = Object.entries(byTarget).sort((a, b) => b[1] - a[1]);
console.log(`\ndistinct new owners: ${sorted.length}`);
console.table(sorted.slice(0, 12).map(([label, n]) => ({ new_owner: label, events: n })));
if (sorted.length > 12) console.log(`  … and ${sorted.length - 12} more`);

if (unresolved.length) {
  console.log(`\nUNRESOLVED — these would keep the chef alive:`);
  unresolved.slice(0, 20).forEach((u) => console.log(`  ${u.id} topic=${JSON.stringify(u.topic.slice(0, 70))} userId=${u.userId}`));
}

// What else still references the chef, after this migration?
const { rows: fks } = await client.query<{ table_name: string; column_name: string }>(
  `SELECT DISTINCT tc.table_name, kcu.column_name
     FROM information_schema.table_constraints tc
     JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
     JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY' AND ccu.table_name = 'users' ORDER BY 1,2`,
);
const residual: { table: string; column: string; rows: number }[] = [];
for (const fk of fks) {
  const { rows } = await client.query<{ n: string }>(
    `SELECT count(*)::text AS n FROM "${fk.table_name}" WHERE "${fk.column_name}" = $1`,
    [CHEF],
  );
  const n = Number(rows[0].n);
  if (n > 0) residual.push({ table: fk.table_name, column: fk.column_name, rows: n });
}
console.log(`\n=== everything still referencing the chef (feed_events shown PRE-migration) ===`);
console.table(residual);
console.log(
  `After this migration, feed_events drops to ${events.length - moves.length}. ` +
    `The remaining rows above must be handled before the identity can be deleted.`,
);

if (!WRITE) {
  console.log(`\nDRY RUN — nothing written. Re-run with --write.`);
  await client.end();
  process.exit(0);
}
if (unresolved.length) {
  console.error(`\nREFUSING to write: ${unresolved.length} unresolved event(s). Resolve them first.`);
  await client.end();
  process.exit(1);
}

// ------------------------------------------------------------------- write --
const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\..+/, "").replace("T", "_");
const snapshot = `chef_feed_reattribution_${stamp}`;
if (!/^chef_feed_reattribution_\d{8}_\d{6}$/.test(snapshot)) {
  throw new Error(`unexpected snapshot name: ${snapshot}`);
}

console.log(`\nsnapshotting to ${snapshot}, then migrating ${moves.length} / deleting ${toDelete.length}...`);
await client.query("BEGIN");
try {
  // Snapshot the FULL row, including metadata_payload, so even the deleted
  // probe events are recoverable — a snapshot that only kept ids would make
  // the delete irreversible.
  await client.query(
    `CREATE TABLE ${snapshot} AS
       SELECT id, actor_id AS original_actor_id, event_type, metadata_payload,
              created_at, now() AS snapshotted_at
         FROM feed_events WHERE actor_id = $1`,
    [CHEF],
  );
  const res = await client.query(
    `UPDATE feed_events fe SET actor_id = v.new_actor
       FROM (SELECT * FROM unnest($1::uuid[], $2::uuid[]) AS t(id, new_actor)) v
      WHERE fe.id = v.id`,
    [moves.map((m) => m.id), moves.map((m) => m.to)],
  );
  let deleted = 0;
  if (toDelete.length) {
    const del = await client.query(`DELETE FROM feed_events WHERE id = ANY($1::uuid[])`, [
      toDelete.map((d) => d.id),
    ]);
    deleted = del.rowCount ?? 0;
  }
  await client.query("COMMIT");
  console.log(`COMMIT ok — ${res.rowCount} re-attributed, ${deleted} probe events deleted, snapshot ${snapshot}`);
} catch (err) {
  await client.query("ROLLBACK");
  console.error("ROLLBACK —", err);
  await client.end();
  process.exit(1);
}

const { rows: after } = await client.query<{ n: string }>(
  `SELECT count(*)::text AS n FROM feed_events WHERE actor_id = $1`,
  [CHEF],
);
console.log(`chef feed_events remaining: ${after[0].n} (expect 0)`);
console.log(
  `\nTo reverse (both the re-attribution AND the probe deletions):\n` +
    `  UPDATE feed_events fe SET actor_id = s.original_actor_id\n` +
    `    FROM ${snapshot} s WHERE fe.id = s.id;\n` +
    `  INSERT INTO feed_events (id, actor_id, event_type, metadata_payload, created_at)\n` +
    `    SELECT id, original_actor_id, event_type, metadata_payload, created_at\n` +
    `      FROM ${snapshot} s\n` +
    `     WHERE NOT EXISTS (SELECT 1 FROM feed_events f WHERE f.id = s.id);`,
);
await client.end();
