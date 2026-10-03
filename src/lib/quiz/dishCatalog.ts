import type { CuisineFamily, QuizDish } from "./catalogContract";
import { computeFeatures, readDishText, type DishText, type RecipeSource } from "./dishFeatures";
import { groupsNamedBy, ingredientGroup, normalizeText } from "./dishLexicon";
import { allergensNamedBy, dietsOf } from "./dishSafety";

/**
 * Builds the quiz catalog from the static recipe catalog: keeps only dishes a
 * person would eat as a meal or dessert, and computes every feature.
 */

const FAMILY_BY_CUISINE: Readonly<Record<string, CuisineFamily>> = {
  chinese: "east-asian",
  japanese: "east-asian",
  korean: "east-asian",
  thai: "southeast-asian",
  vietnamese: "southeast-asian",
  indian: "south-asian",
  "middle eastern": "middle-eastern",
  "middle-eastern": "middle-eastern",
  greek: "mediterranean",
  italian: "mediterranean",
  french: "mediterranean",
  russian: "eastern-european",
  mexican: "latin-american",
  american: "american",
  african: "african",
  hsca: "holistic",
  fusion: "fusion",
};

/** A name ending in one of these is a drink, not a dish. */
const BEVERAGE_END =
  /\b(juice|tea|elixir|smoothie|latte|cooler|lemonade|agua fresca|drink|cocktail|brew|tonic|cleanse|milk|lassi|horchata|kombucha|chai|coffee|cider|punch|soda|shake|water|kvass)$/;
/** A name ending in one of these, with no protein or base, is a component. */
const COMPONENT_END =
  /\b(vinaigrette|dressing|sauce|syrup|stock|broth|marinade|seasoning|spice mix|spice blend|glaze|frosting|icing|dough|crust|paste|butter|oil|ghee|chutney|salsa|dip|relish|jam|compote|gravy|brine|rub|cream|pesto|aioli|mayonnaise|vinegar|base|filling|topping|sprinkles|croutons|pickles?|medallions|cheese|yogurt|ketchup|mustard|spread|crumbs)$/;

