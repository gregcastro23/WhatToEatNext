import type {
  CookingMethod,
  ElementalProperties,
  ZodiacSignType as _ZodiacSignType,
  ThermodynamicProperties,
} from "./shared";

/**
 * P=IV Circuit Model parameters for a cooking method.
 *
 * Maps physical cooking properties to an electrical circuit analogy:
 * - Voltage (V): Temperature differential / intensity of heat source
 * - Current (I): Rate of heat transfer to food
 * - Resistance (R): Insulation / surface area factors that impede transfer
 * - Power (P = V × I): Total energy transfer rate
 *
 * Kinetic properties describe the method's transformative dynamics:
 * - Velocity: Speed of food state transformation
 * - Momentum retention: Carry-over cooking potential after heat removal
 * - Force impact: Structural impact on food (how much the method changes texture/structure)
 */
export interface CookingMethodKineticProfile {
  /** Temperature differential intensity (0-1). Voltage in P=IV model. */
  voltage: number;
  /** Heat transfer rate (0-1). Current in P=IV model. */
  current: number;
  /** Insulation/surface area resistance (0-1). Higher = more energy loss. */
  resistance: number;
  /** Speed of food transformation (0-1). */
  velocityFactor: number;
  /** Carry-over cooking potential (0-1). How much cooking continues after removal from heat. */
  momentumRetention: number;
  /** Structural impact on food (0-1). How much the method changes food structure. */
  forceImpact: number;
}

/**
 * Interface defining the structure of cooking method data
 */
export interface CookingMethodData {
  name: CookingMethod;
  description: string;
  /** 1-sentence "Alchemist's Hook" for quick visual scanning */
  shortDescription?: string;
  /** Archetypal identity (e.g., "The Forger", "The Purifier") */
  culinaryArchetype?: string;
  elementalEffect: ElementalProperties;
  elementalProperties?: ElementalProperties; // Some methods use this property name instead
  duration: {
    min: number;
    max: number;
  };
  suitable_for: string[];
  benefits: string[];

  // Optional properties
  astrologicalInfluences?: {
    favorableZodiac?: any[];
    unfavorableZodiac?: any[];
    lunarPhaseEffect?: Record<string, number>;
    dominantPlanets?: string[];
    rulingPlanets?: string[];
  };

  thermodynamicProperties?: ThermodynamicProperties;

  toolsRequired?: string[];
  commonMistakes?: string[];
  pairingSuggestions?: string[];
  chemicalChanges?: Record<string, boolean>;
  optimalTemperatures?: Record<string, number>;
  nutrientRetention?: Record<string, number>;
  regionalVariations?: Record<string, string[]>;
  safetyFeatures?: string[];

  // Additional fields that may be used in the application
  culturalOrigin?: string;
  bestFor?: string[];
  seasonalPreference?: string[];
  variations?: CookingMethodData[];
  relatedToMainMethod?: string;

  // Fields used for scoring and recommendations
  score?: number;
  scoreDetails?: Record<string, number>;
  planetaryAffinity?: number;

  // Additional metadata
  history?: string;
  modernVariations?: string[];
  scientificPrinciples?: string[];
  sustainabilityRating?: number;
  equipmentComplexity?: number;
  healthConsiderations?: string[];

  // Detailed cooking technique information
  expertTips?: string[];
  ingredientPreparation?: Record<string, string>;
  timingConsiderations?: Record<string, string>;
  doneness_indicators?: Record<string, string>;
  ingredientInteractions?: Record<string, string>;
  technicalNotes?: Record<string, Record<string, string>>;

  // Alchemical aspects for advanced cooking methods
  alchemicalAspects?: Record<string, Record<string, string>>;

  // P=IV Circuit Model kinetic profile
  kineticProfile?: CookingMethodKineticProfile;
}

// ============================================================================
// Alchemical Method Profiles — "Molecular Alchemy" presentation layer
// (content model for the stitch-designed cooking-methods surfaces)
// ============================================================================

