SELECT id, slug, title, description, category,
                  cost_spirit, cost_essence, cost_matter, cost_substance,
                  is_one_time, is_active
           FROM shop_items WHERE slug = $1
