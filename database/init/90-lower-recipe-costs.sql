-- database/init/90-lower-recipe-costs.sql
-- Rebase the recipe-generation shop items to the Swapping Bridge era.
--
--   unlock-cosmic-recipe : 7.5 → 2.5 of each axis (30 → 10 total)
--   unlock-basic-recipe  : 2.5 → 0.5 of each axis (10 →  2 total)
--
-- Why now: a recipe used to be unaffordable the moment ONE axis ran dry, even
-- when the caller held plenty of value on the other three. Payments now route
-- through the Swapping Bridge (src/lib/economy/swappingBridge.ts), which covers
-- a per-axis shortfall by swapping surplus coins at live Elemental Exchange
-- Index parity inside the same transaction as the debit. With the bridge able
-- to fund any axis from the whole balance, the base price is set against the
-- caller's TOTAL holdings rather than their weakest axis — hence the cut.
--
-- The personalization layer (applyPersonalizedPricing × the caller's natal
-- chart × current sky) still shapes the per-axis debit; it simply scales these
-- smaller bases.
--
-- Migration 40 is left as written: it is history, and it has already run
-- everywhere. A fresh database runs 17 (seeded at the new rate) → 40 (the old
-- 7.5/2.5 rebase) → this file, and so still ends at the new rate. The seed in
-- `17-token-economy-schema.sql` is updated in lockstep, and the MCP boundary
-- mirror (`TOOL_COSTS.generate_cosmic_recipe` in src/lib/mcp/auth.ts) matches.

UPDATE shop_items
SET
    cost_spirit = 2.5,
    cost_essence = 2.5,
    cost_matter = 2.5,
    cost_substance = 2.5
WHERE slug = 'unlock-cosmic-recipe';

UPDATE shop_items
SET
    cost_spirit = 0.5,
    cost_essence = 0.5,
    cost_matter = 0.5,
    cost_substance = 0.5
WHERE slug = 'unlock-basic-recipe';

-- The ledger needs no schema change for the bridge, and this is why:
--
--   * One auto-swap writes two rows per leg — a `transmutation` debit of the
--     source coin and a `transmutation` credit of the target coin — followed by
--     the payment debit rows. All of them share ONE transaction_group_id, so the
--     swap and the purchase it funded reconcile as a single group.
--   * transaction_group_id carries no uniqueness constraint (it is indexed by
--     idx_token_txn_group), so any number of rows may share it.
--   * source_type is an unconstrained VARCHAR(50); `transmutation` is already
--     written by /api/economy/transmute and /api/economy/swap.
--   * Swap rows are keyed `<purchase key>:swap<n>:<TokenType>`, under the SAME
--     prefix the payment rows use (`<purchase key>:<TokenType>`), so the
--     existing `LIKE '<key>:%'` idempotency probe sees a replayed swap too.
--
-- Documented on the column so the next reader of the ledger does not have to
-- rediscover it.
COMMENT ON COLUMN token_transactions.transaction_group_id IS
  'Links the rows of one logical movement. An auto-swapped payment (Swapping '
  'Bridge) writes its transmutation debit/credit legs AND the payment debit '
  'under one group id, committed in one transaction.';
