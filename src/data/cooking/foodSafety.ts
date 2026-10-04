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
  if (temperatureF === undefined) return { safe: true };

  // Steps that cool, chill, or refrigerate operate in safe cold storage (<40°F) or ambient
  if (options?.isCoolingOrChilling) {
    return { safe: true };
  }

  // Hard physical impossibility / excessive fire hazard (>1000°F exceeds high-heat tandoor and wood-fired pizza ovens)
  if (temperatureF > 1000) {
    return {
      safe: false,
      reason: `Temperature ${temperatureF}°F exceeds physical kitchen safety envelope (>1000°F exceeds wood-fired pizza and tandoor ovens).`,
    };
  }

  // Liquid boiling in water cannot exceed 212°F (100°C) at standard sea level,
  // EXCEPT for concentrated sugar solutions (candy, caramel, toffee) which exhibit boiling point elevation up to 320°F.
  const boilingMethods = new Set(["boiling", "simmering", "poaching", "steaming"]);
  if (boilingMethods.has(methodKey)) {
    const maxBoilThreshold = options?.isSugarOrCandy ? 320 : 220;
    if (temperatureF > maxBoilThreshold) {
      return {
        safe: false,
        reason: options?.isSugarOrCandy
          ? `Sugar syrup boiling cannot exceed 320°F for method ${methodKey}.`
          : `Liquid water cannot exceed 212°F (100°C) at ambient pressure for method ${methodKey}.`,
      };
    }
  }

  // Protein internal safety: only applies when step specifies an internal target doneness temperature
  // (e.g. "cook until internal temperature reaches X"), not oven air/ambient temps (e.g. "bake at 375°F").
  if (targetProtein && options?.isInternalDoneness && methodKey !== "sous_vide") {
    const lower = targetProtein.toLowerCase();

    // 1. Poultry
    if (lower.includes("chicken") || lower.includes("turkey") || lower.includes("poultry") || lower.includes("duck")) {
      if (temperatureF < 165) {
        return {
          safe: false,
          reason: `Internal doneness temperature ${temperatureF}°F is below USDA minimum safe internal temperature of 165°F (74°C) for poultry (9 CFR § 381.150).`,
        };
      }
    }
    // 2. Ground meat
    else if (lower.includes("ground") || lower.includes("burger") || lower.includes("patty") || lower.includes("sausage")) {
      if (temperatureF < 160) {
        return {
          safe: false,
          reason: `Internal doneness temperature ${temperatureF}°F is below USDA minimum safe internal temperature of 160°F (71°C) for ground meat (9 CFR § 318.23).`,
        };
      }
    }
    // 3. Whole cuts of meat (beef, pork, lamb, veal)
    else if (lower.includes("beef") || lower.includes("pork") || lower.includes("lamb") || lower.includes("veal") || lower.includes("steak") || lower.includes("roast") || lower.includes("chop")) {
      if (temperatureF < 145) {
        return {
          safe: false,
          reason: `Internal doneness temperature ${temperatureF}°F is below USDA minimum safe internal temperature of 145°F (63°C) for whole cuts (FDA Food Code 2022 § 3-401.11).`,
        };
      }
    }
    // 4. Finfish and shellfish
    else if (lower.includes("fish") || lower.includes("salmon") || lower.includes("tuna") || lower.includes("cod") || lower.includes("shrimp") || lower.includes("seafood")) {
      if (temperatureF < 145) {
        return {
          safe: false,
          reason: `Internal doneness temperature ${temperatureF}°F is below FDA minimum safe internal temperature of 145°F (63°C) for fish and shellfish (FDA Food Code 2022 § 3-401.11).`,
        };
      }
    }
  }

  return { safe: true };
}
