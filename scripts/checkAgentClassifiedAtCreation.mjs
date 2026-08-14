/**
 * Does a newly-provisioned agent leave the writer already classified?
 *
 *   railway run --service Postgres -- bun scripts/checkAgentClassifiedAtCreation.mjs
 *
 * Executes the REAL statements from the two provisioning endpoints against a real
 * PostgreSQL, inside a transaction that is ALWAYS rolled back. The SQL is read out
 * of the route source rather than hand-copied, because a copy drifts from what
 * ships and would then verify something other than the code.
 *
 * ── What this exists to catch ───────────────────────────────────────────────
 *
 * `[MEASURED 2026-07-28]` 110 agents sat unclassified in production, and of the
 * 1506 in that family that DID have a monica, every one got it from a backfill —
 * not one had ever been classified within five minutes of creation. Two bugs in
 * `sync-debit`:
 *
 *   1. the monica was resolved from `agentProfile.name` (an optional payload
 *      field) instead of the name the endpoint itself derives and STORES
 *   2. only the single-body construction was attempted, so all 92 Moon-phase
 *      agents resolved to null
 *
 * And a third, latent behind them: the statement wrote `monica_constant` plus
 * `monica_method='single-body'` without `monica_single`, which the CHECK
 * constraint `monica_method_matches_column` REJECTS. Fixing 1 and 2 alone would
 * have converted a silent NULL into a FAILED DEBIT on every provisioning call.
 * That is why this asserts by executing, not by reading.
 */
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import pg from "pg";

const url = process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL;
if (!url) {
  console.error("FAIL: no DATABASE_PUBLIC_URL / DATABASE_URL — this check needs a real database.");
  process.exit(1);
}

/** The profile UPSERT from sync-debit, extracted from the module source. */
function syncDebitProfileSql() {
  const src = readFileSync("src/app/api/economy/sync-debit/route.ts", "utf8");
  const sql = src.match(/`UPDATE user_profiles SET[\s\S]*?WHERE user_id = \$1`/)?.[0];
  if (!sql) {
    console.error("CONTROL FAILED: could not extract the sync-debit profile UPDATE. Update this extractor.");
    process.exit(1);
  }
  return sql.slice(1, -1);
}

/**
 * The profile UPSERT from `userDatabaseService.ensurePlanetaryAgent`, extracted from the
 * module source. This is the statement 370 of 370 real arrivals go through.
 */
