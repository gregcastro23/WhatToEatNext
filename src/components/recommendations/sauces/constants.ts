/**
 * Shared option catalogs and global presets for the Sauce Pairing Studio.
 *
 * @file src/components/recommendations/sauces/constants.ts
 */
import type {
  CuisineSauceContext,
  FlavorAxis,
  SauceRole,
} from "@/utils/cuisine/cuisineSauceProfiler";

export interface OptionItem {
  key: string;
  label: string;
}

export const PROTEINS: readonly OptionItem[] = [
  { key: "beef", label: "Beef / Steak" },
  { key: "pork", label: "Pork" },
  { key: "chicken", label: "Poultry / Chicken" },
  { key: "lamb", label: "Lamb / Goat" },
  { key: "fish", label: "White / Fin Fish" },
  { key: "seafood", label: "Shellfish / Seafood" },
  { key: "eggs", label: "Eggs" },
  { key: "game", label: "Game / Venison" },
  { key: "tofu", label: "Tofu / Tempeh" },
  { key: "vegetarian", label: "Legumes / Paneer / Plant" },
];

export const VEGETABLES: readonly OptionItem[] = [
  { key: "leafy", label: "Leafy Greens (Spinach, Kale)" },
  { key: "root", label: "Root Vegetables (Carrot, Potato)" },
  { key: "nightshades", label: "Nightshades (Tomato, Eggplant, Pepper)" },
  { key: "cruciferous", label: "Cruciferous & Asparagus" },
  { key: "squash", label: "Squash / Gourds / Okra" },
  { key: "mushroom", label: "Wild Mushrooms / Fungi" },
  { key: "legumes", label: "Beans / Corn / Grain" },
  { key: "alliums", label: "Alliums & Fresh Aromatics" },
  { key: "fermented", label: "Fermented / Pickled" },
  { key: "seaweed", label: "Seaweed / Marine Flora" },
];

export const COOKING_METHODS: readonly OptionItem[] = [
  { key: "grilling", label: "Grilling / Char / Smoking (Fire)" },
  { key: "roasting", label: "Roasting / Tandoor (Fire + Earth)" },
  { key: "sauteing", label: "Stir-Frying / Sautéing (Fire + Air)" },
  { key: "braising", label: "Braising / Stewing (Water + Earth)" },
  { key: "steaming", label: "Steaming / Poaching (Water + Air)" },
  { key: "frying", label: "Pan-Frying / Searing (Fire)" },
  { key: "deep-frying", label: "Deep-Frying (Fire)" },
  { key: "baking", label: "Baking (Earth)" },
  { key: "simmering", label: "Simmering / Curry (Water)" },
  { key: "raw", label: "Raw / Salad / Cured (Air)" },
];

export type SeasonValue = NonNullable<CuisineSauceContext["season"]>;

export const SEASONS: ReadonlyArray<{ key: SeasonValue; label: string }> = [
  { key: "all", label: "All Seasons" },
  { key: "spring", label: "Spring" },
  { key: "summer", label: "Summer" },
  { key: "autumn", label: "Autumn / Fall" },
  { key: "winter", label: "Winter" },
];

export const DIETARY_OPTIONS: ReadonlyArray<{ key: string; label: string; icon: string }> = [
  { key: "vegetarian", label: "Vegetarian", icon: "🌱" },
  { key: "vegan", label: "Vegan", icon: "🌿" },
  { key: "glutenFree", label: "Gluten-Free", icon: "🌾" },
  { key: "dairyFree", label: "Dairy-Free", icon: "🥛" },
  { key: "lowSodium", label: "Low-Sodium", icon: "🧂" },
];

export const FLAVOR_AXES: ReadonlyArray<{ key: FlavorAxis; label: string; tone: string }> = [
  { key: "umami", label: "Umami", tone: "border-rose-500/40 text-rose-200 bg-rose-500/15" },
  { key: "spicy", label: "Spicy", tone: "border-orange-500/40 text-orange-200 bg-orange-500/15" },
  { key: "sweet", label: "Sweet", tone: "border-amber-500/40 text-amber-200 bg-amber-500/15" },
  { key: "sour", label: "Sour", tone: "border-lime-500/40 text-lime-200 bg-lime-500/15" },
  { key: "bitter", label: "Bitter", tone: "border-emerald-500/40 text-emerald-200 bg-emerald-500/15" },
  { key: "salty", label: "Salty", tone: "border-sky-500/40 text-sky-200 bg-sky-500/15" },
];

export const ROLES: ReadonlyArray<{ key: SauceRole; label: string; glyph: string; description: string }> = [
  { key: "complement", label: "Complement", glyph: "☯", description: "Mirror & reinforce native elemental energy" },
  { key: "contrast", label: "Contrast", glyph: "⚡", description: "Cut through rich textures with bright counterpoint" },
  { key: "enhance", label: "Enhance", glyph: "🔥", description: "Amplify dominant aromatic & savory notes" },
  { key: "balance", label: "Balance", glyph: "⚖", description: "Introduce the missing elemental pillars" },
];

export interface SaucePreset {
  title: string;
  subtitle: string;
  cuisine: string;
  protein: string;
  vegetable: string;
  cookingMethod: string;
  role: SauceRole;
  flavors: FlavorAxis[];
}

export const PRESETS: readonly SaucePreset[] = [
  {
    title: "Florentine Bistecca",
    subtitle: "Italian · Beef · Grilling",
    cuisine: "Italian",
    protein: "beef",
    vegetable: "leafy",
    cookingMethod: "grilling",
    role: "contrast",
    flavors: ["sour", "umami"],
  },
  {
    title: "Burgundy Braised Beef",
    subtitle: "French · Beef · Braising",
    cuisine: "French",
    protein: "beef",
    vegetable: "mushroom",
    cookingMethod: "braising",
    role: "enhance",
    flavors: ["umami"],
  },
  {
    title: "Cantonese Steamed Fish",
    subtitle: "Chinese · Fish · Steaming",
    cuisine: "Chinese",
    protein: "fish",
    vegetable: "mushroom",
    cookingMethod: "steaming",
    role: "complement",
    flavors: ["umami", "salty"],
  },
  {
    title: "Oaxacan Braised Carnitas",
    subtitle: "Mexican · Pork · Braising",
    cuisine: "Mexican",
    protein: "pork",
    vegetable: "nightshades",
    cookingMethod: "braising",
    role: "enhance",
    flavors: ["spicy", "umami"],
  },
  {
    title: "Kyoto Forest Harvest",
    subtitle: "Japanese · Tofu · Roasting",
    cuisine: "Japanese",
    protein: "tofu",
    vegetable: "squash",
    cookingMethod: "roasting",
    role: "balance",
    flavors: ["sweet", "umami"],
  },
  {
    title: "Tandoori Lamb & Greens",
    subtitle: "Indian · Lamb · Grilling",
    cuisine: "Indian",
    protein: "lamb",
    vegetable: "leafy",
    cookingMethod: "grilling",
    role: "contrast",
    flavors: ["spicy", "sour"],
  },
];