function bareName(name: string): string {
  return normalizeText(name)
    .replace(/\([^)]*\)/g, " ")
    .replace(/["“”]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function isMealWorthy(recipe: RecipeSource, groups: readonly string[]): boolean {
  if (recipe.ingredients.length < 3 || recipe.instructions.length === 0) return false;
  if (/\((for|to serve with)\b/i.test(recipe.name)) return false;
  const name = bareName(recipe.name);
  // "Croutons for Vegan Caesar Salad", "Procedure for egg-thickened sauces".
  if (/\bfor\b/.test(name)) return false;
  if (BEVERAGE_END.test(name)) return false;
  const substantial = groups.some((id) => {
    const kind = ingredientGroup(id)?.kind;
    return kind === "protein" || kind === "base";
  });
  return !(COMPONENT_END.test(name) && !substantial);
}

// prettier-ignore
const EMOJI_RULES: ReadonlyArray<{ pattern: RegExp; emoji: string }> = [
  { pattern: /\b(ice cream|gelato|sorbet|paletas?|bingsu|granita)\b/, emoji: "🍨" },
  { pattern: /\b(cake|cheesecake|tiramisu)\b/, emoji: "🍰" },
  { pattern: /\b(pie|tart|cobbler|crumble)\b/, emoji: "🥧" },
  { pattern: /\b(cookies?|biscuits?|brownies?)\b/, emoji: "🍪" },
  { pattern: /\b(pancakes?|waffles?|crepes?|french toast)\b/, emoji: "🥞" },
  { pattern: /\b(pudding|custard|flan|mousse|panna cotta)\b/, emoji: "🍮" },
  { pattern: /\b(tacos?|tostadas?)\b/, emoji: "🌮" },
  { pattern: /\b(burritos?|wraps?|enchiladas?|chimichangas?)\b/, emoji: "🌯" },
  { pattern: /\b(burgers?|sliders?)\b/, emoji: "🍔" },
  { pattern: /\b(pizza|calzone|flatbread)\b/, emoji: "🍕" },
  { pattern: /\b(sandwich|banh mi|toasts?|bruschetta)\b/, emoji: "🥪" },
  { pattern: /\b(dumplings?|gyoza|mandu|jiaozi|pierogi|pelmeni|bao|buns?|empanadas?|samosas?)\b/, emoji: "🥟" },
  { pattern: /\b(sushi|onigiri|maki|nigiri)\b/, emoji: "🍣" },
  { pattern: /\b(ramen|pho|laksa|udon|noodle soup)\b/, emoji: "🍜" },
  { pattern: /\b(curry|korma|masala|vindaloo|dal|dahl)\b/, emoji: "🍛" },
  { pattern: /\b(soup|stew|chowder|bisque|gumbo|borscht|hot ?pot|congee|porridge|jjigae|tagine)\b/, emoji: "🍲" },
  { pattern: /\b(salad|slaw|ceviche|poke)\b/, emoji: "🥗" },
  { pattern: /\b(noodles?|pasta|spaghetti|lasagna|linguine|fettuccine|penne|macaroni|gnocchi|risotto)\b/, emoji: "🍝" },
  { pattern: /\b(rice|biryani|pilaf|paella|bibimbap|donburi|fried rice)\b/, emoji: "🍚" },
  { pattern: /\b(eggs?|omelet\w*|frittata|shakshuka|scramble)\b/, emoji: "🍳" },
  { pattern: /\b(bread|loaf|focaccia|naan|rolls?)\b/, emoji: "🥖" },
  { pattern: /\b(kebabs?|skewers?|satay|yakitori|ribs?|steak)\b/, emoji: "🍢" },
];

const EMOJI_BY_GROUP: ReadonlyArray<[string, string]> = [
  ["shellfish", "🦐"],
  ["fish", "🐟"],
  ["chicken", "🍗"],
  ["beef", "🥩"],
  ["pork", "🥓"],
  ["lamb", "🍖"],
  ["tofu", "🥢"],
  ["beans", "🫘"],
];

export function emojiFor(name: string, groups: readonly string[], dessert: boolean): string {
  // The full name, parentheses included: "Jianbing (Chinese Crepe)" is a crepe.
  const full = normalizeText(name);
  const rule = EMOJI_RULES.find(({ pattern }) => pattern.test(full));
  if (rule) return rule.emoji;
  if (dessert) return "🍮";
  return EMOJI_BY_GROUP.find(([group]) => groups.includes(group))?.[1] ?? "🍽️";
}

function blurbOf(description: string | undefined): string {
  const first = (description ?? "").split(/(?<=[.!?])\s/)[0]?.trim() ?? "";
  return first.length > 160 ? `${first.slice(0, 157).trimEnd()}…` : first;
}

const STOPWORDS = new Set([
  "fresh", "chopped", "ground", "large", "small", "medium", "sliced", "minced", "diced",
  "cups", "whole", "dried", "finely", "grated", "peeled", "cooked", "optional", "about",
  "taste", "pieces", "plus", "more", "with", "into", "thinly", "roughly", "leaves",
]);

function ingredientTokens(text: DishText): Set<string> {
  const tokens = new Set<string>();
  for (const name of text.ingredients) {
    for (const token of name.split(/[^a-z]+/)) {
      if (token.length >= 4 && !STOPWORDS.has(token)) tokens.add(token);
    }
  }
  return tokens;
}

/**
 * `adventure`: how unusual a dish's ingredients are WITHIN this catalog. For
 * each ingredient token, idf = ln(N / documents containing it); a dish scores
 * the mean of its three rarest tokens, then the score becomes its percentile
 * rank among all dishes, so 0.9 means rarer ingredients than 90% of dishes.
 */
export function adventureScores(tokenSets: ReadonlyArray<ReadonlySet<string>>): number[] {
  const documents = new Map<string, number>();
  for (const tokens of tokenSets) {
    for (const token of tokens) documents.set(token, (documents.get(token) ?? 0) + 1);
  }
  const total = tokenSets.length;
  const raw = tokenSets.map((tokens) => {
    const idfs = [...tokens]
      .map((token) => Math.log(total / (documents.get(token) ?? 1)))
      .sort((a, b) => b - a)
      .slice(0, 3);
    return idfs.length ? idfs.reduce((sum, value) => sum + value, 0) / idfs.length : 0;
  });
  const sorted = [...raw].sort((a, b) => a - b);
  return raw.map((value) => (total > 1 ? sorted.indexOf(value) / (total - 1) : 0.5));
}

export function buildQuizCatalog(recipes: readonly RecipeSource[]): QuizDish[] {
  const seen = new Set<string>();
  const rows: Array<{ dish: QuizDish; tokens: Set<string> }> = [];
  for (const recipe of recipes) {
    if (seen.has(recipe.id)) continue;
    const names = recipe.ingredients.map((item) => item.name);
    const groups = groupsNamedBy(names);
    if (!isMealWorthy(recipe, groups)) continue;
    seen.add(recipe.id);
    const text = readDishText(recipe);
    rows.push({ dish: assembleDish(recipe, text, groups), tokens: ingredientTokens(text) });
  }
  const adventure = adventureScores(rows.map(({ tokens }) => tokens));
  return rows.map(({ dish }, index) => ({
    ...dish,
    features: { ...dish.features, adventure: adventure[index] ?? 0.5 },
  }));
}

function assembleDish(recipe: RecipeSource, text: DishText, groups: string[]): QuizDish {
  const cuisine = normalizeText(recipe.cuisine ?? "");
  const names = recipe.ingredients.map((item) => item.name);
  const seasons = typeof recipe.season === "string" ? [recipe.season] : [...(recipe.season ?? [])];
  return {
    id: recipe.id,
    name: recipe.name.trim(),
    cuisine,
    family: FAMILY_BY_CUISINE[cuisine] ?? "fusion",
    emoji: emojiFor(recipe.name, groups, text.courses.includes("dessert")),
    blurb: blurbOf(recipe.description),
    courses: text.courses,
    seasons,
    minutes: text.minutes,
    servings: recipe.numberOfServings ?? null,
    diets: dietsOf(names),
    allergens: allergensNamedBy(names),
    groups,
    features: computeFeatures(recipe, text),
  };
}