function ensureAgentProfileSql() {
  const src = readFileSync("src/services/userDatabaseService.ts", "utf8");

  // Scope to the ensurePlanetaryAgent body FIRST. There are four `INSERT INTO
  // user_profiles` statements in this module and a file-wide regex would
  // happily verify one of the other three — which is the same class of mistake
  // that let #666 pass while the real producer went unpatched.
  const start = src.indexOf("async ensurePlanetaryAgent");
  if (start === -1) {
    console.error("CONTROL FAILED: no `async ensurePlanetaryAgent` in userDatabaseService.ts. Update this extractor.");
    process.exit(1);
  }
  const nextMethod = src.slice(start + 1).search(/\n {2}(?:async )?[a-zA-Z_]\w*\s*\(/);
  const body = nextMethod === -1 ? src.slice(start) : src.slice(start, start + 1 + nextMethod);

  const sql = body.match(/`(INSERT INTO user_profiles[\s\S]*?updated_at = CURRENT_TIMESTAMP)`/)?.[1];
  if (!sql) {
    console.error("CONTROL FAILED: no profile UPSERT inside ensurePlanetaryAgent. Update this extractor.");
    process.exit(1);
  }
  // The point of this whole section: if ensurePlanetaryAgent's UPSERT does not classify,
  // say so precisely rather than reporting an extraction problem.
  if (!/monica_method/.test(sql)) {
    console.error(
      "FAIL: ensurePlanetaryAgent's profile UPSERT does not write monica_method.\n" +
        "      This is the path 370/370 real arrivals take, so every new agent\n" +
        "      lands unclassified and the nightly backfill papers over it.",
    );
    process.exit(1);
  }
  return sql;
}

const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
await client.connect();

let failures = 0;
const ok = (m) => console.log(`  ok   ${m}`);
const no = (m) => { console.error(`  FAIL ${m}`); failures++; };

const mkAgent = async (name) => {
  const id = randomUUID();
  const email = `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${id.slice(0, 8)}@agentic.alchm.kitchen`;
  await client.query(
    `INSERT INTO users (id, email, password_hash, role, is_active, email_verified, is_agent,
                        name, profile, preferences, login_count, created_at, updated_at)
     VALUES ($1,$2,'AGENT_NO_LOGIN','USER'::user_role,true,true,true,$3,$4,'{}'::jsonb,0,now(),now())`,
    [id, email, name, JSON.stringify({ email, isAgent: true, name })],
  );
  await client.query(`INSERT INTO user_profiles (user_id, name) VALUES ($1,$2)`, [id, name]);
  return id;
};

const classification = async (userId) => {
  const r = await client.query(
    `SELECT monica_method, monica_constant::text, monica_single::text,
            monica_two_body::text, monica_diurnal::text
       FROM user_profiles WHERE user_id = $1`,
    [userId],
  );
  return r.rows[0];
};

const SQL = syncDebitProfileSql();

// $8/$11/$12/$13 are the monica params; the rest mirror a metadata-less payload,
// which is exactly the case that was failing (agentProfile with no `name`).
const params = (userId, monica, method) => [
  userId, null, false, "{}", false, "[]", null,
  monica === null ? null : String(monica.combined),
  false, "{}",
  monica === null ? null : String(monica.diurnal),
  monica === null ? null : String(monica.nocturnal),
  method,
];

try {
  await client.query("BEGIN");

  const { agentMonicaWithMethod } = await import("../src/utils/agentMonicaResolver.ts");

  // ── 1. a Moon-phase agent (92 of the 110) ───────────────────────────────
  console.log("\n1. phase agent — the population that was dropped wholesale");
  const phaseName = "Moon Phase Waning Gibbous 284";
  const phaseResolved = agentMonicaWithMethod(phaseName);
  if (phaseResolved?.method === "two-body") ok(`${phaseName} resolves as two-body`);
  else no(`${phaseName} resolved as ${phaseResolved?.method ?? "NULL"}, expected two-body`);

  const phaseUser = await mkAgent(phaseName);
  await client.query(SQL, params(phaseUser, phaseResolved?.monica ?? null, phaseResolved?.method ?? null));
  const phase = await classification(phaseUser);
  if (phase.monica_method === "two-body") ok("stored monica_method = two-body");
  else no(`stored monica_method = ${phase.monica_method}, expected two-body`);
  if (phase.monica_two_body !== null) ok(`value in monica_two_body (${phase.monica_two_body})`);
  else no("monica_two_body is NULL — the value went somewhere else");
  if (phase.monica_constant === null) ok("monica_constant left NULL (single-body-only column)");
  else no(`monica_constant = ${phase.monica_constant}, must be NULL for two-body`);

  // ── 2. a single-body agent with NO name in the payload ──────────────────
  console.log("\n2. single-body agent, metadata-less — bug 1's exact case");
  const singleName = "Mercury Pisces 16";
  const singleResolved = agentMonicaWithMethod(singleName);
  if (singleResolved?.method === "single-body") ok(`${singleName} resolves as single-body`);
  else no(`${singleName} resolved as ${singleResolved?.method ?? "NULL"}`);

  const singleUser = await mkAgent(singleName);
  await client.query(SQL, params(singleUser, singleResolved?.monica ?? null, singleResolved?.method ?? null));
  const single = await classification(singleUser);
  if (single.monica_method === "single-body") ok("stored monica_method = single-body");
  else no(`stored monica_method = ${single.monica_method}`);
  if (single.monica_single !== null) ok(`value in monica_single (${single.monica_single})`);
  else no("monica_single is NULL — monica_method_matches_column would reject this");
  if (single.monica_constant !== null) ok("monica_constant also set (single-body only)");
  else no("monica_constant is NULL");

  // ── 3. an unresolvable name must stay NULL, not fabricate ───────────────
  console.log("\n3. unresolvable name");
  // NB: this used to be "Mars Gemini", which §18k k29 made RESOLVABLE (planet +
  // sign, degree supplied at the sign midpoint). A person's name is missing the
  // planet and the sign, so nothing constrains it and it must stay NULL.
  const oddUser = await mkAgent("Edgar Allan Poe");
  await client.query(SQL, params(oddUser, null, null));
  const odd = await classification(oddUser);
  if (odd.monica_method === null && odd.monica_single === null && odd.monica_two_body === null) {
    ok("left entirely NULL — no invented classification");
  } else no(`fabricated ${JSON.stringify(odd)}`);

  // ── 3b. THE ACTUAL PRODUCER ─────────────────────────────────────────────
  //
  // `[MEASURED 2026-07-29]` Sections 1-3 verify the two endpoints #666 believed
  // were the writers. They are not. Over seven days, 370 of 370 arrivals carry
  // `ensurePlanetaryAgent`'s fingerprint and 0 carry sync-debit's — so every assertion
  // above passed while every real arrival landed unclassified.
  //
  // The lesson is not that the gate was wrong. It executed real SQL against a
  // real database and reported honestly. It was POINTED AT THE WRONG STATEMENT,
  // and nothing in it could notice. Hence this section, and hence the assertion
  // at the end that the extractor still finds something.
  console.log("\n3b. ensurePlanetaryAgent — the path 370/370 real arrivals actually take");
  const ENSURE_SQL = ensureAgentProfileSql();
  const ensureParams = (userId, name, resolved) => [
    userId,
    name,
    resolved?.method ?? null,
    resolved?.monica.combined ?? null,
    resolved?.monica.diurnal ?? null,
    resolved?.monica.nocturnal ?? null,
  ];

  for (const [label, name, wantMethod] of [
    ["phase", "Moon Phase Full Moon 121", "two-body"],
    ["single-body", "Venus Taurus 12", "single-body"],
    ["person", "Edgar Allan Poe", null],
  ]) {
    // ensurePlanetaryAgent INSERTs the profile row itself, so unlike above there must be
    // no pre-existing row — that is the branch real arrivals take.
    const uid = randomUUID();
    const email = `ensure-${uid.slice(0, 8)}@agentic.alchm.kitchen`;
    await client.query(
      `INSERT INTO users (id, email, password_hash, role, is_active, email_verified, is_agent,
                          name, profile, preferences, login_count, created_at, updated_at)
       VALUES ($1,$2,'AGENT_NO_LOGIN','USER'::user_role,true,true,true,$3,$4,'{}'::jsonb,0,now(),now())`,
      [uid, email, name, JSON.stringify({ email, isAgent: true, name })],
    );
    await client.query(ENSURE_SQL, ensureParams(uid, name, agentMonicaWithMethod(name)));
    const got = await classification(uid);
    if (got.monica_method === wantMethod) {
      ok(`${label}: fresh INSERT classified as ${String(wantMethod)}`);
    } else {
      no(`${label}: expected method ${String(wantMethod)}, got ${JSON.stringify(got)}`);
    }

    // ON CONFLICT branch. The invariant is NOT "never writes again" — a row
    // still NULL must accept a later classification, which is how a resolver
    // improvement reaches rows already in the table. The invariant is that an
    // ALREADY-CLASSIFIED row is never re-classified. Re-run with a deliberately
    // DIFFERENT classification and require the right one of those two.
    const other = agentMonicaWithMethod("Sun Aries 5");
    await client.query(ENSURE_SQL, ensureParams(uid, name, other));
    const after = await classification(uid);
    if (wantMethod === null) {
      if (after.monica_method === "single-body") ok(`${label}: still-NULL row accepts a later classification`);
      else no(`${label}: still-NULL row refused a later classification — ${JSON.stringify(after)}`);
    } else if (after.monica_method === got.monica_method && after.monica_single === got.monica_single) {
      ok(`${label}: already-classified row is NOT re-classified`);
    } else {
      no(`${label}: re-classified ${JSON.stringify(got)} -> ${JSON.stringify(after)}`);
    }
  }

  // ── 4. CONTROL: the pre-fix shape must be REJECTED by the constraint ────
  // Without this, the assertions above could be passing for reasons unrelated to
  // the fix. This is the statement the old code effectively issued.
  console.log("\n4. control — the pre-fix write must violate the CHECK constraint");
  await client.query("SAVEPOINT ctl");
  try {
    await client.query(
      `UPDATE user_profiles SET monica_constant = $2::numeric, monica_method = 'single-body'
        WHERE user_id = $1`,
      [oddUser, "0.5"],
    );
    no("constraint did NOT reject monica_constant + single-body without monica_single");
    await client.query("ROLLBACK TO SAVEPOINT ctl");
  } catch (e) {
    await client.query("ROLLBACK TO SAVEPOINT ctl");
    if (e.code === "23514") ok(`rejected with ${e.code} (${e.constraint}) — the fix is load-bearing`);
    else no(`rejected with ${e.code}, expected 23514`);
  }
} catch (error) {
  console.error("\nunexpected error:", error?.message ?? error);
  failures++;
} finally {
  await client.query("ROLLBACK");
  await client.end();
}

console.log(
  failures === 0
    ? "\nPASS — agents leave the writer already classified, in the right column.\n"
    : `\nFAILED (${failures})\n`,
);
process.exit(failures === 0 ? 0 : 1);
