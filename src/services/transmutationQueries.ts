/**
 * Transmutation Circle SQL — every statement `transmutationService` sends.
 *
 * @file src/services/transmutationQueries.ts
 *
 * Same discipline as `tokenEconomyQueries.ts`, for the same reason: SQL is a
 * second language that only a database can typecheck, so these builders have
 * ZERO runtime imports and `scripts/checkTransmutationSqlParses.ts` can import
 * them and PREPARE every one against a real PostgreSQL.
 *
 * They live in their own module rather than in `tokenEconomyQueries.ts`
 * because that module's gate runs against production on every PR, and these
 * reference `transmutation_offers` (migration 91): a PR that adds the table
 * would otherwise fail its own gate until the migration had already shipped.
 * The transmutation gate reports a clear SKIP on a database without the table.
 *
 * The ledger moves of a fill are NOT here: they are `debitTokensSql` and
 * `creditTokensSql` from `tokenEconomyQueries.ts`, the audited statements every
 * other balance move uses.
 */

/** Token names exactly as `token_type` / `give_token` store them. */
export type TokenName = "Spirit" | "Essence" | "Matter" | "Substance";

export type OfferStatus = "open" | "filled" | "cancelled" | "declined";

export interface BuiltQuery {
  sql: string;
  values: unknown[];
}

/** Hands back `$n` for each value, so numbering is a result, not hand-kept. */
class QueryParams {
  private readonly collected: unknown[] = [];

  add(value: unknown): string {
    this.collected.push(value);
    return `$${this.collected.length}`;
  }

  get values(): unknown[] {
    return [...this.collected];
  }
}

/**
 * The offer columns, amounts as text so NUMERIC arrives exactly (node-postgres
 * hands NUMERIC back as strings anyway; saying so keeps the parse explicit).
 */
function offerColumns(alias: string): string {
  const a = alias ? `${alias}.` : "";
  return `${a}id::text AS id, ${a}maker_id::text AS maker_id,
          ${a}counterparty_id::text AS counterparty_id,
          ${a}give_token, ${a}give_amount::text AS give_amount,
          ${a}want_token, ${a}want_amount::text AS want_amount,
          ${a}message, ${a}status, ${a}taker_id::text AS taker_id,
          ${a}fill_transaction_group_id::text AS fill_transaction_group_id,
          ${a}reply_to_offer_id::text AS reply_to_offer_id,
          ${a}created_at, ${a}expires_at, ${a}closed_at`;
}

/** The balance a maker holds of the coin an offer gives. */
const GIVE_BALANCE = `CASE o.give_token
            WHEN 'Spirit' THEN tb.spirit
            WHEN 'Essence' THEN tb.essence
            WHEN 'Matter' THEN tb.matter
            ELSE tb.substance END`;

/** Unordered blocked pair between $viewer and the offer's maker. */
function blockedWithMaker(viewer: string): string {
  return `EXISTS (
            SELECT 1 FROM commensalships c
             WHERE c.status = 'blocked'
               AND ((c.requester_id = ${viewer} AND c.addressee_id = o.maker_id)
                 OR (c.requester_id = o.maker_id AND c.addressee_id = ${viewer})))`;
}

// ─── Offers ───────────────────────────────────────────────────────────

/**
 * Post an offer. A replayed idempotency key inserts nothing and returns no
 * row; the caller then reads the original with `offerByIdempotencyKeySql`.
 */
export function insertOfferSql(opts: {
  makerId: string;
  counterpartyId: string | null;
  giveToken: TokenName;
  giveAmount: number;
  wantToken: TokenName;
  wantAmount: number;
  message: string | null;
  replyToOfferId: string | null;
  idempotencyKey: string | null;
  /** Whole hours; the caller bounds it. */
  ttlHours: number;
}): BuiltQuery {
  const p = new QueryParams();
  const maker = p.add(opts.makerId);
  const counterparty = p.add(opts.counterpartyId);
  const giveToken = p.add(opts.giveToken);
  const giveAmount = p.add(opts.giveAmount);
  const wantToken = p.add(opts.wantToken);
  const wantAmount = p.add(opts.wantAmount);
  const message = p.add(opts.message);
  const replyTo = p.add(opts.replyToOfferId);
  const idem = p.add(opts.idempotencyKey);
  const ttl = p.add(opts.ttlHours);
  return {
    sql: `INSERT INTO transmutation_offers
            (maker_id, counterparty_id, give_token, give_amount, want_token, want_amount,
             message, reply_to_offer_id, idempotency_key, expires_at)
          VALUES (${maker}, ${counterparty}, ${giveToken}, ${giveAmount}, ${wantToken}, ${wantAmount},
                  ${message}, ${replyTo}, ${idem}, now() + make_interval(hours => ${ttl}::int))
          ON CONFLICT (idempotency_key) DO NOTHING
          RETURNING ${offerColumns("")}`,
    values: p.values,
  };
}

