/**
 * Documented food-safety internal temperatures and safe handling standards.
 *
 * Sources:
 * - Numeric thresholds are drawn from USDA FSIS consumer guidance and
 *   corroborated by FoodSafety.gov, last reviewed November 21, 2024.
 * - U.S. FDA Food Code (2022, January 18, 2023 version), § 3-401.11 ("Cooking
 *   Raw Animal Foods"), is a separate retail/foodservice model with time and
 *   process qualifications.
 * - Harold McGee, *On Food and Cooking: The Science and Lore of the Kitchen*
 *   (Scribner, 2004), Chapter 3 (Meat & Poultry Pathogen Thermal Death Times).
 *
 * The gate checks recipe text against selected flat floors; it does not
 * validate a cooking process or certify regulatory compliance.
 *
 * @file src/data/cooking/foodSafety.ts
 */

export interface SafeInternalTemperature {
  category: string;
  foodType: string;
  minTempC: number;
  minTempF: number;
  restMinutes?: number;
  source: string;
  notes?: string;
}

export const SAFE_INTERNAL_TEMPERATURES: readonly SafeInternalTemperature[] = [
  {
    category: "poultry",
    foodType: "all poultry (whole, parts, ground, stuffing)",
    minTempC: 73.9,
    minTempF: 165,
    source: "USDA FSIS consumer recommendation; FDA Food Code 2022 § 3-401.11(A)(3)",
    notes: "USDA FSIS safe minimum internal temperature; FDA Food Code specifies instantaneous retail cooking criterion.",
  },
  {
    category: "ground-meat",
    foodType: "ground beef, pork, lamb, veal",
    minTempC: 71.1,
    minTempF: 160,
    source: "USDA FSIS consumer Safe Minimum Internal Temperature Chart; corroborated by FoodSafety.gov (reviewed 2024-11-21)",
    notes: "Consumer safe minimum internal temperature for ground meat.",
  },
  {
    category: "whole-meat",
    foodType: "steaks, chops, roasts of beef, pork, veal, lamb",
    minTempC: 62.8,
    minTempF: 145,
    restMinutes: 3,
    source: "USDA FSIS consumer chart; FDA Food Code 2022 § 3-401.11(A)(1) is a separate retail framework",
    notes: "145°F with at least 3 minutes' rest for whole cuts.",
  },
  {
    category: "finfish",
    foodType: "fish, shellfish, crustaceans",
    minTempC: 62.8,
    minTempF: 145,
    source: "USDA FSIS consumer chart (FDA Food Code 2022 § 3-401.11(A)(1) specifies 145°F for 15 seconds)",
    notes: "Until flesh is opaque and flakes readily with a fork.",
  },
  {
    category: "eggs",
    foodType: "egg dishes, quiches, frittatas",
    minTempC: 71.1,
    minTempF: 160,
    source: "USDA FSIS consumer chart / FoodSafety.gov (reviewed 2024-11-21)",
    notes: "Egg dishes (frittata, quiche) cooked to 160°F; raw eggs cooked until yolk and white are firm. Casseroles are categorized at 165°F.",
  },
  {
    category: "reheating",
    foodType: "leftovers, casseroles, sauces",
    minTempC: 73.9,
    minTempF: 165,
    source: "USDA FSIS Safe Food Handling Guidelines / FoodSafety.gov (reviewed 2024-11-21)",
    notes: "Leftovers and casseroles reheated or cooked to 165°F.",
  },
] as const;

export const TEMPERATURE_DANGER_ZONE = {
  minTempC: 4.4,
  maxTempC: 60.0,
  minTempF: 40,
  maxTempF: 140,
  maxHours: 2,
  source: "USDA FSIS Food Safety Fact Sheet: The Danger Zone",
} as const;

export interface EvaluateStepTemperatureOptions {
  isInternalDoneness?: boolean;
  isCoolingOrChilling?: boolean;
  isSugarOrCandy?: boolean;
  isOven?: boolean;
  isPressure?: boolean;
  isLiquid?: boolean;
}

export interface StepTemperatureVerdict {
  safe: boolean;
  reason?: string;
  unevaluated?: boolean;
}

interface ProteinThreshold {
  pattern: RegExp;
  minTemp: number;
  label: string;
  citation: string;
}

