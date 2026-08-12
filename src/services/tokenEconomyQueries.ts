/**
 * Token Economy SQL — every statement `TokenEconomyService` sends to PostgreSQL.
 *
 * @file src/services/tokenEconomyQueries.ts
 *
 * ── Why this file is separate, and why it must stay dependency-free ─────────
 *
 * SQL is a second language in this codebase, and only a database can typecheck
 * it. `[MEASURED 2026-07-26]` a credit statement shipped that PostgreSQL would
 * not even PREPARE (`42P08 inconsistent types deduced for parameter $4`), while
 * thirteen unit tests covering that exact path passed — because they mock the
 * database, and a mock will happily "run" SQL no database will accept.
 *
 * `scripts/checkEconomySqlParses.ts` closes that hole by PREPARing every
 * statement against a real PostgreSQL. For it to check what actually SHIPS
 * rather than a hand copy, it has to obtain the SQL from this module directly.
 * It used to scrape the statements out of the service with regexes, which drift
 * silently the moment anything is reformatted.
 *
 * So this module has ZERO runtime imports. Not the database module, not the
 * logger, not `@/types/economy`. `TokenEconomyService.ts` instantiates a service
 * and lazily pulls in a database connection at import time; a gate that imported
 * it would trigger all of that just to read a string. Keeping this file inert
 * means the gate can `import` it with no side effects at all.
 *
 * Anything added here must remain a pure function from arguments to SQL.
 */

/** The four ESMS axes, as `token_balances` column names. Constrained union
 *  literals, never user input — which is what makes interpolating them into
 *  the statements below injection-safe. */
export type AxisColumn = "spirit" | "essence" | "matter" | "substance";

/** The same four axes as written in `token_transactions.token_type`. Declared
 *  here rather than imported from `@/types/economy` to keep this module free of
 *  runtime imports; it is structurally identical to `TokenType`. */
export type TokenTypeName = "Spirit" | "Essence" | "Matter" | "Substance";

/** The balance column a token type is stored in.
 *
 *  The builders derive this rather than accepting a column AND a token type as
 *  separate arguments. Two arguments that must agree can disagree: passing
 *  `"spirit"` with `"Essence"` would write an Essence ledger row while moving
 *  the spirit balance, and every type check would pass. One argument makes that
 *  unrepresentable. */
export const columnFor = (tokenType: TokenTypeName): AxisColumn =>
  tokenType.toLowerCase() as AxisColumn;

/** The four axes in the order every multi-axis grant writes them. */
export const TOKEN_TYPES: readonly TokenTypeName[] = [
  "Spirit",
  "Essence",
  "Matter",
  "Substance",
];

/** Welcome grant: what every new user starts with, on each axis. */
export const SIGNUP_GRANT_PER_TOKEN = 15;

/**
 * The idempotency key for one axis of a user's welcome grant.
 *
 * `[MEASURED 2026-08-10]` 6 of 14 human signups held no grant, because the
 * grant lived in exactly one of the THREE code paths that create a user. The
 * fix seeds it inside `createUser` itself, which means two independent
 * producers now write these rows: `createUser` (in the same transaction as the
 * user) and `grantSignupBonus` (the self-heal for users who predate that).
 *
 * Two producers agreeing on a key by writing the same string literal twice is
 * exactly how a double-credit ships — the `ON CONFLICT (idempotency_key) DO
 * NOTHING` that makes the grant replay-safe only works if both sides spell the
 * key identically. So both derive it from here, and a test asserts they agree.
 */
export const signupGrantIdempotencyKey = (
  userId: string,
  tokenType: TokenTypeName,
): string => `signup_grant:${userId}:${tokenType}`;

/** Amounts across all four axes, for the multi-axis statements. */
export interface AxisAmounts {
  spirit: number;
  essence: number;
  matter: number;
  substance: number;
}

/** A statement and the positional parameters it was built with. Returning the
 *  two together is the point: a hand-maintained array beside a hand-numbered
 *  `$n` is a silent-failure shape — swap two same-typed arguments and every
 *  type check still passes while the wrong value lands in the wrong column. */
export interface BuiltQuery {
  sql: string;
  values: unknown[];
}

/** Source types that are once-per-user-per-UTC-day BY DEFINITION. Only these
 *  get a `yield_day`, and only these are covered by
 *  `uniq_daily_yield_per_user_day`. Everything else — Sky Drops, transit
 *  attunement — is legitimately multi-per-day and must stay unconstrained.
 *
 *  Exported because `/api/economy/sync-credit` needs the SAME list to decide
 *  whether a credit is daily-yield. It used to declare its own copy; if the two
 *  drifted, the route's guard and the partial unique index that enforces it
 *  would disagree — which is precisely the shape of the original double-credit
 *  bug. One list, one meaning. */
export const DAILY_YIELD_SOURCES = ["agents_yield", "daily_yield"] as const;

