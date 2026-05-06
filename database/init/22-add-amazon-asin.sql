-- Migration: Add amazon_asin column to ingredients table
-- Created: May 6, 2026

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='ingredients' AND column_name='amazon_asin') THEN
        ALTER TABLE ingredients ADD COLUMN amazon_asin VARCHAR(20);
    END IF;
END $$;
