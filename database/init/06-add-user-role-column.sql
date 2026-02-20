-- database/init/06-add-user-role-column.sql

-- Create the new ENUM type for user roles
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('ALCHEMIST', 'GRAND_MASTER');
    END IF;
END
$$;

-- Add the new 'role' column to the 'users' table with a default value
ALTER TABLE users ADD COLUMN role user_role NOT NULL DEFAULT 'ALCHEMIST';

-- Migrate existing data from 'roles' array to new 'role' column (optional, based on existing data)
-- For this scenario, we'll assume existing users are 'ALCHEMIST'
-- UPDATE users SET role = 'ALCHEMIST' WHERE 'user' = ANY(roles);

-- Drop the old 'roles' column
ALTER TABLE users DROP COLUMN roles;

-- Add an index for faster lookups on the role column
CREATE INDEX idx_users_role ON users (role);

-- Ensure default value is set correctly for future inserts
ALTER TABLE users ALTER COLUMN role SET DEFAULT 'ALCHEMIST';
