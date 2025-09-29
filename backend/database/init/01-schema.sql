-- alchm.kitchen Database Schema
-- Optimized for alchemical calculations and recipe recommendations
-- Created: September 22, 2025 for Phase 25 Production Deployment

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "btree_gin";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'user', 'guest', 'service');
CREATE TYPE planet_type AS ENUM ('Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto');
CREATE TYPE zodiac_sign AS ENUM ('Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces');
CREATE TYPE lunar_phase AS ENUM ('New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous', 'Full Moon', 'Waning Gibbous', 'Last Quarter', 'Waning Crescent');
CREATE TYPE season AS ENUM ('Spring', 'Summer', 'Autumn', 'Winter');
CREATE TYPE cuisine_type AS ENUM ('Italian', 'French', 'Chinese', 'Japanese', 'Indian', 'Mexican', 'Thai', 'Vietnamese', 'Korean', 'Greek', 'Middle Eastern', 'American', 'African', 'Russian');
CREATE TYPE dietary_restriction AS ENUM ('Vegetarian', 'Vegan', 'Gluten Free', 'Dairy Free', 'Keto', 'Paleo', 'Low Carb', 'Kosher', 'Halal');

-- ==========================================
-- USER MANAGEMENT TABLES
-- ==========================================

-- Users table for authentication
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    roles user_role[] NOT NULL DEFAULT '{user}',
    is_active BOOLEAN NOT NULL DEFAULT true,
    email_verified BOOLEAN NOT NULL DEFAULT false,
    profile JSONB DEFAULT '{}',
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP WITH TIME ZONE,
    login_count INTEGER DEFAULT 0
);

-- API keys for external integrations
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    key_hash VARCHAR(255) NOT NULL UNIQUE,
    scopes TEXT[] NOT NULL DEFAULT '{}',
    rate_limit_tier VARCHAR(20) DEFAULT 'authenticated',
    is_active BOOLEAN NOT NULL DEFAULT true,
    expires_at TIMESTAMP WITH TIME ZONE,
    last_used_at TIMESTAMP WITH TIME ZONE,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- ALCHEMICAL DATA TABLES
-- ==========================================

-- Elemental properties base structure
CREATE TABLE elemental_properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type VARCHAR(50) NOT NULL, -- 'ingredient', 'recipe', 'user_state'
    entity_id UUID NOT NULL,
    fire DECIMAL(4,3) NOT NULL CHECK (fire >= 0 AND fire <= 1),
    water DECIMAL(4,3) NOT NULL CHECK (water >= 0 AND water <= 1),
    earth DECIMAL(4,3) NOT NULL CHECK (earth >= 0 AND earth <= 1),
    air DECIMAL(4,3) NOT NULL CHECK (air >= 0 AND air <= 1),
    calculation_method VARCHAR(50) DEFAULT 'manual',
    confidence_score DECIMAL(3,2) DEFAULT 1.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT elemental_balance_sum CHECK ((fire + water + earth + air) BETWEEN 0.95 AND 1.05)
);

-- Planetary influences
CREATE TABLE planetary_influences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    planet planet_type NOT NULL,
    influence_strength DECIMAL(3,2) NOT NULL CHECK (influence_strength >= 0 AND influence_strength <= 1),
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Zodiac affinities
CREATE TABLE zodiac_affinities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    zodiac_sign zodiac_sign NOT NULL,
    affinity_strength DECIMAL(3,2) NOT NULL CHECK (affinity_strength >= 0 AND affinity_strength <= 1),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seasonal associations
CREATE TABLE seasonal_associations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    season season NOT NULL,
    strength DECIMAL(3,2) NOT NULL CHECK (strength >= 0 AND strength <= 1),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- INGREDIENT TABLES
-- ==========================================

-- Ingredients master table
CREATE TABLE ingredients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    common_name VARCHAR(255),
    scientific_name VARCHAR(255),
    category VARCHAR(100) NOT NULL,
    subcategory VARCHAR(100),
    description TEXT,

    -- Nutritional data (per 100g)
    calories DECIMAL(6,2),
    protein DECIMAL(5,2),
    carbohydrates DECIMAL(5,2),
    fat DECIMAL(5,2),
    fiber DECIMAL(5,2),
    sugar DECIMAL(5,2),

    -- Flavor profile
    flavor_profile JSONB DEFAULT '{}',
    preparation_methods TEXT[] DEFAULT '{}',

    -- Metadata
    is_active BOOLEAN DEFAULT true,
    data_source VARCHAR(100),
    confidence_score DECIMAL(3,2) DEFAULT 1.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Ingredient cuisine associations
