-- database/init/93-streamline-user-roles.sql
-- Streamline the user_role enum to strictly 'USER' and 'ADMIN'.
--
-- RBAC is two tiers. "Alchemist" is a culinary identity (dominant element,
-- birthchart, ESMS balance), not an access tier, and AI agents are plain USERs
-- told apart by users.is_agent. The paid/alchemist tier was retired 2026-09-28
-- (43-restore-users-role-default.sql already restored DEFAULT 'USER').
--
-- Mapping (every account keeps exactly the access it has today):
--   ADMIN                                  -> ADMIN
--   ALCHEMIST                              -> USER
--   GRAND_MASTER                           -> USER
--   anything else (NULL, legacy lowercase) -> USER, except a lowercase 'admin'
--
-- GRAND_MASTER maps to USER, not ADMIN, on purpose. The app derives admin from
-- role = 'ADMIN' alone (userDatabaseService.ts, userTimelineService.ts), so a
-- GRAND_MASTER account has never had admin access. Promoting it here would grant
-- admin to whoever holds that label, silently, at deploy time. To promote a
-- specific account, do it explicitly afterwards through /admin/users.
--
-- Why this is not a bare ALTER COLUMN ... TYPE:
--   * active_users (12-fix-schema-health.sql) selects users.role, and Postgres
--     refuses to retype a column a view reads. Dependent views are captured,
--     dropped, and recreated from their own definitions after the swap.
--   * The mapping happens inside the USING clause in one pass, so there is no
--     separate UPDATE that would need the old type to still carry 'USER'.
--   * The enum labels differ between environments (01-schema.sql created
--     lowercase labels; 07 added USER/ADMIN; prod also has ALCHEMIST/
--     GRAND_MASTER), so every comparison goes through role::text.
--
-- Runs inside the runner's transaction; any failure rolls the whole file back.
-- Takes a brief ACCESS EXCLUSIVE lock on users while the table is rewritten.
-- Idempotent: a no-op once user_role holds exactly {USER, ADMIN}.

DO $$
DECLARE
    v_role_attnum   smallint;
    v_view_names    text[] := ARRAY[]::text[];
    v_view_defs     text[] := ARRAY[]::text[];
    v_view          record;
    v_i             int;
    v_to_user       bigint;
    v_to_admin      bigint;
BEGIN
    -- Already streamlined: the type has no labels beyond USER / ADMIN.
    IF NOT EXISTS (
        SELECT 1
          FROM pg_enum
         WHERE enumtypid = 'user_role'::regtype
           AND enumlabel NOT IN ('USER', 'ADMIN')
    ) THEN
        RAISE NOTICE '93-streamline-user-roles: user_role is already {USER, ADMIN}; nothing to do';
        RETURN;
    END IF;

    SELECT attnum INTO v_role_attnum
      FROM pg_attribute
     WHERE attrelid = 'users'::regclass
       AND attname = 'role'
       AND NOT attisdropped;

    -- Row counts for the deploy log (counts only: no emails or ids).
    SELECT count(*) FILTER (WHERE upper(role::text) <> 'ADMIN' OR role IS NULL),
           count(*) FILTER (WHERE upper(role::text) = 'ADMIN')
      INTO v_to_user, v_to_admin
      FROM users;
    RAISE NOTICE '93-streamline-user-roles: % row(s) -> USER, % row(s) -> ADMIN (ALCHEMIST=%, GRAND_MASTER=%)',
        v_to_user,
        v_to_admin,
        (SELECT count(*) FROM users WHERE role::text = 'ALCHEMIST'),
        (SELECT count(*) FROM users WHERE role::text = 'GRAND_MASTER');

    -- Capture every plain view that reads users.role, then drop it so the
    -- column can be retyped. Recreated below from the captured definition.
    FOR v_view IN
        SELECT DISTINCT c.oid,
               quote_ident(n.nspname) || '.' || quote_ident(c.relname) AS qualified_name,
               pg_get_viewdef(c.oid, true) AS definition
          FROM pg_depend d
          JOIN pg_rewrite r ON r.oid = d.objid
                           AND d.classid = 'pg_rewrite'::regclass
          JOIN pg_class c ON c.oid = r.ev_class
          JOIN pg_namespace n ON n.oid = c.relnamespace
         WHERE d.refobjid = 'users'::regclass
           AND d.refobjsubid = v_role_attnum
           AND c.relkind = 'v'
         ORDER BY c.oid
    LOOP
        v_view_names := v_view_names || v_view.qualified_name;
        v_view_defs  := v_view_defs  || rtrim(btrim(v_view.definition), ';');
    END LOOP;

    FOR v_i IN 1 .. coalesce(array_length(v_view_names, 1), 0) LOOP
        RAISE NOTICE '93-streamline-user-roles: dropping dependent view % (recreated below)', v_view_names[v_i];
        EXECUTE 'DROP VIEW ' || v_view_names[v_i];
    END LOOP;

    -- Replacement enum. A leftover from a hand-run attempt is unused by now.
    DROP TYPE IF EXISTS user_role_v2;
    CREATE TYPE user_role_v2 AS ENUM ('USER', 'ADMIN');

    ALTER TABLE users ALTER COLUMN role DROP DEFAULT;
    ALTER TABLE users ALTER COLUMN role TYPE user_role_v2 USING (
        CASE WHEN upper(role::text) = 'ADMIN'
             THEN 'ADMIN'
             ELSE 'USER'
        END
    )::user_role_v2;
    ALTER TABLE users ALTER COLUMN role SET DEFAULT 'USER'::user_role_v2;

    -- Swap the names. DROP TYPE fails loudly if anything else still uses the
    -- old type, which rolls this whole file back rather than half-applying it.
    DROP TYPE user_role;
    ALTER TYPE user_role_v2 RENAME TO user_role;

    FOR v_i IN 1 .. coalesce(array_length(v_view_names, 1), 0) LOOP
        EXECUTE 'CREATE VIEW ' || v_view_names[v_i] || ' AS ' || v_view_defs[v_i];
    END LOOP;
END
$$;
