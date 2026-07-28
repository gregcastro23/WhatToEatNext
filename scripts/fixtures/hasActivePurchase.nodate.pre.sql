SELECT 1 FROM user_purchases up
           JOIN shop_items si ON si.id = up.shop_item_id
           WHERE up.user_id = $1 AND si.slug = $2
           
           LIMIT 1