/** The same list as a SQL literal, so the writer and the partial index in
 *  `database/init/73-daily-yield-once-per-day.sql` cannot drift apart. If they
 *  do, rows get a yield_day the index ignores (or vice versa) and the guard
 *  silently stops guarding. */
const DAILY_YIELD_SOURCES_SQL = DAILY_YIELD_SOURCES.map((s) => `'${s}'`).join(
  ", ",
);

/**
 * Collects positional parameters and hands back the `$n` token for each.
 *
 * The statements below are assembled from two call sites with DIFFERENT
 * parameter numbering: a generic spend binds its source type, while a premium
 * purchase writes the literal `'premium_purchase'` and therefore consumes one
 * fewer slot — every parameter after it shifts down by one. That is not a
 * uniform offset, so a `startIndex` argument could not express it; the
 * collector can, because a value that becomes a literal simply never calls
 * `add()` and never takes a number.
 *
 * It also makes the values array a RESULT rather than a parallel artifact the
 * caller has to keep in sync by hand.
 */
class QueryParams {
  private readonly collected: unknown[] = [];

  /** Record a value and return the `$n` placeholder that now refers to it. */
  add(value: unknown): string {
    this.collected.push(value);
    return `$${this.collected.length}`;
  }

  /** The values, in binding order. Copied so the built query cannot be mutated
   *  through a reference the builder still holds. */
  get values(): unknown[] {
    return [...this.collected];
  }
}

// ─── Balances ─────────────────────────────────────────────────────────

/**
 * Insert-or-return the balance row, as ONE statement.
 *
 * `DO UPDATE` rather than `DO NOTHING` is what makes it return the row whether
 * it was just created or already existed: `RETURNING` yields nothing for a
 * conflicting row under DO NOTHING, so the ensure and the read have to be the
 * same statement to be both atomic and readable. The SET is deliberately a
 * no-op write of the column's own value — nothing about the row should change.
 *
 * This replaces `INSERT …; SELECT …` sent as ONE string with a bind parameter,
 * which PostgreSQL rejects outright: `[MEASURED 2026-07-27]` against production
 * it throws `42601 cannot insert multiple commands into a prepared statement`.
 * The extended query protocol permits exactly one command per parameterised
 * message. So EVERY balance read raised, was swallowed by the catch, and
 * silently took the two-query fallback: correct results, an exception per call,
 * and a "primary" path that had never once run.
 *
 */
export function getBalancesSql(userId: string): BuiltQuery {
  const p = new QueryParams();
  const user = p.add(userId);
  return {
    sql: `INSERT INTO token_balances (user_id) VALUES (${user})
           ON CONFLICT (user_id) DO UPDATE SET updated_at = token_balances.updated_at
           RETURNING *`,
    values: p.values,
  };
}

// ─── Single-axis credit / debit ───────────────────────────────────────

