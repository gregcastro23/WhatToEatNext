-- Food Diary Schema Extension
-- Created: February 2026 for Beta Readiness
-- Extends base schema with food diary tracking tables

-- ==========================================
-- MEAL TYPE ENUM
-- ==========================================
CREATE TYPE meal_type AS ENUM ('breakfast', 'lunch', 'dinner', 'snack');
CREATE TYPE food_rating AS ENUM ('1', '2', '3', '4', '5');
CREATE TYPE nutrition_confidence AS ENUM ('high', 'medium', 'low');
CREATE TYPE food_source AS ENUM ('quick', 'recipe', 'manual', 'barcode', 'favorite', 'custom');

-- ==========================================
-- USER PROFILES EXTENSION
-- ==========================================

-- User profiles table for extended user data (birth data, natal charts, etc.)
-- This extends the users table with application-specific profile data
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    name VARCHAR(255),

    -- Birth data for astrological calculations
    birth_data JSONB DEFAULT '{}',
    -- Computed natal chart
    natal_chart JSONB DEFAULT '{}',

    -- Dietary preferences and restrictions
    dietary_preferences JSONB DEFAULT '{}',
    -- { allergies: [], restrictions: [], healthConditions: [], goals: [] }

    -- Group dining support
    group_members JSONB DEFAULT '[]',
    dining_groups JSONB DEFAULT '[]',

    -- Onboarding status
    onboarding_completed BOOLEAN DEFAULT false,
    onboarding_completed_at TIMESTAMP WITH TIME ZONE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trigger for updated_at
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- FOOD DIARY TABLES
-- ==========================================

-- Food diary entries
CREATE TABLE food_diary_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,

    -- Food identification
    food_name VARCHAR(255) NOT NULL,
    food_source food_source NOT NULL DEFAULT 'custom',
    source_id VARCHAR(100), -- Reference to quick_food_presets, recipe, etc.
    brand_name VARCHAR(255),

    -- When eaten
    date DATE NOT NULL,
    meal_type meal_type NOT NULL,
    time TIME NOT NULL,

    -- Portion information
    serving_amount DECIMAL(8,3) NOT NULL DEFAULT 1,
    serving_unit VARCHAR(50) NOT NULL DEFAULT 'serving',
    serving_grams DECIMAL(8,2),
    serving_description VARCHAR(255),
    quantity DECIMAL(8,3) NOT NULL DEFAULT 1,

    -- Nutrition data (computed from serving * quantity)
    calories DECIMAL(8,2),
    protein DECIMAL(6,2),
    carbs DECIMAL(6,2),
    fat DECIMAL(6,2),
    fiber DECIMAL(6,2),
    sugar DECIMAL(6,2),
    sodium DECIMAL(8,2),
    saturated_fat DECIMAL(6,2),
    potassium DECIMAL(8,2),
    cholesterol DECIMAL(6,2),
    nutrition_confidence nutrition_confidence DEFAULT 'medium',

    -- Elemental properties (for alchemical calculations)
    elemental_fire DECIMAL(4,3),
    elemental_water DECIMAL(4,3),
    elemental_earth DECIMAL(4,3),
    elemental_air DECIMAL(4,3),

    -- User feedback
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    mood_tags TEXT[] DEFAULT '{}',
    notes TEXT,
    would_eat_again BOOLEAN,
    is_favorite BOOLEAN DEFAULT false,
    tags TEXT[] DEFAULT '{}',

    -- Astrological context at time of eating
    astrological_context JSONB DEFAULT '{}',
    -- { dominantPlanet, zodiacSign, lunarPhase, planetaryHour }

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trigger for updated_at
CREATE TRIGGER update_food_diary_entries_updated_at
    BEFORE UPDATE ON food_diary_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- User favorite foods
CREATE TABLE user_food_favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,

    food_name VARCHAR(255) NOT NULL,
    food_source food_source NOT NULL DEFAULT 'custom',
    source_id VARCHAR(100),
    brand_name VARCHAR(255),

    -- Custom serving info
    custom_serving JSONB DEFAULT '{}',
    -- { amount, unit, grams, description }

    -- Custom nutrition (if modified from source)
    custom_nutrition JSONB DEFAULT '{}',

    -- Usage stats
    times_eaten INTEGER DEFAULT 0,
    average_rating DECIMAL(2,1),
    last_eaten DATE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(user_id, food_name, source_id)
);

