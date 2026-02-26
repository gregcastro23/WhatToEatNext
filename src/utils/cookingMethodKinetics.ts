/**
 * Cooking Method Kinetics Calculator
 *
 * Implements the P=IV Circuit Model for cooking methods, producing method-specific
 * KineticMetrics by combining:
 * - The method's intrinsic kinetic profile (voltage, current, resistance)
 * - Transformed ESMS from planetary positions + pillar effects
 * - The method's elemental effects and thermodynamic properties
 *
 * This replaces the generic planetary kinetics with method-aware calculations
 * that differentiate between e.g. "Frying" (high power, high entropy) and
 * "Sous Vide" (low power, low entropy, high stability).
 */

import type { Element } from "@/types/celestial";
import type { CookingMethodKineticProfile } from "@/types/cookingMethod";
import type { AspectPhase, KineticMetrics } from "@/types/kinetics";

// ============================================================================
// Default Kinetic Profiles for ALL cooking methods
// ============================================================================

/**
 * Comprehensive kinetic profiles for all cooking methods.
 * Each profile maps physical cooking properties to the P=IV circuit model.
 *
 * Values are normalized to 0-1 scale where:
 * - voltage: 0 = no temperature differential, 1 = extreme (>500°F above ambient)
 * - current: 0 = no heat transfer, 1 = maximum transfer rate (direct conduction)
 * - resistance: 0 = no impedance, 1 = maximum insulation
 * - velocityFactor: 0 = no transformation, 1 = instant transformation
 * - momentumRetention: 0 = no carry-over cooking, 1 = maximum residual energy
 * - forceImpact: 0 = no structural change, 1 = complete structural breakdown
 */
