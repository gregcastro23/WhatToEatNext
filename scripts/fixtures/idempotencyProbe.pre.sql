SELECT 1 FROM token_transactions WHERE idempotency_key LIKE $1 LIMIT 1
