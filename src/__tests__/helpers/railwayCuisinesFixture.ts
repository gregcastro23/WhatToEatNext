/**
 * GET /cuisines/recommend?limit=14 as the Railway backend answers it.
 *
 * [MEASURED 2026-11-03] A verbatim trim of one capture: backend/alchm_kitchen/main.py
 * at e9859015, booted locally against a read-only connection to the production
 * database, called with the same query the Next route sends. Kept: the capture's four
 * top-level keys and, untouched, its first three cuisines (Vietnamese 0.8496, Chinese
 * 0.8489, Thai 0.8371, best match first) with all their nested recipes. Dropped: the
 * other eleven cuisines, so `total_recommendations` still says 14 while three entries
 * remain. The recipes are public catalogue rows.
 *
 * Wire types worth knowing: nested `prep_time`, `cook_time`, `servings` and
 * `difficulty` are numbers, `recipe_id` a UUID, `cuisine_id` a slug.
 *
 * Shared fixture, not a suite: `/__tests__/helpers/` is skipped by jest's test
 * collection.
 */
export const RAILWAY_CUISINES_RECOMMEND = {
  "current_moment": {
    "zodiac_sign": "Scorpio",
    "season": "Autumn",
    "meal_type": null,
    "sky": {
      "elements": {
        "Fire": 0.29090909090909095,
        "Water": 0.2545454545454545,
        "Earth": 0.09090909090909091,
        "Air": 0.36363636363636365
      },
      "sun_sign": "scorpio",
      "computed_at": "2026-11-03T08:58:41Z",
      "cached": false
    },
    "timestamp": "2026-11-03T03:58:42.693321"
  },
  "cuisine_recommendations": [
    {
      "cuisine_id": "vietnamese",
      "name": "Vietnamese",
      "description": "Fresh, light flavors with an emphasis on herbs and clear broths.",
      "elemental_properties": {
        "Fire": 0.272,
        "Water": 0.3366,
        "Earth": 0.2537,
        "Air": 0.1378
      },
      "elemental_basis": {
        "method": "recipe-mean",
        "recipes": 41
      },
      "nested_recipes": [
        {"recipe_id": "b7ab2a5d-00e2-4229-8618-769061886cd7", "name": "Authentic Bánh Mì", "description": "A structural fusion of cultures. A high-kinetic baguette with a rice-flour fortified crust shatters into airy crumbs, encapsulating fatty liver pâté, charred pork, and highly acidic pickled vegetables.", "prep_time": 30, "cook_time": 30, "servings": 4, "difficulty": 2, "ingredients": [{"name": "vietnamese baguette", "amount": 1.0, "unit": "whole", "notes": "Rice flour/wheat blend."}, {"name": "liver pâté", "amount": 2.0, "unit": "tbsp", "notes": "For fatty moisture."}], "instructions": ["Step 1: Split baguette; spread with mayo and pâté.", "Step 2: Layer grilled pork, cucumber slices, and cilantro.", "Step 3: Add a massive amount of pickled daikon/carrot (đồ chua).", "Step 4: Season with Maggi liquid seasoning and bird's eye chilies.", "Step 5: Serve immediately while the crust is still rigid."], "meal_type": "general", "seasonal_fit": "Excellent Autumn choice"},
        {"recipe_id": "2119126c-894b-4365-a664-04953abbb31c", "name": "Authentic Bánh Canh Cua (Vietnamese Crab Tapioca Noodles)", "description": "A soothing and hearty noodle soup, Bánh Canh Cua encapsulates an alchemical balance of oceanic and terrestrial richness, capturing the ephemeral essence of Vietnamese coastal cuisine with its silky strands and lavish crab bisque.", "prep_time": 30, "cook_time": 30, "servings": 4, "difficulty": 2, "ingredients": [{"name": "black pepper", "amount": 1.0, "unit": "tsp", "notes": ""}, {"name": "Vegetable Oil", "amount": 2.0, "unit": "tbsp", "notes": ""}], "instructions": ["Step 1: Cook tapioca noodles according to package instructions. Drain and set aside.", "Step 2: In a pot, heat vegetable oil over medium heat. Sauté crab meat until cooked.", "Step 3: Pour in chicken stock, fish sauce, and sugar. Bring to a boil.", "Step 4: Add noodles, reduce heat to simmer for 5 minutes.", "Step 5: Stir in bean sprouts and cook for another minute.", "Step 6: Garnish with scallions, black pepper, and cilantro before serving."], "meal_type": "general", "seasonal_fit": "Excellent Autumn choice"},
        {"recipe_id": "20ced87b-55c6-486f-a594-21354af2dd0d", "name": "Authentic Gỏi Gà Bắp Cải (Vietnamese Chicken and Cabbage Salad)", "description": "A refreshing salad balanced with the alchemical wonders of textures and flavors, combining tender chicken with crispy cabbage, enhanced by a zesty dressing that incarnates the culinary essence of Vietnamese finesse.", "prep_time": 30, "cook_time": 30, "servings": 4, "difficulty": 2, "ingredients": [{"name": "cabbage", "amount": 300.0, "unit": "g", "notes": ""}, {"name": "carrot", "amount": 1.0, "unit": "large", "notes": ""}, {"name": "lime juice", "amount": 3.0, "unit": "tbsp", "notes": ""}], "instructions": ["Step 1: In a large bowl, combine shredded chicken, cabbage, carrot, mint, and cilantro.", "Step 2: In a small bowl, whisk together lime juice, fish sauce, sugar, and chili garlic paste.", "Step 3: Pour the dressing over the salad and toss gently to combine.", "Step 4: Garnish with fried shallots and serve immediately."], "meal_type": "general", "seasonal_fit": "Excellent Autumn choice"}
      ],
      "recommended_sauces": [],
      "seasonal_context": "Perfect for Autumn with Scorpio energy",
      "astrological_score": 0.8495921633349407,
      "compatibility_reason": "Elemental match with today's sky: 85%"
    },
    {
      "cuisine_id": "chinese",
      "name": "Chinese",
      "description": "Ancient culinary traditions with a focus on balance and wok hei.",
      "elemental_properties": {
        "Fire": 0.3012,
        "Water": 0.2924,
        "Earth": 0.2692,
        "Air": 0.1372
      },
      "elemental_basis": {
        "method": "recipe-mean",
        "recipes": 43
      },
      "nested_recipes": [
        {"recipe_id": "4a016768-55db-4d96-9e78-7d78dd97bef4", "name": "Authentic Eight Treasure Rice Pudding (Ba Bao Fan)", "description": "A highly decorative, ceremonial dessert served at Lunar New Year. Sticky glutinous rice is steamed with sugar and lard/oil, then molded in a bowl lined with exactly eight types of dried fruits, nuts, and seeds (representing fortune), filled with red bean paste, and steamed again to set the structure.", "prep_time": 30, "cook_time": 30, "servings": 4, "difficulty": 2, "ingredients": [{"name": "short-grain glutinous rice (sweet rice)", "amount": 2.0, "unit": "cups", "notes": "Soaked overnight."}, {"name": "pork lard or coconut oil", "amount": 3.0, "unit": "tbsp", "notes": "Mixed into the cooked rice for gloss and flavor."}, {"name": "granulated sugar", "amount": 0.5, "unit": "cup", "notes": "Mixed into the cooked rice."}, {"name": "sweetened red bean paste", "amount": 1.0, "unit": "cup", "notes": "The hidden center."}, {"name": "dried fruits and nuts ('treasures')", "amount": 8.0, "unit": "types", "notes": "E.g., jujubes (red dates), lotus seeds, goji berries, candied winter melon, pumpkin seeds, walnuts, raisins, dried apricots."}, {"name": "water", "amount": 0.5, "unit": "cup", "notes": "For the finishing syrup."}, {"name": "sugar", "amount": 2.0, "unit": "tbsp", "notes": "For the finishing syrup."}, {"name": "cornstarch", "amount": 1.0, "unit": "tsp", "notes": "For the finishing syrup."}], "instructions": ["Step 1: Steam the rice. Drain the soaked sticky rice. Steam it in a basket lined with cheesecloth for 30 minutes until fully cooked and translucent.", "Step 2: Season the rice. While the rice is still piping hot, transfer it to a bowl and fold in the lard/coconut oil and 1/2 cup sugar until completely absorbed and glossy.", "Step 3: The Architecture. Generously grease a medium-sized, heatproof, dome-shaped bowl. Arrange the 'eight treasures' (dried fruits and nuts) in a decorative, geometric pattern on the bottom and sides of the bowl. This will be the top when unmolded.", "Step 4: Layering. Carefully press a layer of the warm sticky rice into the bowl over the decorations, making a well in the center.", "Step 5: The Center. Fill the well with the red bean paste.", "Step 6: Seal. Cover the bean paste with the remaining sticky rice, pressing down firmly to compact the entire pudding so it holds its shape.", "Step 7: Second Steam. Place the bowl back into the steamer and steam for another 15 minutes to fuse everything together.", "Step 8: The Glaze. While steaming, boil the water, 2 tbsp sugar, and cornstarch slurry to make a clear, sweet glaze.", "Step 9: Unmold and Serve. Invert a serving plate over the bowl and carefully flip it over. Lift off the bowl to reveal the jewel-encrusted dome. Pour the clear glaze over the top and serve hot."], "meal_type": "general", "seasonal_fit": "Excellent Autumn choice"},
        {"recipe_id": "612c0fd2-7c3f-4a12-9ffd-09e5d09c6919", "name": "Authentic Chinese Lamb Skewers (Yang Rou Chuan)", "description": "Roasting lamb with a fiery blend of cumin, chili, and coriander, Yang Rou Chuan proclaims rustic flavors that bind Earth and Fire, producing succulent morsels that resonate with primal energy.", "prep_time": 30, "cook_time": 30, "servings": 4, "difficulty": 2, "ingredients": [{"name": "Lamb", "amount": 600.0, "unit": "grams", "notes": ""}, {"name": "Cumin Seeds", "amount": 2.0, "unit": "tablespoons", "notes": ""}, {"name": "Coriander Seeds", "amount": 1.0, "unit": "tablespoon", "notes": ""}, {"name": "chili powder", "amount": 2.0, "unit": "tablespoons", "notes": ""}, {"name": "Vegetable Oil", "amount": 3.0, "unit": "tablespoons", "notes": ""}], "instructions": ["Step 1: Marinate lamb cubes with ground cumin, coriander, chili powder, salt, vegetable oil, and soy sauce for at least 1 hour.", "Step 2: Thread marinated lamb onto skewers.", "Step 3: Grill over high heat, turning occasionally, until cooked through and slightly charred.", "Step 4: Serve hot."], "meal_type": "general", "seasonal_fit": "Excellent Autumn choice"},
        {"recipe_id": "0ba1b88e-32aa-44f1-9819-0a13df60f735", "name": "Authentic Sichuan Dan Dan Noodles", "description": "The quintessential street food of Chengdu. It is not a soup, but rather a dry noodle dish characterized by intense stratification. Fresh noodles are placed over a violently red, highly complex sauce of chili oil, sesame paste, and Sichuan peppercorns, then topped with deeply savory, dry-fried pork and preserved vegetables (ya cai).", "prep_time": 30, "cook_time": 30, "servings": 4, "difficulty": 2, "ingredients": [{"name": "garlic", "amount": 2.0, "unit": "cloves", "notes": ""}], "instructions": ["Step 1: The Topping. Heat 1 tbsp oil in a wok. Add the ground pork. Stir-fry aggressively over high heat, breaking it up, until the moisture evaporates and the pork begins to crisp and brown in its own fat.", "Step 2: Flavor the pork. Add the Shaoxing wine and dark soy sauce. Toss. Add the chopped Ya Cai. Stir-fry for 1 more minute until deeply fragrant and dry. Remove from heat.", "Step 3: The Sauce Base. In each individual serving bowl, assemble the sauce. To each bowl add: 1.5 tbsp chili oil, 1/2 tbsp sesame paste, 1/2 tbsp light soy sauce, 1/2 tbsp black vinegar, a heavy pinch of ground Sichuan peppercorns, and half the minced garlic. Mix slightly into a dark paste.", "Step 4: The Greens. Blanch the bok choy in boiling water for 30 seconds. Remove and set aside.", "Step 5: The Noodles. In the same boiling water, cook the fresh noodles until just al dente. Drain very well.", "Step 6: Assemble. Place the hot noodles directly on top of the sauce paste in the serving bowls.", "Step 7: Crown. Top the noodles with the crispy pork/ya cai mixture, the blanched greens, and chopped scallions.", "Step 8: Serve. The dish is served layered. The diner must vigorously stir the noodles to coat them in the fiery sauce hidden at the bottom immediately before eating."], "meal_type": "general", "seasonal_fit": "Excellent Autumn choice"}
      ],
      "recommended_sauces": [
        {"sauce_name": "Sweet and Sour", "description": "Authentic Sweet and Sour for Chinese cuisine", "compatibility_score": 0.7, "reason": "Traditional autumn pairing with Scorpio harmony"},
        {"sauce_name": "Kung Pao", "description": "Authentic Kung Pao for Chinese cuisine", "compatibility_score": 0.7, "reason": "Traditional autumn pairing with Scorpio harmony"},
        {"sauce_name": "Black Bean", "description": "Authentic Black Bean for Chinese cuisine", "compatibility_score": 0.7, "reason": "Traditional autumn pairing with Scorpio harmony"}
      ],
      "seasonal_context": "Perfect for Autumn with Scorpio energy",
      "astrological_score": 0.8489179399602038,
      "compatibility_reason": "Elemental match with today's sky: 85%"
    },
    {
      "cuisine_id": "thai",
      "name": "Thai",
      "description": "Perfect balance of sour, sweet, salty, and spicy flavors.",
      "elemental_properties": {
        "Fire": 0.3091,
        "Water": 0.3299,
        "Earth": 0.247,
        "Air": 0.114
      },
      "elemental_basis": {
        "method": "recipe-mean",
        "recipes": 41
      },
      "nested_recipes": [
        {"recipe_id": "f4ff0f02-2b75-4d87-b493-e1576ba898c6", "name": "Authentic Gaeng Panang (Panang Curry)", "description": "Rich and creamy, this curry combines the essence of coconut milk with fragrant spices, creating an interplay of warmth and comfort that embodies the essence of Thai culinary magic.", "prep_time": 30, "cook_time": 30, "servings": 4, "difficulty": 2, "ingredients": [{"name": "coconut milk", "amount": 1.0, "unit": "cup", "notes": ""}, {"name": "Vegetable Oil", "amount": 2.0, "unit": "tablespoons", "notes": ""}], "instructions": ["Step 1: Heat vegetable oil in a pot over medium heat.", "Step 2: Add Panang curry paste and stir-fry until fragrant.", "Step 3: Add sliced chicken and stir until browned.", "Step 4: Pour in coconut milk, add fish sauce, sugar, and kaffir lime leaves.", "Step 5: Simmer for about 20 minutes until the chicken is cooked through.", "Step 6: Stir in Thai basil leaves and serve with jasmine rice."], "meal_type": "general", "seasonal_fit": "Excellent Autumn choice"},
        {"recipe_id": "db779e56-7197-4b67-af2f-0ac52272edd1", "name": "Nam Kang Sai", "description": "The structural opposite of hot and heavy. A violently cooling Thai dessert consisting of fiercely crushed ice piled over a customizable matrix of jellies, sweet beans, and syrups, flooded with condensed milk.", "prep_time": 30, "cook_time": 30, "servings": 4, "difficulty": 2, "ingredients": [{"name": "ice", "amount": 2.0, "unit": "cups", "notes": "Must be finely shaved or crushed into snow."}, {"name": "toppings matrix", "amount": 0.5, "unit": "cup", "notes": "Red beans, grass jelly, sweet corn, attap seeds."}, {"name": "hale's blue boy syrup", "amount": 3.0, "unit": "tbsp", "notes": "Iconic sweet, floral, bright red or green syrup."}, {"name": "evaporated milk", "amount": 2.0, "unit": "tbsp", "notes": "For richness."}, {"name": "sweetened condensed milk", "amount": 1.0, "unit": "tbsp", "notes": "For density and sweetness."}], "instructions": ["Step 1: The Base. In the bottom of a wide bowl, arrange the chosen heavy toppings (sweet red beans, jellies, corn).", "Step 2: The Mountain. Shave the ice directly over the toppings, forming a high, structured mountain. The ice must be fine enough to absorb syrup but granular enough not to instantly melt.", "Step 3: The Saturation. Vigorously drench the ice mountain with the brightly colored, floral syrup. The ice will instantly absorb the color.", "Step 4: The Emulsion. Pour the evaporated milk and a heavy drizzle of sweetened condensed milk over the top. The milk will streak down the sides, creating a visual marbling effect.", "Step 5: The Collapse. Serve immediately with a spoon. As it is eaten, the ice collapses into the sweet milks and toppings, creating a cold, slushy soup."], "meal_type": "general", "seasonal_fit": "Excellent Autumn choice"},
        {"recipe_id": "6fd7613d-ccbd-4326-8072-86d803e71f39", "name": "Gaeng Keow Wan Gai", "description": "Thai Green Curry, perhaps the most vibrant and aromatic of the Thai curry canon. A fiercely green paste of fresh green chilies, lemongrass, galangal, kaffir lime zest, and shrimp paste is fried in cracked coconut cream, then simmered with chicken, Thai eggplant, and an ocean of fresh basil. It is simultaneously the most herbaceous and spicy of the major Thai curries.", "prep_time": 30, "cook_time": 30, "servings": 4, "difficulty": 2, "ingredients": [{"name": "boneless chicken thighs", "amount": 500.0, "unit": "g", "notes": "Sliced into bite-sized strips. Thighs hold up better than breast in the curry."}, {"name": "full-fat coconut milk", "amount": 400.0, "unit": "ml", "notes": "Separated into thick cream (top) and thin milk (bottom) by refrigerating overnight and not shaking."}, {"name": "green curry paste", "amount": 4.0, "unit": "tbsp", "notes": "Good-quality store-bought or homemade. The foundation of all flavor."}, {"name": "thai eggplant", "amount": 200.0, "unit": "g", "notes": "Golf ball-sized, quartered. Or substitute pea eggplants. Do not substitute Italian eggplant."}, {"name": "fresh thai basil leaves", "amount": 1.0, "unit": "cup", "notes": "Horapah variety. Added at the very end. Do not substitute Italian basil."}, {"name": "makrut lime leaves", "amount": 4.0, "unit": "leaves", "notes": "Torn, central rib removed. For aromatic infusion."}, {"name": "fish sauce", "amount": 2.0, "unit": "tbsp", "notes": "For seasoning."}, {"name": "palm sugar", "amount": 1.0, "unit": "tbsp", "notes": "To balance the heat."}, {"name": "long red chilies", "amount": 2.0, "unit": "whole", "notes": "Sliced diagonally for garnish."}, {"name": "chicken stock", "amount": 1.0, "unit": "cup", "notes": "To adjust consistency."}], "instructions": ["Step 1: The Oil Separation (Keeo Gati). In a wok or wide pot, add the thick coconut cream from the top of the can. Heat over medium-high until the cream simmers and the coconut oil visibly separates and pools on the surface - this is called 'cracking the coconut cream' and is essential for frying the paste.", "Step 2: The Paste Fry. Add the green curry paste to the cracked coconut oil. Fry aggressively, stirring constantly, for 2-3 minutes until the paste darkens slightly and becomes incredibly fragrant. The raw edge of the galangal and chili will mellow and deepen.", "Step 3: The Chicken. Add the sliced chicken thighs to the fried paste. Toss to coat every piece. Stir-fry for 2 minutes until the chicken is sealed on the outside.", "Step 4: The Thin Milk and Stock. Pour in the remaining thin coconut milk and the chicken stock. Add the torn makrut lime leaves. Bring to a gentle simmer.", "Step 5: The Eggplant. Add the quartered Thai eggplants. Simmer gently for 8-10 minutes until the eggplant is completely tender and the chicken is cooked through.", "Step 6: The Seasoning. Season with fish sauce and palm sugar. The curry must be predominantly spicy and herbaceous with a background of sweetness and salinity.", "Step 7: The Basil Finish. Turn off the heat. Immediately add the fresh Thai basil leaves and sliced red chilies. Fold once; the basil will wilt from the residual heat. Serve immediately over jasmine rice."], "meal_type": "general", "seasonal_fit": "Excellent Autumn choice"}
      ],
      "recommended_sauces": [
        {"sauce_name": "Thai Green Curry Paste", "description": "Aromatic and vibrant curry paste made with fresh green chilies, lemongrass, galangal and aromatic herbs. The foundation of Thai green curry dishes.", "key_ingredients": ["green chilies", "lemongrass", "galangal", "kaffir lime", "coriander root"], "elemental_properties": {"Fire": 0.5, "Water": 0.2, "Air": 0.2, "Earth": 0.1}, "compatibility_score": 0.6, "reason": "Perfect for Autumn"},
        {"sauce_name": "Thai Red Curry Paste", "description": "Deep, robust, and moderately spicy paste anchored by dried red chilies, lemongrass, and galangal.", "key_ingredients": ["dried red chilies", "lemongrass", "galangal", "shrimp paste", "coriander root"], "elemental_properties": {"Fire": 0.6, "Earth": 0.2, "Water": 0.1, "Air": 0.1}, "compatibility_score": 0.6, "reason": "Perfect for Autumn"},
        {"sauce_name": "Thai Yellow Curry Paste", "description": "Mild, fragrant, and deeply savory curry paste characterized by fresh turmeric, dried spices, and a gentle heat.", "key_ingredients": ["turmeric", "curry powder", "lemongrass", "dried chilies", "shallots"], "elemental_properties": {"Earth": 0.5, "Fire": 0.3, "Air": 0.1, "Water": 0.1}, "compatibility_score": 0.6, "reason": "Perfect for Autumn"}
      ],
      "seasonal_context": "Perfect for Autumn with Scorpio energy",
      "astrological_score": 0.8370684037530726,
      "compatibility_reason": "Elemental match with today's sky: 84%"
    }
  ],
  "total_recommendations": 14,
  "debug_info": {
    "cuisine_scores": {
      "vietnamese": 0.8495921633349407,
      "chinese": 0.8489179399602038,
      "thai": 0.8370684037530726,
      "japanese": 0.8299389128474624,
      "korean": 0.8115132203892567,
      "italian": 0.8086481662645,
      "indian": 0.8068822489503598,
      "french": 0.799947364865565,
      "african": 0.7957229260749863,
      "american": 0.7943369071114675,
      "mexican": 0.793578407260706,
      "greek": 0.7687807459367612,
      "russian": 0.751626192769767,
      "middle-eastern": 0.750266422549659
    },
    "top_cuisines": [
      [
        "vietnamese",
        0.8495921633349407
      ],
      [
        "chinese",
        0.8489179399602038
      ],
      [
        "thai",
        0.8370684037530726
      ],
      [
        "japanese",
        0.8299389128474624
      ],
      [
        "korean",
        0.8115132203892567
      ],
      [
        "italian",
        0.8086481662645
      ],
      [
        "indian",
        0.8068822489503598
      ],
      [
        "french",
        0.799947364865565
      ],
      [
        "african",
        0.7957229260749863
      ],
      [
        "american",
        0.7943369071114675
      ],
      [
        "mexican",
        0.793578407260706
      ],
      [
        "greek",
        0.7687807459367612
      ],
      [
        "russian",
        0.751626192769767
      ],
      [
        "middle-eastern",
        0.750266422549659
      ]
    ]
  }
};

/** The body above as it would be with no sky to rank by, so every cuisine is unscored.
 *
 * Built from backend/alchm_kitchen/main.py, NOT captured: when the ephemeris fails and no
 * earlier sky is cached, current_sky() returns None (:1839), rank_cuisines_by_sky gives
 * every cuisine a None score and orders them alphabetically (:1855-1866), and the
 * endpoint still answers 200 with astrological_score and compatibility_reason null on
 * each entry (:1944-1945). */
export function withoutSky(body: typeof RAILWAY_CUISINES_RECOMMEND): Record<string, unknown> {
  const unscored = body.cuisine_recommendations
    .map((cuisine) => ({ ...cuisine, astrological_score: null, compatibility_reason: null }))
    .sort((a, b) => a.name.localeCompare(b.name));
  return {
    ...body,
    current_moment: { ...body.current_moment, sky: null },
    cuisine_recommendations: unscored,
  };
}