// Single-statement credit: insert an immutable ledger entry (idempotency-guarded)
// and apply the delta to the typed column, atomically.
//
// ── Why the balance write is an UPSERT and not an UPDATE ────────────────────
//
// It used to be an `UPDATE token_balances … WHERE user_id = $1` preceded by an
// `ensure_balance` CTE that INSERTed the row. That silently lost every user's
// FIRST-EVER credit. In a data-modifying CTE, every sub-statement AND the main
// query run against ONE snapshot taken before the statement begins, so the
// UPDATE could not see the row `ensure_balance` had just inserted: the ledger
// row committed, the UPDATE matched ZERO rows, and the balance never moved.
//
// It failed silently because `creditMultipleTokens` only assigns `last` when
// `res.rows.length > 0`. Spirit returning nothing just left `last` null, Essence
// then set it, and the endpoint returned 200 with a balances object.
//
// `[MEASURED 2026-07-26 on production]` 67 users, 521.7141 Spirit. For 67 of 67
// the shortfall equals that user's FIRST ledger row, and all 67 are
// auto-provisioned agents — human signup seeds `token_balances` in its own
// statement, so the row pre-existed and the UPDATE landed. Spirit is simply the
// first of the four axes written, so it is the only one that ever meets the
// missing-row state; Essence/Matter/Substance always found the row and
// reconciled EXACTLY, which is why only Spirit looked wrong.
//
// The upsert has no such ordering hazard: with no row it INSERTs the credited
// amount (the other three axes default to 0), and with a row it adds the delta
// under `ON CONFLICT`. Idempotency is preserved because `SELECT … FROM inserted`
// yields no row when the ledger insert was suppressed, so nothing is written.
//
// ── Why $4 is cast to text in BOTH of its references ────────────────────────
//
// A bind parameter has exactly ONE deduced type. $4 is bound as the INSERT value
// for `source_type` (character varying) and is also compared against the string
// literals in the CASE, which deduce `text`. Left uncast, PostgreSQL refuses to
// prepare the statement at all:
//
//     42P08  inconsistent types deduced for parameter $4
//
// and every credit throws. Casting only the comparison side does NOT fix it —
// the INSERT target still deduces varchar. Both references must agree; text ->
// varchar is an assignment cast, so pinning both to text is safe.
//
// This shipped to production once. Thirteen unit tests covered the path and all
// passed, because they mock the database — a mock accepts SQL no database will.
// `scripts/checkEconomySqlParses.ts` now PREPAREs every variant against a real
// PostgreSQL in CI, which is the only thing that can catch this class.
//
// `yield_day` is computed IN THE DATABASE from `now()`, not passed in from the
// caller. That matters: the whole point is a day key the application cannot get
// wrong or disagree with itself about, and two producers running in different
// timezones (or one of them holding a stale clock) is precisely how the
// original double-credit arose. It is NULL for every non-daily-yield source, so
// those rows do not participate in the unique index at all.
export function creditTokensSql(opts: {
  userId: string;
  tokenType: TokenTypeName;
  amount: number;
  sourceType: string;
  sourceId: string | null;
  description: string | null;
  transactionGroupId: string | null;
  idempotencyKey: string | null;
}): BuiltQuery {
  const column = columnFor(opts.tokenType);
  const p = new QueryParams();

  const user = p.add(opts.userId);
  const tokenType = p.add(opts.tokenType);
  const amount = p.add(opts.amount);
  const sourceType = p.add(opts.sourceType);
  const sourceId = p.add(opts.sourceId);
  const description = p.add(opts.description);
  const group = p.add(opts.transactionGroupId);
  const idem = p.add(opts.idempotencyKey);

  const sql = `WITH inserted AS (
            INSERT INTO token_transactions
              (transaction_group_id, user_id, token_type, amount, source_type, source_id, description, idempotency_key, yield_day)
            VALUES
              (COALESCE(${group}::uuid, uuid_generate_v4()), ${user}, ${tokenType}, ${amount}, ${sourceType}::text, ${sourceId}, ${description}, ${idem},
               CASE WHEN ${sourceType}::text IN (${DAILY_YIELD_SOURCES_SQL})
                    THEN (now() AT TIME ZONE 'UTC')::date
                    ELSE NULL END)
            ON CONFLICT (idempotency_key) DO NOTHING
            RETURNING id
          )
          INSERT INTO token_balances (user_id, ${column}, updated_at)
          SELECT ${user}, ${amount}, now() FROM inserted
          ON CONFLICT (user_id) DO UPDATE
            SET ${column} = token_balances.${column} + EXCLUDED.${column},
                updated_at = now()
          RETURNING *`;

  return { sql, values: p.values };
}

// Single-statement debit: check the balance, write the ledger entry only if the
// funds are there, and apply the delta — atomically.
//
// ── Why this one is NOT an upsert, unlike the credit above ──────────────────
//
// This statement also used to open with an `ensure_balance` INSERT, which was
// inert for exactly the reason described above the credit builder: no other
// sub-statement could see the row it created. Removing it changes nothing, and
// leaving it in read as a safeguard that was never operating.
//
// It must NOT become `INSERT … ON CONFLICT DO UPDATE`. `[MEASURED 2026-07-27]`
// against production, in a rolled-back transaction: an upsert-shaped debit of 25
// against a user with NO balance row produces `spirit = -25.0000` — it lets
// someone spend tokens they never had. The `check_balance` CTE is what makes this
// fail CLOSED: with no row it selects nothing, the ledger insert selects FROM it
// and writes nothing, the UPDATE matches nothing, and the caller reads "0 rows"
// as insufficient balance. Verified in the same run: the guarded shape touched 0
// rows and created no balance.
//
// The asymmetry is the point. A credit for a missing row SHOULD create it; a debit
// for a missing row should refuse.
//
// This is no longer guarded only by this comment: `checkEconomyStatementBehaviour`
// asserts, for EVERY debit-side builder, that a debit against a user with no
// balance row writes nothing and conjures no row. That catches a regression by
// its effect, whichever shape the SQL is rewritten into.
export function debitTokensSql(opts: {
  userId: string;
  tokenType: TokenTypeName;
  amount: number;
  sourceType: string;
  sourceId: string | null;
  transactionGroupId: string | null;
  description: string | null;
}): BuiltQuery {
  const column = columnFor(opts.tokenType);
  const p = new QueryParams();

  const user = p.add(opts.userId);
  const tokenType = p.add(opts.tokenType);
  const amount = p.add(opts.amount);
  const sourceType = p.add(opts.sourceType);
  const sourceId = p.add(opts.sourceId);
  const group = p.add(opts.transactionGroupId);
  const description = p.add(opts.description);

  const sql = `WITH check_balance AS (
            SELECT ${column} AS current_balance FROM token_balances WHERE user_id = ${user}
          ),
          inserted AS (
            INSERT INTO token_transactions
              (transaction_group_id, user_id, token_type, amount, source_type, source_id, description)
            SELECT COALESCE(${group}::uuid, uuid_generate_v4()), ${user}, ${tokenType}, -${amount}::numeric, ${sourceType}::text, ${sourceId}, ${description}
            FROM check_balance
            WHERE current_balance >= ${amount}::numeric
            RETURNING id
          )
          UPDATE token_balances
          SET ${column} = ${column} - ${amount}::numeric,
              updated_at = now()
          WHERE user_id = ${user}
            AND EXISTS (SELECT 1 FROM inserted)
          RETURNING *`;

  return { sql, values: p.values };
}

