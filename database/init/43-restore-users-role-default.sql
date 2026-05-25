-- database/init/43-restore-users-role-default.sql
-- Restore users.role DEFAULT to 'USER' to match source-of-truth.
--
-- The prod default was changed by hand at some point to 'ALCHEMIST'::user_role,
-- diverging from 07-nextauth-schema.sql which declares DEFAULT 'USER' (set
-- twice for clarity, on lines 31 and 34). New signups should be created at
-- USER tier and upgraded to ALCHEMIST through the explicit tier flow, not
-- granted ALCHEMIST as the implicit default.
--
-- Existing rows are not affected.
-- Idempotent.

ALTER TABLE users ALTER COLUMN role SET DEFAULT 'USER';
