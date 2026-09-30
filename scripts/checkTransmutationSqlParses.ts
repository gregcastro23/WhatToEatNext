/**
 * PREPARE every Transmutation Circle statement against a real PostgreSQL.
 *
 * The same gate `checkEconomySqlParses.ts` runs for the token ledger, for the
 * statements in `src/services/transmutationQueries.ts`: PREPARE parses and
 * type-checks a statement and writes nothing. Unit tests mock the database,
 * and a mock accepts SQL no database would.
 *
 *   DATABASE_URL=… bun scripts/checkTransmutationSqlParses.ts
 *
 * On a database where migration 91 has not been applied yet, this prints an
 * explicit SKIP and exits 0 — the PR that adds the table must not fail its own
 * gate against a production database that cannot have it yet. It never
 * reports PASS without having prepared every statement.
 */
import pg from "pg";
import * as queries from "../src/services/transmutationQueries";

const fail = (msg: string): never => {
  console.error(`\n✗ ${msg}`);
  process.exit(1);
};

const url = process.env.DATABASE_PUBLIC_URL ?? process.env.DATABASE_URL;
if (!url) fail("no DATABASE_PUBLIC_URL / DATABASE_URL in the environment");

const UUID = "00000000-0000-0000-0000-000000000000";

interface Statement {
  label: string;
  sql: string;
  builder: string;
}

const statements: Statement[] = [
  {
    label: "insertOffer",
    builder: "insertOfferSql",
    sql: queries.insertOfferSql({
      makerId: UUID,
      counterpartyId: UUID,
      giveToken: "Spirit",
      giveAmount: 3,
      wantToken: "Essence",
      wantAmount: 2,
      message: "probe",
      replyToOfferId: UUID,
      idempotencyKey: "probe",
      ttlHours: 72,
    }).sql,
  },
  { label: "offerByIdempotencyKey", builder: "offerByIdempotencyKeySql", sql: queries.offerByIdempotencyKeySql(UUID, "k").sql },
  { label: "offerById", builder: "offerByIdSql", sql: queries.offerByIdSql(UUID).sql },
  { label: "lockOffer", builder: "lockOfferSql", sql: queries.lockOfferSql(UUID).sql },
  { label: "countLiveOffersByMaker", builder: "countLiveOffersByMakerSql", sql: queries.countLiveOffersByMakerSql(UUID).sql },
  {
    label: "fillOffer",
    builder: "fillOfferSql",
    sql: queries.fillOfferSql({ offerId: UUID, takerId: UUID, transactionGroupId: UUID }).sql,
  },
  // The actor column and status literal differ by kind: two statements.
  { label: "closeOffer(cancel)", builder: "closeOfferSql", sql: queries.closeOfferSql({ offerId: UUID, actorId: UUID, kind: "cancel" }).sql },
  { label: "closeOffer(decline)", builder: "closeOfferSql", sql: queries.closeOfferSql({ offerId: UUID, actorId: UUID, kind: "decline" }).sql },
  { label: "lockPairBalances", builder: "lockPairBalancesSql", sql: queries.lockPairBalancesSql(UUID, UUID).sql },
  { label: "participant", builder: "participantSql", sql: queries.participantSql(UUID).sql },
  { label: "participantByEmail", builder: "participantByEmailSql", sql: queries.participantByEmailSql("a@b.c").sql },
  { label: "blockedPair", builder: "blockedPairSql", sql: queries.blockedPairSql(UUID, UUID).sql },
  { label: "board", builder: "boardSql", sql: queries.boardSql({ viewerId: UUID, limit: 10 }).sql },
  { label: "makerOffers", builder: "makerOffersSql", sql: queries.makerOffersSql({ makerId: UUID, limit: 10 }).sql },
  { label: "tradeStats", builder: "tradeStatsSql", sql: queries.tradeStatsSql(UUID).sql },
  { label: "circleActivity", builder: "circleActivitySql", sql: queries.circleActivitySql().sql },
];

const EXPECTED_TOTAL = 16;

const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
await client.connect();

try {
  const present = await client.query<{ reg: string | null }>(
    "SELECT to_regclass('public.transmutation_offers')::text AS reg",
  );
  if (!present.rows[0]?.reg) {
    console.log(
      "SKIP — transmutation_offers does not exist on this database (migration 91 " +
        "not applied). No statement was prepared; this is NOT a pass.",
    );
    process.exit(0);
  }

  // Control 1: PREPARE really rejects bad SQL.
  let controlCaught = false;
  try {
    await client.query("PREPARE _tgate_control AS SELECT no_such_column FROM transmutation_offers");
  } catch {
    controlCaught = true;
  }
  if (!controlCaught) fail("CONTROL FAILED: PREPARE accepted a statement it should reject");

  // Control 2: every exported builder is exercised.
  const exported = Object.entries(queries)
    .filter(([, value]) => typeof value === "function")
    .map(([name]) => name);
  const covered = new Set(statements.map((s) => s.builder));
  const ungated = exported.filter((name) => !covered.has(name));
  if (ungated.length > 0) fail(`CONTROL FAILED: never PREPAREd: ${ungated.join(", ")}`);

  // Control 3: the statement count has not silently shrunk.
  if (statements.length !== EXPECTED_TOTAL) {
    fail(`CONTROL FAILED: expected ${EXPECTED_TOTAL} statements, built ${statements.length}`);
  }

  let failures = 0;
  for (const { label, sql } of statements) {
    const name = `_tgate_${label.replace(/[^a-z0-9]/gi, "_")}`.toLowerCase();
    try {
      await client.query(`PREPARE ${name} AS ${sql}`);
      await client.query(`DEALLOCATE ${name}`);
      console.log(`✓ ${label} prepares`);
    } catch (error) {
      failures++;
      const err = error as { code?: string; message?: string };
      console.error(`✗ ${label} FAILED TO PREPARE — ${err.code ?? ""} ${err.message ?? String(error)}`);
    }
  }
  if (failures > 0) fail(`${failures} of ${statements.length} transmutation statements cannot be prepared`);
  console.log(`\n✓ all ${statements.length} transmutation statements parse and type-check against PostgreSQL`);
} finally {
  await client.end();
}