// ─── Multi-axis debit (spend / premium purchase) ──────────────────────

/**
 * What a multi-axis debit is FOR. A generic spend binds its own `source_type`;
 * a premium purchase writes the literal `'premium_purchase'` and additionally
 * records a `user_purchases` row.
 */
export type DebitAllIntent =
  | {
      kind: "spend";
      /** Bound as $6 — the caller's `TransactionSourceType`. */
      sourceType: string;
      sourceId: string | null;
    }
  | {
      kind: "purchase";
      /** The `shop_items.id`. Doubles as `source_id` and as the FK on
       *  `user_purchases.shop_item_id`, so it occupies a single slot. */
      shopItemId: string;
    };

/**
 * Debit all four axes at once, atomically, and refuse entirely unless EVERY
 * axis can cover its share.
 *
 * ── Why one builder for two statements ──────────────────────────────────────
 *
 * The spend and premium-purchase statements were ~40 duplicated lines apart,
 * differing only in the source type, an extra `purchase` CTE, and the final
 * projection. Duplicated money SQL is how two statements drift into disagreeing
 * about the same invariant.
 *
 * `scripts/checkEconomyStatementBehaviour.mjs` asserts that this builder's
 * output is byte-identical (modulo SQL comments, which the lexer discards) to
 * the two inline statements it replaced — so the unification provably changed
 * no semantics, only the number of places the SQL is written down.
 *
 * ── Why it is NOT an upsert ─────────────────────────────────────────────────
 *
 * `balance_check` selects the row only when all four axes are sufficient. Every
 * ledger INSERT selects FROM it, and the UPDATE joins it, so an underfunded or
 * absent user writes nothing at all and the caller reads 0 rows as a refusal.
 * See `debitTokensSql` for the production measurement showing what an
 * upsert-shaped debit does instead (`spirit = -25.0000`).
 *
 * ── Why there is no `ensure_balance` CTE ────────────────────────────────────
 *
 * There used to be. It could not be seen by any other sub-statement — one
 * snapshot per statement — so it never protected anything, and it is
 * `balance_check` that makes this fail closed for a user with no row.
 */
