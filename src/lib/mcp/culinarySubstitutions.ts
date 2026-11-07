/**
 * @file src/lib/mcp/culinarySubstitutions.ts
 *
 * Culinary substitution engine for allergen, dietary, and pantry adaptation.
 */
import { toolFailure, type ToolResult } from "./culinaryCommon";

export interface CulinarySubstitutionEntry {
  name: string;
  ratio: string;
  flavorImpact: string;
  textureImpact: string;
  elementalShift: Record<string, number>;
  bestFor: string[];
  notes: string | null;
}

export const CULINARY_SUBSTITUTIONS: Record<string, CulinarySubstitutionEntry[]> = {
  egg: [
    {
      name: "Flax egg (1 tbsp ground flaxseed + 2.5 tbsp water, rested 5 min)",
      ratio: "1 egg = 1 flax egg",
      flavorImpact: "Subtle nutty, earthy aroma; blends seamlessly into bakes",
      textureImpact: "Cohesive binding with gentle moisture; less rise than whole eggs",
      elementalShift: { Fire: 0.1, Water: 0.3, Earth: 0.5, Air: 0.1 },
      bestFor: ["cookies", "quick breads", "muffins", "pancakes"],
      notes: "Rich in plant lignans and omega-3 fatty acids.",
    },
    {
      name: "Aquafaba (canned chickpea liquid, whipped or unwhipped)",
      ratio: "3 tbsp aquafaba = 1 whole egg (2 tbsp = 1 egg white)",
      flavorImpact: "Completely neutral once cooked",
      textureImpact: "Light, airy foaming capability; mimics egg white albumin",
      elementalShift: { Fire: 0.1, Water: 0.4, Earth: 0.2, Air: 0.3 },
      bestFor: ["meringues", "macarons", "waffles", "mayonnaise"],
      notes: "Whip with a pinch of cream of tartar for stable stiff peaks.",
    },
    {
      name: "Puréed silken tofu",
      ratio: "1/4 cup (60g) = 1 egg",
      flavorImpact: "Neutral",
      textureImpact: "Dense, creamy moisture without leavening",
      elementalShift: { Fire: 0.1, Water: 0.4, Earth: 0.4, Air: 0.1 },
      bestFor: ["dense brownies", "custards", "quiches"],
      notes: "Blend until completely smooth before incorporating into batter.",
    },
  ],
  butter: [
    {
      name: "Refined or virgin coconut oil",
      ratio: "1:1 by weight (solid at room temp)",
      flavorImpact: "Refined: neutral; Virgin: tropical coconut sweetness",
      textureImpact: "Firm structure when chilled; melts cleanly at body temperature",
      elementalShift: { Fire: 0.2, Water: 0.1, Earth: 0.6, Air: 0.1 },
      bestFor: ["pie crusts", "cookies", "sautéing", "curries"],
      notes: "Chill briefly if making laminated or flaky doughs.",
    },
    {
      name: "Extra virgin olive oil",
      ratio: "3/4 cup EVOO = 1 cup butter (0.75:1)",
      flavorImpact: "Fruity, peppery, savory green notes",
      textureImpact: "Extremely tender, moist crumb that stays soft for days at room temp",
      elementalShift: { Fire: 0.3, Water: 0.2, Earth: 0.4, Air: 0.1 },
      bestFor: ["olive oil cakes", "focaccia", "pan-searing", "roasted vegetables"],
      notes: "Reduces saturated fat while elevating antioxidant polyphenols.",
    },
    {
      name: "Ghee (clarified butter)",
      ratio: "1:1",
      flavorImpact: "Intense toasted hazelnut, caramelized nutty aroma",
      textureImpact: "Very high smoke point (485°F / 250°C), zero moisture spatter",
      elementalShift: { Fire: 0.4, Water: 0.1, Earth: 0.4, Air: 0.1 },
      bestFor: ["high-heat searing", "tempering spices (tadka)", "roasting"],
      notes: "Milk solids and water removed; tolerated by many dairy-sensitive eaters.",
    },
  ],
  buttermilk: [
    {
      name: "Whole or soy milk + fresh lemon juice or white vinegar",
      ratio: "1 cup milk + 1 tbsp acid, stand 10 minutes to curdle",
      flavorImpact: "Bright, clean, lactic acidity",
      textureImpact: "Thickened, clotted liquid that activates baking soda immediately",
      elementalShift: { Fire: 0.2, Water: 0.4, Earth: 0.3, Air: 0.1 },
      bestFor: ["pancakes", "biscuits", "fried chicken marinades", "salad dressings"],
      notes: "Lactic acid tenderizes meat protein fibers rapidly.",
    },
  ],
  "heavy cream": [
    {
      name: "Full-fat canned coconut cream",
      ratio: "1:1",
      flavorImpact: "Subtle coconut sweetness",
      textureImpact: "Rich, luscious mouthfeel; whips when thoroughly chilled",
      elementalShift: { Fire: 0.1, Water: 0.3, Earth: 0.5, Air: 0.1 },
      bestFor: ["curries", "soups", "vegan chocolate ganache"],
      notes: "Scoop out top solid layer after refrigerating can overnight.",
    },
    {
      name: "Raw cashew cream (soaked cashews blended with water 1:1)",
      ratio: "1:1",
      flavorImpact: "Clean, mild, silky nutty richness",
      textureImpact: "Emulsifies completely; will not break or separate when boiled with acids",
      elementalShift: { Fire: 0.1, Water: 0.3, Earth: 0.5, Air: 0.1 },
      bestFor: ["cream pasta sauces (Alfredo)", "tomato bisque", "stews"],
      notes: "Soak cashews in boiling water for 20 minutes before blending on high.",
    },
  ],
  "soy sauce": [
    {
      name: "Tamari (gluten-free 100% soybean)",
      ratio: "1:1",
      flavorImpact: "Deeper, richer, less sharply salty umami",
      textureImpact: "Slightly more viscous dark liquid",
      elementalShift: { Fire: 0.2, Water: 0.4, Earth: 0.3, Air: 0.1 },
      bestFor: ["stir-fries", "sushi dipping", "marinades"],
      notes: "Brewed without wheat; celiac-safe.",
    },
    {
      name: "Coconut aminos",
      ratio: "1:1 (add an extra pinch of sea salt)",
      flavorImpact: "Milder umami with a gentle sweet finish (73% less sodium)",
      textureImpact: "Thinner liquid seasoning",
      elementalShift: { Fire: 0.1, Water: 0.3, Earth: 0.5, Air: 0.1 },
      bestFor: ["paleo diets", "soy-free diets", "vinaigrettes"],
      notes: "Derived from naturally aged, fermented coconut tree sap.",
    },
  ],
  honey: [
    {
      name: "Pure maple syrup",
      ratio: "1:1",
      flavorImpact: "Woody, caramel, vanilla complexity",
      textureImpact: "Slightly thinner viscosity",
      elementalShift: { Fire: 0.2, Water: 0.3, Earth: 0.4, Air: 0.1 },
      bestFor: ["vegan baking", "dressings", "glazes", "tea"],
      notes: "Grade A dark amber provides the deepest flavor profile.",
    },
  ],
  "all-purpose flour": [
    {
      name: "1-to-1 Gluten-Free Baking Flour (with xanthan gum)",
      ratio: "1:1 by weight",
      flavorImpact: "Neutral grain profile",
      textureImpact: "Mimics gluten elasticity and structure for standard cakes and cookies",
      elementalShift: { Fire: 0.1, Water: 0.2, Earth: 0.6, Air: 0.1 },
      bestFor: ["cookies", "cakes", "quick breads", "roux"],
      notes: "Measure by weight (120g/cup) for most consistent crumb structure.",
    },
  ],
  cornstarch: [
    {
      name: "Arrowroot powder",
      ratio: "1:1",
      flavorImpact: "Completely neutral and glossy finish",
      textureImpact: "Thickens at lower temperature; stays stable under freezing and acidic conditions",
      elementalShift: { Fire: 0.1, Water: 0.2, Earth: 0.6, Air: 0.1 },
      bestFor: ["pie fillings", "clear glazes", "acidic sauces"],
      notes: "Do not boil excessively or it will lose thickening power.",
    },
  ],
  parmesan: [
    {
      name: "Nutritional yeast + ground raw cashews + sea salt",
      ratio: "1:1",
      flavorImpact: "Sharp, cheesy, savory umami depth, 100% plant-based",
      textureImpact: "Dry, crumbly, powdery grate",
      elementalShift: { Fire: 0.1, Water: 0.1, Earth: 0.6, Air: 0.2 },
      bestFor: ["pasta garnish", "risotto", "salads", "popcorn"],
      notes: "Pulse cashews with nutritional yeast, garlic powder, and salt in a food processor.",
    },
  ],
  ricotta: [
    {
      name: "Whipped firm tofu with olive oil, lemon juice, and nutritional yeast",
      ratio: "1:1",
      flavorImpact: "Mild, creamy, lightly acidic curd notes",
      textureImpact: "Grainy curd texture matching whole-milk ricotta",
      elementalShift: { Fire: 0.1, Water: 0.3, Earth: 0.5, Air: 0.1 },
      bestFor: ["lasagna", "stuffed shells", "cannoli filling", "pizza topping"],
      notes: "Press tofu lightly to remove excess moisture before pulsing.",
    },
  ],
};

