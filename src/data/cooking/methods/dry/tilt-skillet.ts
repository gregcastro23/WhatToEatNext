import type { CookingMethodData } from "@/types/cookingMethod";

/**
 * Tilt Skillet (tilting braising pan)
 *
 * A large flat-bottomed commercial pan that both sears at high heat and braises in liquid —
 * the workhorse vessel for large-batch cooking. Its broad conductive floor delivers a hard sear,
 * while the lid + tilt mechanism let it pivot into a covered braise and pour off at volume. Filed
 * under dry heat (it is primarily a flat conductive griddle) but carries a strong Water component
 * for its braising mode.
 */
export const _tiltSkillet: CookingMethodData = {
  name: "tilt-skillet",
  description:
    "A large flat-bottomed tilting skillet that sears, sautés, and fries on a broad conductive floor, then pivots into a covered braise or simmer — the high-throughput vessel for planning large-batch cooking in stages.",
  shortDescription:
    "Sears hard on a broad steel floor, then tilts into a covered braise — built for batches.",
  culinaryArchetype: "The Foundry",
  elementalEffect: {
    Fire: 0.55, // Broad conductive sear across a hot steel floor
    Water: 0.25, // Covered braise/simmer mode at volume
    Earth: 0.12, // Large thermal mass + the bulk of a full batch
    Air: 0.08, // Open-pan evaporation during reduction
  },
  duration: {
    min: 15, // A quick batch sauté/sear
    max: 180, // A full sear-then-braise across a large batch
  },
  suitable_for: [
    "large-batch braises and stews",
    "seared proteins in volume",
    "sautéed vegetables at scale",
    "pan sauces and reductions",
    "shallow fries",
    "breakfast/brunch service",
    "one-pan batch meals",
  ],
  benefits: [
    "high-volume throughput",
    "dual sear-then-braise in one vessel",
    "even flat-top heat distribution",
    "fond development for deep sauces",
    "batch-to-batch consistency",
    "controlled liquid reduction at scale",
  ],
  astrologicalInfluences: {
    favorableZodiac: ["aries", "leo", "capricorn"] as any[],
    unfavorableZodiac: ["pisces", "cancer", "libra"] as any[],
    dominantPlanets: ["Mars", "Saturn", "Sun"],
    lunarPhaseEffect: {
      full_moon: 1.2, // Searing/fond development peaks
      new_moon: 0.95, // Gentler braise-leaning service
      first_quarter: 1.1, // Balanced sear + braise
      third_quarter: 1.0, // Steady reduction
    },
  },
  toolsRequired: [
    "Tilting braising pan / tilt skillet",
    "Long-handled flat spatula or paddle",
    "High-BTU burner or built-in element",
    "Lid for the braise phase",
    "Staging pans for sequential batches",
    "Probe thermometer",
  ],
  commonMistakes: [
    "overcrowding the floor (steaming instead of searing)",
    "searing too large a batch at once instead of in waves",
    "deglazing before the fond has developed",
    "adding braising liquid while still in sear mode",
    "uneven ingredient sizing across a big batch",
  ],
  pairingSuggestions: [
    "Grains or starches to absorb the braising liquid",
    "Bright acidic finishes to cut the long-cooked richness",
    "Fresh herbs added off-heat",
    "Crisp garnishes for textural contrast",
  ],
  nutrientRetention: {
    vitamins: 0.7,
    minerals: 0.85,
    proteins: 0.9,
    antioxidants: 0.65,
  },
  optimalTemperatures: {
    searing: 425,
    sauteing: 375,
    braising: 300,
    reduction: 340,
    preheating_floor: 450,
  },
  regionalVariations: {
    institutional: ["batch braising for cafeterias", "banquet-scale sear-and-hold"],
    french: ["braisé à la plaque", "large-format daube"],
    american: ["diner flat-top batch service", "chili and stew lines"],
  },
  chemicalChanges: {
    maillard_reaction: true,
    caramelization: true,
    fond_development: true,
    collagen_to_gelatin: true,
    liquid_reduction: true,
  },
  safetyFeatures: [
    "Lock the tilt mechanism before loading",
    "Pour off hot liquid away from the body",
    "Mind steam release when lifting the lid",
    "Keep the broad floor evenly loaded to avoid hot spots",
    "Use long heat-resistant gloves for the large surface",
  ],
  thermodynamicProperties: {
    heat: 0.78, // Hard sear on a broad floor, moderated by the braise phase
    entropy: 0.5, // Significant structural breakdown over a long braise
    reactivity: 0.7, // Strong Maillard/fond reactivity in the sear phase
    gregsEnergy: -7.5, // fallback display value; the live engine recomputes from ESMS + elements
  } as any,

  kineticProfile: {
    voltage: 0.78, // High floor temperature, below a wok's extreme but broad and sustained
    current: 0.82, // Direct metal-to-food contact across the whole flat floor
    resistance: 0.18, // Low while searing; the lid adds some barrier in braise mode
    velocityFactor: 0.6, // Blended: fast sear, slow braise
    momentumRetention: 0.6, // Large thermal mass + batch volume hold heat well (strong carry-over)
    forceImpact: 0.7, // Substantial structural change across both phases
  },

  history:
    "The tilting skillet (tilting braising pan) emerged in mid-20th-century institutional kitchens as a single vessel that could sear, fry, braise, and pour off at scale, replacing several specialized pieces. Its broad, shallow, tilting body made high-volume sear-then-braise cooking practical for cafeterias, banquets, and production lines.",

  scientificPrinciples: [
    "A broad flat steel floor maximizes conductive contact area for an even sear",
    "Large thermal mass buffers temperature drops when a full batch is loaded",
    "Sequential staging matches each ingredient's cook time within one vessel",
    "Maillard browning in the sear phase builds fond that flavors the later braise",
    "The lid traps vapor to shift from dry conduction to moist convective braising",
    "Tilting enables controlled reduction and clean pour-off of large liquid volumes",
  ],

  modernVariations: [
    "Induction tilting skillets for precise floor-temperature control",
    "Programmable sear-then-braise cycles for unattended batch runs",
    "Sous-vide hold then flat-top batch sear to finish",
    "Energy-recovery lids that cut reduction time at scale",
  ],

  sustainabilityRating: 0.7, // One vessel replaces several; efficient at volume but energy-intensive

  equipmentComplexity: 0.6, // Specialized commercial equipment, straightforward technique

  healthConsiderations: [
    "Sear in waves with minimal oil rather than deep-frying the batch",
    "The braise phase retains water-soluble nutrients in the reduced liquid",
    "Long high-heat searing can form some Maillard byproducts",
    "Skim rendered fat after braising to control richness",
    "Salt and fat are easily adjusted across the whole batch",
  ],
};

export const tiltSkillet = _tiltSkillet;