export const COOKING_METHOD_KINETIC_PROFILES: Record<string, CookingMethodKineticProfile> = {
  // ── Dry Heat Methods ──────────────────────────────────────────────────
  roasting: {
    voltage: 0.70,            // Moderate-high oven temp (300-450°F)
    current: 0.45,            // Air is a poor conductor
    resistance: 0.55,         // Moderate insulation (oven walls reflect)
    velocityFactor: 0.40,     // Slow transformation over extended time
    momentumRetention: 0.75,  // Significant carry-over cooking
    forceImpact: 0.65,        // Substantial structural changes (Maillard, collagen)
  },
  frying: {
    voltage: 0.85,            // Very high oil temp (350-375°F)
    current: 0.90,            // Oil is excellent conductor - direct contact
    resistance: 0.15,         // Minimal barrier between oil and food
    velocityFactor: 0.85,     // Rapid transformation
    momentumRetention: 0.45,  // Moderate carry-over (oil cools quickly once removed)
    forceImpact: 0.80,        // Major structural change (dehydration, crust formation)
  },
  stir_frying: {
    voltage: 0.95,            // Wok heat 600-900°F — highest temp differential of any method
    current: 0.88,            // Direct metal-to-food contact through ultra-thin oil film
    resistance: 0.08,         // Constant tossing maximizes heat contact, minimal barrier
    velocityFactor: 0.95,     // Near-instant transformation — "wok hei" develops in seconds
    momentumRetention: 0.25,  // Small pieces + high surface area = extremely rapid cooling
    forceImpact: 0.72,        // Significant charring but brief — preserves interior tenderness
  },
  grilling: {
    voltage: 0.88,            // High radiant heat from coals/gas
    current: 0.65,            // Radiant + some conductive (grill marks)
    resistance: 0.25,         // Open-air setup, some radiation loss
    velocityFactor: 0.75,     // Fast surface transformation
    momentumRetention: 0.55,  // Moderate carry-over from thick proteins
    forceImpact: 0.75,        // Strong surface charring and structural change
  },
  broiling: {
    voltage: 0.95,            // Extreme radiant heat from above (500-550°F)
    current: 0.70,            // Intense radiation, fast transfer
    resistance: 0.20,         // Direct exposure, minimal barriers
    velocityFactor: 0.88,     // Very fast surface transformation
    momentumRetention: 0.40,  // Lower carry-over (surface-focused)
    forceImpact: 0.85,        // Extreme surface structural impact
  },
  baking: {
    voltage: 0.60,            // Moderate oven heat (325-400°F)
    current: 0.40,            // Air conduction (slow)
    resistance: 0.60,         // Oven insulation, enclosed space
    velocityFactor: 0.35,     // Gradual transformation
    momentumRetention: 0.65,  // Good carry-over in dense items
    forceImpact: 0.70,        // Significant (starch gelatinization, gluten network)
  },

  // ── Wet Heat Methods ──────────────────────────────────────────────────
  steaming: {
    voltage: 0.40,            // Limited by 212°F water boiling point
    current: 0.65,            // Steam is efficient heat carrier
    resistance: 0.30,         // Steam surrounds food evenly
    velocityFactor: 0.50,     // Moderate speed
    momentumRetention: 0.20,  // Low carry-over (steam dissipates quickly)
    forceImpact: 0.25,        // Gentle - preserves structure
  },
  boiling: {
    voltage: 0.50,            // 212°F fixed temp — moderate differential vs ambient
    current: 0.78,            // Excellent conduction through full liquid immersion
    resistance: 0.18,         // Low resistance — water is efficient heat conductor
    velocityFactor: 0.60,     // Moderate transformation speed at rolling boil
    momentumRetention: 0.25,  // Rapid cooling once removed from liquid
    forceImpact: 0.45,        // Moderate structural impact — can toughen proteins
  },
  simmering: {
    voltage: 0.38,            // 185-200°F — lower temp differential than boiling
    current: 0.72,            // Good conduction through liquid, gentle convection
    resistance: 0.22,         // Slightly higher resistance — less turbulent transfer
    velocityFactor: 0.35,     // Slow, gradual transformation over extended time
    momentumRetention: 0.40,  // Heavy pot thermal mass retains heat well
    forceImpact: 0.42,        // Gentle — collagen breakdown without protein toughening
  },
  poaching: {
    voltage: 0.30,            // 140-180°F — gentlest wet heat method
    current: 0.70,            // Good liquid conduction, minimal turbulence
    resistance: 0.22,         // Low resistance from full submersion
    velocityFactor: 0.28,     // Very slow transformation — preserves delicate texture
    momentumRetention: 0.15,  // Rapid cooling of thin, delicate items
    forceImpact: 0.18,        // Minimal structural impact — ideal for eggs, fish
  },
  braising: {
    voltage: 0.50,            // Moderate heat (300-325°F oven)
    current: 0.60,            // Partial liquid + steam conduction
    resistance: 0.40,         // Covered vessel, mixed media
    velocityFactor: 0.25,     // Very slow transformation
    momentumRetention: 0.80,  // High - dense liquid retains heat
    forceImpact: 0.75,        // Significant collagen breakdown over time
  },
  stewing: {
    voltage: 0.42,            // 190-210°F — between simmering and boiling
    current: 0.68,            // Good conduction, items partially submerged
    resistance: 0.32,         // Higher resistance — dense ingredients, thick liquid
    velocityFactor: 0.22,     // Very slow transformation over hours
    momentumRetention: 0.72,  // Excellent — heavy pot, dense liquid retains heat
    forceImpact: 0.68,        // Significant over time — complete collagen breakdown
  },
  sous_vide: {
    voltage: 0.15,            // Very low temp differential (130-185°F, precise)
    current: 0.80,            // Water is excellent conductor
    resistance: 0.85,         // Vacuum bag insulates, precision limits transfer
    velocityFactor: 0.10,     // Extremely slow, controlled transformation
    momentumRetention: 0.90,  // Very high - water bath retains heat perfectly
    forceImpact: 0.15,        // Minimal - precise, gentle
  },
  pressure_cooking: {
    voltage: 0.75,            // High temp from pressure (250°F)
    current: 0.85,            // Pressurized steam, excellent transfer
    resistance: 0.15,         // Pressure forces heat into food
    velocityFactor: 0.80,     // Very fast under pressure
    momentumRetention: 0.60,  // Moderate (pressure drops when opened)
    forceImpact: 0.70,        // Significant structural breakdown (collagen, fiber)
  },

  // ── Molecular Methods ─────────────────────────────────────────────────
  spherification: {
    voltage: 0.10,            // Room temp or slight warming — chemical, not thermal
    current: 0.35,            // Ionic exchange at liquid surface — rapid membrane formation
    resistance: 0.55,         // Moderate — alginate-calcium reaction is fast at interface
    velocityFactor: 0.70,     // Fast — membrane forms in seconds upon contact
    momentumRetention: 0.20,  // Low — spheres are fragile and time-sensitive
    forceImpact: 0.35,        // Surface-only transformation — interior remains liquid
  },
  emulsification: {
    voltage: 0.20,            // Low temp differential — mechanical energy dominates
    current: 0.50,            // Moderate — shear force creates droplet dispersion
    resistance: 0.60,         // High — immiscible phases resist mixing
    velocityFactor: 0.55,     // Moderate — stable emulsion forms in minutes
    momentumRetention: 0.35,  // Low-moderate — emulsions can break over time
    forceImpact: 0.40,        // Moderate — molecular restructuring without cooking
  },
  gelification: {
    voltage: 0.25,            // Warm to cool — hydrocolloids hydrate at various temps
    current: 0.45,            // Moderate — molecular network formation is gradual
    resistance: 0.40,         // Moderate — depends on gelling agent concentration
    velocityFactor: 0.30,     // Moderate — gelation takes minutes to hours
    momentumRetention: 0.65,  // Good — gels maintain structure when set
    forceImpact: 0.55,        // Moderate — complete liquid-to-solid phase transition
  },
  cryo_cooking: {
    voltage: 0.95,            // Extreme temp differential — liquid nitrogen at -321°F
    current: 0.92,            // Rapid heat extraction through direct contact
    resistance: 0.05,         // Near-zero — liquid nitrogen conducts heat instantly
    velocityFactor: 0.98,     // Near-instant — flash freezing in seconds
    momentumRetention: 0.85,  // High — frozen state is very stable
    forceImpact: 0.70,        // Significant — rapid ice crystal formation alters texture
  },

  // ── Traditional Methods ───────────────────────────────────────────────
  fermentation: {
    voltage: 0.05,            // Ambient temp — biological process, not thermal
    current: 0.08,            // Microbial metabolism — extremely slow energy transfer
    resistance: 0.88,         // Very high — cellular barriers, slow diffusion
    velocityFactor: 0.05,     // Slowest of all methods — days to months
    momentumRetention: 0.90,  // Excellent — fermented foods are stable for months/years
    forceImpact: 0.72,        // High — complete biochemical transformation of sugars/proteins
  },
  pickling: {
    voltage: 0.15,            // Brief heat for brine (quick pickle) or ambient (lacto)
    current: 0.20,            // Acid/brine diffusion — moderate molecular transfer
    resistance: 0.65,         // High — cell walls resist acid penetration
    velocityFactor: 0.12,     // Slow — hours for quick pickle, weeks for lacto-fermented
    momentumRetention: 0.88,  // Excellent — pickled foods last months to years
    forceImpact: 0.50,        // Moderate — texture change from acid, cell wall breakdown
  },

  // ── Transformation Methods ────────────────────────────────────────────
  smoking: {
    voltage: 0.45,            // 125-275°F — low-moderate temp differential (cold/hot smoke)
    current: 0.30,            // Indirect heat transfer via smoke particles and convection
    resistance: 0.62,         // High resistance — smoke is poor conductor, air gap
    velocityFactor: 0.15,     // Very slow transformation — hours to days
    momentumRetention: 0.85,  // Excellent — smoke compounds persist in food long after
    forceImpact: 0.55,        // Moderate — surface dehydration + chemical preservation
  },
  dehydrating: {
    voltage: 0.35,            // 95-165°F — low temp, relies on airflow
    current: 0.25,            // Poor heat transfer — convective air drying
    resistance: 0.70,         // High resistance — surface moisture barrier
    velocityFactor: 0.12,     // Extremely slow — hours to days for full dehydration
    momentumRetention: 0.92,  // Highest retention — dehydrated food is shelf-stable
    forceImpact: 0.75,        // Major structural change — complete moisture removal
  },
  curing: {
    voltage: 0.10,            // Ambient or cold temp — osmotic pressure, not heat
    current: 0.12,            // Salt/sugar osmosis — extremely slow molecular transfer
    resistance: 0.80,         // Very high — cellular membranes resist salt penetration
    velocityFactor: 0.08,     // Slowest method — days to weeks for full cure
    momentumRetention: 0.95,  // Highest of all methods — cured food lasts months/years
    forceImpact: 0.60,        // Significant — dehydration and protein cross-linking
  },
  marinating: {
    voltage: 0.08,            // Ambient temp — minimal thermal differential
    current: 0.15,            // Chemical diffusion only — no thermal current
    resistance: 0.75,         // High resistance — slow molecular penetration
    velocityFactor: 0.10,     // Very slow — relies on diffusion gradient over hours
    momentumRetention: 0.55,  // Moderate — flavors persist but fade without reinforcement
    forceImpact: 0.30,        // Limited surface tenderization from acid/enzyme action
  },
  infusing: {
    voltage: 0.30,            // Warm to hot liquid — moderate temp differential
    current: 0.40,            // Solvent extraction — moderate molecular transfer
    resistance: 0.50,         // Medium — depends on surface area and solubility
    velocityFactor: 0.25,     // Moderate — minutes to hours depending on medium
    momentumRetention: 0.45,  // Moderate — infused flavors can dissipate over time
    forceImpact: 0.15,        // Minimal structural change to the infusing medium
  },
  distilling: {
    voltage: 0.88,            // 173-212°F — high heat for vaporization
    current: 0.55,            // Phase-change transfer — energy absorbed by evaporation
    resistance: 0.45,         // Moderate — condenser efficiency determines output
    velocityFactor: 0.40,     // Moderate — continuous process but slow collection
    momentumRetention: 0.80,  // High — distilled product is concentrated and stable
    forceImpact: 0.90,        // Maximum — complete molecular separation
  },

  // ── Raw Methods ───────────────────────────────────────────────────────
  raw: {
    voltage: 0.0,             // No heat applied — zero thermal differential
    current: 0.05,            // Minimal — only enzymatic and mechanical processes
    resistance: 0.95,         // Maximum — no energy input to overcome barriers
    velocityFactor: 0.02,     // Minimal transformation — mechanical prep only
    momentumRetention: 0.10,  // Very low — raw food degrades fastest
    forceImpact: 0.05,        // Minimal — cutting/slicing only
  },
};

