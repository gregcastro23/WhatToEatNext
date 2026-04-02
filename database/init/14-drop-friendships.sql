-- Remove the friendships table.
-- The commensal system (commensalships table) now handles all
-- user-to-user relationship requests. "Commensal" is our brand term.

DROP TABLE IF EXISTS friendships;
DROP TYPE IF EXISTS friendship_status;