export function debitAllTokensSql(opts: {
  userId: string;
  amounts: AxisAmounts;
  description: string | null;
  /** Prefix only. Each axis appends `:<TokenType>` so the unique index on
   *  `token_transactions.idempotency_key` catches a concurrent duplicate that
   *  slips past any application-level pre-check. Null disables the guard. */
  idempotencyKey: string | null;
  intent: DebitAllIntent;
}): BuiltQuery {
  const p = new QueryParams();

  const user = p.add(opts.userId);
  const spirit = p.add(opts.amounts.spirit);
  const essence = p.add(opts.amounts.essence);
  const matter = p.add(opts.amounts.matter);
  const substance = p.add(opts.amounts.substance);

  // A purchase writes the source type as a literal, so it consumes no slot and
  // every parameter after it shifts down by one. This is the whole reason the
  // numbering is collected rather than hand-written.
  //
  // Narrowed on `intent.kind` rather than a precomputed boolean: a boolean does
  // not narrow a discriminated union, and the order of these `add` calls IS the
  // parameter order, so they must stay as written.
  const intent = opts.intent;
  const isPurchase = intent.kind === "purchase";
  const sourceType =
    intent.kind === "purchase"
      ? "'premium_purchase'"
      : p.add(intent.sourceType);
  const sourceId =
    intent.kind === "purchase" ? p.add(intent.shopItemId) : p.add(intent.sourceId);
  const description = p.add(opts.description);
  const idem = p.add(opts.idempotencyKey);

  // An explicit ordered list, not an object: the axis order determines the CTE
  // order in the emitted SQL, and that should not rest on object key-ordering
  // rules.
  const axes: ReadonlyArray<readonly [string, string]> = [
    ["Spirit", spirit],
    ["Essence", essence],
    ["Matter", matter],
    ["Substance", substance],
  ];

  // One CTE per axis. Each is skipped when its amount is 0, so a single-axis
  // spend does not write three empty ledger rows.
  const debits = axes
    .map(
      ([tokenType, amount]) => `          debit_${tokenType.toLowerCase()} AS (
            INSERT INTO token_transactions (transaction_group_id, user_id, token_type, amount, source_type, source_id, description, idempotency_key)
            SELECT g.gid, ${user}, '${tokenType}', -${amount}, ${sourceType}, ${sourceId}, ${description},
                   CASE WHEN ${idem}::text IS NOT NULL THEN ${idem} || ':${tokenType}' ELSE NULL END
            FROM balance_check bc, new_group g
            WHERE ${amount} > 0
            RETURNING id
          ),`,
    )
    .join("\n");

  // Recording the purchase is the only structural difference between the two
  // statements. It selects FROM `updated`, so a refused debit writes no
  // `user_purchases` row either.
  const purchaseCte = isPurchase
    ? `,
          purchase AS (
            INSERT INTO user_purchases (user_id, shop_item_id, transaction_group_id)
            SELECT ${user}, ${sourceId}::uuid, g.gid FROM updated u, new_group g
            RETURNING transaction_group_id
          )`
    : "";

  const projection = isPurchase
    ? `          SELECT u.*, p.transaction_group_id AS txn_group_id
          FROM updated u, purchase p`
    : `          SELECT u.*, g.gid AS txn_group_id FROM updated u, new_group g`;

  const sql = `WITH balance_check AS (
            SELECT * FROM token_balances WHERE user_id = ${user}
            AND spirit >= ${spirit} AND essence >= ${essence} AND matter >= ${matter} AND substance >= ${substance}
          ),
          new_group AS (
            SELECT uuid_generate_v4() AS gid
          ),
${debits}
          updated AS (
            -- Qualify token_balances.<col> on the right-hand side of each
            -- SET so the planner doesn't see the bare column name as
            -- ambiguous between token_balances and balance_check (both
            -- have spirit/essence/matter/substance columns). Without
            -- these qualifiers Postgres raises 42702 and the whole CTE
            -- rolls back, surfacing as purchase_failed in the caller.
            UPDATE token_balances
            SET spirit = token_balances.spirit - ${spirit},
                essence = token_balances.essence - ${essence},
                matter = token_balances.matter - ${matter},
                substance = token_balances.substance - ${substance},
                updated_at = now()
            FROM balance_check bc
            WHERE token_balances.user_id = ${user}
            RETURNING token_balances.*
          )${purchaseCte}
${projection}`;

  return { sql, values: p.values };
}

// ─── Transmutation ────────────────────────────────────────────────────

/**
 * Move value between two axes in one statement: debit `fromColumn`, credit
 * `toColumn`, and write both halves of the double entry under one
 * transaction group.
 *
 * ── Why it is NOT an upsert ─────────────────────────────────────────────────
 *
 * `check_balance` is what makes a transmutation fail closed for a user with no
 * balance row — the UPDATE's `EXISTS` finds nothing, so neither axis moves and
 * both ledger CTEs (which select FROM `updated`) write nothing. See
 * `debitTokensSql` for the measurement.
 *
 * ── Why there is an idempotency key ─────────────────────────────────────────
 *
 * There was not one, and every other money-moving statement here has one. A
 * client retry after a network error — the failure mode idempotency keys exist
 * for — would transmute a second time, debiting the user twice. Both ledger
 * rows now carry `<key>:<TokenType>`, so the unique index on
 * `token_transactions.idempotency_key` rejects the duplicate with `23505` and
 * the caller reports it as already-applied rather than charging again.
 *
 * Null disables the guard, which preserves the previous behaviour for any
 * caller that has not opted in.
 *
 * ── Why the token-type parameters are cast to text in BOTH references ───────
 *
 * `[MEASURED 2026-07-27]` adding the idempotency key introduced exactly the
 * 42P08 documented above `creditTokensSql`, and the PREPARE gate caught it on
 * all 12 column pairs before it could ship:
 *
 *     42P08  inconsistent types deduced for parameter $5
 *
 * $5/$7 are bound as the INSERT value for `token_type` (character varying) and
 * ALSO concatenated with `':'`, which deduces `text`. One parameter, one type —
 * so both references must carry the same cast. text -> varchar is an assignment
 * cast, so pinning both to text is safe.
 */
