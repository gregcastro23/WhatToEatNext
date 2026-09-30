/**
 * Transmutation Circle SQL — the reads behind the Circle view: the board, a
 * maker's own offers, a practitioner's record and the network pulse.
 *
 * Split from `transmutationQueries.ts` (the offer and fill statements) to keep
 * each module readable; the same zero-runtime-import discipline applies, and
 * `scripts/checkTransmutationSqlParses.ts` PREPAREs both.
 *
 * @file src/services/transmutationBoardQueries.ts
 */

import { OFFER_COLUMNS_AS_O, QueryParams, type BuiltQuery } from "./transmutationQueries";

/** The balance a maker holds of the coin an offer gives. */
const GIVE_BALANCE = `CASE o.give_token
            WHEN 'Spirit' THEN tb.spirit
            WHEN 'Essence' THEN tb.essence
            WHEN 'Matter' THEN tb.matter
            ELSE tb.substance END`;

/** Unordered blocked pair between the viewer and the offer's maker. */
function blockedWithMaker(viewer: string): string {
  return `EXISTS (
            SELECT 1 FROM commensalships c
             WHERE c.status = 'blocked'
               AND ((c.requester_id = ${viewer} AND c.addressee_id = o.maker_id)
                 OR (c.requester_id = o.maker_id AND c.addressee_id = ${viewer})))`;
}

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
    sql: `SELECT ${OFFER_COLUMNS_AS_O},
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
    sql: `SELECT ${OFFER_COLUMNS_AS_O},
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
