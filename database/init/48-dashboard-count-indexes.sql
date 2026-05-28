-- 48-dashboard-count-indexes.sql
--
-- Indexes backing the admin dashboard "practitioner cohorts" and user-insights
-- panels, which run full-table COUNT(*) / COUNT(DISTINCT ...) over users,
-- user_interactions, and user_subscriptions (see src/services/dashboardPanelsService.ts
-- and src/services/userInsightsService.ts). At the project's million-user goal
-- these were sequential scans on every dashboard load; the 5s memoize bounds
-- frequency but not per-query cost.
--
-- IMPORTANT — CREATE INDEX CONCURRENTLY cannot run inside a transaction block.
-- Run this file OUTSIDE a transaction (e.g. psql \i, or a migration runner set to
-- skip the implicit BEGIN/COMMIT for this file). If your runner wraps every file
-- in a transaction, either remove CONCURRENTLY (accepting a brief write lock) or
-- apply these statements manually during a low-traffic window. All are IF NOT
-- EXISTS so re-running is safe.

-- Completed-profile count:
--   SELECT COUNT(*) FROM users WHERE (profile->>'birthData') IS NOT NULL
--     AND (profile->>'natalChart') IS NOT NULL
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_profile_complete
  ON users ((profile->>'birthData'))
  WHERE (profile->>'birthData') IS NOT NULL
    AND (profile->>'natalChart') IS NOT NULL;

-- Active-user count: SELECT COUNT(*) FROM users WHERE is_active = true
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_is_active
  ON users (is_active)
  WHERE is_active = true;

-- Signup-window counts (24h / 7d / 30d) and the 14-day signup trend.
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_created_at
  ON users (created_at);

-- Active-window counts: last_login_at >= NOW() - INTERVAL ...
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_last_login_at
  ON users (last_login_at);

-- Dominant-element histogram:
--   GROUP BY profile->'natalChart'->>'dominantElement'
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_dominant_element
  ON users ((profile->'natalChart'->>'dominantElement'))
  WHERE profile->'natalChart' IS NOT NULL;

-- Recipe-cook reach:
--   SELECT COUNT(DISTINCT user_id) FROM user_interactions WHERE interaction_type = 'recipe_cook'
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_interactions_type_user
  ON user_interactions (interaction_type, user_id);

-- Active subscriptions: SELECT COUNT(*) FROM user_subscriptions WHERE status = 'active'
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_subscriptions_status
  ON user_subscriptions (status);
