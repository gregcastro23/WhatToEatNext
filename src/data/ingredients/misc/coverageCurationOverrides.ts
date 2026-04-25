import type { IngredientMapping } from "@/data/ingredients/types";

// High-traffic coverage entries curated for clearer descriptions and tighter category typing.
export const coverageCurationOverrides: Record<string, Partial<IngredientMapping>> = {
  oil: {
    category: "oil",
    description: "Generic recipe oil token used when a source recipe does not specify olive, canola, or another named fat. Treat as neutral cooking oil unless a regional context indicates otherwise.",
  },
  fresh: {
    category: "seasoning",
    description: "A modifier token indicating freshness (e.g., fresh herbs, fresh chilies) rather than a standalone ingredient. Resolve to the primary ingredient named in context.",
  },
  pepper: {
    category: "spice",
    description: "Generic pepper token, most often meaning black pepper in savory recipes. Use as a baseline pungent spice unless the recipe specifies a pepper type.",
  },
  small_fish: {
    category: "protein",
    description: "Small whole fish used for broths, sauces, frying, and fermented preparations. Flavor intensity and salinity vary by species and preservation method.",
  },
  juice: {
    category: "seasoning",
    description: "Generic juice token typically used for citrus acidity, fruit sweetness, or marinade moisture. Resolve to citrus, vegetable, or fruit source from recipe context.",
  },
  vinegar: {
    category: "vinegar",
    description: "Generic vinegar token used for acid balance, pickling, and deglazing when a specific vinegar type is not named.",
  },
  corn: {
    category: "grain",
    description: "Whole corn kernels or cut corn used as a starchy-sweet base ingredient across soups, stews, tortillas, and salads.",
  },
  neutral_oil: {
    category: "oil",
    description: "Refined low-aroma oil (e.g., canola, grapeseed, sunflower) used for high-heat frying or when no flavor contribution from fat is desired.",
  },
  mirin: {
    category: "seasoning",
    description: "Sweet Japanese rice wine used to add gloss, mild sweetness, and aroma in sauces, braises, and tare.",
  },
  ice: {
    category: "seasoning",
    description: "Frozen water used for chilling, textural contrast, and dessert beverages rather than as a nutritional ingredient.",
  },
  fresh_yeast: {
    category: "seasoning",
    description: "Compressed baker's yeast used for active fermentation in breads and enriched doughs, with high activity and shorter shelf life than dry yeast.",
  },
  active_dry_yeast: {
    category: "seasoning",
    description: "Granulated dehydrated yeast used for bread fermentation; typically bloomed in warm liquid before mixing.",
  },
  cornstarch: {
    category: "grain",
    description: "Refined corn starch used to thicken sauces, stabilize batters, and improve crispness in frying.",
  },
  oyster_sauce: {
    category: "seasoning",
    description: "Concentrated savory sauce made from oyster extract and seasonings, used for umami depth and glossy stir-fry finishes.",
  },
  shaoxing_wine: {
    category: "seasoning",
    description: "Chinese rice wine used for aromatic depth, deglazing, and reducing perceived meat or seafood odors in cooking.",
  },
  alchemical_binding_agent: {
    category: "seasoning",
    description: "Schema stand-in for recipe-specific binder or emulsifier. Replace with concrete ingredient names during recipe curation.",
  },
  white_vinegar: {
    category: "vinegar",
    description: "Neutral distilled vinegar with sharp acetic acidity used for pickling, cleaning flavor profiles, and brightening sauces.",
  },
  corn_tortillas: {
    category: "grain",
    description: "Nixtamalized corn flatbreads used in tacos, enchiladas, tostadas, and layered casseroles.",
  },
  firm_tofu: {
    category: "protein",
    description: "Pressable tofu with moderate water content that holds shape in stir-fries, braises, and pan-searing.",
  },
  raisins: {
    category: "fruit",
    description: "Dried grapes used for concentrated sweetness and chew in savory rice dishes, breads, and desserts.",
  },
  cloves: {
    category: "spice",
    description: "Highly aromatic dried flower buds used in tiny quantities for warm, sweet, and medicinal spice notes.",
  },
  medium_firm_tofu: {
    category: "protein",
    description: "Tofu texture between soft and firm, suitable for soups, braises, and gentle stir-fries.",
  },
  extra_firm_tofu: {
    category: "protein",
    description: "Low-moisture tofu ideal for high-heat searing, grilling, and crisp textures after pressing.",
  },
  corn_tortilla: {
    category: "grain",
    description: "Single corn tortilla entry for recipe rows that use singular ingredient naming.",
    aliases: ["corn tortillas"],
  },
  allspice: {
    category: "spice",
    description: "Warm spice from dried Pimenta berries with flavor notes of clove, cinnamon, and nutmeg.",
  },
  ancho: {
    category: "spice",
    description: "Dried poblano chile used for mild heat, earthy sweetness, and deep red-brown sauces.",
  },
  queso_fresco: {
    category: "dairy",
    description: "Fresh crumbly Mexican cheese used as a salty, cooling finish for beans, tortillas, and chiles.",
  },
  white_bread: {
    category: "grain",
    description: "Refined wheat bread used for crumbs, soaks, sandwiches, and structure in fillings or meat mixtures.",
  },
  dried_red_chilies: {
    category: "spice",
    description: "Air-dried red chiles used whole, crushed, or rehydrated for layered heat and color.",
  },
  tahini: {
    category: "seasoning",
    description: "Ground sesame seed paste used for emulsions, sauces, dips, and nutty richness.",
  },
  raw_tahini: {
    category: "seasoning",
    description: "Unroasted sesame paste with lighter bitterness and grassy sesame aroma compared with roasted tahini.",
    aliases: ["tahini"],
  },
  lard: {
    category: "oil",
    description: "Rendered pork fat used for frying, pastry shortening, and savory depth in traditional regional cooking.",
  },
  vermicelli: {
    category: "grain",
    description: "Thin noodles (wheat or rice depending on cuisine) used in soups, stir-fries, and cold dishes.",
  },
  red_chilies: {
    category: "spice",
    description: "Generic ripe red chili pepper entry used for fresh heat and bright pepper aroma.",
  },
  cooked_meat: {
    category: "protein",
    description: "Prepared meat component carried into soups, rice dishes, or wraps as a pre-cooked protein ingredient.",
  },
  five_spice_powder: {
    category: "spice",
    description: "Chinese spice blend balancing sweet, warm, and numbing notes; commonly includes star anise, fennel, clove, cinnamon, and pepper.",
  },
  cayenne_pepper: {
    category: "spice",
    description: "Hot red chili powder used for direct, fast-building capsaicin heat.",
  },
  sichuan_peppercorns: {
    category: "spice",
    description: "Citrusy, numbing spice from prickly ash husks used for ma la profile and aromatic lift.",
  },
  garni: {
    category: "aromatic_base",
    subCategory: "bouquet_garni",
    compositeElements: ["thyme", "bay leaf", "parsley"],
    description: "Shorthand for herb bouquet components (e.g., bouquet garni) used to infuse stocks and braises.",
  },
  mirepoix: {
    category: "aromatic_base",
    subCategory: "mirepoix",
    compositeElements: ["onion", "carrots", "celery"],
    description: "Traditional French aromatic flavor base made of diced vegetables gently cooked in fat.",
  },
  chili_flakes: {
    category: "spice",
    description: "Crushed dried chili fragments used as finishing heat or infused in oil.",
  },
  radishes: {
    category: "vegetable",
    description: "Crisp pungent roots used raw for bite or pickled for acidity and crunch.",
  },
  fresh_wheat_noodles: {
    category: "grain",
    description: "High-moisture wheat noodles used in stir-fry and soup formats where chew and elasticity are important.",
  },
  dried_chili_flakes: {
    category: "spice",
    description: "Shelf-stable crushed dried chiles used for controlled background heat.",
    aliases: ["chili flakes"],
  },
  olives: {
    category: "fruit",
    description: "Brined or cured olive fruit used for saline bitterness and fat-like richness in Mediterranean and Middle Eastern dishes.",
  },
  bird_eye_chilies: {
    category: "spice",
    description: "Small, very hot chiles common in Southeast Asian cooking, used fresh or pounded into pastes.",
    aliases: ["bird's eye chilies", "bird_s_eye_chilies"],
  },
  bird_s_eye_chilies: {
    category: "spice",
    description: "Alternate spelling variant for bird's eye chilies; treated as the same high-heat chili ingredient.",
    aliases: ["bird eye chilies", "bird_eye_chilies"],
  },
  frying_oil: {
    category: "oil",
    description: "Oil specified for deep or shallow frying where smoke point and oxidation stability are primary constraints.",
  },
  pita_breads: {
    category: "grain",
    description: "Plural entry for pocket flatbreads used for wraps, dips, and baked chips.",
    aliases: ["pita bread"],
  },
  pita_bread: {
    category: "grain",
    description: "Leavened Middle Eastern flatbread used for stuffing, dipping, and as a starch base.",
    aliases: ["pita breads"],
  },
  vegetable_broth: {
    category: "seasoning",
    description: "Savory vegetable stock used as a liquid flavor base in soups, braises, and grain cooking.",
  },
};

