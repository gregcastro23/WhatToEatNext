/**
 * Ingredient Enrichment Script (AST-based)
 *
 * Walks every ingredient file under `src/data/ingredients/**` and injects
 * missing rubric fields (description, sensoryProfile, nutritionalProfile,
 * culinaryProfile, pairingRecommendations, storage, qualities) into each
 * ingredient card.
 *
 * Sources:
 *   - `ingredientSummaries.ts` → rich description harvest
 *   - Category-keyed default templates for everything else
 *
 * Idempotent: never overwrites existing fields — only fills gaps.
 */

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import {
  Project,
  SyntaxKind,
  ObjectLiteralExpression,
  PropertyAssignment,
} from "ts-morph";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "..");
const INGREDIENTS_DIR = path.join(REPO_ROOT, "src", "data", "ingredients");
const SUMMARIES_FILE = path.join(INGREDIENTS_DIR, "ingredientSummaries.ts");

// ──────────────────────────────────────────────────────────────────
// Step 1: harvest descriptions from ingredientSummaries.ts
// ──────────────────────────────────────────────────────────────────

function loadSummaries(): Record<string, string> {
  const project = new Project({
    skipAddingFilesFromTsConfig: true,
    compilerOptions: { noEmit: true, skipLibCheck: true },
  });
  const sf = project.addSourceFileAtPath(SUMMARIES_FILE);
  const out: Record<string, string> = {};
  for (const decl of sf.getVariableDeclarations()) {
    const init = decl
      .getInitializer()
      ?.asKind(SyntaxKind.ObjectLiteralExpression);
    if (!init) continue;
    for (const prop of init.getProperties()) {
      const pa = prop.asKind(SyntaxKind.PropertyAssignment);
      if (!pa) continue;
      const key = pa.getName().replace(/^["'`]|["'`]$/g, "");
      const valueNode = pa.getInitializer();
      if (!valueNode) continue;
      let raw = valueNode.getText();
      // Strip surrounding quotes/backticks
      if (/^[`'"]/.test(raw) && /[`'"]$/.test(raw)) {
        raw = raw.slice(1, -1);
      }
      out[key] = raw;
    }
  }
  return out;
}

// Truncate a summary into a single-paragraph description for the card.
// Summaries include a `**Selection & Storage:**` block; we keep everything
// before that and collapse newlines.
function summaryToDescription(summary: string): string {
  let body = summary.split(/\*\*Selection/i)[0].trim();
  body = body.replace(/\n+/g, " ").replace(/\s+/g, " ").trim();
  // Escape stray double quotes and backslashes so we can emit as a
  // double-quoted JS string literal.
  body = body.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  return body;
}

// ──────────────────────────────────────────────────────────────────
// Step 2: category defaults (used when nothing better exists)
// ──────────────────────────────────────────────────────────────────

interface CategoryDefaults {
  description: string;
  qualities: string[];
  sensoryProfile: string;
  nutritionalProfile: string;
  culinaryProfile: string;
  pairingRecommendations: string;
  storage: string;
}

function def(cat: string, name: string): CategoryDefaults {
  const display = name.replace(/_/g, " ");
  const defaults: Record<string, CategoryDefaults> = {
    grains: {
      description: `A cereal or pseudo-cereal product, ${display} contributes complex carbohydrates, fiber, and a neutral-to-nutty flavor that anchors savory and sweet dishes across global cuisines.`,
      qualities: `["carbohydrate-rich", "sustaining", "versatile"]`,
      sensoryProfile: `{ taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.0, umami: 0.1, spicy: 0.0 }, aroma: { earthy: 0.6, nutty: 0.5, roasted: 0.2 }, texture: { chewy: 0.5, firm: 0.3, soft: 0.2 } }`,
      nutritionalProfile: `{ serving_size: "1/2 cup cooked", calories: 120, macros: { protein: 3, carbs: 25, fat: 0.5, fiber: 2 }, vitamins: { B1: 0.08, B3: 0.1, folate: 0.04 }, minerals: { manganese: 0.4, magnesium: 0.15, phosphorus: 0.1 }, source: "category default" }`,
      culinaryProfile: `{ flavorProfile: { primary: ["neutral"], secondary: ["starchy", "nutty"], notes: "Absorbs surrounding flavors; gains complexity via toasting." }, cookingMethods: ["boil", "steam", "bake", "pilaf", "risotto"], cuisineAffinity: ["Asian", "Mediterranean", "Middle-Eastern", "Latin"], preparationTips: ["Rinse until water runs clear to remove excess starch.", "Toast briefly in fat before adding liquid to deepen flavor."] }`,
      pairingRecommendations: `{ complementary: ["butter", "olive oil", "stock", "herbs", "alliums"], contrasting: ["citrus", "vinegar", "raw herbs"], toAvoid: [] }`,
      storage: `{ pantry: "Airtight container in cool, dry place.", shelfLife: "Up to 1 year dry.", notes: "Refrigerate or freeze whole-grain flours to prevent rancidity." }`,
    },
    vegetables: {
      description: `A fresh plant food, ${display} offers fiber, micronutrients, and a characteristic texture-flavor profile that changes dramatically with preparation method — from crisp and raw to tender and caramelized.`,
      qualities: `["fresh", "nutrient-dense", "versatile"]`,
      sensoryProfile: `{ taste: { sweet: 0.2, salty: 0.0, sour: 0.05, bitter: 0.2, umami: 0.1, spicy: 0.0 }, aroma: { vegetal: 0.7, earthy: 0.3, grassy: 0.3 }, texture: { crisp: 0.5, juicy: 0.3, tender: 0.4 } }`,
      nutritionalProfile: `{ serving_size: "1 cup", calories: 40, macros: { protein: 2, carbs: 8, fat: 0.3, fiber: 3 }, vitamins: { C: 0.3, A: 0.2, K: 0.2, folate: 0.15 }, minerals: { potassium: 0.2, manganese: 0.1, iron: 0.05 }, source: "category default" }`,
      culinaryProfile: `{ flavorProfile: { primary: ["vegetal"], secondary: ["sweet", "earthy"], notes: "Flavor intensifies with dry-heat methods; brightens with acid." }, cookingMethods: ["saute", "roast", "steam", "grill", "raw"], cuisineAffinity: ["Mediterranean", "Asian", "American", "European"], preparationTips: ["Salt 10-15 min before cooking to draw moisture.", "Finish with acid or fat to balance."] }`,
      pairingRecommendations: `{ complementary: ["olive oil", "garlic", "salt", "lemon", "herbs"], contrasting: ["vinegar", "chili", "citrus zest"], toAvoid: [] }`,
      storage: `{ refrigerated: "Crisper drawer, 1-2 weeks.", notes: "Store unwashed; wash just before use to extend freshness." }`,
    },
    herbs: {
      description: `An aromatic culinary herb, ${display} contributes volatile aromatic compounds that lift, brighten, or perfume a dish. Fresh and dried forms behave very differently — fresh is vivid and grassy, dried is concentrated and earthier.`,
      qualities: `["aromatic", "fresh", "bright"]`,
      sensoryProfile: `{ taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.2, umami: 0.0, spicy: 0.0 }, aroma: { herbaceous: 0.9, grassy: 0.5, floral: 0.3 }, texture: { tender: 0.6, delicate: 0.5 } }`,
      nutritionalProfile: `{ serving_size: "1 tbsp fresh", calories: 1, macros: { protein: 0.1, carbs: 0.2, fat: 0, fiber: 0.1 }, vitamins: { K: 0.3, A: 0.1, C: 0.05 }, minerals: { iron: 0.05, manganese: 0.04 }, source: "category default" }`,
      culinaryProfile: `{ flavorProfile: { primary: ["herbaceous"], secondary: ["grassy", "bright"], notes: "Add fresh herbs at the end of cooking to preserve volatile oils; dried herbs go in early." }, cookingMethods: ["raw", "infuse", "finish", "chiffonade"], cuisineAffinity: ["Mediterranean", "French", "Middle-Eastern", "Asian"], preparationTips: ["Chop with a sharp knife to avoid bruising.", "Add fresh at service, dried during simmer."] }`,
      pairingRecommendations: `{ complementary: ["olive oil", "lemon", "garlic", "butter", "tomato"], contrasting: ["chili", "vinegar", "citrus zest"], toAvoid: [] }`,
      storage: `{ refrigerated: "Wrap in damp paper towel, bag loosely — 5-7 days.", notes: "Hardy herbs (rosemary, thyme) freeze well; tender herbs (basil, cilantro) wilt fast." }`,
    },
    spices: {
      description: `A dried aromatic spice, ${display} carries highly concentrated essential oils and flavor compounds. Heat in fat or toasting bloom its character; age and light degrade it, so fresh whole spice ground as needed gives the best results.`,
      qualities: `["aromatic", "warm", "concentrated"]`,
      sensoryProfile: `{ taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.3, umami: 0.0, spicy: 0.4 }, aroma: { warm: 0.8, earthy: 0.5, spicy: 0.7 }, texture: { powdery: 0.6, dry: 0.8 } }`,
      nutritionalProfile: `{ serving_size: "1 tsp", calories: 6, macros: { protein: 0.2, carbs: 1.3, fat: 0.2, fiber: 0.6 }, vitamins: { A: 0.05, E: 0.03 }, minerals: { manganese: 0.1, iron: 0.1, calcium: 0.05 }, source: "category default" }`,
      culinaryProfile: `{ flavorProfile: { primary: ["warm"], secondary: ["earthy", "aromatic"], notes: "Bloom in fat or dry-toast briefly to activate aromatics; avoid scorching." }, cookingMethods: ["bloom", "toast", "grind", "infuse"], cuisineAffinity: ["Indian", "Middle-Eastern", "North-African", "Mexican"], preparationTips: ["Grind whole spice as close to use as possible.", "Store away from heat and light."] }`,
      pairingRecommendations: `{ complementary: ["onion", "garlic", "oil", "salt", "complementary spices"], contrasting: ["acid", "dairy"], toAvoid: [] }`,
      storage: `{ pantry: "Airtight, dark container, 6-12 months whole; 3-6 months ground.", notes: "Test potency by smelling — if faint, replace." }`,
    },
    seasonings: {
      description: `A foundational seasoning, ${display} shapes the savory backbone of cooking. Used for salt balance, umami depth, or aromatic lift, its placement and timing matter as much as quantity.`,
      qualities: `["foundational", "flavor-building", "savory"]`,
      sensoryProfile: `{ taste: { sweet: 0.1, salty: 0.4, sour: 0.1, bitter: 0.1, umami: 0.3, spicy: 0.1 }, aroma: { savory: 0.6, aromatic: 0.4 }, texture: { varied: 0.5 } }`,
      nutritionalProfile: `{ serving_size: "1 tsp", calories: 10, macros: { protein: 0.5, carbs: 2, fat: 0.2, fiber: 0.2 }, vitamins: {}, minerals: { sodium: 0.5 }, source: "category default" }`,
      culinaryProfile: `{ flavorProfile: { primary: ["savory"], secondary: ["umami", "aromatic"], notes: "Balance salt, acid, and umami progressively throughout cooking." }, cookingMethods: ["season", "finish", "marinate"], cuisineAffinity: ["global"], preparationTips: ["Season in layers rather than all at once.", "Taste between additions."] }`,
      pairingRecommendations: `{ complementary: ["oil", "acid", "alliums", "herbs"], contrasting: ["sweeteners", "dairy"], toAvoid: [] }`,
      storage: `{ pantry: "Sealed container, cool and dry.", notes: "Humidity clumps dry seasonings — add a rice grain to absorb moisture." }`,
    },
    oils: {
      description: `A culinary fat, ${display} carries flavor compounds, enables Maillard reactions, and regulates heat transfer. Smoke point and flavor intensity determine best use: low-heat finishing versus high-heat frying.`,
      qualities: `["fatty", "rich", "flavor-carrier"]`,
      sensoryProfile: `{ taste: { sweet: 0.05, salty: 0.0, sour: 0.0, bitter: 0.1, umami: 0.05, spicy: 0.0 }, aroma: { fatty: 0.7, nutty: 0.3, fruity: 0.3 }, texture: { oily: 0.9, smooth: 0.9, coating: 0.9 } }`,
      nutritionalProfile: `{ serving_size: "1 tbsp", calories: 120, macros: { protein: 0, carbs: 0, fat: 14, fiber: 0, saturatedFat: 2 }, vitamins: { E: 0.15, K: 0.05 }, minerals: {}, source: "category default" }`,
      culinaryProfile: `{ flavorProfile: { primary: ["fatty"], secondary: ["nutty", "fruity"], notes: "Heat below smoke point for frying; finish raw for best aroma." }, cookingMethods: ["saute", "fry", "drizzle", "emulsify", "confit"], cuisineAffinity: ["Mediterranean", "Asian", "American"], preparationTips: ["Store away from light and heat.", "Use high-smoke-point oils for searing; finishing oils raw."] }`,
      pairingRecommendations: `{ complementary: ["acid", "salt", "herbs", "garlic"], contrasting: ["citrus", "vinegar"], toAvoid: [] }`,
      storage: `{ pantry: "Dark, cool cupboard; 6-12 months.", notes: "Refrigerate delicate nut/seed oils to prevent rancidity." }`,
    },
    vinegars: {
      description: `An acidic condiment, ${display} delivers sharpness, brightness, and balance. Acetic acid cuts through fat and richness; specific base material (wine, rice, apple, malt) contributes a distinct secondary flavor.`,
      qualities: `["acidic", "bright", "balancing"]`,
      sensoryProfile: `{ taste: { sweet: 0.1, salty: 0.0, sour: 0.9, bitter: 0.1, umami: 0.1, spicy: 0.0 }, aroma: { sharp: 0.8, fruity: 0.4, fermented: 0.5 }, texture: { liquid: 1.0, sharp: 0.9 } }`,
      nutritionalProfile: `{ serving_size: "1 tbsp", calories: 3, macros: { protein: 0, carbs: 0.1, fat: 0, fiber: 0 }, vitamins: {}, minerals: { potassium: 0.01 }, source: "category default" }`,
      culinaryProfile: `{ flavorProfile: { primary: ["sour"], secondary: ["fruity", "fermented"], notes: "Balances rich and fatty dishes; finishes bright and clean." }, cookingMethods: ["deglaze", "reduce", "dress", "pickle", "marinate"], cuisineAffinity: ["Mediterranean", "Asian", "European"], preparationTips: ["Taste before using — acidity varies by brand.", "Reduce slowly to avoid sharpness burnout."] }`,
      pairingRecommendations: `{ complementary: ["oil", "honey", "mustard", "shallot", "herbs"], contrasting: ["dairy", "egg"], toAvoid: [] }`,
      storage: `{ pantry: "Sealed bottle, cool dark place, indefinite shelf life.", notes: "Cloudiness or 'mother' sediment is harmless and edible." }`,
    },
    beverages: {
      description: `A liquid consumable, ${display} functions as hydration, flavor carrier, or culinary ingredient. Temperature, dilution, and accompaniment dramatically change its sensory profile.`,
      qualities: `["refreshing", "aromatic", "hydrating"]`,
      sensoryProfile: `{ taste: { sweet: 0.2, salty: 0.0, sour: 0.1, bitter: 0.2, umami: 0.0, spicy: 0.0 }, aroma: { aromatic: 0.5, complex: 0.5 }, texture: { liquid: 1.0, smooth: 0.6 } }`,
      nutritionalProfile: `{ serving_size: "8 oz", calories: 10, macros: { protein: 0, carbs: 2, fat: 0, fiber: 0 }, vitamins: {}, minerals: {}, source: "category default" }`,
      culinaryProfile: `{ flavorProfile: { primary: ["aromatic"], secondary: ["complex"], notes: "Use as liquid base in reductions, braises, or cocktails." }, cookingMethods: ["reduce", "deglaze", "infuse", "steep"], cuisineAffinity: ["global"], preparationTips: ["Warm or chill to optimal serving temperature.", "Match weight and flavor to accompanying food."] }`,
      pairingRecommendations: `{ complementary: ["citrus", "herbs", "spices"], contrasting: ["dairy", "salt"], toAvoid: [] }`,
      storage: `{ refrigerated: "Sealed, 3-7 days once opened.", notes: "Oxidation dulls flavor — decant smaller portions if stored long." }`,
    },
    misc: {
      description: `A pantry staple, ${display} fills a specific functional or flavor role in the kitchen — thickening, emulsifying, sweetening, leavening, or garnishing.`,
      qualities: `["functional", "flavor-builder", "pantry-staple"]`,
      sensoryProfile: `{ taste: { sweet: 0.2, salty: 0.1, sour: 0.1, bitter: 0.1, umami: 0.1, spicy: 0.0 }, aroma: { neutral: 0.5 }, texture: { varied: 0.5 } }`,
      nutritionalProfile: `{ serving_size: "1 tbsp", calories: 40, macros: { protein: 0.5, carbs: 8, fat: 1, fiber: 0.2 }, vitamins: {}, minerals: {}, source: "category default" }`,
      culinaryProfile: `{ flavorProfile: { primary: ["functional"], secondary: ["supporting"], notes: "Used to modify texture, balance, or finish." }, cookingMethods: ["mix", "fold", "bloom", "dissolve"], cuisineAffinity: ["global"], preparationTips: ["Measure carefully — small amounts have big impact.", "Store per label guidance."] }`,
      pairingRecommendations: `{ complementary: ["base ingredient", "salt", "acid"], contrasting: [], toAvoid: [] }`,
      storage: `{ pantry: "Airtight, cool dry.", notes: "Check package for specific shelf life." }`,
    },
    dairy: {
      description: `A dairy product, ${display} contributes fat, protein, moisture, and rich mouthfeel. Heat, acid, and age transform its character — from liquid to curd, from fresh to aged.`,
      qualities: `["creamy", "rich", "foundational"]`,
      sensoryProfile: `{ taste: { sweet: 0.2, salty: 0.2, sour: 0.1, bitter: 0.0, umami: 0.2, spicy: 0.0 }, aroma: { lactic: 0.7, fresh: 0.5, creamy: 0.7 }, texture: { creamy: 0.9, smooth: 0.8, rich: 0.8 } }`,
      nutritionalProfile: `{ serving_size: "1 oz", calories: 90, macros: { protein: 5, carbs: 3, fat: 7, fiber: 0, saturatedFat: 4 }, vitamins: { A: 0.1, B12: 0.15, D: 0.1, riboflavin: 0.1 }, minerals: { calcium: 0.2, phosphorus: 0.1, zinc: 0.05 }, source: "category default" }`,
      culinaryProfile: `{ flavorProfile: { primary: ["creamy"], secondary: ["lactic", "rich"], notes: "Acid and heat cause separation; temper carefully into hot liquids." }, cookingMethods: ["sauce", "cream", "bake", "foam", "finish"], cuisineAffinity: ["European", "American", "Middle-Eastern"], preparationTips: ["Temper with a small amount of hot liquid before adding to sauces.", "High heat breaks the emulsion — use gentle warmth."] }`,
      pairingRecommendations: `{ complementary: ["fruit", "herbs", "bread", "honey", "nuts"], contrasting: ["acid", "citrus"], toAvoid: [] }`,
      storage: `{ refrigerated: "35-40°F, sealed.", notes: "Fresh dairy: 5-10 days; aged cheese: weeks to months wrapped in wax paper." }`,
    },
    fruits: {
      description: `A sweet edible plant product, ${display} delivers natural sugars, acid, aromatic volatiles, and fiber. Ripeness dramatically changes its flavor, texture, and use.`,
      qualities: `["sweet", "juicy", "aromatic"]`,
      sensoryProfile: `{ taste: { sweet: 0.7, salty: 0.0, sour: 0.3, bitter: 0.05, umami: 0.0, spicy: 0.0 }, aroma: { fruity: 0.9, floral: 0.3, fresh: 0.7 }, texture: { juicy: 0.7, tender: 0.6, soft: 0.5 } }`,
      nutritionalProfile: `{ serving_size: "1 cup", calories: 70, macros: { protein: 1, carbs: 18, fat: 0.3, fiber: 3, sugar: 12 }, vitamins: { C: 0.5, A: 0.1, folate: 0.08 }, minerals: { potassium: 0.15, manganese: 0.05 }, source: "category default" }`,
      culinaryProfile: `{ flavorProfile: { primary: ["sweet"], secondary: ["acidic", "aromatic"], notes: "Ripeness drives use: firm/underripe for savory, ripe for desserts, overripe for purees." }, cookingMethods: ["raw", "roast", "poach", "jam", "dehydrate"], cuisineAffinity: ["Mediterranean", "tropical", "European", "Asian"], preparationTips: ["Taste for ripeness before committing to a technique.", "Acid balances sweetness; salt amplifies both."] }`,
      pairingRecommendations: `{ complementary: ["citrus", "honey", "vanilla", "dairy", "mint"], contrasting: ["chili", "salt", "vinegar"], toAvoid: [] }`,
      storage: `{ countertop: "Until ripe, then refrigerate.", notes: "Ethylene-producers (apple, banana) ripen neighbors faster — separate if delaying ripening." }`,
    },
    proteins: {
      description: `A protein-rich ingredient, ${display} provides complete or complementary amino acids along with fat, minerals, and umami depth. Cooking method determines texture: dry-heat for browning, moist-heat for tenderness.`,
      qualities: `["protein-rich", "nourishing", "savory"]`,
      sensoryProfile: `{ taste: { sweet: 0.05, salty: 0.1, sour: 0.0, bitter: 0.1, umami: 0.6, spicy: 0.0 }, aroma: { savory: 0.8, rich: 0.6, roasted: 0.5 }, texture: { firm: 0.6, tender: 0.5, juicy: 0.4 } }`,
      nutritionalProfile: `{ serving_size: "3 oz", calories: 180, macros: { protein: 22, carbs: 0, fat: 10, fiber: 0, saturatedFat: 3 }, vitamins: { B12: 0.4, B6: 0.3, niacin: 0.3 }, minerals: { iron: 0.15, zinc: 0.3, selenium: 0.4 }, source: "category default" }`,
      culinaryProfile: `{ flavorProfile: { primary: ["savory"], secondary: ["umami", "rich"], notes: "Brown in dry heat for Maillard, then finish gently to stay tender." }, cookingMethods: ["sear", "roast", "braise", "poach", "grill"], cuisineAffinity: ["global"], preparationTips: ["Salt 40 min before cooking for well-seasoned result.", "Rest after cooking to redistribute juices."] }`,
      pairingRecommendations: `{ complementary: ["salt", "fat", "acid", "herbs", "garlic"], contrasting: ["citrus", "spicy", "bitter greens"], toAvoid: [] }`,
      storage: `{ refrigerated: "35-40°F, 1-3 days fresh; freeze for longer.", notes: "Thaw in refrigerator — never at room temperature." }`,
    },
  };
  return defaults[cat] ?? defaults.misc;
}

// ──────────────────────────────────────────────────────────────────
// Step 3: enrichment walker
// ──────────────────────────────────────────────────────────────────

interface EnrichStats {
  totalIngredients: number;
  fieldsAdded: Record<string, number>;
  filesModified: number;
}

function propMap(
  obj: ObjectLiteralExpression,
): Map<string, PropertyAssignment> {
  const m = new Map<string, PropertyAssignment>();
  for (const p of obj.getProperties()) {
    const pa = p.asKind(SyntaxKind.PropertyAssignment);
    if (pa) m.set(pa.getName().replace(/^["'`]|["'`]$/g, ""), pa);
  }
  return m;
}

function hasCaloriesMacros(props: Map<string, PropertyAssignment>): boolean {
  const np = props
    .get("nutritionalProfile")
    ?.getInitializer()
    ?.asKind(SyntaxKind.ObjectLiteralExpression);
  if (!np) return false;
  return !!np.getProperty("calories") && !!np.getProperty("macros");
}

function hasVitaminsMinerals(props: Map<string, PropertyAssignment>): boolean {
  const np = props
    .get("nutritionalProfile")
    ?.getInitializer()
    ?.asKind(SyntaxKind.ObjectLiteralExpression);
  if (!np) return false;
  return !!np.getProperty("vitamins") && !!np.getProperty("minerals");
}

function hasCookingMethods(props: Map<string, PropertyAssignment>): boolean {
  const cp = props
    .get("culinaryProfile")
    ?.getInitializer()
    ?.asKind(SyntaxKind.ObjectLiteralExpression);
  if (cp && cp.getProperty("cookingMethods")) return true;
  return !!props.get("cookingMethods");
}

function hasComplementary(props: Map<string, PropertyAssignment>): boolean {
  if (props.get("pairings")) return true;
  const pr = props
    .get("pairingRecommendations")
    ?.getInitializer()
    ?.asKind(SyntaxKind.ObjectLiteralExpression);
  return !!pr && !!pr.getProperty("complementary");
}

function hasQualities(props: Map<string, PropertyAssignment>): boolean {
  const q = props.get("qualities");
  const init = q?.getInitializer()?.asKind(SyntaxKind.ArrayLiteralExpression);
  return !!init && init.getElements().length >= 3;
}

function hasAstrology(props: Map<string, PropertyAssignment>): boolean {
  const ap = props
    .get("astrologicalProfile")
    ?.getInitializer()
    ?.asKind(SyntaxKind.ObjectLiteralExpression);
  return !!ap && !!ap.getProperty("rulingPlanets");
}

function hasDescription(props: Map<string, PropertyAssignment>): boolean {
  const p = props.get("description");
  if (!p) return false;
  const txt = p.getInitializer()?.getText() ?? "";
  const cleaned = txt.replace(/^["'`]|["'`]$/g, "").replace(/\\n/g, " ");
  return cleaned.length >= 40;
}

function categoryFromFile(file: string): string {
  const rel = path.relative(INGREDIENTS_DIR, file).split(path.sep);
  return rel[0].replace(/\.ts$/, "");
}

function enrichFile(
  filePath: string,
  summaries: Record<string, string>,
  project: Project,
  stats: EnrichStats,
): boolean {
  const sf = project.addSourceFileAtPath(filePath);
  const category = categoryFromFile(filePath);
  let modified = false;

  for (const decl of sf.getVariableDeclarations()) {
    const rootObj = decl
      .getInitializer()
      ?.asKind(SyntaxKind.ObjectLiteralExpression);
    if (!rootObj) continue;

    for (const prop of rootObj.getProperties()) {
      const pa = prop.asKind(SyntaxKind.PropertyAssignment);
      if (!pa) continue;
      const ingredientObj = pa
        .getInitializer()
        ?.asKind(SyntaxKind.ObjectLiteralExpression);
      // Also support createIngredientMapping("slug", { ... })
      let actualObj = ingredientObj;
      if (!actualObj) {
        const callExpr = pa
          .getInitializer()
          ?.asKind(SyntaxKind.CallExpression);
        if (callExpr) {
          const args = callExpr.getArguments();
          const objArg = args.find(
            (a) => a.getKind() === SyntaxKind.ObjectLiteralExpression,
          );
          if (objArg) {
            actualObj = objArg.asKind(SyntaxKind.ObjectLiteralExpression);
          }
        }
      }
      if (!actualObj) continue;
      // Must look like an ingredient card (has a `name` property)
      if (!actualObj.getProperty("name")) continue;

      const slug = pa.getName().replace(/^["'`]|["'`]$/g, "");
      const props = propMap(actualObj);
      stats.totalIngredients++;

      const defaults = def(category, slug);

      // 1. description
      if (!hasDescription(props)) {
        const summary = summaries[slug];
        const descText = summary
          ? summaryToDescription(summary)
          : defaults.description;
        actualObj.insertPropertyAssignment(0, {
          name: "description",
          initializer: `"${descText}"`,
        });
        stats.fieldsAdded.description =
          (stats.fieldsAdded.description || 0) + 1;
        modified = true;
      }

      // 2. qualities (only add if missing; do not overwrite if <3 — leave author choice)
      if (!hasQualities(props)) {
        actualObj.addPropertyAssignment({
          name: "qualities",
          initializer: defaults.qualities,
        });
        stats.fieldsAdded.qualities = (stats.fieldsAdded.qualities || 0) + 1;
        modified = true;
      }

      // 3. astrologicalProfile with rulingPlanets
      if (!hasAstrology(props)) {
        actualObj.addPropertyAssignment({
          name: "astrologicalProfile",
          initializer: `{ rulingPlanets: ["Sun", "Moon"], favorableZodiac: ["cancer", "taurus"] }`,
        });
        stats.fieldsAdded.astrology = (stats.fieldsAdded.astrology || 0) + 1;
        modified = true;
      }

      // 4. sensoryProfile
      if (!props.has("sensoryProfile")) {
        actualObj.addPropertyAssignment({
          name: "sensoryProfile",
          initializer: defaults.sensoryProfile,
        });
        stats.fieldsAdded.sensory = (stats.fieldsAdded.sensory || 0) + 1;
        modified = true;
      }

      // 5. nutritionalProfile - only add whole thing if nutrition calories+macros missing
      // (easier than injecting into existing partial profile)
      if (
        !hasCaloriesMacros(props) &&
        !hasVitaminsMinerals(props) &&
        !props.has("nutritionalProfile")
      ) {
        actualObj.addPropertyAssignment({
          name: "nutritionalProfile",
          initializer: defaults.nutritionalProfile,
        });
        stats.fieldsAdded.nutrition = (stats.fieldsAdded.nutrition || 0) + 1;
        modified = true;
      } else {
        // If nutritionalProfile exists but is incomplete, inject missing keys
        const np = actualObj
          .getProperty("nutritionalProfile")
          ?.asKind(SyntaxKind.PropertyAssignment)
          ?.getInitializer()
          ?.asKind(SyntaxKind.ObjectLiteralExpression);
        if (np) {
          if (!np.getProperty("calories")) {
            np.addPropertyAssignment({
              name: "calories",
              initializer: "100",
            });
            modified = true;
          }
          if (!np.getProperty("macros")) {
            np.addPropertyAssignment({
              name: "macros",
              initializer: `{ protein: 1, carbs: 10, fat: 1, fiber: 1 }`,
            });
            stats.fieldsAdded.macros = (stats.fieldsAdded.macros || 0) + 1;
            modified = true;
          }
          if (!np.getProperty("vitamins")) {
            np.addPropertyAssignment({
              name: "vitamins",
              initializer: "{}",
            });
            modified = true;
          }
          if (!np.getProperty("minerals")) {
            np.addPropertyAssignment({
              name: "minerals",
              initializer: "{}",
            });
            stats.fieldsAdded.micros = (stats.fieldsAdded.micros || 0) + 1;
            modified = true;
          }
        }
      }

      // 6. culinaryProfile with cookingMethods
      if (!hasCookingMethods(props)) {
        if (!props.has("culinaryProfile")) {
          actualObj.addPropertyAssignment({
            name: "culinaryProfile",
            initializer: defaults.culinaryProfile,
          });
        } else {
          const cp = actualObj
            .getProperty("culinaryProfile")
            ?.asKind(SyntaxKind.PropertyAssignment)
            ?.getInitializer()
            ?.asKind(SyntaxKind.ObjectLiteralExpression);
          if (cp && !cp.getProperty("cookingMethods")) {
            cp.addPropertyAssignment({
              name: "cookingMethods",
              initializer: `["saute", "roast", "mix"]`,
            });
          }
        }
        stats.fieldsAdded.culinary = (stats.fieldsAdded.culinary || 0) + 1;
        modified = true;
      }

      // 7. pairingRecommendations with complementary
      if (!hasComplementary(props)) {
        if (!props.has("pairingRecommendations")) {
          actualObj.addPropertyAssignment({
            name: "pairingRecommendations",
            initializer: defaults.pairingRecommendations,
          });
        } else {
          const pr = actualObj
            .getProperty("pairingRecommendations")
            ?.asKind(SyntaxKind.PropertyAssignment)
            ?.getInitializer()
            ?.asKind(SyntaxKind.ObjectLiteralExpression);
          if (pr && !pr.getProperty("complementary")) {
            pr.addPropertyAssignment({
              name: "complementary",
              initializer: `["salt", "acid", "herbs"]`,
            });
          }
        }
        stats.fieldsAdded.pairings = (stats.fieldsAdded.pairings || 0) + 1;
        modified = true;
      }

      // 8. storage
      if (!props.has("storage")) {
        actualObj.addPropertyAssignment({
          name: "storage",
          initializer: defaults.storage,
        });
        stats.fieldsAdded.storage = (stats.fieldsAdded.storage || 0) + 1;
        modified = true;
      }
    }
  }

  if (modified) {
    sf.saveSync();
    stats.filesModified++;
  } else {
    project.removeSourceFile(sf);
  }
  return modified;
}

// ──────────────────────────────────────────────────────────────────
// Run
// ──────────────────────────────────────────────────────────────────

const summaries = loadSummaries();
console.log(`Loaded ${Object.keys(summaries).length} summaries.`);

const project = new Project({
  skipAddingFilesFromTsConfig: true,
  compilerOptions: { noEmit: true, skipLibCheck: true, target: 99 },
});

const stats: EnrichStats = {
  totalIngredients: 0,
  fieldsAdded: {},
  filesModified: 0,
};

const files: string[] = [];
function walk(dir: string) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p);
    else if (
      entry.name.endsWith(".ts") &&
      ![
        "index.ts",
        "types.ts",
        "ingredients.ts",
        "ingredientSummaries.ts",
        "flavorProfiles.ts",
        "elementalProperties.ts",
      ].includes(entry.name)
    ) {
      files.push(p);
    }
  }
}
walk(INGREDIENTS_DIR);

for (const file of files) {
  try {
    enrichFile(file, summaries, project, stats);
  } catch (err) {
    console.error(`Failed: ${file}`, err);
  }
}

console.log(
  `\nEnriched: ${stats.filesModified}/${files.length} files, ${stats.totalIngredients} ingredients inspected.`,
);
console.log("Fields added:", stats.fieldsAdded);
