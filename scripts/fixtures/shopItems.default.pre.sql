SELECT id, slug, title, description, category,
                cost_spirit, cost_essence, cost_matter, cost_substance,
                is_one_time, is_active, sort_order
         FROM shop_items
         WHERE is_active = true
         ORDER BY sort_order ASC, title ASC