// ============================================================================
// Method-Specific Kinetics Calculator
// ============================================================================

interface MethodKineticsInput {
  /** Cooking method identifier (e.g., "roasting", "frying") */
  methodId: string;
  /** Method's elemental effects (Fire, Water, Earth, Air) */
  elementalEffect: Record<string, number>;
  /** Transformed ESMS from planetary positions + pillar effects */
  transformedESMS: { Spirit: number; Essence: number; Matter: number; Substance: number };
  /** Method's thermodynamic properties */
  thermodynamics: { heat: number; entropy: number; reactivity: number };
  /** Greg's Energy for this method */
  gregsEnergy: number;
  /** Monica constant for this method (null if uncalculated) */
  monica: number | null;
  /** Optional kinetic profile from method data (overrides default mapping) */
  kineticProfile?: CookingMethodKineticProfile;
  /** Current planetary positions for astrological modulation */
  planetaryPositions?: Record<string, string>;
}

/**
 * Get the kinetic profile for a method, checking data first then falling back to mapping.
 */
export function getKineticProfile(
  methodId: string,
  dataProfile?: CookingMethodKineticProfile,
): CookingMethodKineticProfile {
  if (dataProfile) return dataProfile;

  // Normalize method name for lookup
  const normalized = methodId.toLowerCase().replace(/[\s-]+/g, "_");

  return COOKING_METHOD_KINETIC_PROFILES[normalized] ?? {
    // Fallback for unknown methods
    voltage: 0.50,
    current: 0.50,
    resistance: 0.50,
    velocityFactor: 0.50,
    momentumRetention: 0.50,
    forceImpact: 0.50,
  };
}

