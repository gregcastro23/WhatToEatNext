-- database/init/41-restore-user-column-defaults.sql
-- Restore NOT NULL defaults on users.email_verified and users.login_count.
--
-- These defaults were defined in 01-schema.sql but were lost on the production
-- DB at some point along the migration history, leaving the columns NOT NULL
-- with no DEFAULT. As of 2026-05-25 this blocks every fresh OAuth signup —
-- userDatabaseService.createUser does not supply either column, so the INSERT
-- fails with 23502 (not-null violation), which surfaces as a 503 on
-- /api/onboarding for new users.
--
-- The application INSERT now passes both columns explicitly, but restoring the
-- defaults closes the same hole for any other code path or direct SQL insert.

ALTER TABLE users ALTER COLUMN email_verified SET DEFAULT false;
ALTER TABLE users ALTER COLUMN login_count    SET DEFAULT 0;
