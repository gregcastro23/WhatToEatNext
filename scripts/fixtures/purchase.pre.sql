WITH balance_check AS (
            SELECT * FROM token_balances WHERE user_id = $1
            AND spirit >= $2 AND essence >= $3 AND matter >= $4 AND substance >= $5
          ),
          new_group AS (
            SELECT uuid_generate_v4() AS gid
          ),
          debit_spirit AS (
            INSERT INTO token_transactions (transaction_group_id, user_id, token_type, amount, source_type, source_id, description, idempotency_key)
            SELECT g.gid, $1, 'Spirit', -$2, 'premium_purchase', $6, $7,
                   CASE WHEN $8::text IS NOT NULL THEN $8 || ':Spirit' ELSE NULL END
            FROM balance_check bc, new_group g
            WHERE $2 > 0
            RETURNING id
          ),
          debit_essence AS (
            INSERT INTO token_transactions (transaction_group_id, user_id, token_type, amount, source_type, source_id, description, idempotency_key)
            SELECT g.gid, $1, 'Essence', -$3, 'premium_purchase', $6, $7,
                   CASE WHEN $8::text IS NOT NULL THEN $8 || ':Essence' ELSE NULL END
            FROM balance_check bc, new_group g
            WHERE $3 > 0
            RETURNING id
          ),
          debit_matter AS (
            INSERT INTO token_transactions (transaction_group_id, user_id, token_type, amount, source_type, source_id, description, idempotency_key)
            SELECT g.gid, $1, 'Matter', -$4, 'premium_purchase', $6, $7,
                   CASE WHEN $8::text IS NOT NULL THEN $8 || ':Matter' ELSE NULL END
            FROM balance_check bc, new_group g
            WHERE $4 > 0
            RETURNING id
          ),
          debit_substance AS (
            INSERT INTO token_transactions (transaction_group_id, user_id, token_type, amount, source_type, source_id, description, idempotency_key)
            SELECT g.gid, $1, 'Substance', -$5, 'premium_purchase', $6, $7,
                   CASE WHEN $8::text IS NOT NULL THEN $8 || ':Substance' ELSE NULL END
            FROM balance_check bc, new_group g
            WHERE $5 > 0
            RETURNING id
          ),
          updated AS (
            -- Qualify token_balances.<col> on the right-hand side of each
            -- SET so the planner doesn't see the bare column name as
            -- ambiguous between token_balances and balance_check (both
            -- have spirit/essence/matter/substance columns). Without
            -- these qualifiers Postgres raises 42702 and the whole CTE
            -- rolls back, surfacing as purchase_failed in the caller.
            UPDATE token_balances
            SET spirit = token_balances.spirit - $2,
                essence = token_balances.essence - $3,
                matter = token_balances.matter - $4,
                substance = token_balances.substance - $5,
                updated_at = now()
            FROM balance_check bc
            WHERE token_balances.user_id = $1
            RETURNING token_balances.*
          ),
          purchase AS (
            INSERT INTO user_purchases (user_id, shop_item_id, transaction_group_id)
            SELECT $1, $6::uuid, g.gid FROM updated u, new_group g
            RETURNING transaction_group_id
          )
          SELECT u.*, p.transaction_group_id AS txn_group_id
          FROM updated u, purchase p