export function transmuteSql(opts: {
  fromColumn: AxisColumn;
  toColumn: AxisColumn;
  userId: string;
  /** Amount debited from `fromColumn`. */
  costAmount: number;
  /** Amount credited to `toColumn`. */
  targetAmount: number;
  transactionGroupId: string;
  fromToken: string;
  toToken: string;
  debitDescription: string;
  creditDescription: string;
  idempotencyKey: string | null;
}): BuiltQuery {
  const { fromColumn, toColumn } = opts;
  const p = new QueryParams();

  const user = p.add(opts.userId);
  const cost = p.add(opts.costAmount);
  const target = p.add(opts.targetAmount);
  const group = p.add(opts.transactionGroupId);
  const fromToken = p.add(opts.fromToken);
  const debitDesc = p.add(opts.debitDescription);
  const toToken = p.add(opts.toToken);
  const creditDesc = p.add(opts.creditDescription);
  const idem = p.add(opts.idempotencyKey);

  const sql = `WITH check_balance AS (
            SELECT ${fromColumn} AS current_balance
            FROM token_balances
            WHERE user_id = ${user}
          ),
          updated AS (
            UPDATE token_balances
            SET ${fromColumn} = ${fromColumn} - ${cost},
                ${toColumn} = ${toColumn} + ${target},
                updated_at = now()
            WHERE user_id = ${user}
              AND EXISTS (
                SELECT 1
                FROM check_balance
                WHERE current_balance >= ${cost}
              )
            RETURNING *
          ),
          debit_txn AS (
            INSERT INTO token_transactions
              (transaction_group_id, user_id, token_type, amount, source_type, source_id, description, idempotency_key)
            SELECT
              ${group}::uuid, ${user}, ${fromToken}::text, -${cost}, 'transmutation', NULL, ${debitDesc},
              CASE WHEN ${idem}::text IS NOT NULL THEN ${idem}::text || ':' || ${fromToken}::text ELSE NULL END
            FROM updated
          ),
          credit_txn AS (
            INSERT INTO token_transactions
              (transaction_group_id, user_id, token_type, amount, source_type, source_id, description, idempotency_key)
            SELECT
              ${group}::uuid, ${user}, ${toToken}::text, ${target}, 'transmutation', NULL, ${creditDesc},
              CASE WHEN ${idem}::text IS NOT NULL THEN ${idem}::text || ':' || ${toToken}::text ELSE NULL END
            FROM updated
          )
          SELECT * FROM updated`;

  return { sql, values: p.values };
}

// ─── Reads and bookkeeping ────────────────────────────────────────────
//
// None of the statements below moves a balance. They are here for the same two
// reasons the money statements are: the PREPARE gate can only check SQL it can
// reach, and a hand-numbered `$n` beside a hand-ordered array is a shape where
// swapping two same-typed arguments type-checks and silently does the wrong
// thing.

/**
 * Has any transaction already been written under this idempotency key?
 *
 * The writers store `<prefix>:<TokenType>`, one row per axis, so the probe has
 * to match on the prefix. That `:%` suffix lives HERE rather than at the call
 * sites: it is the same convention `debitAllTokensSql` encodes when it writes
 * the keys, and the two must agree. Passing the raw prefix and appending `:%`
 * by hand at each caller is how they drift.
 *
 * `LIKE` with a caller-supplied prefix is safe because the prefix is BOUND, not
 * interpolated — a `%` inside it would widen the match but cannot alter the
 * statement.
 */
export function idempotencyProbeSql(keyPrefix: string): BuiltQuery {
  const p = new QueryParams();
  const prefix = p.add(`${keyPrefix}:%`);
  return {
    sql: `SELECT 1 FROM token_transactions WHERE idempotency_key LIKE ${prefix} LIMIT 1`,
    values: p.values,
  };
}

/** Which column records a site's daily claim. Two sites, two columns; derived
 *  from the site so the caller cannot name a column that does not exist. */
export type ClaimSite = "main" | "agents";
const CLAIM_COLUMN: Record<ClaimSite, string> = {
  main: "last_daily_claim_at",
  agents: "last_daily_claim_agents_at",
};

/** Stamp the site-specific daily-claim timestamp. */
export function dailyClaimTimestampSql(opts: {
  userId: string;
  site: ClaimSite;
}): BuiltQuery {
  const column = CLAIM_COLUMN[opts.site];
  const p = new QueryParams();
  const user = p.add(opts.userId);
  return {
    sql: `UPDATE token_balances SET ${column} = now(), updated_at = now() WHERE user_id = ${user}`,
    values: p.values,
  };
}

/**
 * One page of a user's ledger, newest first.
 *
 * `limit` and `offset` are two adjacent integers — the one parameter pair here
 * where a hand-ordered array could silently swap and return the wrong page.
 */
export function transactionsPageSql(opts: {
  userId: string;
  limit: number;
  offset: number;
}): BuiltQuery {
  const p = new QueryParams();
  const user = p.add(opts.userId);
  const limit = p.add(opts.limit);
  const offset = p.add(opts.offset);
  return {
    sql: `SELECT * FROM token_transactions
             WHERE user_id = ${user}
             ORDER BY created_at DESC
             LIMIT ${limit} OFFSET ${offset}`,
    values: p.values,
  };
}

