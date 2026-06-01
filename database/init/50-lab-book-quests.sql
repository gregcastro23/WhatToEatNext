-- Lab Book recipe-ingestion quests.
-- Reward users with ESMS for building their personal recipe cookbook
-- (user_custom_recipes) via the Lab Book. Each successful save to
-- POST /api/users/me/recipes/custom reports the 'ingest_recipe' event;
-- reportEvent() increments every matching quest, so these cumulative
-- achievements (+ a recurring weekly) complete as the count climbs.
-- Idempotent: ON CONFLICT (slug) DO NOTHING.

INSERT INTO quest_definitions
  (slug, title, description, quest_type, token_reward_type, token_reward_amount, trigger_event, trigger_threshold, sort_order)
VALUES
  ('achievement-lab-book-first',      'First Transcription', 'Add your first recipe to your Lab Book',     'achievement', 'all',  10, 'ingest_recipe',   1, 60),
  ('achievement-lab-book-five',       'Stocked Shelf',       'Add 5 recipes to your Lab Book',             'achievement', 'all',  25, 'ingest_recipe',   5, 61),
  ('achievement-lab-book-twentyfive', 'Cookbook Curator',    'Add 25 recipes to your Lab Book',            'achievement', 'all',  75, 'ingest_recipe',  25, 62),
  ('achievement-lab-book-hundred',    'Grand Archivist',     'Add 100 recipes to your Lab Book',           'achievement', 'all', 200, 'ingest_recipe', 100, 63),
  ('weekly-lab-book',                 'Weekly Archivist',    'Add 3 recipes to your Lab Book this week',    'weekly',      'all',  15, 'ingest_recipe',   3, 14)
ON CONFLICT (slug) DO NOTHING;
