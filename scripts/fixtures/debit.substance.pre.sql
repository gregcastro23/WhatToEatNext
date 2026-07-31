WITH check_balance AS (
            SELECT substance AS current_balance FROM token_balances WHERE user_id = $1
          ),
          inserted AS (
            INSERT INTO token_transactions
              (transaction_group_id, user_id, token_type, amount, source_type, source_id, description)
            SELECT COALESCE($6::uuid, uuid_generate_v4()), $1, $2, -$3::numeric, $4::text, $5, $7
            FROM check_balance
            WHERE current_balance >= $3::numeric
            RETURNING id
          )
          UPDATE token_balances
          SET substance = substance - $3::numeric,
              updated_at = now()
          WHERE user_id = $1
            AND EXISTS (SELECT 1 FROM inserted)
          RETURNING *