/** Total ledger rows for a user, for paging. */
export function transactionCountSql(userId: string): BuiltQuery {
  const p = new QueryParams();
  const user = p.add(userId);
  return {
    sql: `SELECT COUNT(*)::int AS total FROM token_transactions WHERE user_id = ${user}`,
    values: p.values,
  };
}

/** The purchasable item behind a slug. Filters `is_active` because an inactive
 *  item must not be buyable — distinct from `shopItemDetailSql`, which reads an
 *  item for display regardless of its active state. */
export function shopItemForPurchaseSql(slug: string): BuiltQuery {
  const p = new QueryParams();
  const s = p.add(slug);
  return {
    sql: `SELECT * FROM shop_items WHERE slug = ${s} AND is_active = true`,
    values: p.values,
  };
}

/** Does this user already own this item? Used to enforce one-time items. */
export function userOwnsItemSql(opts: {
  userId: string;
  slug: string;
}): BuiltQuery {
  const p = new QueryParams();
  const user = p.add(opts.userId);
  const slug = p.add(opts.slug);
  return {
    sql: `SELECT 1 FROM user_purchases up
             JOIN shop_items si ON si.id = up.shop_item_id
             WHERE up.user_id = ${user} AND si.slug = ${slug}`,
    values: p.values,
  };
}

/**
 * Does this user hold a CURRENT purchase of this item?
 *
 * ── Why `maxAgeDays` is bound rather than interpolated ──────────────────────
 *
 * It used to be spliced straight into the statement text:
 *
 *     AND up.purchased_at >= now() - interval '${maxAgeDays} days'
 *
 * `maxAgeDays` is typed `number`, but a value arriving from `request.json()` is
 * `any` at runtime, so a string would have been concatenated into the SQL. No
 * caller passed the argument, so the branch was unreachable and nothing was
 * exploitable — but it was one call site away from being an injection point,
 * and a PREPARE gate cannot check a statement whose text depends on a value.
 *
 * `make_interval` takes the day count as an ordinary bound parameter, so the
 * statement text is now fixed no matter what the caller passes.
 */
export function hasActivePurchaseSql(opts: {
  userId: string;
  slug: string;
  maxAgeDays?: number;
}): BuiltQuery {
  const p = new QueryParams();
  const user = p.add(opts.userId);
  const slug = p.add(opts.slug);
  const dateCondition =
    opts.maxAgeDays === undefined
      ? ""
      : `AND up.purchased_at >= now() - make_interval(days => ${p.add(opts.maxAgeDays)}::int)`;
  return {
    sql: `SELECT 1 FROM user_purchases up
           JOIN shop_items si ON si.id = up.shop_item_id
           WHERE up.user_id = ${user} AND si.slug = ${slug}
           ${dateCondition}
           LIMIT 1`,
    values: p.values,
  };
}

/** The shop catalogue entry for a slug, whatever its active state. */
export function shopItemDetailSql(slug: string): BuiltQuery {
  const p = new QueryParams();
  const s = p.add(slug);
  return {
    sql: `SELECT id, slug, title, description, category,
                  cost_spirit, cost_essence, cost_matter, cost_substance,
                  is_one_time, is_active
           FROM shop_items WHERE slug = ${s}`,
    values: p.values,
  };
}

/**
 * The shop catalogue, optionally filtered.
 *
 * `onlyActive` defaults to true, and specifically on `!== false`: passing no
 * options at all must still hide inactive items. Only an explicit `false`
 * widens the query.
 */
export function shopItemsSql(opts?: {
  category?: string;
  onlyActive?: boolean;
}): BuiltQuery {
  const p = new QueryParams();
  const where: string[] = [];
  if (opts?.category) where.push(`category = ${p.add(opts.category)}`);
  if (opts?.onlyActive !== false) where.push(`is_active = true`);
  const whereClause = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";
  return {
    sql: `SELECT id, slug, title, description, category,
                cost_spirit, cost_essence, cost_matter, cost_substance,
                is_one_time, is_active, sort_order
         FROM shop_items
         ${whereClause}
         ORDER BY sort_order ASC, title ASC`,
    values: p.values,
  };
}

// ─── Admin dashboard aggregates ───────────────────────────────────────
//
// Read-only rollups for the admin dashboard's economy panels. They live here
// rather than in the panel services for the same reason as everything above:
// the PREPARE gate can only check SQL it can reach, and these read the money
// tables — a misspelled column here would otherwise surface only in a panel's
// catch block, as a silent `live: false`.

/** Any nonzero divergence is real drift: both sides are exact DECIMAL(12,4)
 *  arithmetic (NUMERIC SUM never rounds), and credit/debit statements bind the
 *  SAME parameter to the ledger insert and the balance update — so ledger and
 *  balance can only differ by an actual lost or phantom write. A one-ulp
 *  (0.0001) delta is the smallest representable real discrepancy and must
 *  count, not hide inside a tolerance. */
const DRIFT_TOLERANCE_SQL = "0";