const PROTEIN_SAFETY_RULES: readonly ProteinThreshold[] = [
  {
    pattern: /\b(chicken|turkey|poultry|duck|fowl|quail|hen)\b/i,
    minTemp: 165,
    label: "poultry",
    citation: "USDA FSIS consumer recommendation / FDA Food Code 2022 § 3-401.11(A)(3) safe minimum of 165°F (74°C)",
  },
  {
    pattern: /\b(ground|burger|patty|sausage)\b/i,
    minTemp: 160,
    label: "ground meat",
    citation: "USDA FSIS consumer safe minimum of 160°F (71°C)",
  },
  {
    pattern: /\b(beef|pork|lamb|veal|steak|roast|chop)\b/i,
    minTemp: 145,
    label: "whole cuts",
    citation: "USDA FSIS consumer safe minimum of 145°F (63°C) with 3-minute rest",
  },
  {
    pattern:
      /\b(fish|salmon|tuna|cod|shrimp|seafood|halibut|trout|tilapia|sea bass|snapper|prawns?|crab|lobster|scallops?)\b/i,
    minTemp: 145,
    label: "fish and shellfish",
    citation: "USDA FSIS consumer safe minimum of 145°F (63°C)",
  },
];

function checkProteinInternalSafety(
  targetProtein: string | readonly string[],
  temperatureF: number,
): StepTemperatureVerdict {
  const targets: readonly string[] =
    typeof targetProtein === "string" ? [targetProtein] : targetProtein;
  for (const protein of targets) {
    for (const rule of PROTEIN_SAFETY_RULES) {
      if (rule.pattern.test(protein)) {
        if (temperatureF < rule.minTemp) {
          return {
            safe: false,
            reason: `Internal doneness temperature ${temperatureF}°F is below ${rule.citation} for ${rule.label}.`,
          };
        }
        break;
      }
    }
  }
  return { safe: true };
}

function checkBoilingMethodSafety(
  methodKey: string,
  temperatureF: number,
  options?: EvaluateStepTemperatureOptions,
): StepTemperatureVerdict {
  if (options?.isOven) return { safe: true };

  const isPressure =
    options?.isPressure === true ||
    methodKey === "pressure" ||
    methodKey === "pressure_cook" ||
    methodKey === "pressure_cooking" ||
    methodKey === "instant_pot";

  if (isPressure) {
    return {
      safe: true,
      unevaluated: true,
      reason:
        "Pressure cooking requires a validated pressure/time process; recipe text does not establish that process.",
    };
  }

  const boilingMethods = new Set([
    "boiling",
    "boil",
    "simmering",
    "simmer",
    "poaching",
    "poach",
    "steaming",
    "steam",
  ]);
  const isBoiling = boilingMethods.has(methodKey);
  const isLiquid = options?.isLiquid ?? false;
  if (!isBoiling && !isLiquid) return { safe: true };

  const maxBoilThreshold = options?.isSugarOrCandy ? 320 : 212;
  if (temperatureF > maxBoilThreshold) {
    return {
      safe: false,
      reason: options?.isSugarOrCandy
        ? `Sugar syrup boiling cannot exceed 320°F for method ${methodKey}.`
        : `Liquid water cannot exceed 212°F (100°C) at ambient pressure for method ${methodKey}.`,
    };
  }
  return { safe: true };
}

/**
 * Check whether a step specifies an unsafe low temperature for a protein category,
 * or an impossible/excessive kitchen temperature (> 1000°F).
 */
export function evaluateStepTemperature(
  methodKey: string,
  temperatureF?: number,
  targetProtein?: string | readonly string[],
  options?: EvaluateStepTemperatureOptions,
): StepTemperatureVerdict {
  if (temperatureF === undefined) {
    return { safe: true };
  }

  if (options?.isCoolingOrChilling && !options.isInternalDoneness) {
    return { safe: true };
  }

  if (temperatureF > 1000) {
    return {
      safe: false,
      reason: `Temperature ${temperatureF}°F exceeds physical kitchen safety envelope (>1000°F exceeds wood-fired pizza and tandoor ovens).`,
    };
  }

  const boilVerdict = checkBoilingMethodSafety(
    methodKey,
    temperatureF,
    options,
  );
  if (!boilVerdict.safe) return boilVerdict;

  const hasProteins =
    typeof targetProtein === "string"
      ? targetProtein.length > 0
      : targetProtein !== undefined && targetProtein.length > 0;

  if (
    hasProteins &&
    options?.isInternalDoneness &&
    targetProtein !== undefined
  ) {
    const internal = checkProteinInternalSafety(targetProtein, temperatureF);
    if (!internal.safe) return internal;
  }

  return boilVerdict;
}
