// Behaviour of the admin welcome-grant indicator, against a real PostgreSQL,
// in a transaction that is ALWAYS rolled back.
//
// ── Why this exists ─────────────────────────────────────────────────────────
//
// `welcomeGrantCoverageSql` used to match only `source_type = 'signup_grant'`.
// `[MEASURED 2026-08-13]` against production that made the panel read a
// permanent, un-clearable `1`: the synthetic monitoring account holds its
// welcome grant under the older spelling `initial_grant` (4 × 500, written
// 2026-05-25 01:12:29Z). Across all 14 `is_agent IS NOT TRUE` rows the split
// was signup-only 13 / initial-only 1 / both 0 / NEITHER 0 — so every non-agent
// user had in fact been granted, and the indicator was simply wrong.
//
// The fix widens the NOT EXISTS to accept either spelling. That STRICTLY
// NARROWS what the check counts, which is indistinguishable from deleting the
// check unless the check is still shown to fire. Hence this file: every case
// below that must still count is asserted, and each assertion is then re-run
// against a deliberately BROKEN copy of the statement to prove the assertion
// can fail. A control that cannot fail proves nothing.
//
// The statement comes from `src/services/tokenEconomyQueries.ts` by IMPORT, so
// this exercises exactly what ships rather than a hand copy that can drift.
//
//   railway run --service Postgres -- bun scripts/checkWelcomeGrantCoverageBehaviour.mjs
//   DATABASE_PUBLIC_URL="$PROD_URL" bun scripts/checkWelcomeGrantCoverageBehaviour.mjs
import { randomUUID } from "node:crypto";
import pg from "pg";
import {
  welcomeGrantCoverageSql,
  welcomeGrantMissingUsersSql,
} from "../src/services/tokenEconomyQueries.ts";

const c = new pg.Client({
  connectionString: process.env.DATABASE_PUBLIC_URL,
  ssl: { rejectUnauthorized: false },
});
await c.connect();

let bad = 0;
const ok = (m) => console.log(`  ok   ${m}`);
const no = (m) => {
  console.error(`  FAIL ${m}`);
  bad++;
};

const SHIPPED = welcomeGrantCoverageSql().sql;

/** Run a statement and return its `humans_without_grant`. */
const countWith = async (sql) => Number((await c.query(sql)).rows[0].humans_without_grant);

/**
 * Insert a user with an explicit `is_agent`.
 *
 * `clock_timestamp()` rather than `now()`: `now()` is the TRANSACTION start
 * time, so every user inserted below would share one `created_at` to the
 * microsecond and the roster's `ORDER BY created_at DESC` would be untestable
 * — the newest-first assertion would pass on any ordering at all.
 */
const mkUser = async (isAgent) => {
  const id = randomUUID();
  await c.query(
    `INSERT INTO users (id, email, password_hash, role, is_active, email_verified, is_agent,
                        name, profile, preferences, login_count, created_at, updated_at)
     VALUES ($1,$2,'NO_LOGIN','USER'::user_role,true,true,$3,'probe','{}'::jsonb,'{}'::jsonb,0,
             clock_timestamp(), clock_timestamp())`,
    [id, `wgc-${id}@example.invalid`, isAgent],
  );
  return id;
};

/** Give a user a 4-axis grant under `sourceType`, the way a real grant lands. */
const grant = async (userId, sourceType, amount = 15) => {
  const group = randomUUID();
  for (const tokenType of ["Spirit", "Essence", "Matter", "Substance"]) {
    await c.query(
      `INSERT INTO token_transactions
         (transaction_group_id, user_id, token_type, amount, source_type,
          description, idempotency_key, created_at)
       VALUES ($1,$2,$3,$4,$5,'probe grant',$6, now())`,
      [group, userId, tokenType, amount, sourceType, `wgc:${userId}:${tokenType}`],
    );
  }
};

/**
 * The mutants: the shipped statement with ONE operand broken each. Defined up
 * front because each needs its OWN pre-insert baseline — a mutant that
 * re-introduces the bug also counts production's real ungranted rows, so
 * comparing it to the shipped statement's baseline would mis-predict it.
 *
 * `delta` is how many of the seven users inserted below that mutant must count,
 * which is a fact about the predicate alone and cannot move with the data.
 */
const MUTANTS = [
  {
    label: "NOT EXISTS removed entirely (the check deleted)",
    sql: SHIPPED.replace(/AND NOT EXISTS \([\s\S]*\)$/, ""),
    delta: 5,
    why: "counts all 5 inserted non-agents, granted or not",
  },
  {
    label: "is_agent operand removed (agents leak in)",
    sql: SHIPPED.replace(/u\.is_agent IS NOT TRUE\s*AND\s+/, ""),
    delta: 3,
    why: "counts the grantless agent alongside the 2 grantless non-agents",
  },
  {
    label: "initial_grant dropped (the original bug, re-introduced)",
    sql: SHIPPED.replace("IN ('signup_grant', 'initial_grant')", "= 'signup_grant'"),
    delta: 3,
    why: "counts the initial_grant holder alongside the 2 grantless non-agents",
  },
];

