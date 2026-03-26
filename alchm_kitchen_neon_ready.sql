--
-- PostgreSQL database schema for Alchm Kitchen
-- Neon-compatible version (no COPY statements, no owner changes)
--

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;

-- ENUM Types
CREATE TYPE public.commensalship_status AS ENUM ('pending', 'accepted', 'blocked');
CREATE TYPE public.cuisine_type AS ENUM ('Italian', 'French', 'Chinese', 'Japanese', 'Indian', 'Mexican', 'Thai', 'Vietnamese', 'Korean', 'Greek', 'Middle Eastern', 'American', 'African', 'Russian');
CREATE TYPE public.dietary_restriction AS ENUM ('Vegetarian', 'Vegan', 'Gluten Free', 'Dairy Free', 'Keto', 'Paleo', 'Low Carb', 'Kosher', 'Halal');
CREATE TYPE public.friendship_status AS ENUM ('pending', 'accepted', 'blocked');
CREATE TYPE public.lunar_phase AS ENUM ('New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous', 'Full Moon', 'Waning Gibbous', 'Last Quarter', 'Waning Crescent');
CREATE TYPE public.planet_type AS ENUM ('Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto');
CREATE TYPE public.season AS ENUM ('Spring', 'Summer', 'Autumn', 'Winter');
CREATE TYPE public.subscription_status AS ENUM ('active', 'past_due', 'canceled', 'trialing', 'incomplete', 'unpaid');
CREATE TYPE public.subscription_tier AS ENUM ('free', 'premium');
CREATE TYPE public.user_role AS ENUM ('ALCHEMIST', 'GRAND_MASTER', 'USER', 'ADMIN');
CREATE TYPE public.zodiac_sign AS ENUM ('Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces');

-- Tables

CREATE TABLE public.users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL PRIMARY KEY,
    email character varying(255) NOT NULL UNIQUE,
    password_hash character varying(255) NOT NULL,
    is_active boolean NOT NULL DEFAULT true,
    email_verified boolean NOT NULL DEFAULT false,
    profile jsonb NOT NULL DEFAULT '{}',
    preferences jsonb NOT NULL DEFAULT '{}',
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    last_login_at timestamp with time zone,
    login_count integer NOT NULL DEFAULT 0,
    "onboardingComplete" boolean DEFAULT false,
    "birthDate" date,
    "birthTime" time without time zone,
    "birthLocation" character varying(255),
    name character varying(255),
    image text,
    "emailVerified" timestamp with time zone,
    role public.user_role DEFAULT 'USER'::public.user_role
);

CREATE TABLE public.accounts (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL PRIMARY KEY,
    "userId" uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    type character varying(255) NOT NULL,
    provider character varying(255) NOT NULL,
    "providerAccountId" character varying(255) NOT NULL,
    refresh_token text,
    access_token text,
    expires_at bigint,
    token_type character varying(255),
    scope character varying(255),
    id_token text,
    session_state character varying(255),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "accounts_provider_providerAccountId_key" UNIQUE (provider, "providerAccountId")
);

CREATE TABLE public.sessions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL PRIMARY KEY,
    "sessionToken" character varying(255) NOT NULL UNIQUE,
    "userId" uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    expires timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.verification_token (
    identifier character varying(255) NOT NULL,
    token character varying(255) NOT NULL,
    expires timestamp with time zone NOT NULL,
    PRIMARY KEY (identifier, token)
);

