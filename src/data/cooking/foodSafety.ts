/**
 * Documented food-safety internal temperatures and safe handling standards.
 *
 * Sources:
 * - USDA Food Safety and Inspection Service (FSIS): "Safe Minimum Internal
 *   Temperature Chart" (revised 2020), 9 CFR § 318.23 / 9 CFR § 381.150.
 * - U.S. FDA Food Code (2022), § 3-401.11 ("Cooking Raw Animal Foods").
 * - McGee, Harold. *On Food and Cooking: The Science and Lore of the Kitchen*
 *   (Scribner, 2004), Chapter 3 (Meat & Poultry Pathogen Thermal Death Times).
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
    source: "USDA FSIS / FDA Food Code 2022 § 3-401.11(A)(3)",
    notes: "Instantaneous 7-log10 lethality for Salmonella and Campylobacter.",
  },
  {
    category: "ground-meat",
    foodType: "ground beef, pork, lamb, veal",
    minTempC: 71.1,
    minTempF: 160,
    source: "USDA FSIS / 9 CFR § 318.23",
    notes: "Lethality for Shiga-toxin producing E. coli (STEC).",
  },
  {
    category: "whole-meat",
    foodType: "steaks, chops, roasts of beef, pork, veal, lamb",
    minTempC: 62.8,
    minTempF: 145,
    restMinutes: 3,
    source: "USDA FSIS (2011 revised policy) / FDA Food Code 2022 § 3-401.11(A)(1)",
    notes: "Mandatory 3-minute post-cooking rest time to allow internal thermal equilibrium.",
  },
  {
    category: "finfish",
    foodType: "fish, shellfish, crustaceans",
    minTempC: 62.8,
    minTempF: 145,
    source: "FDA Food Code 2022 § 3-401.11(A)(1)",
    notes: "Until flesh is opaque and flakes readily with a fork.",
  },
  {
    category: "eggs",
    foodType: "egg dishes, quiches, casseroles",
    minTempC: 71.1,
    minTempF: 160,
    source: "USDA FSIS / FDA Food Code 2022 § 3-401.11",
    notes: "Raw eggs cooked until yolk and white are completely firm.",
  },
  {
    category: "reheating",
    foodType: "leftovers, casseroles, sauces",
    minTempC: 73.9,
    minTempF: 165,
    source: "USDA FSIS Safe Food Handling Guidelines",
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
}

interface ProteinThreshold {
  pattern: RegExp;
  minTemp: number;
  label: string;
  citation: string;
}

const PROTEIN_SAFETY_RULES: readonly ProteinThreshold[] = [
  {
    pattern: /\b(chicken|turkey|poultry|duck)\b/i,
    minTemp: 165,
    label: "poultry",
    citation: "USDA FSIS / FDA Food Code 2022 § 3-401.11(A)(3) safe minimum of 165°F (74°C)",
  },
  {
    pattern: /\b(ground|burger|patty|sausage)\b/i,
    minTemp: 160,
    label: "ground meat",
    citation: "USDA FSIS / FDA Food Code 2022 § 3-401.11(A)(2) safe minimum of 160°F (71°C)",
  },
  {
    pattern: /\b(beef|pork|lamb|veal|steak|roast|chop)\b/i,
    minTemp: 145,
    label: "whole cuts",
    citation: "USDA FSIS / FDA Food Code 2022 § 3-401.11(A)(1) safe minimum of 145°F (63°C)",
  },
  {
    pattern: /\b(fish|salmon|tuna|cod|shrimp|seafood)\b/i,
    minTemp: 145,
    label: "fish and shellfish",
    citation: "FDA Food Code 2022 § 3-401.11(A)(1) safe minimum of 145°F (63°C)",
  },
];

function checkProteinInternalSafety(
  targetProtein: string,
  temperatureF: number,
): { safe: boolean; reason?: string } {
  for (const rule of PROTEIN_SAFETY_RULES) {
    if (rule.pattern.test(targetProtein)) {
      if (temperatureF < rule.minTemp) {
        return {
          safe: false,
          reason: `Internal doneness temperature ${temperatureF}°F is below ${rule.citation} for ${rule.label}.`,
        };
      }
      return { safe: true };
    }
  }
  return { safe: true };
}

function checkBoilingMethodSafety(
  methodKey: string,
  temperatureF: number,
  isSugarOrCandy?: boolean,
): { safe: boolean; reason?: string } {
  const boilingMethods = new Set(["boiling", "simmering", "poaching", "steaming"]);
  if (!boilingMethods.has(methodKey)) return { safe: true };

  const maxBoilThreshold = isSugarOrCandy ? 320 : 212;
  if (temperatureF > maxBoilThreshold) {
    return {
      safe: false,
      reason: isSugarOrCandy
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
  targetProtein?: string,
  options?: EvaluateStepTemperatureOptions,
): { safe: boolean; reason?: string } {
  if (temperatureF === undefined || options?.isCoolingOrChilling) {
    return { safe: true };
  }

  if (temperatureF > 1000) {
    return {
      safe: false,
      reason: `Temperature ${temperatureF}°F exceeds physical kitchen safety envelope (>1000°F exceeds wood-fired pizza and tandoor ovens).`,
    };
  }

  const boilVerdict = checkBoilingMethodSafety(methodKey, temperatureF, options?.isSugarOrCandy);
  if (!boilVerdict.safe) return boilVerdict;

  if (targetProtein && options?.isInternalDoneness) {
    return checkProteinInternalSafety(targetProtein, temperatureF);
  }

  return { safe: true };
}
