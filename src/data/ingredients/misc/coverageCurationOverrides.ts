import type { IngredientMapping } from "@/data/ingredients/types";

// High-traffic coverage entries curated for clearer descriptions and tighter category typing.
export const coverageCurationOverrides: Record<string, Partial<IngredientMapping>> = {
  oil: {
      image_url: "https://assets.alchm.kitchen/ingredients/oil.png",
    category: "oil",
    description: "Generic recipe oil token used when a source recipe does not specify olive, canola, or another named fat. Treat as neutral cooking oil unless a regional context indicates otherwise.",
  },
  fresh: {
      image_url: "https://assets.alchm.kitchen/ingredients/fresh.png",
    category: "seasoning",
    description: "A modifier token indicating freshness (e.g., fresh herbs, fresh chilies) rather than a standalone ingredient. Resolve to the primary ingredient named in context.",
  },
  pepper: {
      image_url: "https://assets.alchm.kitchen/ingredients/pepper.png",
    category: "spice",
    description: "Generic pepper token, most often meaning black pepper in savory recipes. Use as a baseline pungent spice unless the recipe specifies a pepper type.",
  },
  small_fish: {
      image_url: "https://assets.alchm.kitchen/ingredients/small_fish.png",
    category: "protein",
    description: "Small whole fish used for broths, sauces, frying, and fermented preparations. Flavor intensity and salinity vary by species and preservation method.",
  },
  juice: {
      image_url: "https://assets.alchm.kitchen/ingredients/juice.png",
    category: "seasoning",
    description: "Generic juice token typically used for citrus acidity, fruit sweetness, or marinade moisture. Resolve to citrus, vegetable, or fruit source from recipe context.",
  },
  vinegar: {
      image_url: "https://assets.alchm.kitchen/ingredients/vinegar.png",
    category: "vinegar",
    description: "Generic vinegar token used for acid balance, pickling, and deglazing when a specific vinegar type is not named.",
  },
  corn: {
      image_url: "https://assets.alchm.kitchen/ingredients/corn.png",
    category: "grain",
    description: "Whole corn kernels or cut corn used as a starchy-sweet base ingredient across soups, stews, tortillas, and salads.",
  },
  neutral_oil: {
      image_url: "https://assets.alchm.kitchen/ingredients/neutral_oil.png",
    category: "oil",
    description: "Refined low-aroma oil (e.g., canola, grapeseed, sunflower) used for high-heat frying or when no flavor contribution from fat is desired.",
  },
  mirin: {
      image_url: "https://assets.alchm.kitchen/ingredients/mirin.png",
    category: "seasoning",
    description: "Sweet Japanese rice wine used to add gloss, mild sweetness, and aroma in sauces, braises, and tare.",
  },
  ice: {
      image_url: "https://assets.alchm.kitchen/ingredients/ice.png",
    category: "seasoning",
    description: "Frozen water used for chilling, textural contrast, and dessert beverages rather than as a nutritional ingredient.",
  },
  fresh_yeast: {
      image_url: "https://assets.alchm.kitchen/ingredients/fresh_yeast.png",
    category: "seasoning",
    description: "Compressed baker's yeast used for active fermentation in breads and enriched doughs, with high activity and shorter shelf life than dry yeast.",
  },
  active_dry_yeast: {
      image_url: "https://assets.alchm.kitchen/ingredients/active_dry_yeast.png",
    category: "seasoning",
    description: "Granulated dehydrated yeast used for bread fermentation; typically bloomed in warm liquid before mixing.",
  },
  cornstarch: {
      image_url: "https://assets.alchm.kitchen/ingredients/cornstarch.png",
    category: "grain",
    description: "Refined corn starch used to thicken sauces, stabilize batters, and improve crispness in frying.",
  },
  oyster_sauce: {
      image_url: "https://assets.alchm.kitchen/ingredients/oyster_sauce.png",
    category: "seasoning",
    description: "Concentrated savory sauce made from oyster extract and seasonings, used for umami depth and glossy stir-fry finishes.",
  },
  shaoxing_wine: {
      image_url: "https://assets.alchm.kitchen/ingredients/shaoxing_wine.png",
    category: "seasoning",
    description: "Chinese rice wine used for aromatic depth, deglazing, and reducing perceived meat or seafood odors in cooking.",
  },
  alchemical_binding_agent: {
      image_url: "https://assets.alchm.kitchen/ingredients/alchemical_binding_agent.png",
    category: "seasoning",
    description: "Schema stand-in for recipe-specific binder or emulsifier. Replace with concrete ingredient names during recipe curation.",
  },
  white_vinegar: {
      image_url: "https://assets.alchm.kitchen/ingredients/white_vinegar.png",
    category: "vinegar",
    description: "Neutral distilled vinegar with sharp acetic acidity used for pickling, cleaning flavor profiles, and brightening sauces.",
  },
  corn_tortillas: {
      image_url: "https://assets.alchm.kitchen/ingredients/corn_tortillas.png",
    category: "grain",
    description: "Nixtamalized corn flatbreads used in tacos, enchiladas, tostadas, and layered casseroles.",
  },
  firm_tofu: {
      image_url: "https://assets.alchm.kitchen/ingredients/firm_tofu.png",
    category: "protein",
    description: "Pressable tofu with moderate water content that holds shape in stir-fries, braises, and pan-searing.",
  },
  raisins: {
      image_url: "https://assets.alchm.kitchen/ingredients/raisins.png",
    category: "fruit",
    description: "Dried grapes used for concentrated sweetness and chew in savory rice dishes, breads, and desserts.",
  },
  cloves: {
      image_url: "https://assets.alchm.kitchen/ingredients/cloves.png",
    category: "spice",
    description: "Highly aromatic dried flower buds used in tiny quantities for warm, sweet, and medicinal spice notes.",
  },
  medium_firm_tofu: {
      image_url: "https://assets.alchm.kitchen/ingredients/medium_firm_tofu.png",
    category: "protein",
    description: "Tofu texture between soft and firm, suitable for soups, braises, and gentle stir-fries.",
  },
  extra_firm_tofu: {
      image_url: "https://assets.alchm.kitchen/ingredients/extra_firm_tofu.png",
    category: "protein",
    description: "Low-moisture tofu ideal for high-heat searing, grilling, and crisp textures after pressing.",
  },
  corn_tortilla: {
      image_url: "https://assets.alchm.kitchen/ingredients/corn_tortilla.png",
    category: "grain",
    description: "Single corn tortilla entry for recipe rows that use singular ingredient naming.",
    aliases: ["corn tortillas"],
  },
  allspice: {
      image_url: "https://assets.alchm.kitchen/ingredients/allspice.png",
    category: "spice",
    description: "Warm spice from dried Pimenta berries with flavor notes of clove, cinnamon, and nutmeg.",
  },
  ancho: {
      image_url: "https://assets.alchm.kitchen/ingredients/ancho.png",
    category: "spice",
    description: "Dried poblano chile used for mild heat, earthy sweetness, and deep red-brown sauces.",
  },
  queso_fresco: {
      image_url: "https://assets.alchm.kitchen/ingredients/queso_fresco.png",
    category: "dairy",
    description: "Fresh crumbly Mexican cheese used as a salty, cooling finish for beans, tortillas, and chiles.",
  },
  white_bread: {
      image_url: "https://assets.alchm.kitchen/ingredients/white_bread.png",
    category: "grain",
    description: "Refined wheat bread used for crumbs, soaks, sandwiches, and structure in fillings or meat mixtures.",
  },
  dried_red_chilies: {
      image_url: "https://assets.alchm.kitchen/ingredients/dried_red_chilies.png",
    category: "spice",
    description: "Air-dried red chiles used whole, crushed, or rehydrated for layered heat and color.",
  },
  tahini: {
      image_url: "https://assets.alchm.kitchen/ingredients/tahini.png",
    category: "seasoning",
    description: "Ground sesame seed paste used for emulsions, sauces, dips, and nutty richness.",
  },
  raw_tahini: {
      image_url: "https://assets.alchm.kitchen/ingredients/raw_tahini.png",
    category: "seasoning",
    description: "Unroasted sesame paste with lighter bitterness and grassy sesame aroma compared with roasted tahini.",
    aliases: ["tahini"],
  },
  lard: {
      image_url: "https://assets.alchm.kitchen/ingredients/lard.png",
    category: "oil",
    description: "Rendered pork fat used for frying, pastry shortening, and savory depth in traditional regional cooking.",
  },
  vermicelli: {
      image_url: "https://assets.alchm.kitchen/ingredients/vermicelli.png",
    category: "grain",
    description: "Thin noodles (wheat or rice depending on cuisine) used in soups, stir-fries, and cold dishes.",
  },
  red_chilies: {
      image_url: "https://assets.alchm.kitchen/ingredients/red_chilies.png",
    category: "spice",
    description: "Generic ripe red chili pepper entry used for fresh heat and bright pepper aroma.",
  },
  cooked_meat: {
      image_url: "https://assets.alchm.kitchen/ingredients/cooked_meat.png",
    category: "protein",
    description: "Prepared meat component carried into soups, rice dishes, or wraps as a pre-cooked protein ingredient.",
  },
  five_spice_powder: {
      image_url: "https://assets.alchm.kitchen/ingredients/five_spice_powder.png",
    category: "spice",
    description: "Chinese spice blend balancing sweet, warm, and numbing notes; commonly includes star anise, fennel, clove, cinnamon, and pepper.",
  },
  cayenne_pepper: {
      image_url: "https://assets.alchm.kitchen/ingredients/cayenne_pepper.png",
    category: "spice",
    description: "Hot red chili powder used for direct, fast-building capsaicin heat.",
  },
  sichuan_peppercorns: {
      image_url: "https://assets.alchm.kitchen/ingredients/sichuan_peppercorns.png",
    category: "spice",
    description: "Citrusy, numbing spice from prickly ash husks used for ma la profile and aromatic lift.",
  },
  garni: {
      image_url: "https://assets.alchm.kitchen/ingredients/garni.png",
    category: "aromatic_base",
    subCategory: "bouquet_garni",
    compositeElements: ["thyme", "bay leaf", "parsley"],
    description: "Shorthand for herb bouquet components (e.g., bouquet garni) used to infuse stocks and braises.",
    qualities: ["aromatic", "herbal", "infusing"],
    culinaryApplications: {
      commonUses: ["stocks", "soups", "braises", "court-bouillon"],
    },
    culinaryProfile: {
      preparationTips: [
        "Tie the herb sprigs into a tight bundle with kitchen twine, or wrap them in a square of cheesecloth.",
        "Knot a long tail of twine to the pot handle so the bundle is easy to fish out.",
        "Add early so it has time to infuse, then remove before serving — it flavors the liquid, it is not eaten.",
      ],
      cookingMethods: ["simmer", "braise", "infuse"],
      cuisineAffinity: ["French", "European"],
    },
  },
  mirepoix: {
      image_url: "https://assets.alchm.kitchen/ingredients/mirepoix.png",
    category: "aromatic_base",
    subCategory: "mirepoix",
    compositeElements: ["onion", "carrots", "celery"],
    description: "Traditional French aromatic flavor base made of diced vegetables gently cooked in fat.",
    qualities: ["aromatic", "savory", "foundational"],
    culinaryApplications: {
      commonUses: ["stocks", "soups", "braises", "stews", "sauces"],
    },
    culinaryProfile: {
      preparationTips: [
        "Cut onion, carrot, and celery to a uniform 1/4-inch (small) dice so they cook evenly.",
        "Hold the classic ratio of 2 parts onion to 1 part carrot to 1 part celery by volume.",
        "Dice larger for long braises and stocks; cut a fine brunoise for quick-cooking sauces.",
      ],
      cookingMethods: ["sweat", "sauté"],
      cuisineAffinity: ["French", "European", "American"],
    },
    storage: {
      container: "airtight container",
      temperature: "refrigerated",
      duration: "up to 3 days raw",
      notes: "Best diced fresh; freeze cut mirepoix for longer storage.",
    },
  },
  chili_flakes: {
      image_url: "https://assets.alchm.kitchen/ingredients/chili_flakes.png",
    category: "spice",
    description: "Crushed dried chili fragments used as finishing heat or infused in oil.",
  },
  radishes: {
      image_url: "https://assets.alchm.kitchen/ingredients/radishes.png",
    category: "vegetable",
    description: "Crisp pungent roots used raw for bite or pickled for acidity and crunch.",
  },
  fresh_wheat_noodles: {
      image_url: "https://assets.alchm.kitchen/ingredients/fresh_wheat_noodles.png",
    category: "grain",
    description: "High-moisture wheat noodles used in stir-fry and soup formats where chew and elasticity are important.",
  },
  dried_chili_flakes: {
      image_url: "https://assets.alchm.kitchen/ingredients/dried_chili_flakes.png",
    category: "spice",
    description: "Shelf-stable crushed dried chiles used for controlled background heat.",
    aliases: ["chili flakes"],
  },
  olives: {
      image_url: "https://assets.alchm.kitchen/ingredients/olives.png",
    category: "fruit",
    description: "Brined or cured olive fruit used for saline bitterness and fat-like richness in Mediterranean and Middle Eastern dishes.",
  },
  bird_eye_chilies: {
      image_url: "https://assets.alchm.kitchen/ingredients/bird_eye_chilies.png",
    category: "spice",
    description: "Small, very hot chiles common in Southeast Asian cooking, used fresh or pounded into pastes.",
    aliases: ["bird's eye chilies", "bird_s_eye_chilies"],
  },
  bird_s_eye_chilies: {
      image_url: "https://assets.alchm.kitchen/ingredients/bird_s_eye_chilies.png",
    category: "spice",
    description: "Alternate spelling variant for bird's eye chilies; treated as the same high-heat chili ingredient.",
    aliases: ["bird eye chilies", "bird_eye_chilies"],
  },
  frying_oil: {
      image_url: "https://assets.alchm.kitchen/ingredients/frying_oil.png",
    category: "oil",
    description: "Oil specified for deep or shallow frying where smoke point and oxidation stability are primary constraints.",
  },
  pita_breads: {
      image_url: "https://assets.alchm.kitchen/ingredients/pita_breads.png",
    category: "grain",
    description: "Plural entry for pocket flatbreads used for wraps, dips, and baked chips.",
    aliases: ["pita bread"],
  },
  pita_bread: {
      image_url: "https://assets.alchm.kitchen/ingredients/pita_bread.png",
    category: "grain",
    description: "Leavened Middle Eastern flatbread used for stuffing, dipping, and as a starch base.",
    aliases: ["pita breads"],
  },
  vegetable_broth: {
      image_url: "https://assets.alchm.kitchen/ingredients/vegetable_broth.png",
    category: "seasoning",
    description: "Savory vegetable stock used as a liquid flavor base in soups, braises, and grain cooking.",
  },
};