function normalizeSubKey(name: string): string {
  const clean = name.toLowerCase().replace(/[^a-z0-9 ]/g, "").trim();
  if (clean === "eggs") return "egg";
  if (clean === "flour" || clean === "white flour") return "all-purpose flour";
  if (clean === "heavy whipping cream" || clean === "cream") return "heavy cream";
  if (clean === "butter milk") return "buttermilk";
  if (clean === "parmesan cheese" || clean === "parmigiano") return "parmesan";
  if (clean === "ricotta cheese") return "ricotta";
  return clean;
}

function findSubstitutes(key: string): CulinarySubstitutionEntry[] {
  const direct = CULINARY_SUBSTITUTIONS[key];
  if (direct) return direct;
  for (const [subKey, list] of Object.entries(CULINARY_SUBSTITUTIONS)) {
    if (key.includes(subKey) || subKey.includes(key)) {
      return list;
    }
  }
  return [];
}

function filterByDiet(
  substitutes: CulinarySubstitutionEntry[],
  restriction: string | null,
): CulinarySubstitutionEntry[] {
  if (!restriction) return substitutes;
  const dLower = restriction.toLowerCase();
  return substitutes.filter((s) => {
    if (dLower.includes("vegan") && s.name.toLowerCase().includes("ghee")) return false;
    return true;
  });
}