/** Accent palette key for a method's themed surfaces. */
export type MethodAccent =
  | "plasma" // cyan — phase shifts, vapor, precision
  | "ember" // volcanic orange — combustion, radiant heat
  | "emerald" // bioluminescent green — biological/structural transmutation
  | "aqueous" // deep cyan-teal — wet convection, dissolution
  | "solar" // orange-red — radiant desiccation
  | "violet"; // spirit violet — esoteric/infusion methods

export interface MethodEquation {
  /** e.g. "Reaction_Rate = k[Enzyme][Substrate]" */
  expression: string;
  /** e.g. "FUNDAMENTAL_EQUATION", "GOVERNING_EQUATION" */
  label?: string;
  /** e.g. "Where L = Latent Heat of Sublimation, m = Mass" */
  note?: string;
}

export interface MolecularInteractionEntry {
  title: string;
  prose: string;
  /** Chemical formula string, e.g. "C6H12O6 → 2 CH3CHOHCOOH" */
  formula?: string;
  /** Process tag chips, e.g. ["Protease Activity", "Peptide Cleavage"] */
  tags?: string[];
  /** Telemetry-style stat footer, e.g. { label: "LATTICE_DENSITY", value: "0.84 ρ" } */
  dataPoint?: { label: string; value: string };
  /** Activation window, e.g. "120°C – 160°C" */
  temperatureRange?: string;
}

export interface PlanetaryRulerEntry {
  /** Planet name, e.g. "Venus" */
  planet: string;
  rank?: "primary" | "secondary";
  /** Domain caption, e.g. "FLUID DYNAMICS, RECEPTIVITY" */
  governs?: string;
}

/**
 * Editorial "alchemical kinetics" profile for a cooking method — the
 * narrative/scientific content layer rendered by the Molecular Alchemy
 * cooking-methods surfaces. Live numbers (ESMS, Monica, P=IV kinetics)
 * are computed at runtime; this profile holds the curated content.
 */
export interface AlchemicalMethodProfile {
  /** Display name override; defaults to the method data's name. */
  displayName?: string;
  /** Grand epithet, e.g. "The Temporal Synthesis". */
  epithet: string;
  /** Classification badge, e.g. "BIOLOGICAL_TRANSMUTATION". */
  classification: string;
  /** Hero tagline prose (1–2 sentences). */
  tagline: string;
  /** Hero state chips, e.g. [{ label: "PHASE", value: "ANAEROBIC" }]. */
  stateChips?: Array<{ label: string; value: string }>;
  kinetics: {
    /** Qualitative voltage descriptor, e.g. "LOW / CONSTANT". */
    voltage: string;
    /** Qualitative current descriptor, e.g. "FLUID (CONVECTION)". */
    current: string;
    /** Optional third kinetic variable, e.g. "THERMAL_SHOCK". */
    catalyst?: string;
    prose: string;
    equations: MethodEquation[];
  };
  /** Per-element parenthetical roles, e.g. { Water: "Solvent", Earth: "Substrate" }. */
  elementalRoles?: Partial<Record<"Fire" | "Water" | "Earth" | "Air", string>>;
  /** Descriptor tag chips, e.g. ["Vaporous", "Expanding", "Ascending"]. */
  descriptorTags?: string[];
  planetaryRulers: PlanetaryRulerEntry[];
  /** Prose footnote under the rulership panel. */
  rulershipNote?: string;
  molecularInteractions: MolecularInteractionEntry[];
  /** Verified-outcome checklist, e.g. ["Cellular integrity maintained >94%"]. */
  checklist?: string[];
  /** Hero diagram path under /public, e.g. "/images/methods/fermentation.webp". */
  image?: string;
  imageAlt?: string;
  accent: MethodAccent;
}

// Export alias for compatibility
export type { CookingMethod } from "./shared";
