--
-- PostgreSQL database dump
--

\restrict sLnt8Mj3uDbTtOVOXCecEd9PSlWBRXUU7cDoUGj4a2Nue7ysaHZKfJvxrhB0hgu

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: commensalship_status; Type: TYPE; Schema: public; Owner: user
--

CREATE TYPE public.commensalship_status AS ENUM (
    'pending',
    'accepted',
    'blocked'
);



--
-- Name: cuisine_type; Type: TYPE; Schema: public; Owner: user
--

CREATE TYPE public.cuisine_type AS ENUM (
    'Italian',
    'French',
    'Chinese',
    'Japanese',
    'Indian',
    'Mexican',
    'Thai',
    'Vietnamese',
    'Korean',
    'Greek',
    'Middle Eastern',
    'American',
    'African',
    'Russian'
);



--
-- Name: dietary_restriction; Type: TYPE; Schema: public; Owner: user
--

CREATE TYPE public.dietary_restriction AS ENUM (
    'Vegetarian',
    'Vegan',
    'Gluten Free',
    'Dairy Free',
    'Keto',
    'Paleo',
    'Low Carb',
    'Kosher',
    'Halal'
);



--
-- Name: friendship_status; Type: TYPE; Schema: public; Owner: user
--

CREATE TYPE public.friendship_status AS ENUM (
    'pending',
    'accepted',
    'blocked'
);



--
-- Name: lunar_phase; Type: TYPE; Schema: public; Owner: user
--

CREATE TYPE public.lunar_phase AS ENUM (
    'New Moon',
    'Waxing Crescent',
    'First Quarter',
    'Waxing Gibbous',
    'Full Moon',
    'Waning Gibbous',
    'Last Quarter',
    'Waning Crescent'
);



--
-- Name: planet_type; Type: TYPE; Schema: public; Owner: user
--

CREATE TYPE public.planet_type AS ENUM (
    'Sun',
    'Moon',
    'Mercury',
    'Venus',
    'Mars',
    'Jupiter',
    'Saturn',
    'Uranus',
    'Neptune',
    'Pluto'
);



--
-- Name: season; Type: TYPE; Schema: public; Owner: user
--

CREATE TYPE public.season AS ENUM (
    'Spring',
    'Summer',
    'Autumn',
    'Winter'
);



--
-- Name: subscription_status; Type: TYPE; Schema: public; Owner: user
--

CREATE TYPE public.subscription_status AS ENUM (
    'active',
    'past_due',
    'canceled',
    'trialing',
    'incomplete',
    'unpaid'
);



--
-- Name: subscription_tier; Type: TYPE; Schema: public; Owner: user
--

CREATE TYPE public.subscription_tier AS ENUM (
    'free',
    'premium'
);



--
-- Name: user_role; Type: TYPE; Schema: public; Owner: user
--

CREATE TYPE public.user_role AS ENUM (
    'ALCHEMIST',
    'GRAND_MASTER',
    'USER',
    'ADMIN'
);



--
-- Name: zodiac_sign; Type: TYPE; Schema: public; Owner: user
--

CREATE TYPE public.zodiac_sign AS ENUM (
    'Aries',
    'Taurus',
    'Gemini',
    'Cancer',
    'Leo',
    'Virgo',
    'Libra',
    'Scorpio',
    'Sagittarius',
    'Capricorn',
    'Aquarius',
    'Pisces'
);



SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: accounts; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.accounts (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "userId" uuid NOT NULL,
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
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);



--
-- Name: api_keys; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.api_keys (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    name character varying(100) NOT NULL,
    key_hash character varying(255) NOT NULL,
    scopes character varying[] NOT NULL,
    rate_limit_tier character varying(20) NOT NULL,
    is_active boolean NOT NULL,
    expires_at timestamp with time zone,
    last_used_at timestamp with time zone,
    usage_count integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);



--
-- Name: calculation_cache; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.calculation_cache (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    cache_key character varying(255) NOT NULL,
    calculation_type character varying(100) NOT NULL,
    input_data jsonb NOT NULL,
    result_data jsonb NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    hit_count integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    last_accessed_at timestamp with time zone DEFAULT now() NOT NULL
);



--
-- Name: commensalships; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.commensalships (
    id character varying(64) NOT NULL,
    requester_id uuid NOT NULL,
    addressee_id uuid NOT NULL,
    status public.commensalship_status DEFAULT 'pending'::public.commensalship_status NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT no_self_commensalship CHECK ((requester_id <> addressee_id))
);



--
-- Name: elemental_properties; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.elemental_properties (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    entity_type character varying(50) NOT NULL,
    entity_id uuid NOT NULL,
    fire real NOT NULL,
    water real NOT NULL,
    earth real NOT NULL,
    air real NOT NULL,
    calculation_method character varying(50),
    confidence_score real NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT air_range CHECK (((air >= (0)::double precision) AND (air <= (1)::double precision))),
    CONSTRAINT earth_range CHECK (((earth >= (0)::double precision) AND (earth <= (1)::double precision))),
    CONSTRAINT elemental_balance_sum CHECK ((((((fire + water) + earth) + air) >= (0.95)::double precision) AND ((((fire + water) + earth) + air) <= (1.05)::double precision))),
    CONSTRAINT fire_range CHECK (((fire >= (0)::double precision) AND (fire <= (1)::double precision))),
    CONSTRAINT water_range CHECK (((water >= (0)::double precision) AND (water <= (1)::double precision)))
);