await c.query("BEGIN");
try {
  // Baselines inside the transaction, BEFORE any inserts. Every later assertion
  // is a DELTA against these, so the gate is independent of how production's
  // real numbers move.
  const base = await countWith(SHIPPED);
  for (const m of MUTANTS) {
    if (m.sql === SHIPPED) {
      no(`mutant did not apply — the statement text changed shape: ${m.label}`);
      m.base = null;
    } else {
      m.base = await countWith(m.sql);
    }
  }
  console.log(`\nbaseline humans_without_grant (production, in-txn): ${base}\n`);

  // Each case asserts only its OWN effect on the count: `prev` is re-synced to
  // what was actually observed, so one broken case reports once instead of
  // cascading into every assertion after it.
  let prev = base;
  const asserts = async (rise, pass, fail) => {
    const now = await countWith(SHIPPED);
    now === prev + rise ? ok(pass) : no(`${fail} (count ${prev} → ${now})`);
    prev = now;
  };

  // ── The cases that must still COUNT — the check is not deleted ────────────
  console.log("must still be counted:");

  const plainHuman = await mkUser(false); // no ledger rows at all
  await asserts(
    1,
    "a non-agent user with no grant of any spelling counts",
    "a genuinely grantless human was NOT counted — the check is dead",
  );

  // A user whose only ledger rows are NON-grant sources is still ungranted.
  const yieldOnly = await mkUser(false);
  await grant(yieldOnly, "agents_yield");
  await asserts(
    1,
    "a user holding only non-grant ledger rows still counts",
    "an unrelated source_type was mistaken for a welcome grant",
  );

  // ── The cases that must NOT count ────────────────────────────────────────
  console.log("\nmust not be counted:");

  const signupGranted = await mkUser(false);
  await grant(signupGranted, "signup_grant");
  await asserts(
    0,
    "a user with signup_grant is covered",
    "a signup_grant holder was counted as ungranted",
  );

  const initialGranted = await mkUser(false);
  await grant(initialGranted, "initial_grant", 500);
  await asserts(
    0,
    "a user with initial_grant is covered — the reported-2026-08-13 case",
    "an initial_grant holder was counted — the permanent-alarm bug is back",
  );

  const grantlessAgent = await mkUser(true);
  await asserts(
    0,
    "a grantless agent is not counted — agents get no welcome grant",
    "an agent leaked into the human count",
  );

  // A single axis is enough to prove a grant was attempted; the indicator asks
  // "did the grant path run", not "did it write all four rows".
  const partial = await mkUser(false);
  await c.query(
    `INSERT INTO token_transactions
       (transaction_group_id, user_id, token_type, amount, source_type, description, created_at)
     VALUES ($1,$2,'Spirit',15,'signup_grant','probe partial', now())`,
    [randomUUID(), partial],
  );
  await asserts(
    0,
    "one grant row is enough to clear the check (presence, not completeness)",
    "a partially-granted user changed the count unexpectedly",
  );

  // ── Why there is no NULL-`is_agent` case ─────────────────────────────────
  // The predicate says `IS NOT TRUE` rather than `= false`, which reads as
  // tri-state defensiveness. It is not load-bearing: `users.is_agent` is NOT
  // NULL with default false, so the two forms are equivalent over every row
  // that can exist and no mutation control could tell them apart. Asserted
  // rather than assumed — if the column ever becomes nullable, this fails and
  // a NULL-`is_agent` case must be added above.
  console.log("\nschema assumption behind the omitted tri-state case:");
  const isAgentNullable = (
    await c.query(
      `SELECT is_nullable FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'is_agent'`,
    )
  ).rows[0]?.is_nullable;
  isAgentNullable === "NO"
    ? ok("users.is_agent is NOT NULL — a NULL-is_agent human cannot exist")
    : no(
        `users.is_agent is now nullable (${isAgentNullable}) — the tri-state ` +
          "case became reachable and this gate no longer covers it",
      );

  // ── The roster names EXACTLY who the count counts ────────────────────────
  // The panel now prints identities beside the number. A count and a list built
  // from two copies of a predicate can disagree, and the disagreement is
  // invisible from either side alone — "3 missing" over a list of 2 names is a
  // bug an operator has to debug instead of act on. They share one FROM/WHERE
  // string in `tokenEconomyQueries.ts` so they CANNOT drift; this proves the
  // property behaviourally rather than trusting that reading.
  console.log("\ncount ↔ roster agreement:");

  const roster = async (sql, values) => (await c.query(sql, values)).rows;
  const total = await countWith(SHIPPED);

  // A cap above the count cannot bite, so cardinality is a real comparison.
  const full = welcomeGrantMissingUsersSql(total + 5);
  const allRows = await roster(full.sql, full.values);
  allRows.length === total
    ? ok(`roster returns ${allRows.length} rows for a count of ${total}`)
    : no(
        `roster returned ${allRows.length} rows but the count says ${total} — ` +
          "the panel would print a number its own list contradicts",
      );

  // Cardinality alone is not set equality: two different sets of the same size
  // would pass the check above. Name the users that must and must not appear.
  const named = new Set(allRows.map((r) => String(r.id)));
  for (const [id, label] of [
    [plainHuman, "the grantless human"],
    [yieldOnly, "the user holding only non-grant ledger rows"],
  ]) {
    named.has(id)
      ? ok(`roster names ${label}`)
      : no(`roster OMITS ${label} the count counts — the list is not the set`);
  }
  for (const [id, label] of [
    [signupGranted, "the signup_grant holder"],
    [initialGranted, "the initial_grant holder"],
    [grantlessAgent, "the grantless agent"],
    [partial, "the partially-granted user"],
  ]) {
    named.has(id)
      ? no(`roster NAMES ${label}, whom the count excludes — a false accusation`)
      : ok(`roster excludes ${label}`);
  }

  // Truncation must take the NEWEST, not an arbitrary page: under a cap the
  // operator sees only these, and the newest miss is the one whose grant path
  // just failed. `yieldOnly` was inserted after `plainHuman`, and both are
  // newer than anything in production.
  const one = welcomeGrantMissingUsersSql(1);
  const topRow = (await roster(one.sql, one.values))[0];
  String(topRow?.id) === yieldOnly
    ? ok("LIMIT 1 returns the newest ungranted user, not an arbitrary one")
    : no(
        `LIMIT 1 returned ${topRow?.id ?? "nothing"}, expected the newest ` +
          `ungranted user ${yieldOnly} — ORDER BY is not doing its job`,
      );

  // The projection must carry what the panel renders. A NULL email is allowed
  // (the panel falls back to the id); a MISSING column is not.
  const cols = Object.keys(topRow ?? {}).sort().join(",");
  cols === "created_at,email,id"
    ? ok("roster projects id + email + created_at, as the panel expects")
    : no(`roster projects "${cols}" — the panel reads id, email, created_at`);

  // ── Mutation control for the roster ──────────────────────────────────────
  // The agreement assertions above are only worth their output if they can
  // fail. Drop the agent filter from the ROSTER alone: it then names the
  // grantless agent, which the count still excludes.
  const skewed = full.sql.replace(/u\.is_agent IS NOT TRUE\s*AND\s+/, "");
  if (skewed === full.sql) {
    no("roster mutant did not apply — the statement text changed shape");
  } else {
    const skewedRows = await roster(skewed, full.values);
    const skewedIds = new Set(skewedRows.map((r) => String(r.id)));
    skewedRows.length !== total && skewedIds.has(grantlessAgent)
      ? ok(
          `roster with the is_agent filter removed returns ${skewedRows.length} ` +
            `vs the count's ${total} and names the agent — the agreement ` +
            "assertions above can fail",
        )
      : no(
          `roster mutant returned ${skewedRows.length} rows vs count ${total}; ` +
            "it is indistinguishable from the shipped roster, so the agreement " +
            "assertions prove nothing",
        );
  }

  // ── Mutation controls ────────────────────────────────────────────────────
  // The shipped statement counted 2 of the 7 users inserted above. Each mutant
  // must count a DIFFERENT number — if one lands on 2 as well, the assertions
  // above cannot distinguish it from the real statement and prove nothing.
  console.log("\nmutation controls (each must disagree with the shipped 2):");
  const shippedDelta = (await countWith(SHIPPED)) - base;

  for (const m of MUTANTS) {
    if (m.base === null) continue; // already reported as non-applying
    const delta = (await countWith(m.sql)) - m.base;
    if (delta === shippedDelta) {
      no(
        `${m.label} → counted ${delta}, same as the shipped statement; ` +
          "the corresponding assertion cannot fail and proves nothing",
      );
    } else if (delta !== m.delta) {
      no(`${m.label} → counted ${delta}, expected ${m.delta} (${m.why})`);
    } else {
      ok(`${m.label} → counted ${delta} vs shipped ${shippedDelta} (${m.why})`);
    }
  }
} finally {
  await c.query("ROLLBACK");
  await c.end();
}

console.log(
  bad === 0
    ? "\nPASS — the welcome-grant indicator counts real misses and forgives both grant spellings (rolled back)\n"
    : `\nFAILED: ${bad}\n`,
);
process.exit(bad === 0 ? 0 : 1);
