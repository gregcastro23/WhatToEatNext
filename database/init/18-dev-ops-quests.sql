-- ==========================================
-- DEV-OPS QUESTS REFACTOR
-- Migration 18: "Help Us Build" quest definitions (ESMS aligned)
-- ==========================================

DROP TABLE IF EXISTS bug_reports;
DELETE FROM quest_definitions WHERE slug = 'achieve-alchemists-eye';

-- ─── Dev-Ops Quest Definitions ───────────────────────────────────────

INSERT INTO quest_definitions (slug, title, description, quest_type, token_reward_type, token_reward_amount, trigger_event, trigger_threshold, sort_order)
VALUES
    -- Legacy tasks kept (if applicable)
    (
        'weekly-recipe-harmonizer',
        'Recipe Harmonizer',
        'Rate 3 recipes you''ve tried so we can tune the alchemical weights. Reward: 20 Essence.',
        'weekly',
        'Essence',
        20,
        'rate_recipe',
        3,
        16
    ),
    (
        'achieve-temporal-anchor',
        'Temporal Anchor',
        'Complete 100% of your profile preferences to anchor your natal signal. Reward: 25 of each token.',
        'achievement',
        'all',
        25,
        'preferences_complete',
        1,
        31
    ),
    (
        'masters-pantry',
        'The Master''s Pantry',
        'Classify an unknown ingredient''s elemental properties to earn Matter.',
        'achievement',
        'Matter',
        2,
        'classify_ingredient',
        1,
        32
    ),

    -- SPIRIT
    ('spirit-add-cooking-method', 'Favorite Cooking Method', 'Add a Favorite Cooking Method. Reward: 10 Spirit.', 'achievement', 'Spirit', 10, 'add_cooking_method', 1, 40),
    ('spirit-add-favorite-cuisine', 'Favorite Cuisine', 'Select a Favorite Cuisine. Reward: 10 Spirit.', 'achievement', 'Spirit', 10, 'add_favorite_cuisine', 1, 41),
    ('spirit-add-food-preference', 'Nutritional Preference', 'Add a Food/Nutritional Preference. Reward: 10 Spirit.', 'achievement', 'Spirit', 10, 'add_food_preference', 1, 42),

    -- ESSENCE
    ('essence-generate-recipes-10', 'Culinary Explorer I', 'Generate 10 Recipes. Reward: 15 Essence.', 'achievement', 'Essence', 15, 'generate_recipe', 10, 50),
    ('essence-generate-recipes-25', 'Culinary Explorer II', 'Generate 25 Recipes. Reward: 30 Essence.', 'achievement', 'Essence', 30, 'generate_recipe', 25, 51),
    ('essence-generate-recipes-50', 'Culinary Explorer III', 'Generate 50 Recipes. Reward: 50 Essence.', 'achievement', 'Essence', 50, 'generate_recipe', 50, 52),
    ('essence-generate-premium', 'Cosmic Chef', 'Generate a Premium Cosmic Recipe. Reward: 20 Essence.', 'achievement', 'Essence', 20, 'generate_premium_recipe', 1, 53),
    ('essence-generate-meal-plan', 'Master Planner', 'Generate a full Weekly Meal Plan. Reward: 25 Essence.', 'achievement', 'Essence', 25, 'generate_meal_plan', 1, 54),

    -- SUBSTANCE
    ('substance-first-purchase', 'First Exchange', 'Spend other coins (First Purchase). Reward: 20 Substance.', 'achievement', 'Substance', 20, 'spend_coins', 1, 60),
    ('substance-premium-signup', 'Premium Initiation', 'Sign up for Premium. Reward: 50 Substance.', 'achievement', 'Substance', 50, 'premium_signup', 1, 61),
    ('substance-add-favorite-restaurant', 'Local Patron', 'Add a Favorite Restaurant to profile. Reward: 15 Substance.', 'achievement', 'Substance', 15, 'add_favorite_restaurant', 1, 62),
    ('substance-add-restaurant-dish', 'Dish Discovery', 'Add a Favorite Dish to a Restaurant Profile. Reward: 15 Substance.', 'achievement', 'Substance', 15, 'add_restaurant_dish', 1, 63),
    ('substance-complete-nutritional-plan', 'Nutritional Alignment', 'Complete a Nutritional Plan. Reward: 20 Substance.', 'achievement', 'Substance', 20, 'complete_nutritional_plan', 1, 64),

    -- MATTER
    ('matter-instacart-order', 'Real World Harvest', 'Successfully complete an Instacart order. Reward: 30 Matter.', 'achievement', 'Matter', 30, 'instacart_order_success', 1, 70),
    ('matter-add-pantry-items', 'Stocking the Pantry', 'Add items to the Pantry. Reward: 10 Matter.', 'achievement', 'Matter', 10, 'add_pantry_items', 1, 71),
    ('matter-use-posso', 'Posso Interaction', 'Use the Posso component. Reward: 10 Matter.', 'achievement', 'Matter', 10, 'use_posso', 1, 72),
    ('matter-send-commensal', 'Dining Companion', 'Send a Commensal request. Reward: 15 Matter.', 'achievement', 'Matter', 15, 'send_commensal_request', 1, 73),
    ('matter-refer-user', 'Network Expansion', 'Refer a new user to sign up. Reward: 40 Matter.', 'achievement', 'Matter', 40, 'refer_user', 1, 74)
ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    quest_type = EXCLUDED.quest_type,
    token_reward_type = EXCLUDED.token_reward_type,
    token_reward_amount = EXCLUDED.token_reward_amount,
    trigger_event = EXCLUDED.trigger_event,
    trigger_threshold = EXCLUDED.trigger_threshold,
    sort_order = EXCLUDED.sort_order;