--
-- Name: friendships; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.friendships (
    id character varying(64) NOT NULL,
    requester_id uuid NOT NULL,
    addressee_id uuid NOT NULL,
    status public.friendship_status DEFAULT 'pending'::public.friendship_status NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT no_self_friendship CHECK ((requester_id <> addressee_id))
);



--
-- Name: ingredient_compatibility; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.ingredient_compatibility (
    ingredient_a_id uuid NOT NULL,
    ingredient_b_id uuid NOT NULL,
    compatibility_score real NOT NULL,
    interaction_type character varying(50) NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT compatibility_score_range CHECK (((compatibility_score >= (0)::double precision) AND (compatibility_score <= (1)::double precision))),
    CONSTRAINT different_ingredients CHECK ((ingredient_a_id <> ingredient_b_id))
);



--
-- Name: ingredient_cuisines; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.ingredient_cuisines (
    ingredient_id uuid NOT NULL,
    cuisine public.cuisine_type NOT NULL,
    usage_frequency real NOT NULL,
    CONSTRAINT usage_frequency_range CHECK (((usage_frequency >= (0)::double precision) AND (usage_frequency <= (1)::double precision)))
);



--
-- Name: ingredients; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.ingredients (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
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
    flavor_profile jsonb NOT NULL,
    preparation_methods character varying[] NOT NULL,
    is_active boolean NOT NULL,
    data_source character varying(100),
    confidence_score real NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);



--
-- Name: planetary_influences; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.planetary_influences (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    entity_type character varying(50) NOT NULL,
    entity_id uuid NOT NULL,
    planet public.planet_type NOT NULL,
    influence_strength real NOT NULL,
    is_primary boolean NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT influence_strength_range CHECK (((influence_strength >= (0)::double precision) AND (influence_strength <= (1)::double precision)))
);



--
-- Name: recipe_contexts; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.recipe_contexts (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    recipe_id uuid NOT NULL,
    recommended_moon_phases public.lunar_phase[] NOT NULL,
    recommended_seasons public.season[] NOT NULL,
    time_of_day character varying[] NOT NULL,
    occasion character varying[] NOT NULL,
    energy_intention character varying(100)
);



--
-- Name: recipe_ingredients; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.recipe_ingredients (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    recipe_id uuid NOT NULL,
    ingredient_id uuid NOT NULL,
    quantity real NOT NULL,
    unit character varying(50) NOT NULL,
    preparation_notes text,
    is_optional boolean NOT NULL,
    group_name character varying(100),
    order_index integer NOT NULL,
    CONSTRAINT quantity_positive CHECK ((quantity > (0)::double precision))
);



--
-- Name: recipes; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.recipes (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    cuisine public.cuisine_type NOT NULL,
    category character varying(100) NOT NULL,
    instructions jsonb NOT NULL,
    prep_time_minutes integer NOT NULL,
    cook_time_minutes integer NOT NULL,
    servings integer NOT NULL,
    difficulty_level integer NOT NULL,
    dietary_tags public.dietary_restriction[] NOT NULL,
    allergens character varying[] NOT NULL,
    nutritional_profile jsonb NOT NULL,
    popularity_score real NOT NULL,
    alchemical_harmony_score real NOT NULL,
    cultural_authenticity_score real NOT NULL,
    user_rating real NOT NULL,
    rating_count integer NOT NULL,
    author_id uuid,
    source character varying(255),
    is_public boolean NOT NULL,
    is_verified boolean NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT authenticity_range CHECK (((cultural_authenticity_score >= (0)::double precision) AND (cultural_authenticity_score <= (1)::double precision))),
    CONSTRAINT cook_time_positive CHECK ((cook_time_minutes >= 0)),
    CONSTRAINT difficulty_range CHECK (((difficulty_level >= 1) AND (difficulty_level <= 5))),
    CONSTRAINT harmony_range CHECK (((alchemical_harmony_score >= (0)::double precision) AND (alchemical_harmony_score <= (1)::double precision))),
    CONSTRAINT popularity_range CHECK (((popularity_score >= (0)::double precision) AND (popularity_score <= (1)::double precision))),
    CONSTRAINT prep_time_positive CHECK ((prep_time_minutes >= 0)),
    CONSTRAINT rating_range CHECK (((user_rating >= (0)::double precision) AND (user_rating <= (5)::double precision))),
    CONSTRAINT servings_positive CHECK ((servings > 0))
);



--
-- Name: recommendations; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.recommendations (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    request_context jsonb NOT NULL,
    recommended_recipes character varying[] NOT NULL,
    recipe_scores jsonb NOT NULL,
    algorithm_version character varying(50) NOT NULL,
    user_feedback jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);