/** The offer a maker already posted under this key. */
export function offerByIdempotencyKeySql(makerId: string, idempotencyKey: string): BuiltQuery {
  const p = new QueryParams();
  const key = p.add(idempotencyKey);
  const maker = p.add(makerId);
  return {
    sql: `SELECT ${offerColumns("o")}
            FROM transmutation_offers o
           WHERE o.idempotency_key = ${key} AND o.maker_id = ${maker}`,
    values: p.values,
  };
}

/** One offer, unlocked. */
export function offerByIdSql(offerId: string): BuiltQuery {
  const p = new QueryParams();
  const id = p.add(offerId);
  return {
    sql: `SELECT ${offerColumns("o")} FROM transmutation_offers o WHERE o.id = ${id}`,
    values: p.values,
  };
}

/**
 * One offer, held for the rest of the transaction. Taken FIRST in a fill, so
 * two takers racing for the same offer serialize here and the second sees it
 * already filled.
 */
export function lockOfferSql(offerId: string): BuiltQuery {
  const p = new QueryParams();
  const id = p.add(offerId);
  return {
    sql: `SELECT ${offerColumns("o")} FROM transmutation_offers o WHERE o.id = ${id} FOR UPDATE`,
    values: p.values,
  };
}

/** A maker's live offers — the per-maker cap counts these. */
export function countLiveOffersByMakerSql(makerId: string): BuiltQuery {
  const p = new QueryParams();
  const maker = p.add(makerId);
  return {
    sql: `SELECT count(*)::int AS n
            FROM transmutation_offers
           WHERE maker_id = ${maker} AND status = 'open' AND expires_at > now()`,
    values: p.values,
  };
}

/**
 * Close a filled offer. Guarded on `status = 'open'` and on expiry, so a
 * second fill (or a fill racing a cancel) updates nothing and the caller
 * rolls back.
 */
export function fillOfferSql(opts: {
  offerId: string;
  takerId: string;
  transactionGroupId: string;
}): BuiltQuery {
  const p = new QueryParams();
  const id = p.add(opts.offerId);
  const taker = p.add(opts.takerId);
  const group = p.add(opts.transactionGroupId);
  return {
    sql: `UPDATE transmutation_offers
             SET status = 'filled', taker_id = ${taker},
                 fill_transaction_group_id = ${group}::uuid, closed_at = now()
           WHERE id = ${id} AND status = 'open' AND expires_at > now()
           RETURNING ${offerColumns("")}`,
    values: p.values,
  };
}

/**
 * Withdraw an offer. `cancel` is the maker's; `decline` is the directed
 * counterparty's. The actor column is chosen from the kind, never from input,
 * and the actor must match — nobody closes an offer that is not theirs.
 */
export function closeOfferSql(opts: {
  offerId: string;
  actorId: string;
  kind: "cancel" | "decline";
}): BuiltQuery {
  const p = new QueryParams();
  const id = p.add(opts.offerId);
  const actor = p.add(opts.actorId);
  const [column, status] =
    opts.kind === "cancel" ? ["maker_id", "cancelled"] : ["counterparty_id", "declined"];
  return {
    sql: `UPDATE transmutation_offers
             SET status = '${status}', closed_at = now()
           WHERE id = ${id} AND ${column} = ${actor} AND status = 'open'
           RETURNING ${offerColumns("")}`,
    values: p.values,
  };
}

// ─── Wallets ──────────────────────────────────────────────────────────

/**
 * Both parties' balances, held until the transaction ends. Ordered by user id
 * so every fill takes the two row locks in the same order: two fills between
 * the same pair, in opposite directions, cannot deadlock.
 */
export function lockPairBalancesSql(userA: string, userB: string): BuiltQuery {
  const p = new QueryParams();
  const a = p.add(userA);
  const b = p.add(userB);
  return {
    sql: `SELECT user_id::text AS user_id, spirit::text AS spirit, essence::text AS essence,
                 matter::text AS matter, substance::text AS substance
            FROM token_balances
           WHERE user_id IN (${a}::uuid, ${b}::uuid)
           ORDER BY user_id
           FOR UPDATE`,
    values: p.values,
  };
}

// ─── People ───────────────────────────────────────────────────────────

const PARTICIPANT_COLUMNS = `u.id::text AS id, u.email, COALESCE(u.is_agent, false) AS is_agent,
          COALESCE(up.name, u.name) AS name, up.share_identity`;

/** Who someone is, for naming them and deciding what they may earn. */
export function participantSql(userId: string): BuiltQuery {
  const p = new QueryParams();
  const id = p.add(userId);
  return {
    sql: `SELECT ${PARTICIPANT_COLUMNS}
            FROM users u LEFT JOIN user_profiles up ON up.user_id = u.id
           WHERE u.id = ${id}::uuid`,
    values: p.values,
  };
}

/** The same, looked up by email — how agents name each other over S2S. */
export function participantByEmailSql(email: string): BuiltQuery {
  const p = new QueryParams();
  const address = p.add(email.toLowerCase());
  return {
    sql: `SELECT ${PARTICIPANT_COLUMNS}
            FROM users u LEFT JOIN user_profiles up ON up.user_id = u.id
           WHERE lower(u.email) = ${address}
           LIMIT 1`,
    values: p.values,
  };
}

