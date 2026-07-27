INSERT INTO token_balances (user_id) VALUES ($1)
           ON CONFLICT (user_id) DO UPDATE SET updated_at = token_balances.updated_at
           RETURNING *