--
-- Name: seasonal_associations; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.seasonal_associations (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    entity_type character varying(50) NOT NULL,
    entity_id uuid NOT NULL,
    season public.season NOT NULL,
    strength real NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT seasonal_strength_range CHECK (((strength >= (0)::double precision) AND (strength <= (1)::double precision)))
);



--
-- Name: sessions; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.sessions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "sessionToken" character varying(255) NOT NULL,
    "userId" uuid NOT NULL,
    expires timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);



--
-- Name: system_metrics; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.system_metrics (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    metric_name character varying(100) NOT NULL,
    metric_value real NOT NULL,
    metric_unit character varying(50),
    tags jsonb NOT NULL,
    "timestamp" timestamp with time zone DEFAULT now() NOT NULL
);



--
-- Name: transit_history; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.transit_history (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    matter_score double precision NOT NULL,
    spirit_score double precision NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    is_collective boolean DEFAULT false,
    participant_count integer DEFAULT 1,
    CONSTRAINT matter_score_positive CHECK ((matter_score >= (0)::double precision)),
    CONSTRAINT spirit_score_positive CHECK ((spirit_score >= (0)::double precision))
);



--
-- Name: usage_records; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.usage_records (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    feature character varying(100) NOT NULL,
    count integer DEFAULT 0 NOT NULL,
    period_start timestamp with time zone NOT NULL,
    period_end timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);



--
-- Name: user_calculations; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.user_calculations (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    calculation_type character varying(100) NOT NULL,
    input_data jsonb NOT NULL,
    result_data jsonb NOT NULL,
    execution_time_ms integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);



--
-- Name: user_subscriptions; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.user_subscriptions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    tier public.subscription_tier DEFAULT 'free'::public.subscription_tier NOT NULL,
    status public.subscription_status DEFAULT 'active'::public.subscription_status NOT NULL,
    stripe_customer_id character varying(255),
    stripe_subscription_id character varying(255),
    current_period_start timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    current_period_end timestamp with time zone DEFAULT (CURRENT_TIMESTAMP + '30 days'::interval) NOT NULL,
    cancel_at_period_end boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);



--
-- Name: users; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    is_active boolean NOT NULL,
    email_verified boolean NOT NULL,
    profile jsonb NOT NULL,
    preferences jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    last_login_at timestamp with time zone,
    login_count integer NOT NULL,
    "onboardingComplete" boolean DEFAULT false,
    "birthDate" date,
    "birthTime" time without time zone,
    "birthLocation" character varying(255),
    name character varying(255),
    image text,
    "emailVerified" timestamp with time zone,
    role public.user_role DEFAULT 'USER'::public.user_role
);



--
-- Name: verification_token; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.verification_token (
    identifier character varying(255) NOT NULL,
    token character varying(255) NOT NULL,
    expires timestamp with time zone NOT NULL
);



--
-- Name: zodiac_affinities; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.zodiac_affinities (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    entity_type character varying(50) NOT NULL,
    entity_id uuid NOT NULL,
    zodiac_sign public.zodiac_sign NOT NULL,
    affinity_strength real NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT affinity_strength_range CHECK (((affinity_strength >= (0)::double precision) AND (affinity_strength <= (1)::double precision)))
);



