-- database/init/42-restore-01-schema-defaults.sql
-- Restore DEFAULT clauses that were lost from prod since the original
-- 01-schema.sql definition. Same class as PR #447 (which restored
-- email_verified + login_count): all 30 columns below are NOT NULL in prod
-- with no DEFAULT, but their source 01-schema.sql declarations DO specify
-- defaults. INSERT paths in the app happen to supply every value today,
-- but any new code path that forgets to pass the column 500s on the
-- not-null constraint. This migration restores the safety net.
--
-- Source-of-truth: database/init/01-schema.sql
-- Diff detection: scratch/audit_schema_drift.ts (deleted post-PR)
-- Idempotent: SET DEFAULT is repeatable.

-- users
ALTER TABLE users ALTER COLUMN is_active SET DEFAULT true;
ALTER TABLE users ALTER COLUMN profile SET DEFAULT '{}';
ALTER TABLE users ALTER COLUMN preferences SET DEFAULT '{}';

-- api_keys
ALTER TABLE api_keys ALTER COLUMN scopes SET DEFAULT '{}';
ALTER TABLE api_keys ALTER COLUMN rate_limit_tier SET DEFAULT 'authenticated';
ALTER TABLE api_keys ALTER COLUMN is_active SET DEFAULT true;
ALTER TABLE api_keys ALTER COLUMN usage_count SET DEFAULT 0;

-- elemental_properties
ALTER TABLE elemental_properties ALTER COLUMN calculation_method SET DEFAULT 'manual';
ALTER TABLE elemental_properties ALTER COLUMN confidence_score SET DEFAULT 1.0;

-- planetary_influences
ALTER TABLE planetary_influences ALTER COLUMN is_primary SET DEFAULT false;

-- ingredients
ALTER TABLE ingredients ALTER COLUMN flavor_profile SET DEFAULT '{}';
ALTER TABLE ingredients ALTER COLUMN preparation_methods SET DEFAULT '{}';
ALTER TABLE ingredients ALTER COLUMN is_active SET DEFAULT true;
ALTER TABLE ingredients ALTER COLUMN confidence_score SET DEFAULT 1.0;

-- ingredient_cuisines
ALTER TABLE ingredient_cuisines ALTER COLUMN usage_frequency SET DEFAULT 0.5;

-- ingredient_compatibility
ALTER TABLE ingredient_compatibility ALTER COLUMN interaction_type SET DEFAULT 'neutral';

-- recipes
ALTER TABLE recipes ALTER COLUMN dietary_tags SET DEFAULT '{}';
ALTER TABLE recipes ALTER COLUMN allergens SET DEFAULT '{}';
ALTER TABLE recipes ALTER COLUMN nutritional_profile SET DEFAULT '{}';
ALTER TABLE recipes ALTER COLUMN popularity_score SET DEFAULT 0.5;
ALTER TABLE recipes ALTER COLUMN alchemical_harmony_score SET DEFAULT 0.5;
ALTER TABLE recipes ALTER COLUMN cultural_authenticity_score SET DEFAULT 0.5;
ALTER TABLE recipes ALTER COLUMN user_rating SET DEFAULT 0.0;
ALTER TABLE recipes ALTER COLUMN rating_count SET DEFAULT 0;
ALTER TABLE recipes ALTER COLUMN is_public SET DEFAULT true;
ALTER TABLE recipes ALTER COLUMN is_verified SET DEFAULT false;

-- recipe_ingredients
ALTER TABLE recipe_ingredients ALTER COLUMN is_optional SET DEFAULT false;
ALTER TABLE recipe_ingredients ALTER COLUMN order_index SET DEFAULT 0;

-- calculation_cache
ALTER TABLE calculation_cache ALTER COLUMN hit_count SET DEFAULT 0;

-- system_metrics
ALTER TABLE system_metrics ALTER COLUMN tags SET DEFAULT '{}';
