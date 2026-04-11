-- ==========================================
-- ALCHEMICAL TOKEN ECONOMY
-- Migration 17: Spirit, Essence, Matter & Substance Token Economy
-- Created: April 2026 for Alchm.kitchen engagement system
-- ==========================================

-- ─── Token Transaction Ledger (Immutable, Source of Truth) ────────────

CREATE TABLE IF NOT EXISTS token_transactions (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    transaction_group_id UUID NOT NULL DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_type VARCHAR(20) NOT NULL CHECK (token_type IN ('Spirit', 'Essence', 'Matter', 'Substance')),
    amount DECIMAL(12, 4) NOT NULL,  -- positive = credit, negative = debit
    source_type VARCHAR(50) NOT NULL, -- 'daily_yield', 'quest_reward', 'purchase', 'transmutation', 'admin', 'streak_bonus'
    source_id VARCHAR(255),           -- reference to quest/item/etc
    description TEXT,
    idempotency_key VARCHAR(255) UNIQUE, -- prevent double-processing
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE token_transactions IS 'Immutable double-entry ledger for all ESMS token movements. Never update or delete rows.';

-- ─── Token Balances (Derived/Materialized from Ledger) ────────────────

CREATE TABLE IF NOT EXISTS token_balances (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    spirit DECIMAL(12, 4) NOT NULL DEFAULT 0,
    essence DECIMAL(12, 4) NOT NULL DEFAULT 0,
    matter DECIMAL(12, 4) NOT NULL DEFAULT 0,
    substance DECIMAL(12, 4) NOT NULL DEFAULT 0,
    last_daily_claim_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id)
);

COMMENT ON TABLE token_balances IS 'Materialized balances derived from token_transactions. Can be rebuilt from ledger if needed.';

-- ─── User Yield Profiles (Natal Chart → Daily Weights) ────────────────

CREATE TABLE IF NOT EXISTS user_yield_profiles (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    spirit_weight DECIMAL(5, 4) NOT NULL DEFAULT 0.2500,
    essence_weight DECIMAL(5, 4) NOT NULL DEFAULT 0.2500,
    matter_weight DECIMAL(5, 4) NOT NULL DEFAULT 0.2500,
    substance_weight DECIMAL(5, 4) NOT NULL DEFAULT 0.2500,
    natal_chart_hash VARCHAR(64),  -- detect when recalculation needed
    last_transit_bonus JSONB DEFAULT '{}',
    yield_cache_date DATE,
    calculated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id)
);

COMMENT ON TABLE user_yield_profiles IS 'Pre-computed per-user ESMS yield weights from natal chart via calculateAlchemicalFromPlanets()';

-- ─── Daily Ephemeris Cache ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS daily_ephemeris_cache (
    cache_date DATE PRIMARY KEY,
    planet_positions JSONB NOT NULL,     -- { Sun: "Aries", Moon: "Taurus", ... }
    transit_esms JSONB NOT NULL,         -- pre-computed { Spirit, Essence, Matter, Substance }
    fetched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    source VARCHAR(50) DEFAULT 'railway' -- 'railway' | 'astronomy-engine' (fallback)
);

COMMENT ON TABLE daily_ephemeris_cache IS 'Cached planetary positions fetched once per day by cron job. All user yields read from this.';

-- ─── Streak Tracking ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS user_streaks (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    current_streak INTEGER NOT NULL DEFAULT 0,
    longest_streak INTEGER NOT NULL DEFAULT 0,
    last_activity_date DATE,
    streak_frozen_until DATE,       -- grace period / streak freeze
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id)
);

COMMENT ON TABLE user_streaks IS 'Daily login streak tracking with optional freeze mechanic';

-- ─── Quest Definitions ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS quest_definitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    quest_type VARCHAR(20) NOT NULL CHECK (quest_type IN ('daily', 'weekly', 'achievement')),
    token_reward_type VARCHAR(20) NOT NULL CHECK (token_reward_type IN ('Spirit', 'Essence', 'Matter', 'Substance', 'all')),
    token_reward_amount DECIMAL(10, 4) NOT NULL,
    trigger_event VARCHAR(100) NOT NULL,   -- e.g., 'view_chart', 'log_meal', 'cook_recipe'
    trigger_threshold INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE quest_definitions IS 'Static quest definitions — daily rituals, weekly quests, and one-time achievements';

-- ─── User Quest Progress ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS user_quest_progress (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    quest_id UUID NOT NULL REFERENCES quest_definitions(id) ON DELETE CASCADE,
    progress INTEGER NOT NULL DEFAULT 0,
    completed_at TIMESTAMPTZ,
    period_start DATE,  -- for daily/weekly: start of current period (NULL for achievements)
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, quest_id, period_start)
);