CREATE TABLE ingredient_cuisines (
    ingredient_id UUID REFERENCES ingredients(id) ON DELETE CASCADE,
    cuisine cuisine_type NOT NULL,
    usage_frequency DECIMAL(3,2) DEFAULT 0.5,
    PRIMARY KEY (ingredient_id, cuisine)
);

-- Ingredient compatibility matrix
CREATE TABLE ingredient_compatibility (
    ingredient_a_id UUID REFERENCES ingredients(id) ON DELETE CASCADE,
    ingredient_b_id UUID REFERENCES ingredients(id) ON DELETE CASCADE,
    compatibility_score DECIMAL(3,2) NOT NULL CHECK (compatibility_score >= 0 AND compatibility_score <= 1),
    interaction_type VARCHAR(50) DEFAULT 'neutral', -- 'synergistic', 'neutral', 'conflicting'
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (ingredient_a_id, ingredient_b_id),
    CHECK (ingredient_a_id != ingredient_b_id)
);

-- ==========================================
-- RECIPE TABLES
-- ==========================================

-- Recipes master table
CREATE TABLE recipes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    cuisine cuisine_type NOT NULL,
    category VARCHAR(100) NOT NULL, -- 'appetizer', 'main', 'dessert', etc.

    -- Instructions and timing
    instructions JSONB NOT NULL, -- Array of step objects
    prep_time_minutes INTEGER NOT NULL CHECK (prep_time_minutes >= 0),
    cook_time_minutes INTEGER NOT NULL CHECK (cook_time_minutes >= 0),
    servings INTEGER NOT NULL CHECK (servings > 0),
    difficulty_level INTEGER NOT NULL CHECK (difficulty_level BETWEEN 1 AND 5),

    -- Dietary information
    dietary_tags dietary_restriction[] DEFAULT '{}',
    allergens TEXT[] DEFAULT '{}',
    nutritional_profile JSONB DEFAULT '{}',

    -- Scoring and popularity
    popularity_score DECIMAL(3,2) DEFAULT 0.5,
    alchemical_harmony_score DECIMAL(3,2) DEFAULT 0.5,
    cultural_authenticity_score DECIMAL(3,2) DEFAULT 0.5,
    user_rating DECIMAL(2,1) DEFAULT 0.0,
    rating_count INTEGER DEFAULT 0,

    -- Metadata
    author_id UUID REFERENCES users(id) ON DELETE SET NULL,
    source VARCHAR(255),
    is_public BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Recipe ingredients with quantities
CREATE TABLE recipe_ingredients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
    ingredient_id UUID REFERENCES ingredients(id) ON DELETE RESTRICT,
    quantity DECIMAL(8,3) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    preparation_notes TEXT,
    is_optional BOOLEAN DEFAULT false,
    group_name VARCHAR(100), -- For ingredient groupings
    order_index INTEGER DEFAULT 0
);

-- Recipe recommended contexts
CREATE TABLE recipe_contexts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
    recommended_moon_phases lunar_phase[],
    recommended_seasons season[],
    time_of_day VARCHAR(50)[], -- 'morning', 'afternoon', 'evening', 'late_night'
    occasion VARCHAR(100)[], -- 'everyday', 'celebration', 'healing', 'meditation'
    energy_intention VARCHAR(100) -- 'grounding', 'energizing', 'calming', 'balancing'
);

-- ==========================================
-- CALCULATION AND ANALYTICS TABLES
-- ==========================================

-- Calculation cache for performance
CREATE TABLE calculation_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cache_key VARCHAR(255) UNIQUE NOT NULL,
    calculation_type VARCHAR(100) NOT NULL,
    input_data JSONB NOT NULL,
    result_data JSONB NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    hit_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User calculation history
CREATE TABLE user_calculations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    calculation_type VARCHAR(100) NOT NULL,
    input_data JSONB NOT NULL,
    result_data JSONB NOT NULL,
    execution_time_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Recommendation history and feedback
CREATE TABLE recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    request_context JSONB NOT NULL,
    recommended_recipes UUID[] NOT NULL,
    recipe_scores JSONB NOT NULL, -- Array of {recipe_id, score, reasons}
    algorithm_version VARCHAR(50) NOT NULL,
    user_feedback JSONB, -- User ratings, selections, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- System metrics and analytics
