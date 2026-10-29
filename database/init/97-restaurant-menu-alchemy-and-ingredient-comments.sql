-- Migration 97: Restaurant Menu Alchemy, Ingredient Deconstruction & Granular Dish Commenting
-- Supports reading/alchemizing restaurant menus and letting users comment on liked ingredients & features.

-- 1. Extend restaurant_comments to store liked ingredients and dish features
ALTER TABLE restaurant_comments
  ADD COLUMN IF NOT EXISTS liked_ingredients TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS dish_features TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS texture_notes TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS elemental_resonance TEXT;

-- 2. Extend restaurant_dish_reviews for post-order ingredient highlights
ALTER TABLE restaurant_dish_reviews
  ADD COLUMN IF NOT EXISTS liked_ingredients TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS dish_features TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS elemental_resonance TEXT;

-- 3. Create restaurant_alchemized_menus table
CREATE TABLE IF NOT EXISTS restaurant_alchemized_menus (
  id SERIAL PRIMARY KEY,
  restaurant_id TEXT NOT NULL,
  restaurant_name TEXT,
  source_url TEXT,
  source_type TEXT DEFAULT 'website',
  elemental_signature JSONB NOT NULL DEFAULT '{"Fire": 25, "Water": 25, "Earth": 25, "Air": 25, "dominant": "Earth"}',
  top_ingredients TEXT[] DEFAULT '{}',
  dishes JSONB NOT NULL DEFAULT '[]',
  summary JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_restaurant_alchemized_menu UNIQUE (restaurant_id)
);

CREATE INDEX IF NOT EXISTS idx_restaurant_alchemized_menus_restaurant_id
  ON restaurant_alchemized_menus (restaurant_id);

