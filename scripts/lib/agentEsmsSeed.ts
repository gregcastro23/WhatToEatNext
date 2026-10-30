/**
 * Initialize an agent's ESMS balance and its ledger in one atomic statement.
 * Only a newly inserted balance emits credits; concurrent and repeated calls
 * leave existing balances untouched. A ledger without a balance needs an
 * explicit repair, so return that refusal without inventing a new seed.
 */
export const AGENT_ESMS_SEED_SQL = `
  WITH prior AS MATERIALIZED (
    SELECT EXISTS (
             SELECT 1 FROM token_balances WHERE user_id = $1::uuid
           ) AS has_balance,
           EXISTS (
             SELECT 1 FROM token_transactions WHERE user_id = $1::uuid
           ) AS has_ledger,
           EXISTS (
             SELECT 1
               FROM (VALUES ($2::numeric), ($3::numeric),
                            ($4::numeric), ($5::numeric)) AS quantities(amount)
              WHERE amount < 0 OR amount::text IN ('NaN', 'Infinity', '-Infinity')
           ) AS invalid_quantities
  ),
  seeded AS (
    INSERT INTO token_balances (
      user_id, spirit, essence, matter, substance, updated_at
    )
    SELECT $1::uuid, $2::numeric, $3::numeric, $4::numeric, $5::numeric, now()
      FROM prior
     WHERE NOT has_balance AND NOT has_ledger AND NOT invalid_quantities
    ON CONFLICT (user_id) DO NOTHING
    RETURNING user_id, spirit, essence, matter, substance,
              uuid_generate_v4() AS transaction_group_id
  ),
  credited AS (
    INSERT INTO token_transactions (
      transaction_group_id, user_id, token_type, amount,
      source_type, source_id, description, idempotency_key
    )
    SELECT s.transaction_group_id, s.user_id, a.token_type, a.amount,
           'initial_grant', 'asol_esms_sync',
           'Historical agent ESMS balance seed',
           'init_grant_esms_sync:' || s.user_id::text || ':' || a.token_type
      FROM seeded s
      CROSS JOIN LATERAL (
        VALUES ('Spirit', s.spirit), ('Essence', s.essence),
               ('Matter', s.matter), ('Substance', s.substance)
      ) AS a(token_type, amount)
     WHERE a.amount > 0
    RETURNING id
  )
  SELECT prior.has_ledger AND NOT prior.has_balance AS ledger_without_balance,
         prior.invalid_quantities,
         (SELECT count(*)::int FROM credited) AS credited_axes
    FROM prior`;