/**
 * Zodiac sign to element mapping
 */
const SIGN_ELEMENT: Record<string, string> = {
  Aries: "Fire", Taurus: "Earth", Gemini: "Air", Cancer: "Water",
  Leo: "Fire", Virgo: "Earth", Libra: "Air", Scorpio: "Water",
  Sagittarius: "Fire", Capricorn: "Earth", Aquarius: "Air", Pisces: "Water",
};

/**
 * Get a planetary element boost factor based on current planetary positions.
 * Methods aligned with the dominant planetary element get a bonus.
 */
function getPlanetaryElementBoost(
  elementalEffect: Record<string, number>,
  planetaryPositions?: Record<string, string>,
): number {
  if (!planetaryPositions) return 1.0;

  // Count elements from planetary positions
  const elementCounts: Record<string, number> = { Fire: 0, Water: 0, Earth: 0, Air: 0 };
  for (const planet of Object.keys(planetaryPositions)) {
    const sign = planetaryPositions[planet];
    const element = SIGN_ELEMENT[sign];
    if (element) elementCounts[element]++;
  }

  // Find the dominant planetary element
  let dominantElement = "Fire";
  let maxCount = 0;
  for (const [el, count] of Object.entries(elementCounts)) {
    if (count > maxCount) {
      maxCount = count;
      dominantElement = el;
    }
  }

  // Boost if the method's primary element matches the dominant planetary element
  const methodElementValue = elementalEffect[dominantElement] ?? 0;
  return 1.0 + methodElementValue * 0.2; // Up to 20% boost
}

