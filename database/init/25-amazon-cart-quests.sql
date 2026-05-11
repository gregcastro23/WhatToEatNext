-- Amazon Fresh cart quest definitions.
-- Rewards users who send grocery carts to Amazon Fresh,
-- supporting the 3-sale requirement to unlock PA-API access.

INSERT INTO quest_definitions
  (slug, title, description, quest_type, token_reward_type, token_reward_amount, trigger_event, trigger_threshold, sort_order)
VALUES
  (
    'achievement-first-amazon-cart',
    'The Alchemist''s Market',
    'Send your first grocery cart to Amazon Fresh and open the Marketplace Gate',
    'achievement',
    'Matter',
    50,
    'amazon_cart_send',
    1,
    50
  ),
  (
    'weekly-amazon-market',
    'Open the Market Gate',
    'Send a grocery cart to Amazon Fresh this week',
    'weekly',
    'Matter',
    20,
    'amazon_cart_send',
    1,
    13
  )
ON CONFLICT (slug) DO NOTHING;
