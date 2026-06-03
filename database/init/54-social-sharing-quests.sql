-- Migration 54: Social sharing quests (ESMS aligned)
-- Enables quests for sharing completed weekly menus, generated recipes, and food preferences to the feed or taking screenshots.

INSERT INTO quest_definitions (slug, title, description, quest_type, token_reward_type, token_reward_amount, trigger_event, trigger_threshold, sort_order)
VALUES
    (
        'spirit-share-preferences-social',
        'Preference Showcase',
        'Share a screenshot of your alchemical food preferences to social media. Reward: 15 Spirit.',
        'achievement',
        'Spirit',
        15,
        'share_preferences_social',
        1,
        43
    ),
    (
        'essence-share-preferences-feed',
        'Community Attunement',
        'Share your alchemical food preferences to the community feed. Reward: 15 Essence.',
        'achievement',
        'Essence',
        15,
        'share_preferences_feed',
        1,
        55
    ),
    (
        'matter-share-menu-feed',
        'Feast Broadcast',
        'Share a completed weekly menu to the community feed. Reward: 20 Matter.',
        'weekly',
        'Matter',
        20,
        'share_menu_feed',
        1,
        17
    ),
    (
        'substance-share-recipe-feed',
        'Alchemical Broadcast',
        'Share a generated recipe to the community feed. Reward: 20 Substance.',
        'weekly',
        'Substance',
        20,
        'share_recipe_feed',
        1,
        18
    )
ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    quest_type = EXCLUDED.quest_type,
    token_reward_type = EXCLUDED.token_reward_type,
    token_reward_amount = EXCLUDED.token_reward_amount,
    trigger_event = EXCLUDED.trigger_event,
    trigger_threshold = EXCLUDED.trigger_threshold,
    sort_order = EXCLUDED.sort_order;
