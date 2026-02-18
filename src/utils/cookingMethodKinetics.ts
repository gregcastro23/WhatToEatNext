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
import type { AspectPhase, KineticMetrics } from "@/types/kinetics";
import type { CookingMethodKineticProfile } from "@/types/cookingMethod";

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
    voltage: 0.90,            // Extreme wok heat (>600°F)
    current: 0.85,            // Direct metal-to-food contact
    resistance: 0.10,         // Very thin oil film, max contact
    velocityFactor: 0.92,     // Near-instant transformation (wok hei)
    momentumRetention: 0.30,  // Low carry-over (small pieces cool fast)
    forceImpact: 0.70,        // Significant but brief structural change
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
    voltage: 0.50,            // Constant at 212°F (100°C at sea level)
    current: 0.75,            // Water is excellent conductor - full submersion
    resistance: 0.20,         // Direct liquid contact
    velocityFactor: 0.60,     // Moderate-fast (turbulent convection)
    momentumRetention: 0.25,  // Low carry-over
    forceImpact: 0.45,        // Moderate structural impact (can break down fibers)
  },
  simmering: {
    voltage: 0.38,            // Just below boiling (185-205°F)
    current: 0.70,            // Good liquid conduction
    resistance: 0.25,         // Full liquid contact
    velocityFactor: 0.35,     // Slow, gentle transformation
    momentumRetention: 0.35,  // Some carry-over in liquid
    forceImpact: 0.40,        // Moderate (gentle breakdown over time)
  },
  poaching: {
    voltage: 0.30,            // Low temperature (160-180°F)
    current: 0.70,            // Good liquid conduction
    resistance: 0.25,         // Full liquid contact
    velocityFactor: 0.30,     // Slow, very gentle
    momentumRetention: 0.15,  // Minimal carry-over
    forceImpact: 0.20,        // Very gentle - preserves delicate structure
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
    voltage: 0.45,            // Moderate-low heat
    current: 0.65,            // Full liquid submersion
    resistance: 0.35,         // Covered pot
    velocityFactor: 0.25,     // Slow
    momentumRetention: 0.70,  // High in liquid mass
    forceImpact: 0.65,        // Significant breakdown of proteins/vegetables
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
    voltage: 0.10,            // Near room temperature
    current: 0.30,            // Chemical diffusion (slow)
    resistance: 0.70,         // Gel membrane forms as barrier
    velocityFactor: 0.45,     // Medium (chemical reaction is quick, but delicate)
    momentumRetention: 0.10,  // No thermal carry-over
    forceImpact: 0.60,        // Total structural transformation (liquid → gel sphere)
  },
  emulsification: {
    voltage: 0.20,            // Low heat or room temp
    current: 0.50,            // Mechanical energy (whisking/blending)
    resistance: 0.45,         // Surface tension resistance
    velocityFactor: 0.55,     // Moderate speed with mechanical input
    momentumRetention: 0.05,  // Minimal thermal carry-over
    forceImpact: 0.55,        // Structural change (separate liquids → unified)
  },
  gelification: {
    voltage: 0.25,            // Low heat then cooling
    current: 0.35,            // Chemical diffusion
    resistance: 0.60,         // Gel network resists further change
    velocityFactor: 0.20,     // Slow (gelation takes time)
    momentumRetention: 0.15,  // Minimal
    forceImpact: 0.65,        // Major structural change (liquid → solid gel)
  },
  cryo_cooking: {
    voltage: 0.95,            // Extreme temperature differential (liquid nitrogen: -321°F)
    current: 0.92,            // Direct cryogenic contact
    resistance: 0.10,         // No barrier
    velocityFactor: 0.98,     // Near-instant freezing
    momentumRetention: 0.05,  // No carry-over (items stay frozen)
    forceImpact: 0.90,        // Extreme structural change (ice crystal formation)
  },

  // ── Traditional Methods ───────────────────────────────────────────────
  fermentation: {
    voltage: 0.05,            // Near ambient temperature
    current: 0.05,            // Biological heat (negligible)
    resistance: 0.90,         // Very slow, self-regulating
    velocityFactor: 0.03,     // Extremely slow (days to weeks)
    momentumRetention: 0.95,  // Maximum - fermentation continues indefinitely
    forceImpact: 0.85,        // Profound structural/chemical transformation
  },
  pickling: {
    voltage: 0.10,            // Room temp or brief boil for brine
    current: 0.15,            // Chemical diffusion (acid penetration)
    resistance: 0.80,         // Slow acid penetration
    velocityFactor: 0.05,     // Very slow
    momentumRetention: 0.92,  // Process continues in jar
    forceImpact: 0.60,        // Moderate structural change (texture, flavor)
  },

  // ── Transformation Methods ────────────────────────────────────────────
  smoking: {
    voltage: 0.45,            // Low-moderate heat (225-275°F for hot smoke)
    current: 0.35,            // Smoke particles carry flavor, not much heat
    resistance: 0.55,         // Smoke is diffuse medium
    velocityFactor: 0.15,     // Slow transformation
    momentumRetention: 0.70,  // Residual smoke flavor continues developing
    forceImpact: 0.55,        // Moderate (surface dehydration, flavor penetration)
  },
  dehydrating: {
    voltage: 0.30,            // Low heat (125-160°F)
    current: 0.25,            // Air circulation, slow transfer
    resistance: 0.65,         // Low-temp air is poor conductor
    velocityFactor: 0.08,     // Very slow (hours)
    momentumRetention: 0.85,  // Continues drying after removal
    forceImpact: 0.70,        // Significant (moisture removal changes structure)
  },
  curing: {
    voltage: 0.05,            // Ambient or refrigerator temp
    current: 0.10,            // Salt/chemical diffusion
    resistance: 0.85,         // Slow osmotic process
    velocityFactor: 0.04,     // Extremely slow (days to months)
    momentumRetention: 0.93,  // Process continues
    forceImpact: 0.75,        // Major (protein denaturation via chemistry, not heat)
  },
  marinating: {
    voltage: 0.08,            // Room temp or refrigerated
    current: 0.20,            // Acid/enzyme diffusion
    resistance: 0.70,         // Surface absorption is slow
    velocityFactor: 0.10,     // Slow (hours)
    momentumRetention: 0.40,  // Some continued absorption
    forceImpact: 0.35,        // Moderate surface impact
  },
  infusing: {
    voltage: 0.35,            // Low-moderate heat
    current: 0.30,            // Flavor compound diffusion
    resistance: 0.60,         // Medium dissolves compounds slowly
    velocityFactor: 0.20,     // Slow
    momentumRetention: 0.50,  // Flavors continue developing
    forceImpact: 0.20,        // Minimal structural change
  },
  distilling: {
    voltage: 0.80,            // High heat to vaporize
    current: 0.50,            // Phase change transfer
    resistance: 0.40,         // Condensation system
    velocityFactor: 0.45,     // Moderate (phase changes take energy)
    momentumRetention: 0.30,  // Distillate is stable
    forceImpact: 0.95,        // Complete structural transformation (liquid→vapor→liquid)
  },

  // ── Raw Methods ───────────────────────────────────────────────────────
  raw: {
    voltage: 0.0,             // No heat applied
    current: 0.0,             // No heat transfer
    resistance: 1.0,          // Maximum resistance (no cooking)
    velocityFactor: 0.0,      // No transformation
    momentumRetention: 0.0,   // No carry-over
    forceImpact: 0.0,         // No structural change from cooking
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