CREATE TABLE system_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(15,4) NOT NULL,
    metric_unit VARCHAR(50),
    tags JSONB DEFAULT '{}',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- PERFORMANCE INDEXES
-- ==========================================

-- User table indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_roles ON users USING GIN(roles);
CREATE INDEX idx_users_active ON users(is_active) WHERE is_active = true;
CREATE INDEX idx_users_created_at ON users(created_at);

-- API keys indexes
CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX idx_api_keys_hash ON api_keys(key_hash);
CREATE INDEX idx_api_keys_active ON api_keys(is_active) WHERE is_active = true;

-- Elemental properties indexes
CREATE INDEX idx_elemental_props_entity ON elemental_properties(entity_type, entity_id);
CREATE INDEX idx_elemental_props_fire ON elemental_properties(fire);
CREATE INDEX idx_elemental_props_water ON elemental_properties(water);
CREATE INDEX idx_elemental_props_earth ON elemental_properties(earth);
CREATE INDEX idx_elemental_props_air ON elemental_properties(air);

-- Planetary influences indexes
CREATE INDEX idx_planetary_entity ON planetary_influences(entity_type, entity_id);
CREATE INDEX idx_planetary_planet ON planetary_influences(planet);
CREATE INDEX idx_planetary_strength ON planetary_influences(influence_strength);
CREATE INDEX idx_planetary_primary ON planetary_influences(is_primary) WHERE is_primary = true;

-- Zodiac affinities indexes
CREATE INDEX idx_zodiac_entity ON zodiac_affinities(entity_type, entity_id);
CREATE INDEX idx_zodiac_sign ON zodiac_affinities(zodiac_sign);

-- Seasonal associations indexes
CREATE INDEX idx_seasonal_entity ON seasonal_associations(entity_type, entity_id);
CREATE INDEX idx_seasonal_season ON seasonal_associations(season);

-- Ingredients indexes
CREATE INDEX idx_ingredients_name ON ingredients USING GIN(name gin_trgm_ops);
CREATE INDEX idx_ingredients_category ON ingredients(category);
CREATE INDEX idx_ingredients_subcategory ON ingredients(subcategory);
CREATE INDEX idx_ingredients_active ON ingredients(is_active) WHERE is_active = true;
CREATE INDEX idx_ingredients_flavor ON ingredients USING GIN(flavor_profile);

-- Ingredient cuisine indexes
CREATE INDEX idx_ingredient_cuisines_ingredient ON ingredient_cuisines(ingredient_id);
CREATE INDEX idx_ingredient_cuisines_cuisine ON ingredient_cuisines(cuisine);

-- Ingredient compatibility indexes
CREATE INDEX idx_compatibility_a ON ingredient_compatibility(ingredient_a_id);
CREATE INDEX idx_compatibility_b ON ingredient_compatibility(ingredient_b_id);
CREATE INDEX idx_compatibility_score ON ingredient_compatibility(compatibility_score);

-- Recipe indexes
CREATE INDEX idx_recipes_name ON recipes USING GIN(name gin_trgm_ops);
CREATE INDEX idx_recipes_cuisine ON recipes(cuisine);
CREATE INDEX idx_recipes_category ON recipes(category);
CREATE INDEX idx_recipes_difficulty ON recipes(difficulty_level);
CREATE INDEX idx_recipes_prep_time ON recipes(prep_time_minutes);
CREATE INDEX idx_recipes_cook_time ON recipes(cook_time_minutes);
CREATE INDEX idx_recipes_dietary ON recipes USING GIN(dietary_tags);
CREATE INDEX idx_recipes_popularity ON recipes(popularity_score DESC);
CREATE INDEX idx_recipes_rating ON recipes(user_rating DESC);
CREATE INDEX idx_recipes_public ON recipes(is_public) WHERE is_public = true;
CREATE INDEX idx_recipes_created_at ON recipes(created_at);

-- Recipe ingredients indexes
CREATE INDEX idx_recipe_ingredients_recipe ON recipe_ingredients(recipe_id);
CREATE INDEX idx_recipe_ingredients_ingredient ON recipe_ingredients(ingredient_id);
CREATE INDEX idx_recipe_ingredients_order ON recipe_ingredients(recipe_id, order_index);

-- Recipe contexts indexes
CREATE INDEX idx_recipe_contexts_recipe ON recipe_contexts(recipe_id);
CREATE INDEX idx_recipe_contexts_moon_phases ON recipe_contexts USING GIN(recommended_moon_phases);
CREATE INDEX idx_recipe_contexts_seasons ON recipe_contexts USING GIN(recommended_seasons);