/**
 * Calculate method-specific kinetics using the P=IV Circuit Model.
 *
 * This produces unique KineticMetrics for each cooking method by combining
 * the method's intrinsic kinetic profile with its transformed ESMS,
 * elemental effects, and thermodynamic properties.
 *
 * Key differences from generic planetary kinetics:
 * - Each method has distinct voltage/current/resistance values
 * - Velocity is per-element, weighted by the method's elemental emphasis
 * - Momentum accounts for method-specific carry-over potential
 * - Force combines the method's structural impact with electromagnetic effects
 * - Planetary positions modulate the result through element alignment
 */
export function calculateMethodSpecificKinetics(
  input: MethodKineticsInput,
): KineticMetrics {
  const {
    methodId,
    elementalEffect,
    transformedESMS,
    thermodynamics,
    gregsEnergy,
    monica,
    kineticProfile: dataProfile,
    planetaryPositions,
  } = input;

  const profile = getKineticProfile(methodId, dataProfile);
  const planetaryBoost = getPlanetaryElementBoost(elementalEffect, planetaryPositions);
  const monicaValue = monica ?? 1.0;

  // ── 1. Charge (Q) ────────────────────────────────────────────────────
  // Q = Matter + Substance (from transformed ESMS)
  const charge = Math.max(0.01, transformedESMS.Matter + transformedESMS.Substance);

  // ── 2. Potential Difference (V) ───────────────────────────────────────
  // Base voltage from profile, modulated by Greg's Energy
  const potentialDifference = profile.voltage * (1 + gregsEnergy * 0.05) * planetaryBoost;

  // ── 3. Current Flow (I) ──────────────────────────────────────────────
  // Base current from profile, modulated by reactivity
  const currentFlow = profile.current * thermodynamics.reactivity * planetaryBoost;

  // ── 4. Power (P = I × V) ────────────────────────────────────────────
  // Total energy transfer rate, reduced by resistance
  const power = currentFlow * potentialDifference * (1 - profile.resistance * 0.3);

  // ── 5. Velocity per element ──────────────────────────────────────────
  // Each element's transformation speed = elemental emphasis × velocity factor
  const elements: Element[] = ["Fire", "Water", "Earth", "Air"];
  const velocity: Record<Element, number> = { Fire: 0, Water: 0, Earth: 0, Air: 0 };

  for (const element of elements) {
    const emphasis = elementalEffect[element] ?? 0;
    velocity[element] = emphasis * profile.velocityFactor * planetaryBoost;
  }

  // ── 6. Inertia ──────────────────────────────────────────────────────
  // Method inertia from ESMS Matter/Substance + Earth element
  const earthEmphasis = elementalEffect.Earth ?? 0;
  const inertia = Math.max(
    0.5,
    1 + (transformedESMS.Matter + earthEmphasis + transformedESMS.Substance / 2) * 0.1,
  );

  // ── 7. Momentum per element ─────────────────────────────────────────
  // p = inertia × velocity × momentum retention factor
  const momentum: Record<Element, number> = { Fire: 0, Water: 0, Earth: 0, Air: 0 };

  for (const element of elements) {
    momentum[element] = inertia * velocity[element] * profile.momentumRetention;
  }

  // ── 8. Force per element ────────────────────────────────────────────
  // Combined kinetic force (from structural impact) + electromagnetic (Q × V × Monica)
  const force: Record<Element, number> = { Fire: 0, Water: 0, Earth: 0, Air: 0 };
  let forceMagnitudeSq = 0;

  for (const element of elements) {
    const emphasis = elementalEffect[element] ?? 0;
    // Kinetic force: structural impact scaled by elemental emphasis
    const kineticForce = profile.forceImpact * emphasis;
    // Electromagnetic force: charge × (potential + velocity × Monica)
    const emForce = charge * (potentialDifference + velocity[element] * monicaValue) * 0.01;
    // Combined force
    force[element] = (kineticForce + emForce) / 2;
    forceMagnitudeSq += force[element] ** 2;
  }

  const forceMagnitude = Math.sqrt(forceMagnitudeSq);

  // ── 9. Force Classification ─────────────────────────────────────────
  let forceClassification: "accelerating" | "decelerating" | "balanced";
  if (profile.velocityFactor > 0.6 && profile.forceImpact > 0.5) {
    forceClassification = "accelerating";
  } else if (profile.velocityFactor < 0.2 && profile.forceImpact < 0.3) {
    forceClassification = "decelerating";
  } else {
    forceClassification = "balanced";
  }

  // ── 10. Thermal Direction ───────────────────────────────────────────
  const fireEmphasis = elementalEffect.Fire ?? 0;
  const waterEmphasis = elementalEffect.Water ?? 0;
  let thermalDirection: "heating" | "cooling" | "stable";
  if (fireEmphasis > waterEmphasis + 0.2) {
    thermalDirection = "heating";
  } else if (waterEmphasis > fireEmphasis + 0.2) {
    thermalDirection = "cooling";
  } else {
    thermalDirection = "stable";
  }

  // ── 11. Aspect Phase ────────────────────────────────────────────────
  // Derive from method's thermodynamic character + planetary influence
  let aspectPhase: AspectPhase | null = null;
  if (thermodynamics.heat > 0.7 && thermodynamics.reactivity > 0.6) {
    aspectPhase = {
      type: "applying",
      description: "Intense energy building - peak transformation approaching",
      velocityBoost: 0.15 * planetaryBoost,
      powerBoost: 0.25,
    };
  } else if (thermodynamics.entropy > 0.6 && thermodynamics.reactivity > 0.5) {
    aspectPhase = {
      type: "exact",
      description: "Peak transformation energy - maximum alchemical potential",
      powerBoost: 0.30,
    };
  } else if (thermodynamics.heat < 0.4 && thermodynamics.entropy < 0.4) {
    aspectPhase = {
      type: "separating",
      description: "Stable transformation - gentle integration and settling",
    };
  } else {
    aspectPhase = {
      type: "applying",
      description: "Energy building - gradual transformation in progress",
      velocityBoost: 0.10,
      powerBoost: 0.15,
    };
  }

  return {
    velocity,
    momentum,
    charge,
    potentialDifference,
    currentFlow,
    power,
    potential: potentialDifference,
    inertia,
    force,
    forceMagnitude,
    forceClassification,
    aspectPhase,
    thermalDirection,
  };
}