--
-- Data for Name: accounts; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public.accounts (id, "userId", type, provider, "providerAccountId", refresh_token, access_token, expires_at, token_type, scope, id_token, session_state, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: api_keys; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public.api_keys (id, user_id, name, key_hash, scopes, rate_limit_tier, is_active, expires_at, last_used_at, usage_count, created_at) FROM stdin;
\.


--
-- Data for Name: calculation_cache; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public.calculation_cache (id, cache_key, calculation_type, input_data, result_data, expires_at, hit_count, created_at, last_accessed_at) FROM stdin;
\.


--
-- Data for Name: commensalships; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public.commensalships (id, requester_id, addressee_id, status, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: elemental_properties; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public.elemental_properties (id, entity_type, entity_id, fire, water, earth, air, calculation_method, confidence_score, created_at, updated_at) FROM stdin;
078b6cd1-7ca0-431e-828b-7ccdc78152c8	recipe	e251222f-adc5-4b62-b39d-4b41cf7fa487	0.1	0.3	0.2	0.4	manual	1	2026-02-06 18:45:35.637683+00	2026-02-06 18:45:35.637683+00
d58115e6-3ea9-4b38-9a70-ae1fb4c141fa	recipe	9b371874-6fd0-4ab4-9203-d336e7b0b518	0.3	0.5	0.2	0	manual	1	2026-02-06 18:45:35.637683+00	2026-02-06 18:45:35.637683+00
ed797465-c770-4359-b5f3-9f9ec0788738	recipe	9038f86e-eb19-4c4e-be3d-39ec1507f19a	0.6	0.1	0.2	0.1	manual	1	2026-02-06 18:45:35.637683+00	2026-02-06 18:45:35.637683+00
\.


--
-- Data for Name: friendships; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public.friendships (id, requester_id, addressee_id, status, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: ingredient_compatibility; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public.ingredient_compatibility (ingredient_a_id, ingredient_b_id, compatibility_score, interaction_type, notes, created_at) FROM stdin;
\.


--
-- Data for Name: ingredient_cuisines; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public.ingredient_cuisines (ingredient_id, cuisine, usage_frequency) FROM stdin;
\.


--
-- Data for Name: ingredients; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public.ingredients (id, name, common_name, scientific_name, category, subcategory, description, calories, protein, carbohydrates, fat, fiber, sugar, flavor_profile, preparation_methods, is_active, data_source, confidence_score, created_at, updated_at) FROM stdin;
9d53a729-4a2d-4b41-9362-e4f358e6dfe1	Strawberry	\N	\N	Fruit	\N	\N	\N	\N	\N	\N	\N	\N	{"sweet": 0.8}	{}	t	\N	1	2026-02-06 18:45:35.637683+00	2026-02-06 18:45:35.637683+00
b9ef920f-4c8a-4253-81ec-a62e2a246100	Spinach	\N	\N	Vegetable	\N	\N	\N	\N	\N	\N	\N	\N	{"earthy": 0.5}	{}	t	\N	1	2026-02-06 18:45:35.637683+00	2026-02-06 18:45:35.637683+00
df9e50a5-6908-4480-bdab-9aeedf6e8a28	Dark Chocolate	\N	\N	Sweets	\N	\N	\N	\N	\N	\N	\N	\N	{"sweet": 0.4, "bitter": 0.6}	{}	t	\N	1	2026-02-06 18:45:35.637683+00	2026-02-06 18:45:35.637683+00
b43f9042-158e-4428-aa23-44e72973d35f	Chili Powder	\N	\N	Spice	\N	\N	\N	\N	\N	\N	\N	\N	{"spicy": 0.9}	{}	t	\N	1	2026-02-06 18:45:35.637683+00	2026-02-06 18:45:35.637683+00
f3c21536-a075-4389-89c0-3412df333b0f	Arborio Rice	\N	\N	Grain	\N	\N	\N	\N	\N	\N	\N	\N	{"neutral": 1.0}	{}	t	\N	1	2026-02-06 18:45:35.637683+00	2026-02-06 18:45:35.637683+00
996a48cf-eec6-4cb7-983c-15968511aa1c	Saffron	\N	\N	Spice	\N	\N	\N	\N	\N	\N	\N	\N	{"floral": 0.8}	{}	t	\N	1	2026-02-06 18:45:35.637683+00	2026-02-06 18:45:35.637683+00
\.


--
-- Data for Name: planetary_influences; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public.planetary_influences (id, entity_type, entity_id, planet, influence_strength, is_primary, created_at) FROM stdin;
\.


--
-- Data for Name: recipe_contexts; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public.recipe_contexts (id, recipe_id, recommended_moon_phases, recommended_seasons, time_of_day, occasion, energy_intention) FROM stdin;
\.


--
-- Data for Name: recipe_ingredients; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public.recipe_ingredients (id, recipe_id, ingredient_id, quantity, unit, preparation_notes, is_optional, group_name, order_index) FROM stdin;
5c30ae73-48a2-46c0-a58e-42f8eb654aed	e251222f-adc5-4b62-b39d-4b41cf7fa487	9d53a729-4a2d-4b41-9362-e4f358e6dfe1	100	g	\N	f	\N	0
7433e985-ec3a-42a3-995a-16a5640fdbdb	e251222f-adc5-4b62-b39d-4b41cf7fa487	b9ef920f-4c8a-4253-81ec-a62e2a246100	50	g	\N	f	\N	0
b349182e-5c9c-4de2-8395-def78f47545c	9b371874-6fd0-4ab4-9203-d336e7b0b518	df9e50a5-6908-4480-bdab-9aeedf6e8a28	200	g	\N	f	\N	0
e2ed0342-9eba-4c6a-a086-db684216ccdc	9b371874-6fd0-4ab4-9203-d336e7b0b518	b43f9042-158e-4428-aa23-44e72973d35f	5	g	\N	f	\N	0
f1a029c4-4fba-4145-93e3-0d3a8d5e2a8a	9038f86e-eb19-4c4e-be3d-39ec1507f19a	f3c21536-a075-4389-89c0-3412df333b0f	300	g	\N	f	\N	0
9d924165-19c9-44e9-9e1f-6f0f2ecc62b9	9038f86e-eb19-4c4e-be3d-39ec1507f19a	996a48cf-eec6-4cb7-983c-15968511aa1c	0.1	g	\N	f	\N	0
\.


--
-- Data for Name: recipes; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public.recipes (id, name, description, cuisine, category, instructions, prep_time_minutes, cook_time_minutes, servings, difficulty_level, dietary_tags, allergens, nutritional_profile, popularity_score, alchemical_harmony_score, cultural_authenticity_score, user_rating, rating_count, author_id, source, is_public, is_verified, created_at, updated_at) FROM stdin;
e251222f-adc5-4b62-b39d-4b41cf7fa487	Balanced Berry Salad	A harmonious mix of greens and berries to restore equilibrium, perfect for Libra.	American	Salad	{"steps": ["Wash greens", "Mix berries", "Toss with balsamic vinaigrette"]}	15	0	2	1	{Vegetarian,"Gluten Free"}	{}	{}	0.5	0.5	0.5	0	0	\N	\N	t	f	2026-02-06 18:45:35.637683+00	2026-02-06 18:45:35.637683+00
9b371874-6fd0-4ab4-9203-d336e7b0b518	Spicy Dark Chocolate Mousse	Intense dark chocolate with a kick of chili, embodying Scorpio's depth.	French	Dessert	{"steps": ["Melt chocolate", "Whip cream", "Fold in chili powder"]}	20	10	4	3	{Vegetarian,"Gluten Free"}	{}	{}	0.5	0.5	0.5	0	0	\N	\N	t	f	2026-02-06 18:45:35.637683+00	2026-02-06 18:45:35.637683+00
9038f86e-eb19-4c4e-be3d-39ec1507f19a	Golden Sunflower Risotto	Creamy saffron risotto radiating golden hues, fit for a Leo king.	Italian	Main Course	{"steps": ["Sauté onions", "Toast rice", "Add saffron stock gradually"]}	10	30	4	4	{"Gluten Free"}	{}	{}	0.5	0.5	0.5	0	0	\N	\N	t	f	2026-02-06 18:45:35.637683+00	2026-02-06 18:45:35.637683+00
\.


--
-- Data for Name: recommendations; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public.recommendations (id, user_id, request_context, recommended_recipes, recipe_scores, algorithm_version, user_feedback, created_at) FROM stdin;
\.


--
-- Data for Name: seasonal_associations; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public.seasonal_associations (id, entity_type, entity_id, season, strength, created_at) FROM stdin;
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public.sessions (id, "sessionToken", "userId", expires, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: system_metrics; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public.system_metrics (id, metric_name, metric_value, metric_unit, tags, "timestamp") FROM stdin;
\.


--
-- Data for Name: transit_history; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public.transit_history (id, matter_score, spirit_score, created_at, is_collective, participant_count) FROM stdin;
\.


--
-- Data for Name: usage_records; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public.usage_records (id, user_id, feature, count, period_start, period_end, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: user_calculations; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public.user_calculations (id, user_id, calculation_type, input_data, result_data, execution_time_ms, created_at) FROM stdin;
\.


--
-- Data for Name: user_subscriptions; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public.user_subscriptions (id, user_id, tier, status, stripe_customer_id, stripe_subscription_id, current_period_start, current_period_end, cancel_at_period_end, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public.users (id, email, password_hash, is_active, email_verified, profile, preferences, created_at, updated_at, last_login_at, login_count, "onboardingComplete", "birthDate", "birthTime", "birthLocation", name, image, "emailVerified", role) FROM stdin;
\.


--
-- Data for Name: verification_token; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public.verification_token (identifier, token, expires) FROM stdin;
\.


--
-- Data for Name: zodiac_affinities; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public.zodiac_affinities (id, entity_type, entity_id, zodiac_sign, affinity_strength, created_at) FROM stdin;
6e0170d1-e059-4330-9e11-b3ed56679d6a	ingredient	9d53a729-4a2d-4b41-9362-e4f358e6dfe1	Libra	0.9	2026-02-06 18:45:35.637683+00
baa9d44c-5a8f-4e23-b03d-b7f82962284f	ingredient	df9e50a5-6908-4480-bdab-9aeedf6e8a28	Scorpio	0.95	2026-02-06 18:45:35.637683+00
8a0d5077-bf49-4ad4-979d-5497bc1061f1	ingredient	996a48cf-eec6-4cb7-983c-15968511aa1c	Leo	1	2026-02-06 18:45:35.637683+00
\.


--
-- Name: accounts accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_pkey PRIMARY KEY (id);


--
-- Name: accounts accounts_provider_providerAccountId_key; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT "accounts_provider_providerAccountId_key" UNIQUE (provider, "providerAccountId");


--
-- Name: api_keys api_keys_key_hash_key; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.api_keys
    ADD CONSTRAINT api_keys_key_hash_key UNIQUE (key_hash);


--
-- Name: api_keys api_keys_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.api_keys
    ADD CONSTRAINT api_keys_pkey PRIMARY KEY (id);


--
-- Name: calculation_cache calculation_cache_cache_key_key; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.calculation_cache
    ADD CONSTRAINT calculation_cache_cache_key_key UNIQUE (cache_key);


--
-- Name: calculation_cache calculation_cache_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.calculation_cache
    ADD CONSTRAINT calculation_cache_pkey PRIMARY KEY (id);


--
-- Name: commensalships commensalships_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.commensalships
    ADD CONSTRAINT commensalships_pkey PRIMARY KEY (id);


--
-- Name: elemental_properties elemental_properties_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.elemental_properties
    ADD CONSTRAINT elemental_properties_pkey PRIMARY KEY (id);


--
-- Name: friendships friendships_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.friendships
    ADD CONSTRAINT friendships_pkey PRIMARY KEY (id);


--
-- Name: ingredient_compatibility ingredient_compatibility_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.ingredient_compatibility
    ADD CONSTRAINT ingredient_compatibility_pkey PRIMARY KEY (ingredient_a_id, ingredient_b_id);


--
-- Name: ingredient_cuisines ingredient_cuisines_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.ingredient_cuisines
    ADD CONSTRAINT ingredient_cuisines_pkey PRIMARY KEY (ingredient_id, cuisine);


--
-- Name: ingredients ingredients_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.ingredients
    ADD CONSTRAINT ingredients_pkey PRIMARY KEY (id);


--
-- Name: planetary_influences planetary_influences_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.planetary_influences
    ADD CONSTRAINT planetary_influences_pkey PRIMARY KEY (id);


--
-- Name: recipe_contexts recipe_contexts_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.recipe_contexts
    ADD CONSTRAINT recipe_contexts_pkey PRIMARY KEY (id);


--
-- Name: recipe_ingredients recipe_ingredients_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.recipe_ingredients
    ADD CONSTRAINT recipe_ingredients_pkey PRIMARY KEY (id);


--
-- Name: recipes recipes_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.recipes
    ADD CONSTRAINT recipes_pkey PRIMARY KEY (id);


--
-- Name: recommendations recommendations_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.recommendations
    ADD CONSTRAINT recommendations_pkey PRIMARY KEY (id);


--
-- Name: seasonal_associations seasonal_associations_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.seasonal_associations
    ADD CONSTRAINT seasonal_associations_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_sessionToken_key; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT "sessions_sessionToken_key" UNIQUE ("sessionToken");


--
-- Name: system_metrics system_metrics_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.system_metrics
    ADD CONSTRAINT system_metrics_pkey PRIMARY KEY (id);


--
-- Name: transit_history transit_history_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.transit_history
    ADD CONSTRAINT transit_history_pkey PRIMARY KEY (id);


--
-- Name: commensalships unique_commensalship; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.commensalships
    ADD CONSTRAINT unique_commensalship UNIQUE (requester_id, addressee_id);


--
-- Name: friendships unique_friendship; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.friendships
    ADD CONSTRAINT unique_friendship UNIQUE (requester_id, addressee_id);


--
-- Name: usage_records unique_user_feature_period; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.usage_records
    ADD CONSTRAINT unique_user_feature_period UNIQUE (user_id, feature, period_start);


--
-- Name: user_subscriptions unique_user_subscription; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.user_subscriptions
    ADD CONSTRAINT unique_user_subscription UNIQUE (user_id);


--
-- Name: usage_records usage_records_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.usage_records
    ADD CONSTRAINT usage_records_pkey PRIMARY KEY (id);


--
-- Name: user_calculations user_calculations_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.user_calculations
    ADD CONSTRAINT user_calculations_pkey PRIMARY KEY (id);


--
-- Name: user_subscriptions user_subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.user_subscriptions
    ADD CONSTRAINT user_subscriptions_pkey PRIMARY KEY (id);


--
-- Name: user_subscriptions user_subscriptions_stripe_subscription_id_key; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.user_subscriptions
    ADD CONSTRAINT user_subscriptions_stripe_subscription_id_key UNIQUE (stripe_subscription_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: verification_token verification_token_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.verification_token
    ADD CONSTRAINT verification_token_pkey PRIMARY KEY (identifier, token);


--
-- Name: zodiac_affinities zodiac_affinities_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.zodiac_affinities
    ADD CONSTRAINT zodiac_affinities_pkey PRIMARY KEY (id);


--
-- Name: idx_accounts_user_id; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX idx_accounts_user_id ON public.accounts USING btree ("userId");


--
-- Name: idx_cache_expires; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX idx_cache_expires ON public.calculation_cache USING btree (expires_at);


--
-- Name: idx_cache_hits; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX idx_cache_hits ON public.calculation_cache USING btree (hit_count);


--
-- Name: idx_cache_key; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX idx_cache_key ON public.calculation_cache USING btree (cache_key);


--
-- Name: idx_cache_type; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX idx_cache_type ON public.calculation_cache USING btree (calculation_type);


--
-- Name: idx_commensalships_addressee; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX idx_commensalships_addressee ON public.commensalships USING btree (addressee_id);


--
-- Name: idx_commensalships_requester; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX idx_commensalships_requester ON public.commensalships USING btree (requester_id);


--
-- Name: idx_commensalships_status; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX idx_commensalships_status ON public.commensalships USING btree (status);


--
-- Name: idx_compatibility_a; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX idx_compatibility_a ON public.ingredient_compatibility USING btree (ingredient_a_id);


--
-- Name: idx_compatibility_b; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX idx_compatibility_b ON public.ingredient_compatibility USING btree (ingredient_b_id);


--
-- Name: idx_compatibility_score; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX idx_compatibility_score ON public.ingredient_compatibility USING btree (compatibility_score);


--
-- Name: idx_elemental_props_air; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX idx_elemental_props_air ON public.elemental_properties USING btree (air);


--
-- Name: idx_elemental_props_earth; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX idx_elemental_props_earth ON public.elemental_properties USING btree (earth);


--
-- Name: idx_elemental_props_entity; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX idx_elemental_props_entity ON public.elemental_properties USING btree (entity_type, entity_id);


--
-- Name: idx_elemental_props_fire; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX idx_elemental_props_fire ON public.elemental_properties USING btree (fire);


--
-- Name: idx_elemental_props_water; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX idx_elemental_props_water ON public.elemental_properties USING btree (water);


--
-- Name: idx_friendships_addressee; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX idx_friendships_addressee ON public.friendships USING btree (addressee_id);


--
-- Name: idx_friendships_requester; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX idx_friendships_requester ON public.friendships USING btree (requester_id);


--
-- Name: idx_friendships_status; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX idx_friendships_status ON public.friendships USING btree (status);


--
-- Name: idx_ingredient_cuisines_cuisine; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX idx_ingredient_cuisines_cuisine ON public.ingredient_cuisines USING btree (cuisine);


--
-- Name: idx_ingredient_cuisines_ingredient; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX idx_ingredient_cuisines_ingredient ON public.ingredient_cuisines USING btree (ingredient_id);


--
-- Name: idx_ingredients_active; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX idx_ingredients_active ON public.ingredients USING btree (is_active);


--
-- Name: idx_ingredients_category; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX idx_ingredients_category ON public.ingredients USING btree (category);


--
-- Name: idx_ingredients_flavor; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX idx_ingredients_flavor ON public.ingredients USING gin (flavor_profile);


--
-- Name: idx_ingredients_name; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX idx_ingredients_name ON public.ingredients USING btree (name);


--
-- Name: idx_ingredients_subcategory; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX idx_ingredients_subcategory ON public.ingredients USING btree (subcategory);


--
-- Name: idx_metrics_name; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX idx_metrics_name ON public.system_metrics USING btree (metric_name);


--
-- Name: idx_metrics_tags; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX idx_metrics_tags ON public.system_metrics USING gin (tags);


--
-- Name: idx_metrics_timestamp; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX idx_metrics_timestamp ON public.system_metrics USING btree ("timestamp");


--
-- Name: idx_planetary_entity; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX idx_planetary_entity ON public.planetary_influences USING btree (entity_type, entity_id);


--
-- Name: idx_planetary_planet; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX idx_planetary_planet ON public.planetary_influences USING btree (planet);


--
-- Name: idx_planetary_primary; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX idx_planetary_primary ON public.planetary_influences USING btree (is_primary);


--
-- Name: idx_planetary_strength; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX idx_planetary_strength ON public.planetary_influences USING btree (influence_strength);


--
-- Name: idx_recipe_contexts_moon_phases; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX idx_recipe_contexts_moon_phases ON public.recipe_contexts USING gin (recommended_moon_phases);


--
-- Name: idx_recipe_contexts_recipe; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX idx_recipe_contexts_recipe ON public.recipe_contexts USING btree (recipe_id);


--
-- Name: idx_recipe_contexts_seasons; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX idx_recipe_contexts_seasons ON public.recipe_contexts USING gin (recommended_seasons);


--
-- Name: idx_recipe_ingredients_ingredient; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX idx_recipe_ingredients_ingredient ON public.recipe_ingredients USING btree (ingredient_id);


--
-- Name: idx_recipe_ingredients_order; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX idx_recipe_ingredients_order ON public.recipe_ingredients USING btree (recipe_id, order_index);


--
-- Name: idx_recipe_ingredients_recipe; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX idx_recipe_ingredients_recipe ON public.recipe_ingredients USING btree (recipe_id);


--
-- Name: idx_recipes_category; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX idx_recipes_category ON public.recipes USING btree (category);


--
-- Name: idx_recipes_cook_time; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX idx_recipes_cook_time ON public.recipes USING btree (cook_time_minutes);


--
-- Name: idx_recipes_created_at; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX idx_recipes_created_at ON public.recipes USING btree (created_at);


--
-- Name: idx_recipes_cuisine; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX idx_recipes_cuisine ON public.recipes USING btree (cuisine);


--
-- Name: idx_recipes_dietary; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX idx_recipes_dietary ON public.recipes USING gin (dietary_tags);


--
-- Name: idx_recipes_difficulty; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX idx_recipes_difficulty ON public.recipes USING btree (difficulty_level);


--
-- Name: idx_recipes_name; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX idx_recipes_name ON public.recipes USING btree (name);


--
-- Name: idx_recipes_popularity; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX idx_recipes_popularity ON public.recipes USING btree (popularity_score);


--
-- Name: idx_recipes_prep_time; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX idx_recipes_prep_time ON public.recipes USING btree (prep_time_minutes);


--
-- Name: idx_recipes_public; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX idx_recipes_public ON public.recipes USING btree (is_public);


--
-- Name: idx_recipes_rating; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX idx_recipes_rating ON public.recipes USING btree (user_rating);


--
-- Name: idx_recommendations_created; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX idx_recommendations_created ON public.recommendations USING btree (created_at);


--
-- Name: idx_recommendations_recipes; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX idx_recommendations_recipes ON public.recommendations USING gin (recommended_recipes);


--
-- Name: idx_recommendations_user; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX idx_recommendations_user ON public.recommendations USING btree (user_id);


--
-- Name: idx_seasonal_entity; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX idx_seasonal_entity ON public.seasonal_associations USING btree (entity_type, entity_id);


--
-- Name: idx_seasonal_season; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX idx_seasonal_season ON public.seasonal_associations USING btree (season);


--
-- Name: idx_sessions_token; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX idx_sessions_token ON public.sessions USING btree ("sessionToken");


--
-- Name: idx_sessions_user_id; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX idx_sessions_user_id ON public.sessions USING btree ("userId");


--
-- Name: idx_subscriptions_status; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX idx_subscriptions_status ON public.user_subscriptions USING btree (status);


--
-- Name: idx_subscriptions_stripe_customer; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX idx_subscriptions_stripe_customer ON public.user_subscriptions USING btree (stripe_customer_id);


--
-- Name: idx_subscriptions_user_id; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX idx_subscriptions_user_id ON public.user_subscriptions USING btree (user_id);


--
-- Name: idx_usage_period; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX idx_usage_period ON public.usage_records USING btree (period_start, period_end);


--
-- Name: idx_usage_user_feature; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX idx_usage_user_feature ON public.usage_records USING btree (user_id, feature);


--
-- Name: idx_user_calc_created; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX idx_user_calc_created ON public.user_calculations USING btree (created_at);


--
-- Name: idx_user_calc_type; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX idx_user_calc_type ON public.user_calculations USING btree (calculation_type);


--
-- Name: idx_user_calc_user; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX idx_user_calc_user ON public.user_calculations USING btree (user_id);


--
-- Name: idx_zodiac_entity; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX idx_zodiac_entity ON public.zodiac_affinities USING btree (entity_type, entity_id);


--
-- Name: idx_zodiac_sign; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX idx_zodiac_sign ON public.zodiac_affinities USING btree (zodiac_sign);


--
-- Name: accounts accounts_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: api_keys api_keys_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.api_keys
    ADD CONSTRAINT api_keys_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: commensalships commensalships_addressee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.commensalships
    ADD CONSTRAINT commensalships_addressee_id_fkey FOREIGN KEY (addressee_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: commensalships commensalships_requester_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.commensalships
    ADD CONSTRAINT commensalships_requester_id_fkey FOREIGN KEY (requester_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: friendships friendships_addressee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.friendships
    ADD CONSTRAINT friendships_addressee_id_fkey FOREIGN KEY (addressee_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: friendships friendships_requester_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.friendships
    ADD CONSTRAINT friendships_requester_id_fkey FOREIGN KEY (requester_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: ingredient_compatibility ingredient_compatibility_ingredient_a_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.ingredient_compatibility
    ADD CONSTRAINT ingredient_compatibility_ingredient_a_id_fkey FOREIGN KEY (ingredient_a_id) REFERENCES public.ingredients(id) ON DELETE CASCADE;


--
-- Name: ingredient_compatibility ingredient_compatibility_ingredient_b_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.ingredient_compatibility
    ADD CONSTRAINT ingredient_compatibility_ingredient_b_id_fkey FOREIGN KEY (ingredient_b_id) REFERENCES public.ingredients(id) ON DELETE CASCADE;


--
-- Name: ingredient_cuisines ingredient_cuisines_ingredient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.ingredient_cuisines
    ADD CONSTRAINT ingredient_cuisines_ingredient_id_fkey FOREIGN KEY (ingredient_id) REFERENCES public.ingredients(id) ON DELETE CASCADE;


--
-- Name: recipe_contexts recipe_contexts_recipe_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.recipe_contexts
    ADD CONSTRAINT recipe_contexts_recipe_id_fkey FOREIGN KEY (recipe_id) REFERENCES public.recipes(id) ON DELETE CASCADE;


--
-- Name: recipe_ingredients recipe_ingredients_ingredient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.recipe_ingredients
    ADD CONSTRAINT recipe_ingredients_ingredient_id_fkey FOREIGN KEY (ingredient_id) REFERENCES public.ingredients(id) ON DELETE RESTRICT;


--
-- Name: recipe_ingredients recipe_ingredients_recipe_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.recipe_ingredients
    ADD CONSTRAINT recipe_ingredients_recipe_id_fkey FOREIGN KEY (recipe_id) REFERENCES public.recipes(id) ON DELETE CASCADE;


--
-- Name: recipes recipes_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.recipes
    ADD CONSTRAINT recipes_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: recommendations recommendations_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.recommendations
    ADD CONSTRAINT recommendations_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: usage_records usage_records_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.usage_records
    ADD CONSTRAINT usage_records_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_calculations user_calculations_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.user_calculations
    ADD CONSTRAINT user_calculations_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_subscriptions user_subscriptions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.user_subscriptions
    ADD CONSTRAINT user_subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict sLnt8Mj3uDbTtOVOXCecEd9PSlWBRXUU7cDoUGj4a2Nue7ysaHZKfJvxrhB0hgu

