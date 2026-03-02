-- Food Lab Book Schema
-- Stores cooking experiments with photos, notes, and social sharing

CREATE TABLE IF NOT EXISTS food_lab_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Dish identification
  dish_name VARCHAR(255) NOT NULL,
  description TEXT,
  notes TEXT,

  -- Recipe context
  recipe_name VARCHAR(255),
  cuisine_type VARCHAR(100),
  cooking_method VARCHAR(100),

  -- When cooked
  cooked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Photos stored as JSONB array: [{dataUrl, caption, uploadedAt}]
  photos JSONB NOT NULL DEFAULT '[]',

  -- Elemental + alchemical tagging from WhatToEatNext
  elemental_tags JSONB NOT NULL DEFAULT '{}',
  alchemical_tags JSONB NOT NULL DEFAULT '{}',
  planetary_context JSONB NOT NULL DEFAULT '{}',

  -- User rating 1-5
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),

  -- Free-form tags
  tags TEXT[] NOT NULL DEFAULT '{}',

  -- Social sharing
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  share_token VARCHAR(64) UNIQUE,

  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_food_lab_user_id ON food_lab_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_food_lab_cooked_at ON food_lab_entries(cooked_at DESC);
CREATE INDEX IF NOT EXISTS idx_food_lab_share_token ON food_lab_entries(share_token) WHERE share_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_food_lab_public ON food_lab_entries(is_public) WHERE is_public = TRUE;
