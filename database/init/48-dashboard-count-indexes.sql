-- 48-dashboard-count-indexes.sql
--
-- Indexes backing the admin dashboard "practitioner cohorts" and user-insights
-- panels, which run full-table COUNT(*) / COUNT(DISTINCT ...) over users,
-- user_interactions, and user_subscriptions (see src/services/dashboardPanelsService.ts
-- and src/services/userInsightsService.ts). At the project's million-user goal
-- these were sequential scans on every dashboard load; the 5s memoize bounds
-- frequency but not per-query cost.
--
-- NOTE — these were originally CREATE INDEX CONCURRENTLY, but the deploy-time
-- migration runners (backend/scripts/run_init_migrations.py and scripts/migrate.ts)
-- execute each file inside an implicit transaction, and CONCURRENTLY cannot run in
-- a transaction block — which crash-looped the Railway deploy on startup. Dropped
-- to plain CREATE INDEX IF NOT EXISTS: it builds inside the txn with a brief write
-- lock, acceptable at current table sizes. If a zero-lock rebuild is ever needed,
-- run these CONCURRENTLY by hand in a low-traffic window (or teach the runner a
-- no-transaction path). All are IF NOT EXISTS, so re-running is safe.

-- Completed-profile count:
--   SELECT COUNT(*) FROM users WHERE (profile->>'birthData') IS NOT NULL
--     AND (profile->>'natalChart') IS NOT NULL
CREATE INDEX IF NOT EXISTS idx_users_profile_complete
  ON users ((profile->>'birthData'))
  WHERE (profile->>'birthData') IS NOT NULL
    AND (profile->>'natalChart') IS NOT NULL;

-- Active-user count: SELECT COUNT(*) FROM users WHERE is_active = true
CREATE INDEX IF NOT EXISTS idx_users_is_active
  ON users (is_active)
  WHERE is_active = true;

-- Signup-window counts (24h / 7d / 30d) and the 14-day signup trend.
CREATE INDEX IF NOT EXISTS idx_users_created_at
  ON users (created_at);

-- Active-window counts: last_login_at >= NOW() - INTERVAL ...
CREATE INDEX IF NOT EXISTS idx_users_last_login_at
  ON users (last_login_at);

-- Dominant-element histogram:
--   GROUP BY profile->'natalChart'->>'dominantElement'
CREATE INDEX IF NOT EXISTS idx_users_dominant_element
  ON users ((profile->'natalChart'->>'dominantElement'))
  WHERE profile->'natalChart' IS NOT NULL;

-- Recipe-cook reach:
--   SELECT COUNT(DISTINCT user_id) FROM user_interactions WHERE interaction_type = 'recipe_cook'
CREATE INDEX IF NOT EXISTS idx_user_interactions_type_user
  ON user_interactions (interaction_type, user_id);

-- Active subscriptions: SELECT COUNT(*) FROM user_subscriptions WHERE status = 'active'
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status
  ON user_subscriptions (status);