-- Calculation cache indexes
CREATE INDEX idx_cache_key ON calculation_cache(cache_key);
CREATE INDEX idx_cache_type ON calculation_cache(calculation_type);
CREATE INDEX idx_cache_expires ON calculation_cache(expires_at);
CREATE INDEX idx_cache_hits ON calculation_cache(hit_count DESC);

-- User calculations indexes
CREATE INDEX idx_user_calc_user ON user_calculations(user_id);
CREATE INDEX idx_user_calc_type ON user_calculations(calculation_type);
CREATE INDEX idx_user_calc_created ON user_calculations(created_at);

-- Recommendations indexes
CREATE INDEX idx_recommendations_user ON recommendations(user_id);
CREATE INDEX idx_recommendations_created ON recommendations(created_at);
CREATE INDEX idx_recommendations_recipes ON recommendations USING GIN(recommended_recipes);

-- System metrics indexes
CREATE INDEX idx_metrics_name ON system_metrics(metric_name);
CREATE INDEX idx_metrics_timestamp ON system_metrics(timestamp);
CREATE INDEX idx_metrics_tags ON system_metrics USING GIN(tags);

-- ==========================================
-- TRIGGERS AND FUNCTIONS
-- ==========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ingredients_updated_at BEFORE UPDATE ON ingredients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_recipes_updated_at BEFORE UPDATE ON recipes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_elemental_props_updated_at BEFORE UPDATE ON elemental_properties FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to clean expired cache entries
CREATE OR REPLACE FUNCTION clean_expired_cache()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM calculation_cache WHERE expires_at < CURRENT_TIMESTAMP;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate recipe popularity score
CREATE OR REPLACE FUNCTION update_recipe_popularity()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE recipes
    SET popularity_score = LEAST(1.0, (
        (COALESCE(rating_count, 0) * 0.3) +
        (COALESCE(user_rating, 0) * 0.1) +
        (popularity_score * 0.6)
    ))
    WHERE id = NEW.id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for recipe popularity updates
CREATE TRIGGER update_recipe_popularity_trigger
    AFTER UPDATE OF user_rating, rating_count ON recipes
    FOR EACH ROW
    EXECUTE FUNCTION update_recipe_popularity();

-- ==========================================
-- INITIAL DATA AND CONSTRAINTS
-- ==========================================

-- Create admin user
INSERT INTO users (email, password_hash, roles, is_active, email_verified)
VALUES (
    'admin@alchm.kitchen',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', -- 'admin123'
    '{admin}',
    true,
    true
) ON CONFLICT (email) DO NOTHING;

-- Create service user for backend communications
INSERT INTO users (email, password_hash, roles, is_active, email_verified)
VALUES (
    'service@alchm.kitchen',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', -- 'service123'
    '{service}',
    true,
    true
) ON CONFLICT (email) DO NOTHING;

-- Grant proper permissions
GRANT CONNECT ON DATABASE alchm_kitchen TO alchm_app;
GRANT USAGE ON SCHEMA public TO alchm_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO alchm_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO alchm_app;

-- Set default permissions for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO alchm_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO alchm_app;

-- Create view for quick user lookup
CREATE VIEW active_users AS
SELECT id, email, roles, created_at, last_login_at, login_count
FROM users
WHERE is_active = true;

-- Create view for recipe search
CREATE VIEW recipe_search AS
SELECT
    r.id,
    r.name,
    r.description,
    r.cuisine,
    r.category,
    r.prep_time_minutes,
    r.cook_time_minutes,
    r.difficulty_level,
    r.dietary_tags,
    r.popularity_score,
    r.user_rating,
    ep.fire,
    ep.water,
    ep.earth,
    ep.air
FROM recipes r
LEFT JOIN elemental_properties ep ON (ep.entity_type = 'recipe' AND ep.entity_id = r.id)
WHERE r.is_public = true;

COMMENT ON DATABASE alchm_kitchen IS 'alchm.kitchen production database - optimized for alchemical calculations and recipe recommendations';
COMMENT ON TABLE users IS 'User authentication and profile management';
COMMENT ON TABLE ingredients IS 'Master ingredient database with alchemical properties';
COMMENT ON TABLE recipes IS 'Recipe database with elemental and cultural information';
COMMENT ON TABLE elemental_properties IS 'Four-element alchemical properties for all entities';
COMMENT ON TABLE calculation_cache IS 'Performance cache for expensive alchemical calculations';