/**
 * Compare materialized `token_balances` against per-axis ledger sums.
 *
 * The balances table is documented as rebuildable from the immutable
 * `token_transactions` ledger; `[MEASURED 2026-07-26]` a 67-user / 521.7-Spirit
 * divergence has happened (the lost-first-credit CTE bug above
 * `creditTokensSql`). This unpivots each balance row into four axis rows and
 * FULL OUTER JOINs them to the ledger sums, so a user present on only ONE side
 * still counts as drifted when the other side is nonzero — an inner join would
 * hide exactly the users whose balance row was never created.
 */
export function ledgerDriftSql(): BuiltQuery {
  return {
    sql: `WITH ledger AS (
            SELECT user_id, lower(token_type) AS axis, SUM(amount) AS total
            FROM token_transactions
            GROUP BY user_id, lower(token_type)
          ),
          balances AS (
            SELECT b.user_id, v.axis, v.amount
            FROM token_balances b,
                 LATERAL (VALUES ('spirit', b.spirit),
                                 ('essence', b.essence),
                                 ('matter', b.matter),
                                 ('substance', b.substance)) AS v(axis, amount)
          ),
          deltas AS (
            SELECT COALESCE(bal.user_id, led.user_id) AS user_id,
                   ABS(COALESCE(bal.amount, 0) - COALESCE(led.total, 0)) AS abs_delta
            FROM balances bal
            FULL OUTER JOIN ledger led
              ON led.user_id = bal.user_id AND led.axis = bal.axis
          )
          SELECT
            COUNT(DISTINCT user_id) FILTER (WHERE abs_delta > ${DRIFT_TOLERANCE_SQL})::int AS drifted_users,
            COALESCE(MAX(abs_delta), 0)::float8 AS max_abs_delta,
            COUNT(DISTINCT user_id)::int AS checked_users
          FROM deltas`,
    values: [],
  };
}

/**
 * Human users holding no `signup_grant` ledger row.
 *
 * #744 moved the grant into `createUser` itself, but humans created before the
 * fix (and any future path that skips it) can still hold nothing. `IS NOT TRUE`
 * rather than `= false`: a NULL `is_agent` is a human, and `NOT (NULL)` would
 * drop those rows from the count entirely.
 */
export function welcomeGrantCoverageSql(): BuiltQuery {
  return {
    sql: `SELECT COUNT(*)::int AS humans_without_grant
          FROM users u
          WHERE u.is_agent IS NOT TRUE
            AND NOT EXISTS (
              SELECT 1 FROM token_transactions t
              WHERE t.user_id = u.id AND t.source_type = 'signup_grant'
            )`,
    values: [],
  };
}

/**
 * Claims stuck in `pending` — debited off-chain with no confirmed mint.
 * `MIN(created_at)` over zero rows is NULL, so `oldest_pending_hours` is NULL
 * (not 0) when nothing is pending; the reader must preserve that distinction.
 */
export function onchainClaimBacklogSql(): BuiltQuery {
  return {
    sql: `SELECT
            COUNT(*)::int AS pending,
            (EXTRACT(EPOCH FROM (NOW() - MIN(created_at))) / 3600)::float8 AS oldest_pending_hours
          FROM esms_onchain_claims
          WHERE status = 'pending'`,
    values: [],
  };
}

/**
 * Daily mint/burn over the trailing 30 days, oldest day first. Buckets are
 * UTC days (`AT TIME ZONE 'UTC'` before truncating) so the series cannot
 * shift with the server's session timezone, and the day is emitted as a
 * YYYY-MM-DD string so no driver-side Date parsing can reintroduce one.
 */
export function tokenFlowSeriesSql(): BuiltQuery {
  return {
    sql: `SELECT
            to_char(date_trunc('day', created_at AT TIME ZONE 'UTC'), 'YYYY-MM-DD') AS day,
            COALESCE(SUM(amount) FILTER (WHERE amount > 0), 0)::float8 AS minted,
            COALESCE(SUM(-amount) FILTER (WHERE amount < 0), 0)::float8 AS burned
          FROM token_transactions
          WHERE created_at > NOW() - INTERVAL '30 days'
          GROUP BY 1
          ORDER BY 1 ASC`,
    values: [],
  };
}

/**
 * Top 5 credit sources over the trailing 24h — the mirror of the sinks
 * rollup in `getCosmicYield`, decomposing inflow (PA sync-credit bridge,
 * MCP top-ups, grants) by `source_type`.
 */
export function tokenSources24hSql(): BuiltQuery {
  return {
    sql: `SELECT source_type, COALESCE(SUM(amount), 0)::float8 AS amount
          FROM token_transactions
          WHERE amount > 0 AND created_at > NOW() - INTERVAL '24 hours'
          GROUP BY source_type
          ORDER BY amount DESC
          LIMIT 5`,
    values: [],
  };
}