COMMENT ON TABLE user_quest_progress IS 'Per-user quest progress tracking. daily/weekly quests reset by period_start.';

-- ─── Shop Items (Token Sinks) ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS shop_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,  -- 'theme', 'report', 'feature', 'cosmetic', 'freeze'
    cost_spirit DECIMAL(10, 4) DEFAULT 0,
    cost_essence DECIMAL(10, 4) DEFAULT 0,
    cost_matter DECIMAL(10, 4) DEFAULT 0,
    cost_substance DECIMAL(10, 4) DEFAULT 0,
    is_one_time BOOLEAN DEFAULT true,  -- one-time purchase vs repeatable
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE shop_items IS 'Alchemist Shop items that serve as token sinks';

-- ─── User Purchases ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS user_purchases (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    shop_item_id UUID NOT NULL REFERENCES shop_items(id),
    transaction_group_id UUID NOT NULL,  -- links to token_transactions
    purchased_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE user_purchases IS 'Record of user purchases from the Alchemist Shop';

-- ==========================================
-- PERFORMANCE INDEXES
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_token_txn_user ON token_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_token_txn_type ON token_transactions(token_type);
CREATE INDEX IF NOT EXISTS idx_token_txn_created ON token_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_token_txn_idempotency ON token_transactions(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_token_txn_group ON token_transactions(transaction_group_id);
CREATE INDEX IF NOT EXISTS idx_token_txn_source ON token_transactions(source_type);
CREATE INDEX IF NOT EXISTS idx_token_txn_user_created ON token_transactions(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_quest_progress_user ON user_quest_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_quest_progress_quest ON user_quest_progress(quest_id);
CREATE INDEX IF NOT EXISTS idx_quest_progress_user_period ON user_quest_progress(user_id, period_start);

CREATE INDEX IF NOT EXISTS idx_user_purchases_user ON user_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_user_purchases_item ON user_purchases(shop_item_id);

-- ==========================================
-- SEED: Default Quest Definitions
-- ==========================================

-- Daily Rituals
INSERT INTO quest_definitions (slug, title, description, quest_type, token_reward_type, token_reward_amount, trigger_event, trigger_threshold, sort_order)
VALUES
    ('daily-consult-stars', 'Consult the Stars', 'View your current chart to align with cosmic energies', 'daily', 'Spirit', 3, 'view_chart', 1, 1),
    ('daily-great-work', 'The Great Work', 'Log a meal in your Food Diary', 'daily', 'Essence', 5, 'log_meal', 1, 2),
    ('daily-gather-ingredients', 'Gather Ingredients', 'Browse or save a recipe', 'daily', 'Matter', 2, 'save_recipe', 1, 3),
    ('daily-study-texts', 'Study the Texts', 'Read a cosmic insight or transit report', 'daily', 'Substance', 3, 'view_insight', 1, 4),
    ('daily-alignment', 'The Daily Alignment', 'Complete all 4 daily rituals', 'daily', 'all', 5, 'complete_all_dailies', 1, 5)
ON CONFLICT (slug) DO NOTHING;

-- Weekly Quests
INSERT INTO quest_definitions (slug, title, description, quest_type, token_reward_type, token_reward_amount, trigger_event, trigger_threshold, sort_order)
VALUES
    ('weekly-planetary-vigil', 'Planetary Vigil', 'Maintain a 7-day streak', 'weekly', 'Spirit', 25, 'maintain_streak', 7, 10),
    ('weekly-alchemists-table', 'The Alchemist''s Table', 'Cook 3 recommended recipes', 'weekly', 'Essence', 20, 'cook_recipe', 3, 11),
    ('weekly-market-day', 'Market Day', 'Create a grocery list', 'weekly', 'Matter', 15, 'create_grocery_list', 1, 12),
    ('weekly-scholars-path', 'Scholar''s Path', 'View 5 different natal aspects', 'weekly', 'Substance', 15, 'view_aspect', 5, 13)
ON CONFLICT (slug) DO NOTHING;

-- Achievement Quests (one-time)
INSERT INTO quest_definitions (slug, title, description, quest_type, token_reward_type, token_reward_amount, trigger_event, trigger_threshold, sort_order)
VALUES
    ('achieve-birth-of-self', 'The Birth of Self', 'Complete onboarding with birth data', 'achievement', 'all', 50, 'complete_onboarding', 1, 20),
    ('achieve-first-transmutation', 'First Transmutation', 'Cook your first recommended recipe', 'achievement', 'Essence', 25, 'cook_recipe', 1, 21),
    ('achieve-commensal-circle', 'The Commensal Circle', 'Add a dining group member', 'achievement', 'Matter', 20, 'add_commensal', 1, 22),
    ('achieve-elemental-awakening', 'Elemental Awakening', 'Reach 100 tokens of any single type', 'achievement', 'all', 10, 'reach_100_tokens', 1, 23)
ON CONFLICT (slug) DO NOTHING;

-- ==========================================
-- SEED: Default Shop Items
-- ==========================================

INSERT INTO shop_items (slug, title, description, category, cost_spirit, cost_essence, cost_matter, cost_substance, is_one_time, sort_order)
VALUES
    ('theme-fire', 'Fire Elemental Theme', 'Unlock the blazing Fire UI theme for your dashboard', 'theme', 0, 0, 50, 0, true, 1),
    ('theme-water', 'Water Elemental Theme', 'Unlock the oceanic Water UI theme for your dashboard', 'theme', 0, 0, 50, 0, true, 2),
    ('theme-earth', 'Earth Elemental Theme', 'Unlock the verdant Earth UI theme for your dashboard', 'theme', 0, 0, 50, 0, true, 3),
    ('theme-air', 'Air Elemental Theme', 'Unlock the ethereal Air UI theme for your dashboard', 'theme', 0, 0, 50, 0, true, 4),
    ('report-natal-deep', 'Deep Natal Report', 'Detailed PDF natal chart analysis with house interpretations', 'report', 100, 0, 0, 50, false, 10),
    ('report-cuisine-dna', 'Cuisine DNA Report', 'Full cuisine compatibility breakdown across all 14 cuisines', 'report', 0, 75, 50, 0, false, 11),
    ('report-transit-forecast', 'Weekly Transit Forecast', 'Personalized weekly food and energy forecast', 'report', 0, 0, 0, 60, false, 12),
    ('streak-freeze', 'Streak Freeze', 'Preserve your streak for 1 missed day', 'freeze', 20, 0, 0, 0, false, 20),
    ('title-fire-premium', 'Title: Fire Premium', 'Earn the "Fire Premium" profile title', 'cosmetic', 0, 0, 0, 0, true, 30),
    ('title-water-sage', 'Title: Water Sage', 'Earn the "Water Sage" profile title', 'cosmetic', 0, 0, 0, 0, true, 31)
ON CONFLICT (slug) DO NOTHING;

-- ─── Feature Unlock Shop Items (Token Sinks for Premium Features) ─────

INSERT INTO shop_items (slug, title, description, category, cost_spirit, cost_essence, cost_matter, cost_substance, is_one_time, sort_order)
VALUES
    ('unlock-cosmic-recipe', 'Cosmic Recipe Generation', 'Generate one AI cosmic recipe aligned with current planetary positions', 'feature', 15, 15, 0, 0, false, 40),
    ('unlock-basic-recipe', 'Basic Recipe Generation', 'Generate one AI recipe recommendation', 'feature', 5, 5, 0, 0, false, 41),
    ('unlock-restaurant-creator', 'Restaurant Creator Access', 'Create a custom restaurant with full menu builder', 'feature', 0, 10, 10, 0, false, 42),
    ('unlock-advanced-charts', 'Advanced Planetary Charts', 'Access advanced transit analysis and planetary charts', 'feature', 0, 0, 0, 20, false, 43),
    ('unlock-food-journal-photo', 'Food Journal Photo Upload', 'Attach a photo to your food lab journal entry', 'feature', 0, 5, 5, 0, false, 44),
    ('unlock-dining-companions', 'Unlimited Companions (30 days)', 'Unlock unlimited dining companions for 30 days', 'feature', 20, 0, 20, 0, false, 45),
    ('unlock-instacart-sync', 'Instacart Sync Access', 'Sync recipe ingredients to your Instacart cart', 'feature', 0, 0, 15, 10, false, 46)
ON CONFLICT (slug) DO NOTHING;

-- ─── Restaurant & Photo Quest Definitions ─────────────────────────────

INSERT INTO quest_definitions (slug, title, description, quest_type, token_reward_type, token_reward_amount, trigger_event, trigger_threshold, sort_order)
VALUES
    ('daily-discover-restaurant', 'The Connoisseur', 'Save a restaurant to your collection', 'daily', 'Essence', 3, 'save_restaurant', 1, 6),
    ('weekly-restaurant-reviewer', 'The Critic''s Pen', 'Rate 3 restaurants you''ve visited', 'weekly', 'Matter', 20, 'review_restaurant', 3, 14),
    ('achieve-first-restaurant', 'First Discovery', 'Save your first restaurant', 'achievement', 'all', 15, 'save_restaurant', 1, 24),
    ('achieve-photo-journalist', 'Photo Journalist', 'Upload 5 food photos to your lab book', 'achievement', 'Essence', 25, 'upload_food_photo', 5, 25),
    ('weekly-photo-chronicler', 'Photo Chronicler', 'Upload 3 food photos this week', 'weekly', 'Essence', 15, 'upload_food_photo', 3, 15)
ON CONFLICT (slug) DO NOTHING;