function sortByDishContext(
  substitutes: CulinarySubstitutionEntry[],
  context: string | null,
): CulinarySubstitutionEntry[] {
  if (!context || substitutes.length <= 1) return substitutes;
  const ctxLower = context.toLowerCase();
  return [...substitutes].sort((a, b) => {
    const aMatches = a.bestFor.some((bf) => ctxLower.includes(bf.toLowerCase())) ? 1 : 0;
    const bMatches = b.bestFor.some((bf) => ctxLower.includes(bf.toLowerCase())) ? 1 : 0;
    return bMatches - aMatches;
  });
}

export function substituteIngredientHandler(
  args: Record<string, unknown>,
): Promise<ToolResult> {
  const rawIngredient = typeof args.ingredient === "string" ? args.ingredient.trim() : "";
  if (!rawIngredient) {
    return Promise.resolve(toolFailure("INVALID_ARGS", "ingredient is required"));
  }

  const dishContext = typeof args.dishContext === "string" ? args.dishContext.trim() : null;
  const dietaryRestriction =
    typeof args.dietaryRestriction === "string" ? args.dietaryRestriction.trim() : null;

  const key = normalizeSubKey(rawIngredient);
  const found = findSubstitutes(key);
  const dietFiltered = filterByDiet(found, dietaryRestriction);
  const substitutes = sortByDishContext(dietFiltered, dishContext);

  const data = {
    originalIngredient: rawIngredient,
    dishContext,
    dietaryRestriction,
    substitutes,
  };

  return Promise.resolve({
    ok: true,
    data,
    summary: {
      originalIngredient: rawIngredient,
      substituteCount: substitutes.length,
      topSubstitute: substitutes[0]?.name ?? null,
    },
  });
}