/** Either of the pair blocked the other (commensalships, unordered). */
export function blockedPairSql(userA: string, userB: string): BuiltQuery {
  const p = new QueryParams();
  const a = p.add(userA);
  const b = p.add(userB);
  return {
    sql: `SELECT 1 FROM commensalships
           WHERE status = 'blocked'
             AND ((requester_id = ${a}::uuid AND addressee_id = ${b}::uuid)
               OR (requester_id = ${b}::uuid AND addressee_id = ${a}::uuid))
           LIMIT 1`,
    values: p.values,
  };
}

// ─── The board ────────────────────────────────────────────────────────

/**
 * What a viewer can fill: live offers open to everyone or directed at them,
 * from makers who can STILL cover what they give (no escrow, so an offer the
 * maker has since spent is hidden rather than shown and refused), excluding
 * the viewer's own and anyone either side has blocked. Offers made to the
 * viewer come first.
 */
export function boardSql(opts: { viewerId: string; limit: number }): BuiltQuery {
  const p = new QueryParams();
  const viewer = `${p.add(opts.viewerId)}::uuid`;
  const limit = p.add(opts.limit);
  return {
    sql: `SELECT ${offerColumns("o")},
                 COALESCE(up.name, u.name) AS maker_name,
                 COALESCE(u.is_agent, false) AS maker_is_agent,
                 up.share_identity AS maker_share_identity
            FROM transmutation_offers o
            JOIN users u ON u.id = o.maker_id
            LEFT JOIN user_profiles up ON up.user_id = o.maker_id
            JOIN token_balances tb ON tb.user_id = o.maker_id
           WHERE o.status = 'open'
             AND o.expires_at > now()
             AND o.maker_id <> ${viewer}
             AND (o.counterparty_id IS NULL OR o.counterparty_id = ${viewer})
             AND ${GIVE_BALANCE} >= o.give_amount
             AND NOT ${blockedWithMaker(viewer)}
           ORDER BY (o.counterparty_id IS NOT NULL) DESC, o.created_at DESC
           LIMIT ${limit}`,
    values: p.values,
  };
}

/**
 * A maker's own offers: every live one, plus those closed in the last two
 * weeks so a maker sees who filled or declined them. `funded` says whether
 * their balance still covers an open offer.
 */
export function makerOffersSql(opts: { makerId: string; limit: number }): BuiltQuery {
  const p = new QueryParams();
  const maker = p.add(opts.makerId);
  const limit = p.add(opts.limit);
  return {
    sql: `SELECT ${offerColumns("o")},
                 COALESCE(${GIVE_BALANCE} >= o.give_amount, false) AS funded,
                 COALESCE(tp.name, tu.name) AS taker_name,
                 COALESCE(tu.is_agent, false) AS taker_is_agent,
                 tp.share_identity AS taker_share_identity,
                 COALESCE(cp.name, cu.name) AS counterparty_name,
                 COALESCE(cu.is_agent, false) AS counterparty_is_agent,
                 cp.share_identity AS counterparty_share_identity
            FROM transmutation_offers o
            LEFT JOIN token_balances tb ON tb.user_id = o.maker_id
            LEFT JOIN users tu ON tu.id = o.taker_id
            LEFT JOIN user_profiles tp ON tp.user_id = o.taker_id
            LEFT JOIN users cu ON cu.id = o.counterparty_id
            LEFT JOIN user_profiles cp ON cp.user_id = o.counterparty_id
           WHERE o.maker_id = ${maker}
             AND (o.status = 'open' OR o.closed_at > now() - interval '14 days')
           ORDER BY (o.status = 'open') DESC, o.created_at DESC
           LIMIT ${limit}`,
    values: p.values,
  };
}

/** A practitioner's trading record: completed trades and distinct partners. */
export function tradeStatsSql(userId: string): BuiltQuery {
  const p = new QueryParams();
  const user = `${p.add(userId)}::uuid`;
  return {
    sql: `SELECT count(*)::int AS trades,
                 count(DISTINCT CASE WHEN maker_id = ${user} THEN taker_id ELSE maker_id END)::int AS partners,
                 max(closed_at) AS last_trade_at
            FROM transmutation_offers
           WHERE status = 'filled' AND (maker_id = ${user} OR taker_id = ${user})`,
    values: p.values,
  };
}

/** Network-wide pulse — social proof that the Circle is alive. */
export function circleActivitySql(): BuiltQuery {
  return {
    sql: `SELECT
            (SELECT count(*) FROM transmutation_offers
              WHERE status = 'filled' AND closed_at > now() - interval '24 hours')::int AS trades_24h,
            (SELECT count(*) FROM transmutation_offers
              WHERE status = 'open' AND expires_at > now())::int AS open_offers`,
    values: [],
  };
}
