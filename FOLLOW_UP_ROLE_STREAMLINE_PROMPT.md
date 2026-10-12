# WTEN RBAC Streamlining & `user_role` Enum Refactor Mission

## 1. Executive Summary & Objective

Streamline the WhatToEatNext access-control (RBAC) model by removing the legacy `ALCHEMIST` and `GRAND_MASTER` roles from the codebase and PostgreSQL database, standardizing strictly on:
* **`USER`**: Standard member account (and base role for all AI agents, where `is_agent = true`).
* **`ADMIN`**: Privileged administrator account.

### Why This Refactor Is Necessary
1. **Identity vs. Access Control**: *"Alchemist"* is a culinary/astrological identity and aesthetic (`.alchm-root .lab`, dominant elemental affinity, birthchart highlights, ESMS balance), **not an RBAC permission tier**. Conflating theme with authorization creates ambiguity in route guards.
2. **Agent Autonomy**: AI agents are already cleanly identified by `users.is_agent BOOLEAN DEFAULT FALSE`. They do not need a custom role enum and should inherit `USER` permissions.
3. **Retired Tiers**: The separate "paid/alchemist tier" was formally retired on 2026-09-28 (`43-restore-users-role-default.sql` already restored default `role = 'USER'`). Vestigial occurrences of `ALCHEMIST` and `GRAND_MASTER` in `sync-credit` and admin dashboards are technical debt that must be cleaned up.

---

## 2. Codebase Refactoring Tasks

### A. Fix Stray Role Inserts in Economy Routes
* **File**: `src/app/api/economy/sync-credit/route.ts` (around line 125)
  * **Change**: Replace `'ALCHEMIST'::user_role` with `'USER'::user_role`.
  * **Context**: This aligns `sync-credit` with `sync-debit/route.ts` (line 155), `agent-sync/route.ts` (line 327), and `userDatabaseService.ts` (line 513), which all already use `'USER'::user_role`.

### B. Clean Admin Role Selector & Allowed Set
* **File**: `src/app/admin/users/[userId]/page.tsx` (around line 16)
  * **Change**:
    ```ts
    // Replace:
    const ROLE_OPTIONS = ["USER", "ADMIN", "ALCHEMIST", "GRAND_MASTER"] as const;
    // With:
    const ROLE_OPTIONS = ["USER", "ADMIN"] as const;
    ```
* **File**: `src/app/api/admin/users/[userId]/route.ts` (around line 143)
  * **Change**:
    ```ts
    // Replace:
    const ALLOWED_ROLES = new Set(["USER", "ADMIN", "ALCHEMIST", "GRAND_MASTER"]);
    // With:
    const ALLOWED_ROLES = new Set(["USER", "ADMIN"]);
    ```
  * Update surrounding comments to clarify that RBAC is strictly `USER` and `ADMIN`.

### C. Clean Admin Dashboard Diagnostic Tier Labels
* **File**: `src/app/api/admin/dashboard/route.ts` (around line 523)
  * **Change**: Update `tier: authResult.user.roles.includes("admin") ? "ROOT" : "ALCHEMIST"` to `"ROOT" : "USER"`.

### D. Update Agent Sync Script
* **File**: `scripts/sync-agentic-users.ts` (around lines 63 and 73)
  * **Change**: Replace `role = 'ALCHEMIST'` with `role = 'USER'`.

---

## 3. Database Migration Script (`database/init/93-streamline-user-roles.sql`)

> [!NOTE]
> **Status**: Completed & Open in [PR #948](https://github.com/gregcastro23/WhatToEatNext/pull/948).
> 
> **Key Architecture Decisions**:
> 1. **Migration Sequence**: Assigned to `93-streamline-user-roles.sql` because `44-user-daily-limits.sql` already exists and sequence has advanced to 92.
> 2. **Postgres View Dependency Solution**: Migration 12's `active_users` view depends directly on `users.role`. A naive `ALTER COLUMN role TYPE ...` causes Postgres to throw `cannot alter type of a column used by a view or rule` and crash-loops automated deployment pipelines (Railway). The migration dynamically queries `pg_depend` and `pg_get_viewdef` to drop dependent views, retypes the column via `USING`, and recreates all views with identical definitions inside a single atomic transaction.
> 3. **Security Mapping**: `GRAND_MASTER` maps strictly to `USER` (`CASE WHEN upper(role::text) = 'ADMIN' THEN 'ADMIN' ELSE 'USER' END`). In WTEN, `userDatabaseService.ts` gates administrative checks solely on `role = 'ADMIN'`. A `GRAND_MASTER` account had no admin authorization; promoting it to `ADMIN` would cause silent privilege escalation.
> 4. **Python Models**: `backend/database/models.py` updated to reflect `('USER', 'ADMIN')` with default `'USER'`.

```sql
-- database/init/93-streamline-user-roles.sql
-- Streamline the user_role enum to strictly 'USER' and 'ADMIN'.
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

    -- Dynamically capture and drop dependent views
    FOR v_view IN
        SELECT DISTINCT c.oid,
               quote_ident(n.nspname) || '.' || quote_ident(c.relname) AS qualified_name,
               pg_get_viewdef(c.oid, true) AS definition
          FROM pg_depend d
          JOIN pg_rewrite r ON r.oid = d.objid AND d.classid = 'pg_rewrite'::regclass
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
        EXECUTE 'DROP VIEW ' || v_view_names[v_i];
    END LOOP;

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

    DROP TYPE user_role;
    ALTER TYPE user_role_v2 RENAME TO user_role;

    FOR v_i IN 1 .. coalesce(array_length(v_view_names, 1), 0) LOOP
        EXECUTE 'CREATE VIEW ' || v_view_names[v_i] || ' AS ' || v_view_defs[v_i];
    END LOOP;
END
$$;
```

---

## 4. Verification & Testing Checklist

After making the changes in the WTEN worktree:
1. **Lint Verification**:
   ```bash
   bun scripts/lintChanged.ts
   ```
   Must pass with `0 errors` and `0 warnings`.
2. **Typecheck Verification**:
   ```bash
   bun run typecheck
   ```
   Must compile cleanly without errors.
3. **Test Suite Verification**:
   ```bash
   bun run test src/app/api/admin/users
   ```
   Verify that admin user role tests pass with the updated `["USER", "ADMIN"]` roles.

---

## 5. Execution Prompt for the Agent

When ready to execute in the WTEN directory, prompt the agent with:

```text
Please execute the RBAC streamlining and user_role enum refactor outlined in FOLLOW_UP_ROLE_STREAMLINE_PROMPT.md:
1. Update src/app/api/economy/sync-credit/route.ts to insert 'USER'::user_role.
2. Update src/app/admin/users/[userId]/page.tsx and src/app/api/admin/users/[userId]/route.ts to allow only USER and ADMIN.
3. Update src/app/api/admin/dashboard/route.ts and scripts/sync-agentic-users.ts.
4. Create database/init/44-streamline-user-roles.sql for data backfill and enum recreation.
5. Run bun scripts/lintChanged.ts, bun run typecheck, and bun run test to verify all gates pass.
```
