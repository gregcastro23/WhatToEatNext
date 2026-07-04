"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  FlaskConical,
  ImageIcon,
  Plus,
  Search,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { useAlchemical } from "@/contexts/AlchemicalContext/hooks";
import type { UnifiedIngredient } from "@/data/unified/unifiedTypes";
import { usePantry } from "@/hooks/usePantry";
import { isBoilerplateCoverageIngredient } from "@/lib/ingredients/coverageQuality";
import { IngredientService } from "@/services/IngredientService";
import type { ElementalProperties } from "@/types/alchemy";
import { normalizeForDisplay } from "@/utils/elemental/normalization";
import { calculateKineticProperties } from "@/utils/kineticCalculations";
import {
  calculateThermodynamicMetrics,
  elementalToAlchemicalApproximation,
  calculateKAlchm,
} from "@/utils/monicaKalchmCalculations";
import { looseIncludes } from "@/utils/searchNormalize";
import { getAssetUrl } from "@/utils/urlUtils";

// Pagination constant - items shown before expansion
const ITEMS_PER_PAGE = 21;

/**
 * Format ingredient name for display
 * - Replaces underscores with spaces
 * - Proper title case capitalization
 */
function formatIngredientName(name: string): string {
  return name
    .replace(/_/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Get current season based on date
 */
function getCurrentSeason(): string {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return "spring";
  if (month >= 5 && month <= 7) return "summer";
  if (month >= 8 && month <= 10) return "autumn";
  return "winter";
}

interface EnhancedIngredientRecommenderProps {
  compact?: boolean;
  initialCategory?: string | null;
  initialSelectedIngredient?: string | null;
  isFullPageVersion?: boolean;
  maxItems?: number;
  onCategoryChange?: (category: string) => void;
  onIngredientSelect?: (ingredient: string) => void;
  onDoubleClickIngredient?: (
    ingredientName: string,
    category?: string,
    elementalProperties?: Record<string, number>,
  ) => void;
}

// Category definitions mapped to ingredient categories
// Note: IDs must match the actual 'category' values in ingredient data (plural forms)
// altIds capture non-standard category values used by individual ingredients in raw data
const CATEGORIES = [
  {
    id: "spices",
    name: "Spices",
    icon: "🌶️",
    altIds: ["spice"],
  },
  {
    id: "herbs",
    name: "Herbs",
    icon: "🌿",
    altIds: ["herb", "culinary_herb", "medicinal_herb", "medicinal herb"],
  },
  {
    id: "proteins",
    name: "Proteins",
    icon: "🥩",
    altIds: [
      "protein",
      "meats",
      "meat",
      "poultry",
      "seafood",
      "legumes",
      "eggs",
      "plant-based",
    ],
  },
  {
    id: "vegetables",
    name: "Vegetables",
    icon: "🥬",
    altIds: [
      "vegetable",
      "leafy_greens",
      "leafy greens",
      "leafy green",
      "root vegetable",
      "root vegetables",
      "nightshade",
      "squash",
      "allium",
      "cruciferous",
    ],
  },
  {
    id: "grains",
    name: "Grains",
    icon: "🌾",
    altIds: ["grain", "pseudo-grain"],
  },
  { id: "dairy", name: "Dairy", icon: "🧀", altIds: ["cheese", "milk"] },
  { id: "fruits", name: "Fruits", icon: "🍎", altIds: ["fruit"] },
  { id: "oils", name: "Oils", icon: "🫒", altIds: ["oil"] },
  { id: "vinegars", name: "Vinegars", icon: "🍶", altIds: ["vinegar"] },
  {
    id: "seasonings",
    name: "Seasonings",
    icon: "🍯",
    altIds: ["seasoning", "condiments", "condiment", "sweeteners", "sweetener"],
  },
  { id: "beverages", name: "Beverages", icon: "🍵", altIds: ["beverage"] },
  {
    id: "misc",
    name: "Miscellaneous",
    icon: "🧂",
    altIds: [
      "desserts",
      "dessert",
      "prepared",
      "nuts",
      "nut",
      "seed",
      "seeds",
      "rhizome",
    ],
  },
];

/**
 * Enhanced compatibility scoring using exponential decay function
 * Creates better differentiation between scores than linear approaches
 *
 * Perfect match (diff=0) → 1.0
 * Small diff (0.1) → ~0.82
 * Medium diff (0.5) → ~0.37
 * Large diff (1.0) → ~0.14
 */
function exponentialCompatibility(
  value1: number,
  value2: number,
  sensitivity = 2.0,
): number {
  const diff = Math.abs(value1 - value2);
  return Math.exp(-sensitivity * diff);
}

/**
 * Normalize seasonality data to a string array
 * Handles multiple data formats: string, string[], object with arrays, or undefined
 */
function normalizeSeasonality(
  seasonality:
    | string
    | string[]
    | { peak?: string[]; available?: string[]; optimal?: string[] }
    | undefined,
): string[] {
  if (!seasonality) return [];

  if (typeof seasonality === "string") {
    // Handle string: "all" or "summer" or "autumn, winter"
    return seasonality.split(",").map((s) => s.trim());
  }

  if (Array.isArray(seasonality)) {
    // Handle array: ["winter", "summer"]
    return seasonality.filter((s) => typeof s === "string");
  }

  if (typeof seasonality === "object") {
    // Handle object: { peak: ["summer"], available: ["spring", "summer"], optimal: [...] }
    const peak = seasonality.peak || [];
    const available = seasonality.available || [];
    const optimal = seasonality.optimal || [];
    return [...peak, ...available, ...optimal].filter(
      (s) => typeof s === "string",
    );
  }

  return [];
}

/**
 * Check if ingredient is in season
 * Handles multiple data formats: string, string[], object with arrays, or undefined
 */
function isIngredientInSeason(
  seasonality:
    | string
    | string[]
    | { peak?: string[]; available?: string[]; optimal?: string[] }
    | undefined,
  currentSeason: string,
): boolean {
  const seasons = normalizeSeasonality(seasonality);

  if (seasons.length === 0) return false;

  const normalizedCurrent = currentSeason.toLowerCase();
  return seasons.some((s) => {
    const normalizedSeason = s.toLowerCase();
    return (
      normalizedSeason === normalizedCurrent ||
      normalizedSeason === "all" ||
      normalizedSeason === "year-round" ||
      (normalizedSeason === "autumn" && normalizedCurrent === "fall") ||
      (normalizedSeason === "fall" && normalizedCurrent === "autumn")
    );
  });
}

/**
 * Score breakdown interface for detailed compatibility info.
 * Each dimension is 0..1 representing how well the ingredient matches the
 * current astrological / sectarian / seasonal moment.
 */
interface ScoreBreakdown {
  elemental: number;
  thermodynamic: number;
  kinetic: number;
  seasonal: number;
  astrological: number;
  lunar: number;
  diurnal: number;
  final: number;
}

interface AstroContext {
  zodiacSign?: string;
  lunarPhase?: string;
  planetaryPositions?: Record<string, unknown>;
  isDaytime?: boolean;
}

/**
 * Score how well the ingredient's astrological profile matches the current
 * zodiac sign and active planetary positions. Combines:
 *   • favorable-zodiac match (binary 1.0 / 0.5 baseline)
 *   • ruling-planet activity (1.0 if any ruler currently has a position; else 0.5)
 *   • sub-element decan affinity bonus when present
 */
function calculateAstrologicalScore(
  astroProfile: any,
  ctx: AstroContext,
): number {
  if (!astroProfile || typeof astroProfile !== "object") return 0.5;

  let zodiacScore = 0.5;
  if (Array.isArray(astroProfile.favorableZodiac) && ctx.zodiacSign) {
    const sign = String(ctx.zodiacSign).toLowerCase();
    const favored = astroProfile.favorableZodiac.map((z: string) =>
      String(z).toLowerCase(),
    );
    if (favored.includes(sign)) zodiacScore = 1.0;
    else zodiacScore = 0.45; // off-favor penalty
  }

  let planetScore = 0.5;
  if (Array.isArray(astroProfile.rulingPlanets)) {
    const positions = ctx.planetaryPositions || {};
    const activeRulers = astroProfile.rulingPlanets.filter(
      (p: string) => positions[p] !== undefined,
    ).length;
    if (astroProfile.rulingPlanets.length > 0) {
      planetScore =
        0.5 + 0.5 * (activeRulers / astroProfile.rulingPlanets.length);
    }
  }

  return zodiacScore * 0.6 + planetScore * 0.4;
}

/**
 * Score how well the current lunar phase aligns with the ingredient's
 * lunarPhaseModifiers. If the current phase has a registered potencyMultiplier,
 * apply it; otherwise return a neutral baseline.
 */
function calculateLunarScore(astroProfile: any, lunarPhase?: string): number {
  if (!astroProfile?.lunarPhaseModifiers || !lunarPhase) return 0.5;
  const phase = String(lunarPhase).toLowerCase().replace(/\s+/g, "_");
  const modifiers = astroProfile.lunarPhaseModifiers;
  // Try several key shapes
  const match =
    modifiers[phase] ||
    modifiers[lunarPhase] ||
    modifiers[String(lunarPhase).toLowerCase()];
  if (!match) return 0.5;
  const potency =
    typeof match.potencyMultiplier === "number"
      ? Math.min(1, Math.max(0, match.potencyMultiplier))
      : undefined;
  if (potency != null) return 0.5 + 0.5 * potency;
  // If a phase entry exists at all, give a moderate bonus.
  return 0.8;
}

/**
 * Score the ingredient against the current sectarian (diurnal/nocturnal) state.
 * Day favors warming, drying, fire-leaning ingredients; night favors cooling,
 * moistening, water-leaning ingredients. Reads:
 *   • kineticsImpact.thermalDirection (numeric, +warm / -cool)
 *   • qualities array (warming / cooling / grounding / drying / moistening)
 */
function calculateDiurnalScore(
  qualities: string[] | undefined,
  kineticsImpact: any,
  isDaytime: boolean | undefined,
): number {
  if (isDaytime == null) return 0.5;

  let thermalScore = 0.5;
  if (kineticsImpact && typeof kineticsImpact.thermalDirection === "number") {
    const dir = kineticsImpact.thermalDirection;
    // Map: dir > 0 (warming) ⇒ aligns with day; dir < 0 (cooling) ⇒ aligns with night
    if (isDaytime) {
      thermalScore = dir >= 0 ? 0.5 + Math.min(0.5, dir * 2) : 0.5 + dir; // dir<0 reduces score
    } else {
      thermalScore = dir <= 0 ? 0.5 + Math.min(0.5, -dir * 2) : 0.5 - dir;
    }
    thermalScore = Math.max(0, Math.min(1, thermalScore));
  }

  let qualityScore = 0.5;
  if (Array.isArray(qualities) && qualities.length > 0) {
    const tags = qualities.map((q) => String(q).toLowerCase());
    const warming = tags.some((q) => /warm|hot|pungent|drying/.test(q));
    const cooling = tags.some((q) => /cool|cold|moisten|hydrating/.test(q));
    if (isDaytime) {
      if (warming && !cooling) qualityScore = 1.0;
      else if (cooling && !warming) qualityScore = 0.4;
      else qualityScore = 0.7; // mixed or grounding ⇒ slight bonus
    } else {
      if (cooling && !warming) qualityScore = 1.0;
      else if (warming && !cooling) qualityScore = 0.4;
      else qualityScore = 0.7;
    }
  }

  return thermalScore * 0.55 + qualityScore * 0.45;
}

/**
 * Calculate enhanced compatibility score using thermodynamic properties
 * This creates much more varied and meaningful match percentages
 */
function calculateCompatibilityScore(
  ingredientElementals: ElementalProperties,
  currentElementals: ElementalProperties,
  seasonality?:
    | string
    | string[]
    | { peak?: string[]; available?: string[]; optimal?: string[] },
  ingredientAlchemicalProps?: {
    Spirit: number;
    Essence: number;
    Matter: number;
    Substance: number;
  } | null,
  ingredientExtras?: {
    astrologicalProfile?: any;
    qualities?: string[];
    kineticsImpact?: any;
  },
  astroCtx?: AstroContext,
): { score: number; breakdown: ScoreBreakdown } {
  // Calculate elemental compatibility using exponential decay for better spread
  const fireCompat = exponentialCompatibility(
    ingredientElementals.Fire || 0,
    currentElementals.Fire || 0,
    2.5,
  );
  const waterCompat = exponentialCompatibility(
    ingredientElementals.Water || 0,
    currentElementals.Water || 0,
    2.5,
  );
  const earthCompat = exponentialCompatibility(
    ingredientElementals.Earth || 0,
    currentElementals.Earth || 0,
    2.5,
  );
  const airCompat = exponentialCompatibility(
    ingredientElementals.Air || 0,
    currentElementals.Air || 0,
    2.5,
  );

  const elementalScore =
    (fireCompat + waterCompat + earthCompat + airCompat) / 4;

  // Use ingredient's own alchemical properties if available (more accurate),
  // otherwise fall back to elemental approximation
  const ingredientAlchemical = ingredientAlchemicalProps?.Spirit
    ? ingredientAlchemicalProps
    : elementalToAlchemicalApproximation(ingredientElementals);
  const currentAlchemical =
    elementalToAlchemicalApproximation(currentElementals);

  const ingredientThermo = calculateThermodynamicMetrics(
    ingredientAlchemical,
    ingredientElementals,
  );
  const currentThermo = calculateThermodynamicMetrics(
    currentAlchemical,
    currentElementals,
  );

  // Thermodynamic compatibility (heat, entropy, reactivity)
  const heatCompat = exponentialCompatibility(
    ingredientThermo.heat,
    currentThermo.heat,
    3.0,
  );
  const entropyCompat = exponentialCompatibility(
    ingredientThermo.entropy,
    currentThermo.entropy,
    2.5,
  );
  const reactivityCompat = exponentialCompatibility(
    ingredientThermo.reactivity,
    currentThermo.reactivity,
    2.0,
  );

  // Kalchm ratio compatibility (logarithmic scale for better handling of large differences)
  const kalchmMin = Math.min(ingredientThermo.kalchm, currentThermo.kalchm);
  const kalchmMax = Math.max(ingredientThermo.kalchm, currentThermo.kalchm);
  const kalchmRatio = kalchmMax > 0 ? kalchmMin / kalchmMax : 0.5;

  // Monica compatibility
  const monicaCompat = exponentialCompatibility(
    ingredientThermo.monica,
    currentThermo.monica,
    1.5,
  );

  // Calculate kinetic properties for deeper differentiation
  const ingredientKinetics = calculateKineticProperties(
    ingredientAlchemical,
    ingredientElementals,
    ingredientThermo,
  );
  const currentKinetics = calculateKineticProperties(
    currentAlchemical,
    currentElementals,
    currentThermo,
  );

  // Kinetic compatibility (power matching)
  const powerCompat = exponentialCompatibility(
    ingredientKinetics.power,
    currentKinetics.power,
    2.0,
  );
  const forceCompat = exponentialCompatibility(
    ingredientKinetics.forceMagnitude,
    currentKinetics.forceMagnitude,
    1.0,
  );

  // Weighted composite score
  const thermoScore =
    heatCompat * 0.25 +
    entropyCompat * 0.2 +
    reactivityCompat * 0.2 +
    kalchmRatio * 0.15 +
    monicaCompat * 0.2;

  const kineticScore = powerCompat * 0.6 + forceCompat * 0.4;

  // Astrological / lunar / sectarian dimensions — leverage all of the
  // ingredient's metadata against the current astrological moment.
  const astrologicalScore = calculateAstrologicalScore(
    ingredientExtras?.astrologicalProfile,
    astroCtx || {},
  );
  const lunarScore = calculateLunarScore(
    ingredientExtras?.astrologicalProfile,
    astroCtx?.lunarPhase,
  );
  const diurnalScore = calculateDiurnalScore(
    ingredientExtras?.qualities,
    ingredientExtras?.kineticsImpact,
    astroCtx?.isDaytime,
  );

  // Final score: blend the alchemical/thermodynamic core with astrological
  // alignment. Geometric mean penalizes imbalance; weighted mean rewards
  // partial matches. We blend the two for a stable distribution.
  const geometricMean = Math.pow(
    Math.max(elementalScore, 0.05) *
      Math.max(thermoScore, 0.05) *
      Math.max(kineticScore, 0.05),
    1 / 3,
  );

  const weightedScore =
    elementalScore * 0.22 +
    thermoScore * 0.22 +
    kineticScore * 0.13 +
    astrologicalScore * 0.18 +
    lunarScore * 0.1 +
    diurnalScore * 0.15;

  let finalScore = geometricMean * 0.4 + weightedScore * 0.6;

  // Seasonal boost — ingredients currently in season get a multiplicative bump.
  const currentSeason = getCurrentSeason();
  const inSeason = isIngredientInSeason(seasonality, currentSeason);
  const seasonalScore = inSeason ? 1.0 : 0.5;
  if (inSeason) {
    finalScore = Math.min(1.0, finalScore * 1.05);
  }

  // Power function expands range for more visible differentiation.
  const adjustedScore = Math.pow(finalScore, 0.85);

  return {
    score: adjustedScore,
    breakdown: {
      elemental: elementalScore,
      thermodynamic: thermoScore,
      kinetic: kineticScore,
      seasonal: seasonalScore,
      astrological: astrologicalScore,
      lunar: lunarScore,
      diurnal: diurnalScore,
      final: adjustedScore,
    },
  };
}

// Helper: Get dominant element
function getDominantElement(elementals: ElementalProperties): string {
  const entries = Object.entries(elementals) as Array<
    [keyof ElementalProperties, number]
  >;
  const sorted = entries.sort((a, b) => b[1] - a[1]);
  return (sorted[0]?.[0] as string) || "Unknown";
}

// Taste profile display configuration
const TASTE_CONFIG: Record<string, { emoji: string; color: string }> = {
  sweet: {
    emoji: "🍬",
    color:
      "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-700/50",
  },
  salty: {
    emoji: "🧂",
    color:
      "bg-sky-100 dark:bg-sky-900/40 text-sky-800 dark:text-sky-200 border-sky-200 dark:border-sky-700/50",
  },
  sour: {
    emoji: "🍋",
    color:
      "bg-lime-100 dark:bg-lime-900/40 text-lime-800 dark:text-lime-200 border-lime-200 dark:border-lime-700/50",
  },
  bitter: {
    emoji: "🌿",
    color:
      "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-700/50",
  },
  umami: {
    emoji: "🍄",
    color:
      "bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-700/50",
  },
  spicy: {
    emoji: "🌶️",
    color:
      "bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200 border-red-200 dark:border-red-700/50",
  },
};

// Extract calories + macros from the several different nutritionalProfile shapes used across ingredient files
function extractNutrition(np: any): {
  servingSize?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
} | null {
  if (!np) return null;
  const calories = np.calories ?? np.kcal;
  const macros = np.macros || {};
  const protein = macros.protein ?? np.protein_g ?? np.protein;
  const carbs = macros.carbs ?? np.carbs_g ?? np.carbohydrates;
  const fat = macros.fat ?? np.fat_g ?? np.fat;
  if (calories == null && protein == null) return null;
  return {
    servingSize: np.serving_size,
    calories: calories != null ? Math.round(Number(calories)) : undefined,
    protein: protein != null ? Number(protein) : undefined,
    carbs: carbs != null ? Number(carbs) : undefined,
    fat: fat != null ? Number(fat) : undefined,
  };
}

const ELEMENT_CARD_TONES: Record<
  string,
  { ring: string; chip: string; fallback: string; bar: string }
> = {
  Fire: {
    ring: "border-orange-400/45 shadow-orange-950/30",
    chip: "bg-orange-500/15 text-orange-100 border-orange-300/30",
    fallback: "from-[#27110b] via-[#572012] to-[#d45f24]",
    bar: "from-orange-300 to-red-400",
  },
  Water: {
    ring: "border-cyan-300/45 shadow-cyan-950/30",
    chip: "bg-cyan-500/15 text-cyan-100 border-cyan-300/30",
    fallback: "from-[#081722] via-[#123d52] to-[#39a8d8]",
    bar: "from-cyan-300 to-blue-400",
  },
  Earth: {
    ring: "border-emerald-300/45 shadow-emerald-950/30",
    chip: "bg-emerald-500/15 text-emerald-100 border-emerald-300/30",
    fallback: "from-[#0d1b12] via-[#21452c] to-[#79b85b]",
    bar: "from-emerald-300 to-lime-400",
  },
  Air: {
    ring: "border-violet-300/45 shadow-violet-950/30",
    chip: "bg-violet-500/15 text-violet-100 border-violet-300/30",
    fallback: "from-[#111223] via-[#333660] to-[#b6b9df]",
    bar: "from-violet-300 to-slate-100",
  },
  Unknown: {
    ring: "border-slate-300/30 shadow-black/30",
    chip: "bg-slate-500/15 text-slate-100 border-slate-300/25",
    fallback: "from-[#14141c] via-[#2a2935] to-[#777283]",
    bar: "from-slate-300 to-slate-500",
  },
};

function getIngredientImageUrl(ingredient: UnifiedIngredient): string | null {
  const root = ingredient as unknown as Record<string, unknown>;
  const rawValue = root.image_url || root.imageUrl || root.image;

  if (typeof rawValue === "string" && rawValue.trim().length > 0) {
    return getAssetUrl(rawValue.trim()) ?? null;
  }
  return null;
}

function cleanDescription(description: string): string {
  return description
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/\\n\\n/g, "\n\n")
    .trim();
}

export const EnhancedIngredientRecommender: React.FC<
  EnhancedIngredientRecommenderProps
> = ({
  compact = false,
  initialCategory,
  initialSelectedIngredient,
  isFullPageVersion: _isFullPageVersion = false,
  maxItems,
  onCategoryChange,
  onIngredientSelect,
  onDoubleClickIngredient,
}) => {
  // State
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    initialCategory || null,
  );
  const [selectedIngredient, setSelectedIngredient] = useState<string | null>(
    initialSelectedIngredient || null,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [ingredients, setIngredients] = useState<UnifiedIngredient[]>([]);
  const [loading, setLoading] = useState(true);
  // Track which categories are expanded to show all items
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(),
  );

  // Hooks
  const alchemicalContext = useAlchemical();
  const ingredientService = useMemo(() => IngredientService.getInstance(), []);
  const pantry = usePantry();
  const [pantryFeedback, setPantryFeedback] = useState<string | null>(null);

  const handleAddToPantry = (
    name: string,
    category: string | undefined,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();
    const normalizedName = formatIngredientName(name);
    if (pantry.hasItem(name)) {
      setPantryFeedback(`${normalizedName} is already in your pantry`);
    } else {
      const added = pantry.addItem({
        name,
        category: category || "other",
        quantity: 1,
        unit: "item",
      });
      setPantryFeedback(
        added
          ? `✓ Added ${normalizedName} to pantry`
          : "Could not add to pantry",
      );
    }
    setTimeout(() => setPantryFeedback(null), 2200);
  };

  // Load ingredients
  useEffect(() => {
    setLoading(true);
    try {
      // Auto-generated recipe-coverage entries (boilerplate copy + placeholder
      // nutrition) exist for recipe mapping only — keep them off this browse grid.
      const allIngredients = ingredientService
        .getAllIngredientsFlat()
        .filter((ing) => !isBoilerplateCoverageIngredient(ing));
      setIngredients(allIngredients);
    } catch (error) {
      console.error("Error loading ingredients:", error);
    } finally {
      setLoading(false);
    }
  }, [ingredientService]);

  // Get current elemental properties from alchemical context
  const currentElementals: ElementalProperties = useMemo(() => {
    if (alchemicalContext?.state?.elementalState) {
      return alchemicalContext.state.elementalState;
    }
    // Default balanced elementals
    return { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
  }, [alchemicalContext]);

  // Filter and score ingredients
  const scoredIngredients = useMemo(() => {
    let filtered = ingredients;

    // Filter by category (case-insensitive to handle data inconsistencies)
    if (selectedCategory) {
      const category = CATEGORIES.find((c) => c.id === selectedCategory);
      const allowedCategories = category
        ? [category.id, ...category.altIds].map((c) => c.toLowerCase())
        : [selectedCategory.toLowerCase()];

      filtered = filtered.filter((ing) =>
        allowedCategories.includes((ing.category || "").toLowerCase()),
      );
    }

    // Filter by search query — covers culinary fields so "tomato dishes",
    // "bloom", "pesto", "complementary" etc. surface the right ingredients.
    // Uses the shared separator-tolerant matcher so "tomato_paste", "tomato
    // paste", and "tomato-paste" all hit the same items.
    if (searchQuery) {
      const matches = (value: unknown): boolean =>
        looseIncludes(
          typeof value === "string" ? value : String(value),
          searchQuery,
        );
      const anyMatches = (values: unknown): boolean =>
        Array.isArray(values) && values.some(matches);

      filtered = filtered.filter((ing) => {
        const root = ing as unknown as Record<string, unknown>;
        if (matches(ing.name)) return true;
        if (ing.description && matches(ing.description)) return true;
        if (anyMatches(ing.qualities)) return true;
        if (anyMatches(ing.origin)) return true;

        const apps = root.culinaryApplications as
          | Record<string, unknown>
          | undefined;
        if (anyMatches(apps?.commonUses)) return true;

        const profile = root.culinaryProfile as
          | Record<string, unknown>
          | undefined;
        if (anyMatches(profile?.cookingMethods)) return true;
        if (anyMatches(profile?.cuisineAffinity)) return true;
        if (anyMatches(profile?.preparationTips)) return true;

        if (anyMatches(root.cookingMethods)) return true;

        const pr = root.pairingRecommendations;
        if (anyMatches(pr)) return true;
        if (pr && typeof pr === "object" && !Array.isArray(pr)) {
          const prObj = pr as Record<string, unknown>;
          for (const key of [
            "complementary",
            "contrasting",
            "toAvoid",
          ] as const) {
            if (anyMatches(prObj[key])) return true;
          }
        }

        if (anyMatches(root.affinities)) return true;
        if (
          typeof root.flavorProfile === "string" &&
          matches(root.flavorProfile)
        )
          return true;

        return false;
      });
    }

    // Build the astrological context once per render — every ingredient is
    // scored against the same current moment.
    const astroCtx: AstroContext = {
      zodiacSign: alchemicalContext?.zodiacSign,
      lunarPhase: alchemicalContext?.lunarPhase,
      planetaryPositions: alchemicalContext?.planetaryPositions,
      isDaytime: alchemicalContext?.isDaytime,
    };

    // Calculate scores and sort
    return filtered
      .map((ing) => {
        // Use seasonality or fall back to season field (some data uses one or the other)
        const seasonData = ing.seasonality || (ing as any).season;

        const result = ing.elementalProperties
          ? calculateCompatibilityScore(
              ing.elementalProperties,
              currentElementals,
              seasonData,
              ing.alchemicalProperties,
              {
                astrologicalProfile: (ing as any).astrologicalProfile,
                qualities: ing.qualities,
                kineticsImpact: (ing as any).kineticsImpact,
              },
              astroCtx,
            )
          : {
              score: 0.5,
              breakdown: {
                elemental: 0.5,
                thermodynamic: 0.5,
                kinetic: 0.5,
                seasonal: 0.5,
                astrological: 0.5,
                lunar: 0.5,
                diurnal: 0.5,
                final: 0.5,
              },
            };

        return {
          ...ing,
          compatibilityScore: result.score,
          scoreBreakdown: result.breakdown,
          dominantElement: ing.elementalProperties
            ? getDominantElement(ing.elementalProperties)
            : "Unknown",
          isInSeason: isIngredientInSeason(seasonData, getCurrentSeason()),
        };
      })
      .sort((a, b) => b.compatibilityScore - a.compatibilityScore);
  }, [
    ingredients,
    selectedCategory,
    searchQuery,
    currentElementals,
    alchemicalContext?.zodiacSign,
    alchemicalContext?.lunarPhase,
    alchemicalContext?.planetaryPositions,
    alchemicalContext?.isDaytime,
  ]);

  // Handlers
  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedIngredient(null);
    // Reset expanded state for this category when selecting
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      next.delete(categoryId);
      return next;
    });
    onCategoryChange?.(categoryId);
  };

  const handleClearCategory = () => {
    setSelectedCategory(null);
    setSelectedIngredient(null);
  };

  const handleClearFilters = () => {
    setSelectedCategory(null);
    setSelectedIngredient(null);
    setSearchQuery("");
  };

  const handleIngredientSelect = (ingredientName: string) => {
    setSelectedIngredient(
      selectedIngredient === ingredientName ? null : ingredientName,
    );
    onIngredientSelect?.(ingredientName);
  };

  const handleToggleExpand = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  // Determine if current category is expanded
  // Also track "all ingredients" expansion state with special key
  const ALL_INGREDIENTS_KEY = "__all__";
  const currentCategoryExpanded = selectedCategory
    ? expandedCategories.has(selectedCategory)
    : expandedCategories.has(ALL_INGREDIENTS_KEY);

  const pageSize = maxItems ?? ITEMS_PER_PAGE;

  // Get paginated ingredients for display
  const displayedIngredients = useMemo(() => {
    // When searching, show all matches
    if (searchQuery) {
      return scoredIngredients;
    }

    // When expanded (either a category or "all"), show all
    if (currentCategoryExpanded) {
      return scoredIngredients;
    }

    // Default: limit to ITEMS_PER_PAGE (top 21 highest-scoring)
    return scoredIngredients.slice(0, pageSize);
  }, [scoredIngredients, currentCategoryExpanded, pageSize, searchQuery]);

  // Count of remaining items not shown (works for both category and "all" views)
  const remainingCount =
    !currentCategoryExpanded && !searchQuery
      ? Math.max(0, scoredIngredients.length - pageSize)
      : 0;
  const selectedCategoryName = selectedCategory
    ? CATEGORIES.find((c) => c.id === selectedCategory)?.name
    : null;
  const compactResultLabel = searchQuery
    ? `Showing ${displayedIngredients.length} search match${
        displayedIngredients.length !== 1 ? "es" : ""
      }${selectedCategoryName ? ` in ${selectedCategoryName}` : ""}`
    : selectedCategoryName
      ? `Best ${selectedCategoryName.toLowerCase()} right now`
      : "Best matches right now";

  // Render category grid
  const renderCategoryGrid = () => (
    <div className="mb-6">
      <div className="mb-3 flex items-center justify-between gap-2 flex-wrap">
        <h3 className="text-lg font-semibold text-slate-100">
          Browse by Category
        </h3>
        <Link
          href="/ingredients"
          className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300/30 bg-amber-500/15 px-3 py-1.5 text-sm font-semibold text-amber-100 shadow-sm transition hover:bg-amber-500/25"
        >
          <FlaskConical className="h-4 w-4" aria-hidden="true" />
          Explore Full Pantry
          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {CATEGORIES.map((category) => (
          <button
            key={category.id}
            onClick={() => handleCategorySelect(category.id)}
            className={`rounded-lg border p-4 transition-all ${
              selectedCategory === category.id
                ? "border-amber-300/45 bg-amber-500/15 shadow-md shadow-amber-950/20"
                : "border-white/10 bg-white/[0.04] hover:border-white/25 hover:bg-white/[0.07]"
            }`}
          >
            <div className="mb-2 text-3xl">{category.icon}</div>
            <div className="text-sm font-medium text-slate-100">
              {category.name}
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  // Render search bar
  const renderSearchBar = () => (
    <div className="relative mb-6">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search ingredients..."
        className="w-full rounded-lg border border-white/10 bg-black/25 px-10 py-2.5 text-white placeholder-slate-500 outline-none transition focus:border-amber-300/40 focus:ring-2 focus:ring-amber-300/20"
      />
    </div>
  );

  const renderCompactCategorySelector = () => (
    <div className="mb-4">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div className="t-mono text-[10px] uppercase tracking-[0.14em] text-slate-400">
          Ingredient categories
        </div>
        {selectedCategoryName && (
          <button
            type="button"
            onClick={handleClearCategory}
            className="text-xs font-semibold text-amber-200 transition-colors hover:text-amber-100"
          >
            Clear filter
          </button>
        )}
      </div>

      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        <button
          type="button"
          aria-pressed={!selectedCategory}
          onClick={handleClearCategory}
          className={`shrink-0 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${
            !selectedCategory
              ? "border-amber-300/45 bg-amber-500/15 text-amber-100"
              : "border-white/10 bg-white/[0.04] text-slate-300 hover:border-white/25 hover:bg-white/[0.07]"
          }`}
        >
          All
        </button>

        {CATEGORIES.map((category) => (
          <button
            key={category.id}
            type="button"
            aria-pressed={selectedCategory === category.id}
            onClick={() => handleCategorySelect(category.id)}
            className={`inline-flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${
              selectedCategory === category.id
                ? "border-amber-300/45 bg-amber-500/15 text-amber-100"
                : "border-white/10 bg-white/[0.04] text-slate-300 hover:border-white/25 hover:bg-white/[0.07]"
            }`}
          >
            <span aria-hidden="true">{category.icon}</span>
            <span>{category.name}</span>
          </button>
        ))}
      </div>
    </div>
  );

  // Render elemental properties
  const renderElementalProperties = (elementals: ElementalProperties) => {
    const elements = [
      { name: "Fire", icon: "🔥", colorClass: "bg-red-500" },
      { name: "Water", icon: "💧", colorClass: "bg-blue-500" },
      { name: "Earth", icon: "🌍", colorClass: "bg-green-500" },
      { name: "Air", icon: "💨", colorClass: "bg-sky-500" },
    ] as const;

    // Normalize raw elemental values for display
    const normalized = normalizeForDisplay(elementals);

    return (
      <div className="space-y-2">
        {elements.map(({ name, icon, colorClass }) => {
          const value = normalized[name] || 0;
          const percentage = Math.round(value * 100);

          return (
            <div key={name} className="flex items-center gap-2">
              <span className="text-lg">{icon}</span>
              <span className="w-16 text-sm font-medium text-gray-700 dark:text-slate-200">
                {name}
              </span>
              <div className="flex-1">
                <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-slate-700">
                  <div
                    className={`h-2 rounded-full ${colorClass}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
              <span className="w-12 text-right text-sm text-gray-600 dark:text-slate-300">
                {percentage}%
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  // Render score breakdown tooltip
  const renderScoreBreakdown = (breakdown: ScoreBreakdown) => {
    const Row = ({
      label,
      value,
      icon,
    }: {
      label: string;
      value: number;
      icon: string;
    }) => (
      <div className="flex justify-between">
        <span className="text-gray-600 dark:text-slate-300">
          <span aria-hidden="true">{icon}</span> {label}:
        </span>
        <span className="font-medium text-gray-900 dark:text-white">
          {Math.round(value * 100)}%
        </span>
      </div>
    );
    return (
      <div className="mt-2 rounded-md bg-gray-50 dark:bg-slate-900/50 p-3 text-xs border border-gray-100 dark:border-slate-800">
        <div className="mb-1 font-semibold text-gray-700 dark:text-slate-200">
          Score Breakdown
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1">
          <Row label="Elemental" value={breakdown.elemental} icon="🜂" />
          <Row
            label="Thermodynamic"
            value={breakdown.thermodynamic}
            icon="🌡️"
          />
          <Row label="Kinetic" value={breakdown.kinetic} icon="⚡" />
          <Row label="Astrological" value={breakdown.astrological} icon="✨" />
          <Row label="Lunar" value={breakdown.lunar} icon="🌙" />
          <Row label="Diurnal" value={breakdown.diurnal} icon="☀️" />
          <div className="flex justify-between col-span-2">
            <span className="text-gray-600 dark:text-slate-300">
              <span aria-hidden="true">🗓️</span> Seasonal:
            </span>
            <span
              className={`font-medium ${
                breakdown.seasonal === 1.0
                  ? "text-green-600 dark:text-green-300"
                  : "text-gray-900 dark:text-white"
              }`}
            >
              {breakdown.seasonal === 1.0 ? "In Season!" : "Off Season"}
            </span>
          </div>
        </div>
      </div>
    );
  };

  // Render ingredient card
  const renderIngredientCard = (ingredient: (typeof scoredIngredients)[0]) => {
    if (!ingredient) return null; // Defensive check
    const isSelected = selectedIngredient === ingredient.name;
    const displayName = formatIngredientName(ingredient.name);
    const imageUrl = getIngredientImageUrl(ingredient);
    const description =
      typeof ingredient.description === "string"
        ? cleanDescription(ingredient.description)
        : "";
    const tone =
      ELEMENT_CARD_TONES[ingredient.dominantElement] ||
      ELEMENT_CARD_TONES.Unknown;

    return (
      <motion.div
        key={ingredient.name}
        layout
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        onClick={() => handleIngredientSelect(ingredient.name)}
        onDoubleClick={() => {
          if (onDoubleClickIngredient) {
            onDoubleClickIngredient(
              ingredient.name,
              ingredient.category,
              ingredient.elementalProperties,
            );
          }
        }}
        className={`group relative flex min-h-[540px] cursor-pointer flex-col overflow-hidden rounded-xl border bg-[#101018]/95 shadow-xl transition-colors ${
          isSelected
            ? `${tone.ring} shadow-2xl`
            : "border-white/10 shadow-black/25 hover:border-amber-300/35"
        }`}
      >
        <div className="relative h-36 w-full overflow-hidden bg-slate-950">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={`${displayName} ingredient`}
              fill
              loading="lazy"
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
            />
          ) : (
            <div
              className={`relative flex h-full w-full items-center justify-center bg-gradient-to-br ${tone.fallback}`}
            >
              <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(255,255,255,.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.12)_1px,transparent_1px)] [background-size:22px_22px]" />
              <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-white/20 bg-black/25 text-white/80 backdrop-blur-sm">
                <ImageIcon className="h-7 w-7" aria-hidden="true" />
              </div>
              <span className="absolute bottom-3 left-4 rounded-full border border-white/15 bg-black/30 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/75">
                Visual pending
              </span>
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#101018] to-transparent" />
          <div className="absolute right-3 top-3 rounded-full border border-white/15 bg-black/45 px-3 py-1 text-sm font-bold text-white backdrop-blur-md">
            {Math.round(ingredient.compatibilityScore * 100)}%
          </div>
        </div>

        <div className="flex flex-1 flex-col p-4">
          {/* Header */}
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h4 className="text-lg font-semibold leading-tight text-white">
                  {displayName}
                </h4>
                {ingredient.isInSeason && (
                  <span className="rounded-full border border-emerald-300/25 bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-100">
                    In Season
                  </span>
                )}
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                <span className="text-xs capitalize text-slate-400">
                  {formatIngredientName(ingredient.category)}
                </span>
                {(() => {
                  const categoryLabel = formatIngredientName(
                    ingredient.category,
                  );
                  const subLabel = ingredient.subcategory
                    ? formatIngredientName(ingredient.subcategory)
                    : "";
                  // Skip a subcategory that merely echoes the name or category.
                  if (
                    !subLabel ||
                    subLabel.toLowerCase() === displayName.toLowerCase() ||
                    subLabel.toLowerCase() === categoryLabel.toLowerCase()
                  ) {
                    return null;
                  }
                  // Bullet + label kept in one span so the separator never
                  // orphans onto its own line when the row wraps.
                  return (
                    <span className="text-xs capitalize text-slate-400">
                      <span className="text-slate-600">·</span> {subLabel}
                    </span>
                  );
                })()}
              </div>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-2">
              <div
                className={`flex items-center gap-1 rounded-full border px-2 py-1 text-xs ${tone.chip}`}
              >
                <span
                  className={`inline-block h-2 w-2 rounded-full bg-gradient-to-r ${tone.bar}`}
                />
                {ingredient.dominantElement}
              </div>
              <button
                type="button"
                onClick={(e) =>
                  handleAddToPantry(ingredient.name, ingredient.category, e)
                }
                className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-semibold transition-colors ${
                  pantry.hasItem(ingredient.name)
                    ? "border-emerald-300/30 bg-emerald-500/15 text-emerald-100 hover:bg-emerald-500/25"
                    : "border-amber-300/30 bg-amber-500/15 text-amber-100 hover:bg-amber-500/25"
                }`}
                title={
                  pantry.hasItem(ingredient.name)
                    ? "Already in your pantry"
                    : "Add this ingredient to your pantry"
                }
              >
                {pantry.hasItem(ingredient.name) ? (
                  <>
                    <Check className="h-3.5 w-3.5" aria-hidden="true" />
                    In Pantry
                  </>
                ) : (
                  <>
                    <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                    Pantry
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Summary Blurb */}
          {description && (
            <motion.div
              layout
              className="mb-3 rounded-lg border border-white/10 bg-white/[0.04] p-3 text-sm leading-6 text-slate-200"
            >
              <p className={isSelected ? "" : "line-clamp-3"}>{description}</p>
              <div className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-amber-200">
                {isSelected ? (
                  <>
                    <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
                    Less detail
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
                    More detail
                  </>
                )}
              </div>
            </motion.div>
          )}

          {/* Composite elements — what an aromatic base / blend is built from */}
          {(() => {
            const composite = (ingredient as any).compositeElements;
            if (!Array.isArray(composite) || composite.length === 0)
              return null;
            return (
              <div className="mb-3">
                <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Made from
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {composite.map((part: unknown) => (
                    <span
                      key={String(part)}
                      className="rounded-md border border-amber-300/20 bg-amber-500/10 px-2 py-1 text-xs capitalize text-amber-100"
                    >
                      {formatIngredientName(String(part))}
                    </span>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Qualities badges */}
          {ingredient.qualities &&
            Array.isArray(ingredient.qualities) &&
            ingredient.qualities.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-1">
                {ingredient.qualities.slice(0, 4).map((quality, idx) => (
                  <span
                    key={idx}
                    className="rounded-md bg-green-100 dark:bg-green-900/40 px-2 py-1 text-xs text-green-700 dark:text-green-300"
                  >
                    {quality}
                  </span>
                ))}
                {ingredient.qualities.length > 4 && (
                  <span className="rounded-md bg-gray-100 dark:bg-slate-800 px-2 py-1 text-xs text-gray-600 dark:text-slate-300">
                    +{ingredient.qualities.length - 4} more
                  </span>
                )}
              </div>
            )}

          {/* ── TASTE PROFILE ─────────────────────────────────── */}
          {(() => {
            let taste = (ingredient as any).sensoryProfile?.taste;

            if (
              !taste ||
              typeof taste !== "object" ||
              Array.isArray(taste) ||
              Object.keys(taste).length === 0
            ) {
              const fp =
                (ingredient as any).unifiedFlavorProfile ||
                (ingredient as any).flavorProfile;
              if (fp && typeof fp === "object" && !Array.isArray(fp)) {
                taste = fp.baseNotes || fp;
              }
            }

            if (!taste || typeof taste !== "object" || Array.isArray(taste))
              return null;

            const active = Object.entries(taste as Record<string, number>)
              .filter(([, v]) => typeof v === "number" && v > 0.1)
              .sort(([, a], [, b]) => b - a);
            if (active.length === 0) return null;
            return (
              <div className="mb-3">
                <div className="mb-1 text-xs font-medium text-gray-500 dark:text-slate-400">
                  Taste profile
                </div>
                <div className="flex flex-wrap gap-1">
                  {active.map(([name, value]) => {
                    const cfg = TASTE_CONFIG[name.toLowerCase()] ?? {
                      emoji: "•",
                      color:
                        "bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-200 border-gray-200 dark:border-slate-700",
                    };
                    const dots = value > 0.7 ? "●●●" : value > 0.4 ? "●●" : "●";
                    return (
                      <span
                        key={name}
                        className={`rounded-full border px-2 py-0.5 text-xs font-medium ${cfg.color}`}
                      >
                        {cfg.emoji} {name} {dots}
                      </span>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* ── NUTRITION SNAPSHOT ────────────────────────────── */}
          {(() => {
            const n = extractNutrition((ingredient as any).nutritionalProfile);
            if (!n) return null;
            return (
              <div className="mb-3">
                {n.servingSize && (
                  <div className="mb-0.5 text-xs text-gray-400 dark:text-slate-500">
                    Per {n.servingSize}
                  </div>
                )}
                <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs">
                  {n.calories != null && (
                    <span className="font-semibold text-gray-700 dark:text-slate-200">
                      🔥 {n.calories} cal
                    </span>
                  )}
                  {n.protein != null && n.protein > 0 && (
                    <span className="text-blue-600 dark:text-blue-300">
                      💪 {n.protein}g protein
                    </span>
                  )}
                  {n.carbs != null && n.carbs > 0 && (
                    <span className="text-amber-600 dark:text-amber-300">
                      🌾 {n.carbs}g carbs
                    </span>
                  )}
                  {n.fat != null && n.fat > 0 && (
                    <span className="text-orange-600 dark:text-orange-300">
                      🫒 {n.fat}g fat
                    </span>
                  )}
                </div>
              </div>
            );
          })()}

          {/* ── SMOKE POINT (oils) ────────────────────────────── */}
          {(ingredient as any).smokePoint && (
            <div className="mb-3 text-xs">
              <span className="font-medium text-orange-600 dark:text-orange-300">
                🌡️ Smoke point:{" "}
              </span>
              <span className="text-gray-700 dark:text-slate-200">
                {(ingredient as any).smokePoint.fahrenheit}°F /{" "}
                {(ingredient as any).smokePoint.celsius}°C
              </span>
              <span className="ml-1 text-gray-400 dark:text-slate-500">
                {(ingredient as any).smokePoint.fahrenheit >= 400
                  ? "(high-heat ok)"
                  : (ingredient as any).smokePoint.fahrenheit >= 350
                    ? "(medium-high heat)"
                    : "(low-medium heat only)"}
              </span>
            </div>
          )}

          {/* ── CULINARY USES ─────────────────────────────────── */}
          {(() => {
            const apps = (ingredient as any).culinaryApplications?.commonUses;
            const methods = (ingredient as any).culinaryProfile?.cookingMethods;
            const affinity = (ingredient as any).culinaryProfile
              ?.cuisineAffinity;

            let uses: string[] = [];
            if (Array.isArray(apps) && apps.length > 0) uses = [...apps];
            else {
              if (Array.isArray(methods)) uses = [...uses, ...methods];
              if (Array.isArray(affinity)) uses = [...uses, ...affinity];
            }

            if (uses.length === 0) return null;

            return (
              <div className="mb-3">
                <div className="mb-1 text-xs font-medium text-gray-500 dark:text-slate-400">
                  👨‍🍳 Used in
                </div>
                <div className="flex flex-wrap gap-1">
                  {uses.slice(0, 4).map((use: string, idx: number) => (
                    <span
                      key={idx}
                      className="rounded-md border border-amber-200 dark:border-amber-700/50 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 text-xs text-amber-700 dark:text-amber-300"
                    >
                      {use}
                    </span>
                  ))}
                  {uses.length > 4 && (
                    <span className="text-xs text-gray-400 dark:text-slate-500">
                      +{uses.length - 4} more
                    </span>
                  )}
                </div>
              </div>
            );
          })()}

          {/* ── HOW TO PREP ───────────────────────────────────── */}
          {(() => {
            const tips: string[] = [];
            const cp = (ingredient as any).culinaryProfile;
            if (Array.isArray(cp?.preparationTips)) {
              tips.push(...cp.preparationTips);
            }
            const prep = (ingredient as any).preparation;
            if (Array.isArray(prep?.methods)) {
              tips.push(...prep.methods);
            }
            if (tips.length === 0) return null;
            return (
              <div className="mb-3">
                <div className="mb-1 text-xs font-medium text-gray-500 dark:text-slate-400">
                  🔪 How to prep
                </div>
                <ul className="space-y-0.5">
                  {tips.slice(0, 3).map((tip, idx) => (
                    <li
                      key={idx}
                      className="flex gap-1.5 text-xs text-gray-600 dark:text-slate-300"
                    >
                      <span className="text-amber-300/70" aria-hidden="true">
                        •
                      </span>
                      <span>{String(tip)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })()}

          {/* ── BEST COOKING METHODS ──────────────────────────── */}
          {(() => {
            const methods: string[] | undefined =
              (ingredient as any).culinaryProfile?.cookingMethods ||
              (ingredient as any).cookingMethods ||
              (ingredient as any).recommendedCookingMethods;
            if (!methods || !Array.isArray(methods) || methods.length === 0)
              return null;
            return (
              <div className="mb-3 text-xs text-gray-600 dark:text-slate-300">
                <span className="font-medium text-gray-500 dark:text-slate-400">
                  🍳 Methods:{" "}
                </span>
                {methods.slice(0, 4).join(", ")}
              </div>
            );
          })()}

          {/* ── PAIRS WELL WITH ───────────────────────────────── */}
          {(() => {
            const pr = ingredient.pairingRecommendations as any;
            // Object format: { complementary: [...] }
            if (
              pr?.complementary &&
              Array.isArray(pr.complementary) &&
              pr.complementary.length > 0
            ) {
              return (
                <div className="mb-2 text-xs text-gray-600 dark:text-slate-300">
                  <span className="font-medium text-gray-500 dark:text-slate-400">
                    🤝 Pairs with:{" "}
                  </span>
                  {pr.complementary.slice(0, 4).join(", ")}
                </div>
              );
            }
            // Simple string array format
            if (Array.isArray(pr) && pr.length > 0) {
              return (
                <div className="mb-2 text-xs text-gray-600 dark:text-slate-300">
                  <span className="font-medium text-gray-500 dark:text-slate-400">
                    🤝 Pairs with:{" "}
                  </span>
                  {(pr as string[]).slice(0, 4).join(", ")}
                </div>
              );
            }
            // affinities as fallback pairing display
            const affinities = (ingredient as any).affinities;
            if (Array.isArray(affinities) && affinities.length > 0) {
              return (
                <div className="mb-2 text-xs text-gray-600 dark:text-slate-300">
                  <span className="font-medium text-gray-500 dark:text-slate-400">
                    🤝 Pairs with:{" "}
                  </span>
                  {(affinities as string[]).slice(0, 4).join(", ")}
                </div>
              );
            }
            return null;
          })()}

          {/* ── STORAGE ───────────────────────────────────────── */}
          {(() => {
            const s = (ingredient as any).storage;
            if (!s || typeof s !== "object") return null;
            const temperature =
              typeof s.temperature === "string" ? s.temperature : null;
            const duration = typeof s.duration === "string" ? s.duration : null;
            const container =
              typeof s.container === "string" ? s.container : null;
            const place = [container, temperature].filter(Boolean).join(", ");
            if (!place && !duration) return null;
            return (
              <div className="mb-2 text-xs text-gray-600 dark:text-slate-300">
                <span className="font-medium text-gray-500 dark:text-slate-400">
                  📦 Storage:{" "}
                </span>
                {place}
                {place && duration ? " · " : ""}
                {duration ? `keeps ${duration}` : ""}
              </div>
            );
          })()}

          {/* ── ORIGIN + SEASONALITY ──────────────────────────── */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-gray-400 dark:text-slate-500">
            {ingredient.origin && ingredient.origin.length > 0 && (
              <span>📍 {ingredient.origin.slice(0, 2).join(", ")}</span>
            )}
            {(() => {
              const seasonData =
                ingredient.seasonality || (ingredient as any).season;
              const normalizedSeasons = normalizeSeasonality(seasonData);
              if (normalizedSeasons.length === 0) return null;
              return (
                <span className="capitalize">
                  🗓️ {normalizedSeasons.slice(0, 2).join(", ")}
                </span>
              );
            })()}
          </div>

          {/* ── HERB / SPICE TIMING TIP ───────────────────────── */}
          {(ingredient as any).timing?.notes && (
            <div className="mt-2 rounded-md bg-indigo-50 dark:bg-indigo-950/40 px-2 py-1.5 text-xs text-indigo-700 dark:text-indigo-300">
              ⏱️ {(ingredient as any).timing.notes}
            </div>
          )}

          {/* Expanded details */}
          <AnimatePresence initial={false}>
            {isSelected && (
              <motion.div
                layout
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.24, ease: "easeOut" }}
                className="mt-4 space-y-4 overflow-hidden border-t border-white/10 pt-4 text-slate-200"
              >
                {/* Score Breakdown */}
                {ingredient.scoreBreakdown &&
                  renderScoreBreakdown(ingredient.scoreBreakdown)}

                {/* Origin */}
                {ingredient.origin && ingredient.origin.length > 0 && (
                  <div>
                    <div className="mb-1 text-sm font-semibold text-gray-800 dark:text-slate-100">
                      Origin
                    </div>
                    <div className="text-sm text-gray-600 dark:text-slate-300">
                      {ingredient.origin.join(", ")}
                    </div>
                  </div>
                )}

                {/* Sensory Profile */}
                {(ingredient as any).sensoryProfile &&
                  typeof (ingredient as any).sensoryProfile === "object" && (
                    <div>
                      <div className="mb-2 text-sm font-semibold text-gray-800 dark:text-slate-100">
                        Sensory Profile
                      </div>
                      <div className="space-y-2 text-sm">
                        {/* Taste */}
                        {(ingredient as any).sensoryProfile.taste &&
                          typeof (ingredient as any).sensoryProfile.taste ===
                            "object" && (
                            <div>
                              <span className="font-medium text-gray-700 dark:text-slate-200">
                                Taste:{" "}
                              </span>
                              <div className="mt-1 flex flex-wrap gap-1">
                                {Object.entries(
                                  (ingredient as any).sensoryProfile.taste,
                                )
                                  .filter(([, value]) => (value as number) > 0)
                                  .sort(
                                    ([, a], [, b]) =>
                                      (b as number) - (a as number),
                                  )
                                  .map(([taste, value]) => (
                                    <span
                                      key={taste}
                                      className="rounded-md bg-purple-100 dark:bg-purple-900/40 px-2 py-1 text-xs text-purple-700 dark:text-purple-300"
                                    >
                                      {taste} (
                                      {Math.round((value as number) * 10)}
                                      /10)
                                    </span>
                                  ))}
                              </div>
                            </div>
                          )}

                        {/* Aroma */}
                        {(ingredient as any).sensoryProfile.aroma &&
                          typeof (ingredient as any).sensoryProfile.aroma ===
                            "object" && (
                            <div>
                              <span className="font-medium text-gray-700 dark:text-slate-200">
                                Aroma:{" "}
                              </span>
                              <div className="mt-1 flex flex-wrap gap-1">
                                {Object.entries(
                                  (ingredient as any).sensoryProfile.aroma,
                                )
                                  .filter(([, value]) => (value as number) > 0)
                                  .sort(
                                    ([, a], [, b]) =>
                                      (b as number) - (a as number),
                                  )
                                  .map(([aroma, value]) => (
                                    <span
                                      key={aroma}
                                      className="rounded-md bg-pink-100 dark:bg-pink-900/40 px-2 py-1 text-xs text-pink-700 dark:text-pink-300"
                                    >
                                      {aroma} (
                                      {Math.round((value as number) * 10)}
                                      /10)
                                    </span>
                                  ))}
                              </div>
                            </div>
                          )}

                        {/* Texture */}
                        {(ingredient as any).sensoryProfile.texture &&
                          typeof (ingredient as any).sensoryProfile.texture ===
                            "object" && (
                            <div>
                              <span className="font-medium text-gray-700 dark:text-slate-200">
                                Texture:{" "}
                              </span>
                              <div className="mt-1 flex flex-wrap gap-1">
                                {Object.entries(
                                  (ingredient as any).sensoryProfile.texture,
                                )
                                  .filter(([, value]) => (value as number) > 0)
                                  .sort(
                                    ([, a], [, b]) =>
                                      (b as number) - (a as number),
                                  )
                                  .map(([texture, value]) => (
                                    <span
                                      key={texture}
                                      className="rounded-md bg-orange-100 dark:bg-orange-900/40 px-2 py-1 text-xs text-orange-700 dark:text-orange-300"
                                    >
                                      {texture} (
                                      {Math.round((value as number) * 10)}
                                      /10)
                                    </span>
                                  ))}
                              </div>
                            </div>
                          )}
                      </div>
                    </div>
                  )}

                {/* Astrological Profile */}
                {ingredient.astrologicalProfile && (
                  <div>
                    <div className="mb-2 text-sm font-semibold text-gray-800 dark:text-slate-100">
                      Astrological Profile
                    </div>
                    <div className="space-y-1 text-sm">
                      {ingredient.astrologicalProfile.rulingPlanets &&
                        Array.isArray(
                          ingredient.astrologicalProfile.rulingPlanets,
                        ) && (
                          <div>
                            <span className="font-medium text-gray-700 dark:text-slate-200">
                              Ruling Planets:{" "}
                            </span>
                            <span className="text-gray-600 dark:text-slate-300">
                              {ingredient.astrologicalProfile.rulingPlanets.join(
                                ", ",
                              )}
                            </span>
                          </div>
                        )}
                      {ingredient.astrologicalProfile.favorableZodiac &&
                        Array.isArray(
                          ingredient.astrologicalProfile.favorableZodiac,
                        ) && (
                          <div>
                            <span className="font-medium text-gray-700 dark:text-slate-200">
                              Favorable Signs:{" "}
                            </span>
                            <span className="text-gray-600 dark:text-slate-300 capitalize">
                              {ingredient.astrologicalProfile.favorableZodiac.join(
                                ", ",
                              )}
                            </span>
                          </div>
                        )}
                      {(ingredient.astrologicalProfile as any)
                        .seasonalAffinity &&
                        Array.isArray(
                          (ingredient.astrologicalProfile as any)
                            .seasonalAffinity,
                        ) && (
                          <div>
                            <span className="font-medium text-gray-700 dark:text-slate-200">
                              Seasonal Affinity:{" "}
                            </span>
                            <span className="text-gray-600 dark:text-slate-300 capitalize">
                              {(
                                ingredient.astrologicalProfile as any
                              ).seasonalAffinity.join(", ")}
                            </span>
                          </div>
                        )}
                    </div>
                  </div>
                )}

                {/* Health Benefits */}
                {(ingredient as any).healthBenefits &&
                  Array.isArray((ingredient as any).healthBenefits) &&
                  (ingredient as any).healthBenefits.length > 0 && (
                    <div>
                      <div className="mb-1 text-sm font-semibold text-gray-800 dark:text-slate-100">
                        Health Benefits
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {((ingredient as any).healthBenefits as string[]).map(
                          (benefit: string, idx: number) => (
                            <span
                              key={idx}
                              className="rounded-md bg-teal-100 dark:bg-teal-900/40 px-2 py-1 text-xs text-teal-700 dark:text-teal-300"
                            >
                              {benefit}
                            </span>
                          ),
                        )}
                      </div>
                    </div>
                  )}

                {/* Pairing Recommendations */}
                {ingredient.pairingRecommendations && (
                  <div>
                    <div className="mb-2 text-sm font-semibold text-gray-800 dark:text-slate-100">
                      Pairings
                    </div>
                    {(() => {
                      const pr = ingredient.pairingRecommendations as any;
                      // Simple string array format
                      if (Array.isArray(pr) && pr.length > 0) {
                        return (
                          <div className="space-y-1 text-sm">
                            <div>
                              <span className="font-medium text-green-700 dark:text-green-300">
                                Pairs well with:{" "}
                              </span>
                              <span className="text-gray-600 dark:text-slate-300">
                                {(pr as string[]).join(", ")}
                              </span>
                            </div>
                          </div>
                        );
                      }
                      // Object format with complementary/contrasting/toAvoid
                      return (
                        <div className="space-y-1 text-sm">
                          {pr?.complementary &&
                            Array.isArray(pr.complementary) && (
                              <div>
                                <span className="font-medium text-green-700 dark:text-green-300">
                                  Complementary:{" "}
                                </span>
                                <span className="text-gray-600 dark:text-slate-300">
                                  {pr.complementary.join(", ")}
                                </span>
                              </div>
                            )}
                          {pr?.contrasting && Array.isArray(pr.contrasting) && (
                            <div>
                              <span className="font-medium text-orange-700 dark:text-orange-300">
                                Contrasting:{" "}
                              </span>
                              <span className="text-gray-600 dark:text-slate-300">
                                {pr.contrasting.join(", ")}
                              </span>
                            </div>
                          )}
                          {pr?.toAvoid && Array.isArray(pr.toAvoid) && (
                            <div>
                              <span className="font-medium text-red-700 dark:text-red-300">
                                Avoid:{" "}
                              </span>
                              <span className="text-gray-600 dark:text-slate-300">
                                {pr.toAvoid.join(", ")}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* Elemental Properties */}
                {ingredient.elementalProperties && (
                  <div>
                    <div className="mb-2 text-sm font-semibold text-gray-800 dark:text-slate-100">
                      Elemental Balance
                    </div>
                    {renderElementalProperties(ingredient.elementalProperties)}
                  </div>
                )}

                {/* Alchemical Properties + KAlchm */}
                {ingredient.alchemicalProperties && (
                  <div>
                    <div className="mb-2 text-sm font-semibold text-gray-800 dark:text-slate-100">
                      Alchemical Properties
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {Object.entries(ingredient.alchemicalProperties).map(
                        ([prop, value]) => (
                          <div key={prop} className="flex justify-between">
                            <span className="font-medium text-gray-700 dark:text-slate-200">
                              {prop}:
                            </span>
                            <span className="text-gray-600 dark:text-slate-300">
                              {Number(value).toFixed(3)}
                            </span>
                          </div>
                        ),
                      )}
                    </div>
                    {/* KAlchm value */}
                    {(() => {
                      const alch = ingredient.alchemicalProperties as any;
                      const kalchmValue =
                        (ingredient as any).kalchm ??
                        (alch?.Spirit
                          ? calculateKAlchm(
                              alch.Spirit,
                              alch.Essence,
                              alch.Matter,
                              alch.Substance,
                            )
                          : null);
                      if (kalchmValue == null) return null;
                      return (
                        <div className="mt-2 flex items-center justify-between rounded-md bg-indigo-50 dark:bg-indigo-950/40 px-3 py-2">
                          <span className="text-sm font-semibold text-indigo-800 dark:text-indigo-200">
                            K<sub>alchm</sub>
                          </span>
                          <span className="text-sm font-bold text-indigo-700 dark:text-indigo-300">
                            {Number(kalchmValue).toFixed(4)}
                          </span>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* Recommended Cooking Methods (expanded - all methods) */}
                {(() => {
                  const methods: string[] | undefined =
                    (ingredient as any).culinaryProfile?.cookingMethods ||
                    (ingredient as any).cookingMethods ||
                    (ingredient as any).recommendedCookingMethods;
                  if (
                    !methods ||
                    !Array.isArray(methods) ||
                    methods.length === 0
                  )
                    return null;
                  return (
                    <div>
                      <div className="mb-1 text-sm font-semibold text-gray-800 dark:text-slate-100">
                        Cooking Methods
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {methods.map((method: string, idx: number) => (
                          <span
                            key={idx}
                            className="rounded-md bg-blue-100 px-2 py-1 text-xs text-blue-700 dark:text-blue-300"
                          >
                            {method}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* Storage Info */}
                {(ingredient as any).storage &&
                  typeof (ingredient as any).storage === "object" && (
                    <div>
                      <div className="mb-1 text-sm font-semibold text-gray-800 dark:text-slate-100">
                        Storage
                      </div>
                      <div className="space-y-1 text-sm text-gray-600 dark:text-slate-300">
                        {(ingredient as any).storage.temperature && (
                          <div>
                            <span className="font-medium text-gray-700 dark:text-slate-200">
                              🌡️{" "}
                            </span>
                            {(ingredient as any).storage.temperature}
                          </div>
                        )}
                        {(ingredient as any).storage.duration && (
                          <div>
                            <span className="font-medium text-gray-700 dark:text-slate-200">
                              ⏱️{" "}
                            </span>
                            {(ingredient as any).storage.duration}
                          </div>
                        )}
                        {(ingredient as any).storage.container && (
                          <div>
                            <span className="font-medium text-gray-700 dark:text-slate-200">
                              📦{" "}
                            </span>
                            {(ingredient as any).storage.container}
                          </div>
                        )}
                        {(ingredient as any).storage.notes && (
                          <div className="text-xs text-gray-500 dark:text-slate-400 italic">
                            {(ingredient as any).storage.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                {/* Preparation Info */}
                {(ingredient as any).preparation &&
                  typeof (ingredient as any).preparation === "object" && (
                    <div>
                      <div className="mb-1 text-sm font-semibold text-gray-800 dark:text-slate-100">
                        Preparation
                      </div>
                      <div className="space-y-1 text-sm text-gray-600 dark:text-slate-300">
                        {typeof (ingredient as any).preparation === "object" &&
                          !Array.isArray((ingredient as any).preparation) && (
                            <>
                              {(ingredient as any).preparation.washing !==
                                undefined && (
                                <div>
                                  <span className="font-medium text-gray-700 dark:text-slate-200">
                                    Washing:{" "}
                                  </span>
                                  {(ingredient as any).preparation.washing
                                    ? "Required"
                                    : "Not needed"}
                                </div>
                              )}
                              {(ingredient as any).preparation.peeling && (
                                <div>
                                  <span className="font-medium text-gray-700 dark:text-slate-200">
                                    Peeling:{" "}
                                  </span>
                                  {(ingredient as any).preparation.peeling}
                                </div>
                              )}
                              {(ingredient as any).preparation.cutting && (
                                <div>
                                  <span className="font-medium text-gray-700 dark:text-slate-200">
                                    Cutting:{" "}
                                  </span>
                                  {(ingredient as any).preparation.cutting}
                                </div>
                              )}
                              {(ingredient as any).preparation.selection && (
                                <div>
                                  <span className="font-medium text-gray-700 dark:text-slate-200">
                                    Selection:{" "}
                                  </span>
                                  {(ingredient as any).preparation.selection}
                                </div>
                              )}
                              {(ingredient as any).preparation.notes &&
                                typeof (ingredient as any).preparation.notes ===
                                  "string" && (
                                  <div className="text-xs text-gray-500 dark:text-slate-400 italic">
                                    {(ingredient as any).preparation.notes}
                                  </div>
                                )}
                              {(ingredient as any).preparation.tips &&
                                Array.isArray(
                                  (ingredient as any).preparation.tips,
                                ) && (
                                  <div className="mt-1">
                                    <span className="font-medium text-gray-700 dark:text-slate-200">
                                      Tips:{" "}
                                    </span>
                                    <ul className="ml-4 list-disc text-xs text-gray-500 dark:text-slate-400">
                                      {(
                                        (ingredient as any).preparation
                                          .tips as string[]
                                      )
                                        .slice(0, 3)
                                        .map((tip: string, idx: number) => (
                                          <li key={idx}>{tip}</li>
                                        ))}
                                    </ul>
                                  </div>
                                )}
                            </>
                          )}
                      </div>
                    </div>
                  )}

                {/* Nutritional Profile (expanded - full details) */}
                {(() => {
                  const np = (ingredient as any).nutritionalProfile;
                  if (!np) return null;
                  const macros = np.macros || {};
                  return (
                    <div>
                      <div className="mb-1 text-sm font-semibold text-gray-800 dark:text-slate-100">
                        Nutritional Details
                      </div>
                      {np.serving_size && (
                        <div className="mb-1 text-xs text-gray-400 dark:text-slate-500">
                          Per {np.serving_size}
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-1 text-sm">
                        {np.calories != null && (
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-slate-300">
                              Calories:
                            </span>
                            <span className="font-medium">
                              {Math.round(np.calories)}
                            </span>
                          </div>
                        )}
                        {(macros.protein ?? np.protein) != null && (
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-slate-300">
                              Protein:
                            </span>
                            <span className="font-medium">
                              {macros.protein ?? np.protein}g
                            </span>
                          </div>
                        )}
                        {(macros.carbs ?? np.carbs) != null && (
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-slate-300">
                              Carbs:
                            </span>
                            <span className="font-medium">
                              {macros.carbs ?? np.carbs}g
                            </span>
                          </div>
                        )}
                        {(macros.fat ?? np.fat) != null && (
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-slate-300">
                              Fat:
                            </span>
                            <span className="font-medium">
                              {macros.fat ?? np.fat}g
                            </span>
                          </div>
                        )}
                        {macros.fiber != null && macros.fiber > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-slate-300">
                              Fiber:
                            </span>
                            <span className="font-medium">{macros.fiber}g</span>
                          </div>
                        )}
                        {macros.sugar != null && macros.sugar > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-slate-300">
                              Sugar:
                            </span>
                            <span className="font-medium">{macros.sugar}g</span>
                          </div>
                        )}
                      </div>
                      {np.vitamins &&
                        typeof np.vitamins === "object" &&
                        Object.keys(np.vitamins).length > 0 &&
                        !Array.isArray(np.vitamins) && (
                          <div className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                            <span className="font-medium text-gray-600 dark:text-slate-300">
                              Vitamins:{" "}
                            </span>
                            {Object.keys(np.vitamins).join(", ").toUpperCase()}
                          </div>
                        )}
                      {np.minerals &&
                        typeof np.minerals === "object" &&
                        Object.keys(np.minerals).length > 0 &&
                        !Array.isArray(np.minerals) && (
                          <div className="text-xs text-gray-500 dark:text-slate-400">
                            <span className="font-medium text-gray-600 dark:text-slate-300">
                              Minerals:{" "}
                            </span>
                            {Object.keys(np.minerals).join(", ")}
                          </div>
                        )}
                    </div>
                  );
                })()}

                {/* Thermodynamic Properties */}
                {(ingredient as any).thermodynamicProperties && (
                  <div>
                    <div className="mb-2 text-sm font-semibold text-gray-800 dark:text-slate-100">
                      Thermodynamic Properties
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {Object.entries(
                        (ingredient as any).thermodynamicProperties,
                      ).map(([prop, value]: [string, any]) => (
                        <div key={prop} className="flex justify-between">
                          <span className="font-medium text-gray-700 dark:text-slate-200 capitalize">
                            {prop}:
                          </span>
                          <span className="text-gray-600 dark:text-slate-300">
                            {typeof value === "number"
                              ? Number(value).toFixed(3)
                              : value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Parts Used (medicinal / botanical ingredients) */}
                {(ingredient as any).parts_used &&
                  Array.isArray((ingredient as any).parts_used) &&
                  (ingredient as any).parts_used.length > 0 && (
                    <div>
                      <div className="mb-1 text-sm font-semibold text-gray-800 dark:text-slate-100">
                        Parts Used
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {((ingredient as any).parts_used as string[]).map(
                          (part: string, idx: number) => (
                            <span
                              key={idx}
                              className="rounded-md bg-violet-100 dark:bg-violet-900/40 px-2 py-1 text-xs text-violet-700 dark:text-violet-300"
                            >
                              {part}
                            </span>
                          ),
                        )}
                      </div>
                    </div>
                  )}

                {/* Medicinal / Herbal Properties */}
                {(ingredient as any).properties &&
                  typeof (ingredient as any).properties === "object" &&
                  !Array.isArray((ingredient as any).properties) &&
                  Object.keys((ingredient as any).properties).length > 0 && (
                    <div>
                      <div className="mb-1 text-sm font-semibold text-gray-800 dark:text-slate-100">
                        Medicinal Properties
                      </div>
                      <div className="space-y-1 text-sm">
                        {Object.entries(
                          (ingredient as any).properties as Record<
                            string,
                            string
                          >,
                        ).map(([key, val]) => (
                          <div key={key}>
                            <span className="font-medium capitalize text-teal-700 dark:text-teal-300">
                              {key.replace(/_/g, " ")}:{" "}
                            </span>
                            <span className="text-gray-600 dark:text-slate-300">
                              {String(val)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Affinities (ingredient pairings stored as simple array) */}
                {(ingredient as any).affinities &&
                  Array.isArray((ingredient as any).affinities) &&
                  (ingredient as any).affinities.length > 0 && (
                    <div>
                      <div className="mb-1 text-sm font-semibold text-gray-800 dark:text-slate-100">
                        Affinities
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {((ingredient as any).affinities as string[]).map(
                          (affinity: string, idx: number) => (
                            <span
                              key={idx}
                              className="rounded-md bg-green-50 border border-green-200 px-2 py-0.5 text-xs text-green-700 dark:text-green-300"
                            >
                              {affinity}
                            </span>
                          ),
                        )}
                      </div>
                    </div>
                  )}

                {/* Flavor / Description text */}
                {(() => {
                  const desc =
                    (ingredient as any).flavor ||
                    (ingredient as any).description ||
                    (ingredient as any).flavorDescription;
                  if (!desc || typeof desc !== "string") return null;
                  return (
                    <div>
                      <div className="mb-1 text-sm font-semibold text-gray-800 dark:text-slate-100">
                        Flavor Notes
                      </div>
                      <p className="text-sm italic text-gray-600 dark:text-slate-300">
                        {desc}
                      </p>
                    </div>
                  );
                })()}

                {/* Culinary Uses (flat array format used by some herbs) */}
                {(() => {
                  const uses: string[] | undefined =
                    (ingredient as any).culinaryUses ||
                    (ingredient as any).culinaryApplications?.uses;
                  if (!uses || !Array.isArray(uses) || uses.length === 0)
                    return null;
                  return (
                    <div>
                      <div className="mb-1 text-sm font-semibold text-gray-800 dark:text-slate-100">
                        Culinary Uses
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {uses.map((use: string, idx: number) => (
                          <span
                            key={idx}
                            className="rounded-md border border-amber-200 dark:border-amber-700/50 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 text-xs text-amber-700 dark:text-amber-300"
                          >
                            {use}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* Varieties */}
                {(ingredient as any).varieties &&
                  typeof (ingredient as any).varieties === "object" &&
                  Object.keys((ingredient as any).varieties).length > 0 && (
                    <div>
                      <div className="mb-1 text-sm font-semibold text-gray-800 dark:text-slate-100">
                        Varieties
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {Object.keys((ingredient as any).varieties).map(
                          (v, idx) => (
                            <span
                              key={idx}
                              className="rounded-md bg-sky-100 dark:bg-sky-900/40 px-2 py-0.5 text-xs capitalize text-sky-700 dark:text-sky-300"
                            >
                              {v.replace(/_/g, " ")}
                            </span>
                          ),
                        )}
                      </div>
                    </div>
                  )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    );
  };

  const renderCompactIngredientCard = (
    ingredient: (typeof scoredIngredients)[0],
  ) => {
    if (!ingredient) return null;
    const displayName = formatIngredientName(ingredient.name);
    const imageUrl = getIngredientImageUrl(ingredient);
    const description =
      typeof ingredient.description === "string"
        ? cleanDescription(ingredient.description)
        : "";
    const tone =
      ELEMENT_CARD_TONES[ingredient.dominantElement] ||
      ELEMENT_CARD_TONES.Unknown;

    return (
      <motion.article
        key={ingredient.name}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -3 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        className="group overflow-hidden rounded-xl border border-white/10 bg-[#101018]/95 shadow-lg shadow-black/20 transition-colors hover:border-amber-300/35"
      >
        <div className="relative h-28 overflow-hidden bg-slate-950">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt=""
              fill
              loading="lazy"
              sizes="(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div
              className={`flex h-full items-center justify-center bg-gradient-to-br ${tone.fallback}`}
            >
              <ImageIcon className="h-7 w-7 text-white/55" aria-hidden="true" />
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#101018] to-transparent" />
          <span className="absolute right-3 top-3 rounded-full border border-white/15 bg-black/55 px-2.5 py-1 text-xs font-bold text-white backdrop-blur-md">
            {Math.round(ingredient.compatibilityScore * 100)}% match
          </span>
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-base font-semibold text-white">
                {displayName}
              </h3>
              <p className="mt-1 text-xs capitalize text-slate-400">
                {formatIngredientName(ingredient.category)}
                {ingredient.isInSeason ? " · In season" : ""}
              </p>
            </div>
            <span
              className={`shrink-0 rounded-full border px-2 py-1 text-[10px] ${tone.chip}`}
            >
              {ingredient.dominantElement}
            </span>
          </div>

          {description && (
            <p className="mt-3 line-clamp-2 text-xs leading-5 text-slate-300">
              {description}
            </p>
          )}

          <button
            type="button"
            onClick={(event) =>
              handleAddToPantry(ingredient.name, ingredient.category, event)
            }
            className={`mt-4 inline-flex min-h-9 w-full items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${
              pantry.hasItem(ingredient.name)
                ? "border-emerald-300/30 bg-emerald-500/15 text-emerald-100 hover:bg-emerald-500/25"
                : "border-amber-300/30 bg-amber-500/15 text-amber-100 hover:bg-amber-500/25"
            }`}
          >
            {pantry.hasItem(ingredient.name) ? (
              <>
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
                In pantry
              </>
            ) : (
              <>
                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                Add to pantry
              </>
            )}
          </button>
        </div>
      </motion.article>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-4 border-amber-300" />
          <p className="text-slate-300">Loading ingredients...</p>
        </div>
      </div>
    );
  }

  // Main render
  return (
    <div className="dark relative p-4 md:p-6">
      {pantryFeedback && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 rounded-lg border border-white/10 bg-gray-950 px-4 py-2 text-sm text-white shadow-lg"
        >
          {pantryFeedback}
        </div>
      )}
      {!compact && renderCategoryGrid()}
      {!compact && renderSearchBar()}
      {compact && renderSearchBar()}
      {compact && renderCompactCategorySelector()}

      {/* Selected category indicator */}
      {!compact && selectedCategory && (
        <div className="mb-4 flex items-center gap-2">
          <span className="text-sm text-slate-300">Showing:</span>
          <span className="rounded-full border border-amber-300/25 bg-amber-500/15 px-3 py-1 text-sm font-medium text-amber-100">
            {CATEGORIES.find((c) => c.id === selectedCategory)?.name}
          </span>
          <button
            onClick={handleClearFilters}
            className="text-sm font-medium text-amber-200 hover:text-amber-100"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Results count */}
      <div className="mb-4 text-sm text-slate-300">
        {compact ? compactResultLabel : `Showing ${displayedIngredients.length}`}
        {!compact && remainingCount > 0
          ? ` of ${scoredIngredients.length}`
          : ""}
        {!compact
          ? ` ingredient${scoredIngredients.length !== 1 ? "s" : ""} (sorted by compatibility)`
          : ""}
      </div>

      {/* Ingredients grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {displayedIngredients.map(
          compact ? renderCompactIngredientCard : renderIngredientCard,
        )}
      </div>

      {/* Expand/Collapse button - works for both category and "all" views */}
      {!compact && scoredIngredients.length > pageSize && !searchQuery && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={() =>
              handleToggleExpand(selectedCategory || ALL_INGREDIENTS_KEY)
            }
            className="group flex items-center gap-2 rounded-lg border border-amber-300/30 bg-amber-500/10 px-6 py-3 text-amber-100 transition-all hover:border-amber-300/50 hover:bg-amber-500/20"
          >
            {currentCategoryExpanded ? (
              <>
                <ChevronUp className="h-5 w-5 transition-transform group-hover:-translate-y-0.5" />
                <span className="font-medium">Show Less</span>
              </>
            ) : (
              <>
                <ChevronDown className="h-5 w-5 transition-transform group-hover:translate-y-0.5" />
                <span className="font-medium">
                  Show {remainingCount} More Ingredient
                  {remainingCount !== 1 ? "s" : ""}
                </span>
              </>
            )}
          </button>
        </div>
      )}

      {displayedIngredients.length === 0 && (
        <div className="py-12 text-center text-slate-400">
          {searchQuery || selectedCategory
            ? "No ingredients match your filters."
            : "No ingredients available at this time."}
        </div>
      )}

      <div className="mt-8 flex justify-center">
        <Link
          href="/ingredients"
          className="inline-flex items-center gap-2 rounded-xl border border-amber-400/40 bg-amber-500/10 px-5 py-2.5 text-sm font-semibold text-amber-200 hover:bg-amber-500/20 hover:border-amber-400/60 transition"
        >
          <FlaskConical className="h-4 w-4" aria-hidden="true" />
          Shop and filter the full Alchemical Pantry
          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
};

export default EnhancedIngredientRecommender;
