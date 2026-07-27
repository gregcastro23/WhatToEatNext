WITH balance_check AS (
            SELECT * FROM token_balances WHERE user_id = $1
            AND spirit >= $2 AND essence >= $3 AND matter >= $4 AND substance >= $5
          ),
          new_group AS (
            SELECT uuid_generate_v4() AS gid
          ),
          debit_spirit AS (
            INSERT INTO token_transactions (transaction_group_id, user_id, token_type, amount, source_type, source_id, description, idempotency_key)
            SELECT g.gid, $1, 'Spirit', -$2, $6, $7, $8,
                   CASE WHEN $9::text IS NOT NULL THEN $9 || ':Spirit' ELSE NULL END
            FROM balance_check bc, new_group g
            WHERE $2 > 0
            RETURNING id
          ),
          debit_essence AS (
            INSERT INTO token_transactions (transaction_group_id, user_id, token_type, amount, source_type, source_id, description, idempotency_key)
            SELECT g.gid, $1, 'Essence', -$3, $6, $7, $8,
                   CASE WHEN $9::text IS NOT NULL THEN $9 || ':Essence' ELSE NULL END
            FROM balance_check bc, new_group g
            WHERE $3 > 0
            RETURNING id
          ),
          debit_matter AS (
            INSERT INTO token_transactions (transaction_group_id, user_id, token_type, amount, source_type, source_id, description, idempotency_key)
            SELECT g.gid, $1, 'Matter', -$4, $6, $7, $8,
                   CASE WHEN $9::text IS NOT NULL THEN $9 || ':Matter' ELSE NULL END
            FROM balance_check bc, new_group g
            WHERE $4 > 0
            RETURNING id
          ),
          debit_substance AS (
            INSERT INTO token_transactions (transaction_group_id, user_id, token_type, amount, source_type, source_id, description, idempotency_key)
            SELECT g.gid, $1, 'Substance', -$5, $6, $7, $8,
                   CASE WHEN $9::text IS NOT NULL THEN $9 || ':Substance' ELSE NULL END
            FROM balance_check bc, new_group g
            WHERE $5 > 0
            RETURNING id
          ),
          updated AS (
            UPDATE token_balances
            SET spirit = token_balances.spirit - $2,
                essence = token_balances.essence - $3,
                matter = token_balances.matter - $4,
                substance = token_balances.substance - $5,
                updated_at = now()
            FROM balance_check bc
            WHERE token_balances.user_id = $1
            RETURNING token_balances.*
          )
          SELECT u.*, g.gid AS txn_group_id FROM updated u, new_group g