-- 4. Seed Alchemized Menus for Partner Sanctuaries
INSERT INTO restaurant_alchemized_menus (
  restaurant_id, restaurant_name, source_url, source_type,
  elemental_signature, top_ingredients, dishes, summary
) VALUES
(
  'partner_alchm_trattoria',
  'Alchm Italian Trattoria',
  'https://alchm.kitchen/trattoria/menu',
  'curated',
  '{"Fire": 25, "Water": 15, "Earth": 45, "Air": 15, "dominant": "Earth"}',
  ARRAY['Black Truffle', 'San Marzano Tomatoes', 'Parmigiano-Reggiano', 'Rosemary', 'Garlic', 'Extra Virgin Olive Oil', 'Arborio Rice'],
  '[
    {
      "id": "dish_trattoria_1",
      "name": "Truffle Tagliolini",
      "category": "Handmade Pasta",
      "description": "House-made egg tagliolini ribbons tossed in mountain butter, cracked tellicherry pepper, and shaved black winter truffles.",
      "price": "$28.00",
      "ingredients": ["Egg Tagliolini", "Mountain Butter", "Black Truffle", "Tellicherry Pepper", "Parmigiano-Reggiano"],
      "elementalProfile": {"Fire": 10, "Water": 10, "Earth": 65, "Air": 15},
      "dominantElement": "Earth",
      "techniques": ["Hand-rolled", "Emulsified", "Shaved"],
      "textures": ["Velvety", "Al dente", "Rich"],
      "dietaryTags": ["Vegetarian"]
    },
    {
      "id": "dish_trattoria_2",
      "name": "Wood-Fired Margherita D.O.P.",
      "category": "Pizza",
      "description": "72-hour fermented sourdough crust, crushed San Marzano D.O.P. tomatoes, fresh buffalo mozzarella, fragrant Genovese basil, and Sicilian olive oil.",
      "price": "$22.00",
      "ingredients": ["Sourdough Crust", "San Marzano Tomatoes", "Buffalo Mozzarella", "Genovese Basil", "Extra Virgin Olive Oil"],
      "elementalProfile": {"Fire": 45, "Water": 15, "Earth": 25, "Air": 15},
      "dominantElement": "Fire",
      "techniques": ["Fermented", "Wood-fired", "Charred"],
      "textures": ["Crispy", "Airy", "Melted"],
      "dietaryTags": ["Vegetarian"]
    },
    {
      "id": "dish_trattoria_3",
      "name": "Braised Short Rib Risotto",
      "category": "Primi & Secondi",
      "description": "Slow-braised beef short rib in Barolo reduction over creamy saffron-infused Carnaroli risotto with bone marrow glaze.",
      "price": "$34.00",
      "ingredients": ["Beef Short Rib", "Carnaroli Rice", "Barolo Wine", "Saffron", "Bone Marrow", "Parmigiano-Reggiano"],
      "elementalProfile": {"Fire": 20, "Water": 25, "Earth": 50, "Air": 5},
      "dominantElement": "Earth",
      "techniques": ["Slow-braised", "Slow-stirred", "Glazed"],
      "textures": ["Tender", "Creamy", "Hearty"],
      "dietaryTags": ["High-Protein", "Gluten-Free"]
    },
    {
      "id": "dish_trattoria_4",
      "name": "Wild Fennel & Citrus Crudo",
      "category": "Antipasti",
      "description": "Thinly sliced wild Mediterranean branzino with shaved blood orange, castelvetrano olives, wild fennel pollen, and Meyer lemon agrumato.",
      "price": "$19.00",
      "ingredients": ["Branzino", "Blood Orange", "Wild Fennel", "Castelvetrano Olives", "Meyer Lemon Agrumato"],
      "elementalProfile": {"Fire": 5, "Water": 45, "Earth": 15, "Air": 35},
      "dominantElement": "Water",
      "techniques": ["Raw/Cured", "Thin-sliced"],
      "textures": ["Silky", "Crisp", "Refreshing"],
      "dietaryTags": ["Pescatarian", "Gluten-Free", "Dairy-Free"]
    }
  ]'::jsonb,
  '{"archetype": "Earth & Fire Hearth — Grounding Comfort & Wood-Fired Aromatics", "dishCount": 4, "topTechnique": "Wood-Fired & Slow-Braised"}'::jsonb
),
(
  'partner_sol_taqueria',
  'Sol Fire Taqueria',
  'https://solfire.kitchen/menu',
  'curated',
  '{"Fire": 55, "Water": 15, "Earth": 20, "Air": 10, "dominant": "Fire"}',
  ARRAY['Charred Habanero', 'Cilantro', 'Heirloom Corn Tortillas', 'Adobo Marinade', 'Avocado', 'Smoked Sea Salt', 'Lime'],
  '[
    {
      "id": "dish_sol_1",
      "name": "Wood-Grilled Carne Asada Tacos",
      "category": "Tacos",
      "description": "Citrus-adobo marinated prime flank steak seared over oak embers, charred scallions, salsa verde, and fresh cilantro on stone-ground heirloom corn tortillas.",
      "price": "$18.00",
      "ingredients": ["Prime Flank Steak", "Heirloom Corn Tortillas", "Charred Scallions", "Salsa Verde", "Cilantro", "Lime"],
      "elementalProfile": {"Fire": 55, "Water": 10, "Earth": 25, "Air": 10},
      "dominantElement": "Fire",
      "techniques": ["Oak-grilled", "Seared", "Citrus-cured"],
      "textures": ["Charred", "Juicy", "Tender"],
      "dietaryTags": ["Gluten-Free", "High-Protein", "Dairy-Free"]
    },
    {
      "id": "dish_sol_2",
      "name": "Al Pastor with Charred Pineapple",
      "category": "Tacos",
      "description": "Heritage pork slow-roasted on the trompo with achiote and guajillo chilies, carved with caramelized pineapple and charred jalapeño salsa.",
      "price": "$17.00",
      "ingredients": ["Heritage Pork", "Achiote", "Guajillo Chili", "Pineapple", "Charred Jalapeño", "Cilantro"],
      "elementalProfile": {"Fire": 60, "Water": 15, "Earth": 15, "Air": 10},
      "dominantElement": "Fire",
      "techniques": ["Spit-roasted", "Caramelized", "Smoked"],
      "textures": ["Crispy edges", "Succulent", "Sweet-spicy"],
      "dietaryTags": ["Gluten-Free", "High-Protein", "Dairy-Free"]
    },
    {
      "id": "dish_sol_3",
      "name": "Fire-Roasted Poblano & Wild Mushroom Enchiladas",
      "category": "Plates",
      "description": "Charred poblano peppers and foraged mushrooms rolled in handmade tortillas, smothered in velvety mole verde and toasted pumpkin seeds.",
      "price": "$21.00",
      "ingredients": ["Poblano Peppers", "Wild Mushrooms", "Mole Verde", "Pumpkin Seeds", "Cashew Crema"],
      "elementalProfile": {"Fire": 30, "Water": 15, "Earth": 45, "Air": 10},
      "dominantElement": "Earth",
      "techniques": ["Fire-roasted", "Simmered", "Toasted"],
      "textures": ["Velvety", "Earthy", "Nutty crunch"],
      "dietaryTags": ["Vegan", "Gluten-Free"]
    }
  ]'::jsonb,
  '{"archetype": "Fire Dominant — High-Energy Embers & Sun-Ripened Heat", "dishCount": 3, "topTechnique": "Oak-Grilled & Spit-Roasted"}'::jsonb
),
(
  'partner_celestial_ramen',
  'Celestial Noodle Sanctuary',
  'https://celestialramen.kitchen/menu',
  'curated',
  '{"Fire": 20, "Water": 50, "Earth": 20, "Air": 10, "dominant": "Water"}',
  ARRAY['Black Garlic Mayu', 'Kombu', 'Shiitake Dashi', 'House Alkaline Noodles', 'Spring Scallions', 'Ajitsuke Tamago'],
  '[
    {
      "id": "dish_celestial_1",
      "name": "Black Garlic Tonkotsu Ramen",
      "category": "Signature Ramen",
      "description": "24-hour pork bone broth enriched with roasted black garlic mayu, torch-caramelized chashu, house alkaline noodles, and wood ear mushrooms.",
      "price": "$21.00",
      "ingredients": ["Tonkotsu Broth", "Black Garlic Mayu", "Chashu Pork", "House Noodles", "Wood Ear Mushroom", "Ajitsuke Tamago"],
      "elementalProfile": {"Fire": 25, "Water": 45, "Earth": 25, "Air": 5},
      "dominantElement": "Water",
      "techniques": ["24hr Simmered", "Torched", "Fermented Oil"],
      "textures": ["Silky broth", "Springy noodles", "Melting chashu"],
      "dietaryTags": ["High-Protein"]
    },
    {
      "id": "dish_celestial_2",
      "name": "Yuzu Shio Clear Dashi Ramen",
      "category": "Signature Ramen",
      "description": "Clarified dual-dashi of golden chicken and Hokkaido kombu accented with cold-pressed Japanese yuzu citrus and bamboo shoots.",
      "price": "$20.00",
      "ingredients": ["Chicken Kombu Dashi", "Japanese Yuzu", "Menma Bamboo", "Mizuna Greens", "White Pepper"],
      "elementalProfile": {"Fire": 10, "Water": 55, "Earth": 15, "Air": 20},
      "dominantElement": "Water",
      "techniques": ["Clarified", "Infused", "Cold-pressed"],
      "textures": ["Crystal-clear", "Light", "Zesty"],
      "dietaryTags": ["Dairy-Free"]
    },
    {
      "id": "dish_celestial_3",
      "name": "Crispy Wagyu & Shiitake Gyoza",
      "category": "Small Bites",
      "description": "Pan-seared dumplings with a delicate lace skirt, filled with minced wagyu beef, shiitake mushrooms, and fresh ginger tare dipping sauce.",
      "price": "$12.00",
      "ingredients": ["Wagyu Beef", "Shiitake Mushrooms", "Ginger Tare", "Dumpling Wrapper", "Sesame Oil"],
      "elementalProfile": {"Fire": 30, "Water": 20, "Earth": 40, "Air": 10},
      "dominantElement": "Earth",
      "techniques": ["Pan-seared", "Steamed", "Crisped"],
      "textures": ["Lacy crisp skirt", "Juicy center", "Savory"],
      "dietaryTags": ["High-Protein"]
    }
  ]'::jsonb,
  '{"archetype": "Water Dominant — Restorative Broths & Harmonic Hydration", "dishCount": 3, "topTechnique": "Long-Simmered & Clarified Dashi"}'::jsonb
)
ON CONFLICT (restaurant_id) DO UPDATE SET
  restaurant_name = EXCLUDED.restaurant_name,
  source_url = EXCLUDED.source_url,
  elemental_signature = EXCLUDED.elemental_signature,
  top_ingredients = EXCLUDED.top_ingredients,
  dishes = EXCLUDED.dishes,
  summary = EXCLUDED.summary,
  updated_at = NOW();
