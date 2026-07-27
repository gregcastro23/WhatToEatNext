WITH inserted AS (
            INSERT INTO token_transactions
              (transaction_group_id, user_id, token_type, amount, source_type, source_id, description, idempotency_key, yield_day)
            VALUES
              (COALESCE($7::uuid, uuid_generate_v4()), $1, $2, $3, $4::text, $5, $6, $8,
               CASE WHEN $4::text IN ('agents_yield', 'daily_yield')
                    THEN (now() AT TIME ZONE 'UTC')::date
                    ELSE NULL END)
            ON CONFLICT (idempotency_key) DO NOTHING
            RETURNING id
          )
          INSERT INTO token_balances (user_id, substance, updated_at)
          SELECT $1, $3, now() FROM inserted
          ON CONFLICT (user_id) DO UPDATE
            SET substance = token_balances.substance + EXCLUDED.substance,
                updated_at = now()
          RETURNING *