CREATE TABLE public.api_keys (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name character varying(100) NOT NULL,
    key_hash character varying(255) NOT NULL UNIQUE,
    scopes character varying[] NOT NULL,
    rate_limit_tier character varying(20) NOT NULL,
    is_active boolean NOT NULL DEFAULT true,
    expires_at timestamp with time zone,
    last_used_at timestamp with time zone,
    usage_count integer NOT NULL DEFAULT 0,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.calculation_cache (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL PRIMARY KEY,
    cache_key character varying(255) NOT NULL UNIQUE,
    calculation_type character varying(100) NOT NULL,
    input_data jsonb NOT NULL,
    result_data jsonb NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    hit_count integer NOT NULL DEFAULT 0,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    last_accessed_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.commensalships (
    id character varying(64) NOT NULL PRIMARY KEY,
    requester_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    addressee_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    status public.commensalship_status DEFAULT 'pending' NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT no_self_commensalship CHECK (requester_id <> addressee_id),
    CONSTRAINT unique_commensalship UNIQUE (requester_id, addressee_id)
);

CREATE TABLE public.friendships (
    id character varying(64) NOT NULL PRIMARY KEY,
    requester_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    addressee_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    status public.friendship_status DEFAULT 'pending' NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT no_self_friendship CHECK (requester_id <> addressee_id),
    CONSTRAINT unique_friendship UNIQUE (requester_id, addressee_id)
);

CREATE TABLE public.ingredients (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL PRIMARY KEY,
    name character varying(255) NOT NULL,
    common_name character varying(255),
    scientific_name character varying(255),
    category character varying(100) NOT NULL,
    subcategory character varying(100),
    description text,
    calories real,
    protein real,
    carbohydrates real,
    fat real,
    fiber real,
    sugar real,
    flavor_profile jsonb NOT NULL DEFAULT '{}',
    preparation_methods character varying[] NOT NULL DEFAULT '{}',
    is_active boolean NOT NULL DEFAULT true,
    data_source character varying(100),
    confidence_score real NOT NULL DEFAULT 1,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.ingredient_compatibility (
    ingredient_a_id uuid NOT NULL REFERENCES public.ingredients(id) ON DELETE CASCADE,
    ingredient_b_id uuid NOT NULL REFERENCES public.ingredients(id) ON DELETE CASCADE,
    compatibility_score real NOT NULL,
    interaction_type character varying(50) NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    PRIMARY KEY (ingredient_a_id, ingredient_b_id),
    CONSTRAINT compatibility_score_range CHECK (compatibility_score >= 0 AND compatibility_score <= 1),
    CONSTRAINT different_ingredients CHECK (ingredient_a_id <> ingredient_b_id)
);

CREATE TABLE public.ingredient_cuisines (
    ingredient_id uuid NOT NULL REFERENCES public.ingredients(id) ON DELETE CASCADE,
    cuisine public.cuisine_type NOT NULL,
    usage_frequency real NOT NULL,
    PRIMARY KEY (ingredient_id, cuisine),
    CONSTRAINT usage_frequency_range CHECK (usage_frequency >= 0 AND usage_frequency <= 1)
);

CREATE TABLE public.recipes (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL PRIMARY KEY,
    name character varying(255) NOT NULL,
    description text,
    cuisine public.cuisine_type NOT NULL,
    category character varying(100) NOT NULL,
    instructions jsonb NOT NULL DEFAULT '{}',
    prep_time_minutes integer NOT NULL DEFAULT 0,
    cook_time_minutes integer NOT NULL DEFAULT 0,
    servings integer NOT NULL DEFAULT 1,
    difficulty_level integer NOT NULL DEFAULT 1,
    dietary_tags public.dietary_restriction[] NOT NULL DEFAULT '{}',
    allergens character varying[] NOT NULL DEFAULT '{}',
    nutritional_profile jsonb NOT NULL DEFAULT '{}',
    popularity_score real NOT NULL DEFAULT 0.5,
    alchemical_harmony_score real NOT NULL DEFAULT 0.5,
    cultural_authenticity_score real NOT NULL DEFAULT 0.5,
    user_rating real NOT NULL DEFAULT 0,
    rating_count integer NOT NULL DEFAULT 0,
    author_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
    source character varying(255),
    is_public boolean NOT NULL DEFAULT true,
    is_verified boolean NOT NULL DEFAULT false,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT authenticity_range CHECK (cultural_authenticity_score >= 0 AND cultural_authenticity_score <= 1),
    CONSTRAINT cook_time_positive CHECK (cook_time_minutes >= 0),
    CONSTRAINT difficulty_range CHECK (difficulty_level >= 1 AND difficulty_level <= 5),
    CONSTRAINT harmony_range CHECK (alchemical_harmony_score >= 0 AND alchemical_harmony_score <= 1),
    CONSTRAINT popularity_range CHECK (popularity_score >= 0 AND popularity_score <= 1),
    CONSTRAINT prep_time_positive CHECK (prep_time_minutes >= 0),
    CONSTRAINT rating_range CHECK (user_rating >= 0 AND user_rating <= 5),
    CONSTRAINT servings_positive CHECK (servings > 0)
);

CREATE TABLE public.recipe_ingredients (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL PRIMARY KEY,
    recipe_id uuid NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
    ingredient_id uuid NOT NULL REFERENCES public.ingredients(id) ON DELETE RESTRICT,
    quantity real NOT NULL,
    unit character varying(50) NOT NULL,
    preparation_notes text,
    is_optional boolean NOT NULL DEFAULT false,
    group_name character varying(100),
    order_index integer NOT NULL DEFAULT 0,
    CONSTRAINT quantity_positive CHECK (quantity > 0)
);

CREATE TABLE public.recipe_contexts (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL PRIMARY KEY,
    recipe_id uuid NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
    recommended_moon_phases public.lunar_phase[] NOT NULL DEFAULT '{}',
    recommended_seasons public.season[] NOT NULL DEFAULT '{}',
    time_of_day character varying[] NOT NULL DEFAULT '{}',
    occasion character varying[] NOT NULL DEFAULT '{}',
    energy_intention character varying(100)
);

CREATE TABLE public.elemental_properties (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL PRIMARY KEY,
    entity_type character varying(50) NOT NULL,
    entity_id uuid NOT NULL,
    fire real NOT NULL,
    water real NOT NULL,
    earth real NOT NULL,
    air real NOT NULL,
    calculation_method character varying(50),
    confidence_score real NOT NULL DEFAULT 1,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT fire_range CHECK (fire >= 0 AND fire <= 1),
    CONSTRAINT water_range CHECK (water >= 0 AND water <= 1),
    CONSTRAINT earth_range CHECK (earth >= 0 AND earth <= 1),
    CONSTRAINT air_range CHECK (air >= 0 AND air <= 1),
    CONSTRAINT elemental_balance_sum CHECK ((fire + water + earth + air) >= 0.95 AND (fire + water + earth + air) <= 1.05)
);

CREATE TABLE public.planetary_influences (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL PRIMARY KEY,
    entity_type character varying(50) NOT NULL,
    entity_id uuid NOT NULL,
    planet public.planet_type NOT NULL,
    influence_strength real NOT NULL,
    is_primary boolean NOT NULL DEFAULT false,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT influence_strength_range CHECK (influence_strength >= 0 AND influence_strength <= 1)
);

CREATE TABLE public.zodiac_affinities (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL PRIMARY KEY,
    entity_type character varying(50) NOT NULL,
    entity_id uuid NOT NULL,
    zodiac_sign public.zodiac_sign NOT NULL,
    affinity_strength real NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT affinity_strength_range CHECK (affinity_strength >= 0 AND affinity_strength <= 1)
);

CREATE TABLE public.seasonal_associations (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL PRIMARY KEY,
    entity_type character varying(50) NOT NULL,
    entity_id uuid NOT NULL,
    season public.season NOT NULL,
    strength real NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT seasonal_strength_range CHECK (strength >= 0 AND strength <= 1)
);

CREATE TABLE public.recommendations (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    request_context jsonb NOT NULL DEFAULT '{}',
    recommended_recipes character varying[] NOT NULL DEFAULT '{}',
    recipe_scores jsonb NOT NULL DEFAULT '{}',
    algorithm_version character varying(50) NOT NULL,
    user_feedback jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.user_calculations (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    calculation_type character varying(100) NOT NULL,
    input_data jsonb NOT NULL DEFAULT '{}',
    result_data jsonb NOT NULL DEFAULT '{}',
    execution_time_ms integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.user_subscriptions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
    tier public.subscription_tier DEFAULT 'free' NOT NULL,
    status public.subscription_status DEFAULT 'active' NOT NULL,
    stripe_customer_id character varying(255),
    stripe_subscription_id character varying(255) UNIQUE,
    current_period_start timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    current_period_end timestamp with time zone DEFAULT (CURRENT_TIMESTAMP + '30 days'::interval) NOT NULL,
    cancel_at_period_end boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.usage_records (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    feature character varying(100) NOT NULL,
    count integer DEFAULT 0 NOT NULL,
    period_start timestamp with time zone NOT NULL,
    period_end timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_feature_period UNIQUE (user_id, feature, period_start)
);

CREATE TABLE public.system_metrics (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL PRIMARY KEY,
    metric_name character varying(100) NOT NULL,
    metric_value real NOT NULL,
    metric_unit character varying(50),
    tags jsonb NOT NULL DEFAULT '{}',
    "timestamp" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.transit_history (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    matter_score double precision NOT NULL,
    spirit_score double precision NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    is_collective boolean DEFAULT false,
    participant_count integer DEFAULT 1,
    CONSTRAINT matter_score_positive CHECK (matter_score >= 0),
    CONSTRAINT spirit_score_positive CHECK (spirit_score >= 0)
);

-- Indexes
CREATE INDEX idx_accounts_user_id ON public.accounts ("userId");
CREATE INDEX idx_sessions_token ON public.sessions ("sessionToken");
CREATE INDEX idx_sessions_user_id ON public.sessions ("userId");
CREATE INDEX idx_commensalships_requester ON public.commensalships (requester_id);
CREATE INDEX idx_commensalships_addressee ON public.commensalships (addressee_id);
CREATE INDEX idx_commensalships_status ON public.commensalships (status);
CREATE INDEX idx_friendships_requester ON public.friendships (requester_id);
CREATE INDEX idx_friendships_addressee ON public.friendships (addressee_id);
CREATE INDEX idx_friendships_status ON public.friendships (status);
CREATE INDEX idx_ingredients_name ON public.ingredients (name);
CREATE INDEX idx_ingredients_category ON public.ingredients (category);
CREATE INDEX idx_ingredients_subcategory ON public.ingredients (subcategory);
CREATE INDEX idx_ingredients_active ON public.ingredients (is_active);
CREATE INDEX idx_ingredients_flavor ON public.ingredients USING gin (flavor_profile);
CREATE INDEX idx_compatibility_a ON public.ingredient_compatibility (ingredient_a_id);
CREATE INDEX idx_compatibility_b ON public.ingredient_compatibility (ingredient_b_id);
CREATE INDEX idx_compatibility_score ON public.ingredient_compatibility (compatibility_score);
CREATE INDEX idx_ingredient_cuisines_ingredient ON public.ingredient_cuisines (ingredient_id);
CREATE INDEX idx_ingredient_cuisines_cuisine ON public.ingredient_cuisines (cuisine);
CREATE INDEX idx_recipes_name ON public.recipes (name);
CREATE INDEX idx_recipes_cuisine ON public.recipes (cuisine);
CREATE INDEX idx_recipes_category ON public.recipes (category);
CREATE INDEX idx_recipes_difficulty ON public.recipes (difficulty_level);
CREATE INDEX idx_recipes_prep_time ON public.recipes (prep_time_minutes);
CREATE INDEX idx_recipes_cook_time ON public.recipes (cook_time_minutes);
CREATE INDEX idx_recipes_popularity ON public.recipes (popularity_score);
CREATE INDEX idx_recipes_rating ON public.recipes (user_rating);
CREATE INDEX idx_recipes_public ON public.recipes (is_public);
CREATE INDEX idx_recipes_dietary ON public.recipes USING gin (dietary_tags);
CREATE INDEX idx_recipes_created_at ON public.recipes (created_at);
CREATE INDEX idx_recipe_ingredients_recipe ON public.recipe_ingredients (recipe_id);
CREATE INDEX idx_recipe_ingredients_ingredient ON public.recipe_ingredients (ingredient_id);
CREATE INDEX idx_recipe_ingredients_order ON public.recipe_ingredients (recipe_id, order_index);
CREATE INDEX idx_recipe_contexts_recipe ON public.recipe_contexts (recipe_id);
CREATE INDEX idx_recipe_contexts_moon_phases ON public.recipe_contexts USING gin (recommended_moon_phases);
CREATE INDEX idx_recipe_contexts_seasons ON public.recipe_contexts USING gin (recommended_seasons);
CREATE INDEX idx_elemental_props_entity ON public.elemental_properties (entity_type, entity_id);
CREATE INDEX idx_elemental_props_fire ON public.elemental_properties (fire);
CREATE INDEX idx_elemental_props_water ON public.elemental_properties (water);
CREATE INDEX idx_elemental_props_earth ON public.elemental_properties (earth);
CREATE INDEX idx_elemental_props_air ON public.elemental_properties (air);
CREATE INDEX idx_planetary_entity ON public.planetary_influences (entity_type, entity_id);
CREATE INDEX idx_planetary_planet ON public.planetary_influences (planet);
CREATE INDEX idx_planetary_strength ON public.planetary_influences (influence_strength);
CREATE INDEX idx_planetary_primary ON public.planetary_influences (is_primary);
CREATE INDEX idx_zodiac_entity ON public.zodiac_affinities (entity_type, entity_id);
CREATE INDEX idx_zodiac_sign ON public.zodiac_affinities (zodiac_sign);
CREATE INDEX idx_seasonal_entity ON public.seasonal_associations (entity_type, entity_id);
CREATE INDEX idx_seasonal_season ON public.seasonal_associations (season);
CREATE INDEX idx_recommendations_user ON public.recommendations (user_id);
CREATE INDEX idx_recommendations_recipes ON public.recommendations USING gin (recommended_recipes);
CREATE INDEX idx_recommendations_created ON public.recommendations (created_at);
CREATE INDEX idx_user_calc_user ON public.user_calculations (user_id);
CREATE INDEX idx_user_calc_type ON public.user_calculations (calculation_type);
CREATE INDEX idx_user_calc_created ON public.user_calculations (created_at);
CREATE INDEX idx_subscriptions_user_id ON public.user_subscriptions (user_id);
CREATE INDEX idx_subscriptions_status ON public.user_subscriptions (status);
CREATE INDEX idx_subscriptions_stripe_customer ON public.user_subscriptions (stripe_customer_id);
CREATE INDEX idx_usage_user_feature ON public.usage_records (user_id, feature);
CREATE INDEX idx_usage_period ON public.usage_records (period_start, period_end);
CREATE INDEX idx_cache_key ON public.calculation_cache (cache_key);
CREATE INDEX idx_cache_type ON public.calculation_cache (calculation_type);
CREATE INDEX idx_cache_expires ON public.calculation_cache (expires_at);
CREATE INDEX idx_cache_hits ON public.calculation_cache (hit_count);
CREATE INDEX idx_metrics_name ON public.system_metrics (metric_name);
CREATE INDEX idx_metrics_timestamp ON public.system_metrics ("timestamp");
CREATE INDEX idx_metrics_tags ON public.system_metrics USING gin (tags);

-- Seed Data (using INSERT instead of COPY)

-- Ingredients
INSERT INTO public.ingredients (id, name, category, flavor_profile, preparation_methods, is_active, confidence_score, created_at, updated_at) VALUES
('9d53a729-4a2d-4b41-9362-e4f358e6dfe1', 'Strawberry', 'Fruit', '{"sweet": 0.8}', '{}', true, 1, '2026-02-06 18:45:35.637683+00', '2026-02-06 18:45:35.637683+00'),
('b9ef920f-4c8a-4253-81ec-a62e2a246100', 'Spinach', 'Vegetable', '{"earthy": 0.5}', '{}', true, 1, '2026-02-06 18:45:35.637683+00', '2026-02-06 18:45:35.637683+00'),
('df9e50a5-6908-4480-bdab-9aeedf6e8a28', 'Dark Chocolate', 'Sweets', '{"sweet": 0.4, "bitter": 0.6}', '{}', true, 1, '2026-02-06 18:45:35.637683+00', '2026-02-06 18:45:35.637683+00'),
('b43f9042-158e-4428-aa23-44e72973d35f', 'Chili Powder', 'Spice', '{"spicy": 0.9}', '{}', true, 1, '2026-02-06 18:45:35.637683+00', '2026-02-06 18:45:35.637683+00'),
('f3c21536-a075-4389-89c0-3412df333b0f', 'Arborio Rice', 'Grain', '{"neutral": 1.0}', '{}', true, 1, '2026-02-06 18:45:35.637683+00', '2026-02-06 18:45:35.637683+00'),
('996a48cf-eec6-4cb7-983c-15968511aa1c', 'Saffron', 'Spice', '{"floral": 0.8}', '{}', true, 1, '2026-02-06 18:45:35.637683+00', '2026-02-06 18:45:35.637683+00');

-- Recipes
INSERT INTO public.recipes (id, name, description, cuisine, category, instructions, prep_time_minutes, cook_time_minutes, servings, difficulty_level, dietary_tags, allergens, nutritional_profile, popularity_score, alchemical_harmony_score, cultural_authenticity_score, user_rating, rating_count, is_public, is_verified, created_at, updated_at) VALUES
('e251222f-adc5-4b62-b39d-4b41cf7fa487', 'Balanced Berry Salad', 'A harmonious mix of greens and berries to restore equilibrium, perfect for Libra.', 'American', 'Salad', '{"steps": ["Wash greens", "Mix berries", "Toss with balsamic vinaigrette"]}', 15, 0, 2, 1, '{Vegetarian,"Gluten Free"}', '{}', '{}', 0.5, 0.5, 0.5, 0, 0, true, false, '2026-02-06 18:45:35.637683+00', '2026-02-06 18:45:35.637683+00'),
('9b371874-6fd0-4ab4-9203-d336e7b0b518', 'Spicy Dark Chocolate Mousse', 'Intense dark chocolate with a kick of chili, embodying Scorpio''s depth.', 'French', 'Dessert', '{"steps": ["Melt chocolate", "Whip cream", "Fold in chili powder"]}', 20, 10, 4, 3, '{Vegetarian,"Gluten Free"}', '{}', '{}', 0.5, 0.5, 0.5, 0, 0, true, false, '2026-02-06 18:45:35.637683+00', '2026-02-06 18:45:35.637683+00'),
('9038f86e-eb19-4c4e-be3d-39ec1507f19a', 'Golden Sunflower Risotto', 'Creamy saffron risotto radiating golden hues, fit for a Leo king.', 'Italian', 'Main Course', '{"steps": ["Sauté onions", "Toast rice", "Add saffron stock gradually"]}', 10, 30, 4, 4, '{"Gluten Free"}', '{}', '{}', 0.5, 0.5, 0.5, 0, 0, true, false, '2026-02-06 18:45:35.637683+00', '2026-02-06 18:45:35.637683+00');

-- Recipe Ingredients
INSERT INTO public.recipe_ingredients (id, recipe_id, ingredient_id, quantity, unit, is_optional, order_index) VALUES
('5c30ae73-48a2-46c0-a58e-42f8eb654aed', 'e251222f-adc5-4b62-b39d-4b41cf7fa487', '9d53a729-4a2d-4b41-9362-e4f358e6dfe1', 100, 'g', false, 0),
('7433e985-ec3a-42a3-995a-16a5640fdbdb', 'e251222f-adc5-4b62-b39d-4b41cf7fa487', 'b9ef920f-4c8a-4253-81ec-a62e2a246100', 50, 'g', false, 0),
('b349182e-5c9c-4de2-8395-def78f47545c', '9b371874-6fd0-4ab4-9203-d336e7b0b518', 'df9e50a5-6908-4480-bdab-9aeedf6e8a28', 200, 'g', false, 0),
('e2ed0342-9eba-4c6a-a086-db684216ccdc', '9b371874-6fd0-4ab4-9203-d336e7b0b518', 'b43f9042-158e-4428-aa23-44e72973d35f', 5, 'g', false, 0),
('f1a029c4-4fba-4145-93e3-0d3a8d5e2a8a', '9038f86e-eb19-4c4e-be3d-39ec1507f19a', 'f3c21536-a075-4389-89c0-3412df333b0f', 300, 'g', false, 0),
('9d924165-19c9-44e9-9e1f-6f0f2ecc62b9', '9038f86e-eb19-4c4e-be3d-39ec1507f19a', '996a48cf-eec6-4cb7-983c-15968511aa1c', 0.1, 'g', false, 0);

-- Elemental Properties
INSERT INTO public.elemental_properties (id, entity_type, entity_id, fire, water, earth, air, calculation_method, confidence_score, created_at, updated_at) VALUES
('078b6cd1-7ca0-431e-828b-7ccdc78152c8', 'recipe', 'e251222f-adc5-4b62-b39d-4b41cf7fa487', 0.1, 0.3, 0.2, 0.4, 'manual', 1, '2026-02-06 18:45:35.637683+00', '2026-02-06 18:45:35.637683+00'),
('d58115e6-3ea9-4b38-9a70-ae1fb4c141fa', 'recipe', '9b371874-6fd0-4ab4-9203-d336e7b0b518', 0.3, 0.5, 0.2, 0, 'manual', 1, '2026-02-06 18:45:35.637683+00', '2026-02-06 18:45:35.637683+00'),
('ed797465-c770-4359-b5f3-9f9ec0788738', 'recipe', '9038f86e-eb19-4c4e-be3d-39ec1507f19a', 0.6, 0.1, 0.2, 0.1, 'manual', 1, '2026-02-06 18:45:35.637683+00', '2026-02-06 18:45:35.637683+00');

-- Zodiac Affinities
INSERT INTO public.zodiac_affinities (id, entity_type, entity_id, zodiac_sign, affinity_strength, created_at) VALUES
('6e0170d1-e059-4330-9e11-b3ed56679d6a', 'ingredient', '9d53a729-4a2d-4b41-9362-e4f358e6dfe1', 'Libra', 0.9, '2026-02-06 18:45:35.637683+00'),
('baa9d44c-5a8f-4e23-b03d-b7f82962284f', 'ingredient', 'df9e50a5-6908-4480-bdab-9aeedf6e8a28', 'Scorpio', 0.95, '2026-02-06 18:45:35.637683+00'),
('8a0d5077-bf49-4ad4-979d-5497bc1061f1', 'ingredient', '996a48cf-eec6-4cb7-983c-15968511aa1c', 'Leo', 1, '2026-02-06 18:45:35.637683+00');

-- Done!