-- Quick food presets (stored in DB for easy updates)
CREATE TABLE quick_food_presets (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,

    -- Default serving
    default_serving_amount DECIMAL(8,3) NOT NULL DEFAULT 1,
    default_serving_unit VARCHAR(50) NOT NULL,
    default_serving_grams DECIMAL(8,2),
    default_serving_description VARCHAR(255),

    -- Nutrition per 100g
    nutrition_per_100g JSONB NOT NULL,
    -- { calories, protein, carbs, fat, fiber, sugar, sodium, etc. }

    icon VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trigger for updated_at
CREATE TRIGGER update_quick_food_presets_updated_at
    BEFORE UPDATE ON quick_food_presets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- NUTRITION TARGETS
-- ==========================================

-- User nutrition targets/goals
CREATE TABLE user_nutrition_targets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,

    -- Daily targets
    daily_calories INTEGER DEFAULT 2000,
    daily_protein INTEGER DEFAULT 50,
    daily_carbs INTEGER DEFAULT 250,
    daily_fat INTEGER DEFAULT 65,
    daily_fiber INTEGER DEFAULT 28,
    daily_sodium INTEGER DEFAULT 2300,
    daily_sugar INTEGER DEFAULT 50,
    daily_saturated_fat INTEGER DEFAULT 20,
    daily_potassium INTEGER DEFAULT 4700,
    daily_cholesterol INTEGER DEFAULT 300,

    -- Goal type
    goal_type VARCHAR(50) DEFAULT 'maintain',
    -- 'lose_weight', 'gain_weight', 'maintain', 'build_muscle', 'custom'

    -- Activity level multiplier
    activity_multiplier DECIMAL(3,2) DEFAULT 1.0,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trigger for updated_at
CREATE TRIGGER update_user_nutrition_targets_updated_at
    BEFORE UPDATE ON user_nutrition_targets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- INDEXES FOR FOOD DIARY
-- ==========================================

-- User profiles indexes
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_onboarding ON user_profiles(onboarding_completed) WHERE onboarding_completed = false;

-- Food diary entries indexes
CREATE INDEX idx_food_diary_user_id ON food_diary_entries(user_id);
CREATE INDEX idx_food_diary_user_date ON food_diary_entries(user_id, date DESC);
CREATE INDEX idx_food_diary_date ON food_diary_entries(date);
CREATE INDEX idx_food_diary_meal_type ON food_diary_entries(meal_type);
CREATE INDEX idx_food_diary_source ON food_diary_entries(food_source, source_id);
CREATE INDEX idx_food_diary_favorite ON food_diary_entries(user_id, is_favorite) WHERE is_favorite = true;
CREATE INDEX idx_food_diary_rated ON food_diary_entries(user_id, rating) WHERE rating IS NOT NULL;
CREATE INDEX idx_food_diary_created ON food_diary_entries(created_at);

-- User favorites indexes
CREATE INDEX idx_user_favorites_user_id ON user_food_favorites(user_id);
CREATE INDEX idx_user_favorites_source ON user_food_favorites(food_source, source_id);
CREATE INDEX idx_user_favorites_last_eaten ON user_food_favorites(user_id, last_eaten DESC);

-- Quick food presets indexes
CREATE INDEX idx_quick_food_category ON quick_food_presets(category) WHERE is_active = true;
CREATE INDEX idx_quick_food_name ON quick_food_presets USING GIN(name gin_trgm_ops);

-- Nutrition targets indexes
CREATE INDEX idx_nutrition_targets_user_id ON user_nutrition_targets(user_id);

-- ==========================================
-- VIEWS
-- ==========================================

-- Daily nutrition summary view
CREATE VIEW daily_nutrition_summary AS
SELECT
    user_id,
    date,
    COUNT(*) as entry_count,
    SUM(calories) as total_calories,
    SUM(protein) as total_protein,
    SUM(carbs) as total_carbs,
    SUM(fat) as total_fat,
    SUM(fiber) as total_fiber,
    SUM(sugar) as total_sugar,
    SUM(sodium) as total_sodium
FROM food_diary_entries
GROUP BY user_id, date;

-- Meal breakdown view
CREATE VIEW meal_nutrition_breakdown AS
SELECT
    user_id,
    date,
    meal_type,
    COUNT(*) as entry_count,
    SUM(calories) as calories,
    SUM(protein) as protein,
    SUM(carbs) as carbs,
    SUM(fat) as fat
FROM food_diary_entries
GROUP BY user_id, date, meal_type;

-- ==========================================
-- FUNCTIONS
-- ==========================================

-- Function to get user's streak (consecutive days with entries)
CREATE OR REPLACE FUNCTION get_user_tracking_streak(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    streak INTEGER := 0;
    current_date DATE := CURRENT_DATE;
    check_date DATE;
    has_entry BOOLEAN;
BEGIN
    LOOP
        check_date := current_date - streak;
        SELECT EXISTS(
            SELECT 1 FROM food_diary_entries
            WHERE user_id = p_user_id AND date = check_date
        ) INTO has_entry;

        EXIT WHEN NOT has_entry;
        streak := streak + 1;
    END LOOP;

    RETURN streak;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate weekly averages
CREATE OR REPLACE FUNCTION get_weekly_nutrition_avg(
    p_user_id UUID,
    p_start_date DATE DEFAULT CURRENT_DATE - 7
)
RETURNS TABLE (
    avg_calories DECIMAL,
    avg_protein DECIMAL,
    avg_carbs DECIMAL,
    avg_fat DECIMAL,
    avg_fiber DECIMAL,
    days_tracked INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        ROUND(AVG(daily.total_calories), 1) as avg_calories,
        ROUND(AVG(daily.total_protein), 1) as avg_protein,
        ROUND(AVG(daily.total_carbs), 1) as avg_carbs,
        ROUND(AVG(daily.total_fat), 1) as avg_fat,
        ROUND(AVG(daily.total_fiber), 1) as avg_fiber,
        COUNT(DISTINCT daily.date)::INTEGER as days_tracked
    FROM (
        SELECT
            date,
            SUM(calories) as total_calories,
            SUM(protein) as total_protein,
            SUM(carbs) as total_carbs,
            SUM(fat) as total_fat,
            SUM(fiber) as total_fiber
        FROM food_diary_entries
        WHERE user_id = p_user_id
          AND date >= p_start_date
          AND date <= CURRENT_DATE
        GROUP BY date
    ) daily;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- COMMENTS
-- ==========================================

COMMENT ON TABLE user_profiles IS 'Extended user profile data including birth info and dietary preferences';
COMMENT ON TABLE food_diary_entries IS 'User food tracking entries with nutrition and rating data';
COMMENT ON TABLE user_food_favorites IS 'User favorite foods for quick access';
COMMENT ON TABLE quick_food_presets IS 'Pre-defined common foods with nutrition data';
COMMENT ON TABLE user_nutrition_targets IS 'User daily nutrition goals and targets';
COMMENT ON VIEW daily_nutrition_summary IS 'Aggregated daily nutrition totals per user';
COMMENT ON VIEW meal_nutrition_breakdown IS 'Nutrition breakdown by meal type per day';
