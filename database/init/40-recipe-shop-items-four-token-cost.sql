-- database/init/40-recipe-shop-items-four-token-cost.sql
-- Recipe-generation shop items now charge ALL FOUR token types
-- (Spirit/Essence/Matter/Substance) so the per-call cost reflects the
-- agent's full ESMS chart at the moment of the call — not just the two
-- "intellectual" axes.
--
-- Total cost is preserved (cosmic: 30, basic: 10); the existing
-- personalization layer (applyPersonalizedPricing × the caller's natal
-- chart × current sky) shapes the per-axis debit, so this update simply
-- gives that layer non-zero values on all four axes to scale.
--
-- The matching seed in `17-token-economy-schema.sql` has been updated
-- in lockstep so fresh deployments come up at the new rate without
-- needing this migration.

UPDATE shop_items
SET
    cost_spirit = 7.5,
    cost_essence = 7.5,
    cost_matter = 7.5,
    cost_substance = 7.5
WHERE slug = 'unlock-cosmic-recipe';

UPDATE shop_items
SET
    cost_spirit = 2.5,
    cost_essence = 2.5,
    cost_matter = 2.5,
    cost_substance = 2.5
WHERE slug = 'unlock-basic-recipe';
