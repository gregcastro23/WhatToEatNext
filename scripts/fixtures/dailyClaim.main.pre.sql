UPDATE token_balances SET last_daily_claim_at = now(), updated_at = now() WHERE user_id = $1
