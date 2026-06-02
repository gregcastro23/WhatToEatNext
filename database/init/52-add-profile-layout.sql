-- database/init/52-add-profile-layout.sql
-- Add profile_layout column to user_profiles table for custom profiling display

ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS profile_layout JSONB;
