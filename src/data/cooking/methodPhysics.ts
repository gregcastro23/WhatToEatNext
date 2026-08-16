/**
 * Per-method culinary heat- and mass-transfer physics.
 *
 * This is the layer that answers "why is this method different from that one"
 * in terms a physicist and a cook would both accept. It is deliberately
 * separate from `src/data/cooking/methods/*` (culinary content), from
 * `physicalReference.ts` (temperature and pressure envelopes) and from
 * everything alchemical.
 *
 * ── The one number that explains cooking ────────────────────────────────────
 *
 * Surface heat transfer coefficient, h, in W·m⁻²·K⁻¹. It spans four orders of
 * magnitude across the methods below, and it — not temperature — is why the
 * kitchen behaves the way it does:
 *
 *   still-air oven      ~25      175 °C  →  25 min to core a 25 mm steak
 *   boiling water     ~3000      100 °C  →   9 min
 *   condensing steam  ~9000      100 °C  →   9 min
 *
 * A 100 °C pot beats a 175 °C oven by nearly 3× because water moves heat about
 * 120× better than still air. Every cook knows this as a fact about their
 * kitchen; h is the reason.
 *
 * ── Not everything is a heat-transfer problem ───────────────────────────────
 *
 * Fermentation, curing, pickling, marinating and spherification are limited by
 * mass transfer, reaction kinetics or microbial growth — not by heat. Quoting
 * an h for them would be a category error dressed up as rigour, so each method
 * declares its `rateLimiter` and the UI is expected to honour it.
 *
 * ── Basis ───────────────────────────────────────────────────────────────────
 *
 * h ranges are the conventional published bands for each transfer regime
 * (Incropera & DeWitt, *Fundamentals of Heat and Mass Transfer*, Table 1.1 for
 * the regime bands; Singh & Heldman, *Introduction to Food Engineering*, for
 * the food-process values). Reaction-onset temperatures are the standard food
 * chemistry figures (McGee, *On Food and Cooking*). Where a value is a
 * representative mid-band figure rather than a measurement it says so.
 *
 * These are RANGES because they genuinely are ranges — a convection oven at
 * 2 m/s and at 5 m/s differ by 2×. Anything presenting a single number here as
 * exact is misrepresenting it.
 *
 * @file src/data/cooking/methodPhysics.ts
 */

/** What actually sets the pace of the method. */
export type RateLimiter =
  | "heat-transfer"
  | "mass-transfer"
  | "reaction-kinetics"
  | "microbial"
  | "phase-change";

/**
 * How elevation acts on a method.
 *
 * `penalised`  — the pace tracks the water ceiling, which falls with elevation.
 * `compensated`— the method restores or exceeds the sea-level ceiling by design.
 * `accelerated`— lower ambient pressure genuinely helps (vapour-pressure driven).
 * `unaffected` — no first-order dependence.
 */
export type AltitudeResponse = "penalised" | "compensated" | "accelerated" | "unaffected";

/** Fractional contribution of each transfer mode. Sums to 1. */
export interface TransferModes {
  conduction: number;
  convection: number;
  radiation: number;
  /** Latent heat — condensing steam onto food, or boiling water off it. */
  phaseChange: number;
}

export interface HeatTransferCoefficient {
  low: number;
  typical: number;
  high: number;
  /** The physical regime this band comes from. */
  regime: string;
}

export interface ReactionThreshold {
  name: string;
  /** Onset temperature, °C. */
  onsetC: number;
  note: string;
}

export interface MethodPhysicsProfile {
  /** What sets the pace. Governs which readouts the UI may legitimately show. */
  rateLimiter: RateLimiter;
  modes: TransferModes;
  /** Null when the method is not heat-transfer limited — see `rateLimiter`. */
  h: HeatTransferCoefficient | null;
  /**
   * Temperature of the medium doing the work, °C. This is the driving
   * temperature in the transient solution — NOT a dial setting, and for wet
   * methods NOT independent of pressure.
   */
  mediumC: number;
  /**
   * Set ONLY when `mediumC` legitimately falls outside the method's published
   * temperature envelope, explaining why.
   *
   * Braising is the case that forces this field to exist: the envelope
   * (275–350 °F) is the OVEN SETTING, while the food sits in liquid that
   * cannot exceed the boiling point — about 203 °F. Both numbers are correct
   * and they describe different things, and the difference is the single most
   * useful thing to know about braising. Collapsing them would have destroyed
   * exactly the nuance this layer exists to surface.
   */
  mediumDivergenceNote?: string;
  /**
   * Can the food surface exceed the boiling point of water?
   * Decides whether browning chemistry is available at all: a surface pinned
   * at 100 °C by evaporation can never reach the ~140 °C Maillard threshold.
   */
  surfaceCanBrown: boolean;
  /** Net radiant flux onto the food, kW·m⁻². Only where radiation is material. */
  radiantFluxKwM2?: number;
  /** Effective radiating source temperature, K. */
  radiantSourceK?: number;
  /** Which direction water moves. */
  moistureFlux: "into-food" | "out-of-food" | "neutral" | "held";
  /** Reactions this method is chosen to drive, with their onset temperatures. */
  reactions: ReactionThreshold[];
  /** How altitude changes this method, in one line. */
  altitudeNote: string;
  /**
   * How elevation changes this method. Direction matters: a pressure cooker is
   * altitude-SENSITIVE and altitude-COMPENSATING, and a boolean cannot say so.
   */
  altitudeResponse: AltitudeResponse;
  /** How ambient humidity changes this method. */
  humidityNote: string;
  /** The cookware property that matters most here. */
  equipmentPriority: "recovery" | "spreading" | "thermal-mass" | "inertness" | "sealing" | "airflow";
  /** Material ids from `cookwareMaterials.ts`. */
  recommendedMaterials: string[];
  /** The equipment insight a cook can act on. */
  equipmentNote: string;
}

// ── Shared reaction thresholds ──────────────────────────────────────────────
// Defined once so a threshold cannot drift between methods.

const MAILLARD: ReactionThreshold = {
  name: "Maillard browning",
  onsetC: 140,
  note: "Amino acid + reducing sugar. Negligible below ~140 °C, then rises steeply — which is why a surface pinned at 100 °C by evaporation never browns.",
};
const CARAMELISATION: ReactionThreshold = {
  name: "Caramelisation",
  onsetC: 160,
  note: "Sugar breaking down without protein. Sucrose ~160 °C; fructose starts near 110 °C, which is why honeyed and fruit-sugar surfaces colour first.",
};
const STARCH_GEL: ReactionThreshold = {
  name: "Starch gelatinisation",
  onsetC: 60,
  note: "Granules absorb water and swell. Potato ~58–66 °C, wheat ~52–85 °C, rice ~61–78 °C — the reason a raw-centred potato is a temperature failure, not a time one.",
};
const COLLAGEN: ReactionThreshold = {
  name: "Collagen → gelatin",
  onsetC: 60,
  note: "Shrinks from ~60 °C, converts to gelatin only when held far longer. Conversion is time-at-temperature, not a threshold you cross.",
};
const PROTEIN_DENAT: ReactionThreshold = {
  name: "Protein denaturation",
  onsetC: 50,
  note: "Myosin from ~50 °C, actin from ~66 °C. The window between them is the whole of doneness: past actin, muscle expels water and turns dry.",
};
const PECTIN: ReactionThreshold = {
  name: "Pectin solubilisation",
  onsetC: 83,
  note: "Vegetable cell walls only soften above ~83 °C, which is why a vegetable can sit in a 70 °C bath indefinitely and stay crunchy.",
};
const ENZYME_KILL: ReactionThreshold = {
  name: "Enzyme deactivation",
  onsetC: 70,
  note: "Most food enzymes denature between 60 and 80 °C — the point of blanching before freezing.",
};
const FAT_RENDER: ReactionThreshold = {
  name: "Fat rendering",
  onsetC: 55,
  note: "Adipose collagen releases its fat from ~55 °C; the fat itself melts lower still, but stays trapped until the matrix goes.",
};
const WATER_BOIL: ReactionThreshold = {
  name: "Water vaporisation",
  onsetC: 100,
  note: "At sea level. This is a hard ceiling on any wet surface and it moves with altitude.",
};

// ── Profiles ────────────────────────────────────────────────────────────────

export const METHOD_PHYSICS: Record<string, MethodPhysicsProfile> = {
  // ══ DRY HEAT ══════════════════════════════════════════════════════════════
  roasting: {
    rateLimiter: "heat-transfer",
    modes: { conduction: 0.05, convection: 0.55, radiation: 0.4, phaseChange: 0 },
    h: { low: 10, typical: 25, high: 60, regime: "Natural to forced convection in air, plus oven-wall radiation. A fan roughly doubles it." },
    mediumC: 190,
    surfaceCanBrown: true,
    radiantFluxKwM2: 1.9,
    radiantSourceK: 505,
    moistureFlux: "out-of-food",
    reactions: [MAILLARD, CARAMELISATION, COLLAGEN, FAT_RENDER, WATER_BOIL],
    altitudeResponse: "unaffected",
    altitudeNote:
      "Oven air temperature is unaffected by altitude. What changes is the surface: the evaporative ceiling drops with the boiling point, so crusts set at a lower surface temperature and food dries faster in the thinner air.",
    humidityNote:
      "Steam injection raises the evaporative ceiling and holds the surface wet, moving heat inward faster while DELAYING crust formation. Bread ovens exploit exactly this — steam first for oven spring, dry after for crust.",
    equipmentPriority: "thermal-mass",
    recommendedMaterials: ["cast_iron", "enamelled_cast_iron", "stoneware"],
    equipmentNote:
      "A heavy pan is a radiant surface, not just a container: it re-emits into the food's underside. A thin sheet pan browns bases poorly because it has nothing stored to give.",
  },

  frying: {
    rateLimiter: "heat-transfer",
    modes: { conduction: 0.1, convection: 0.55, radiation: 0, phaseChange: 0.35 },
    h: { low: 250, typical: 500, high: 1000, regime: "Forced convection in oil, hugely amplified by the food's own moisture boiling off — the bubbling IS the heat transfer." },
    mediumC: 177,
    surfaceCanBrown: true,
    moistureFlux: "out-of-food",
    reactions: [MAILLARD, CARAMELISATION, STARCH_GEL, WATER_BOIL],
    altitudeResponse: "unaffected",
    altitudeNote:
      "Oil temperature is set by the burner, not the atmosphere. But the moisture leaving the food boils at a lower temperature, so the crust sets sooner relative to the interior — thin at altitude, or the middle lags.",
    humidityNote:
      "Ambient humidity barely reaches the oil. Surface moisture on the food matters enormously: a wet surface dumps its latent heat into the oil and drops the whole bath temperature.",
    equipmentPriority: "recovery",
    recommendedMaterials: ["cast_iron", "carbon_steel"],
    equipmentNote:
      "Oil volume is a thermal battery. Frying in a shallow pan of oil crashes the temperature the moment food goes in, and everything after that is absorption instead of crust.",
  },

  stir_frying: {
    rateLimiter: "heat-transfer",
    modes: { conduction: 0.65, convection: 0.25, radiation: 0.1, phaseChange: 0 },
    h: { low: 400, typical: 1000, high: 2000, regime: "Near-direct metal-to-food conduction through a micron-scale oil film, refreshed constantly by tossing." },
    mediumC: 205,
    surfaceCanBrown: true,
    moistureFlux: "out-of-food",
    reactions: [MAILLARD, CARAMELISATION, PROTEIN_DENAT, WATER_BOIL],
    altitudeResponse: "unaffected",
    altitudeNote:
      "Effectively altitude-independent. Contact times are seconds, far too short for the interior to notice a shifted boiling point.",
    humidityNote:
      "Wet ingredients are the enemy. Water hitting the pan floor consumes ~2.26 MJ per kg as latent heat and instantly converts a sear into a steam bath.",
    equipmentPriority: "recovery",
    recommendedMaterials: ["carbon_steel", "cast_iron"],
    equipmentNote:
      "Carbon steel at 2 mm has roughly half the stored heat of 5 mm cast iron, so a wok recovers from the burner rather than from its own mass — which is why wok cooking needs a burner an ordinary hob cannot match, and why crowding kills it.",
  },

  tilt_skillet: {
    rateLimiter: "heat-transfer",
    modes: { conduction: 0.6, convection: 0.3, radiation: 0.05, phaseChange: 0.05 },
    h: { low: 300, typical: 700, high: 1500, regime: "Flat-floor conduction across the whole batch while searing; drops toward covered convection once the lid goes on." },
    mediumC: 218,
    surfaceCanBrown: true,
    moistureFlux: "out-of-food",
    reactions: [MAILLARD, COLLAGEN, FAT_RENDER, WATER_BOIL],
    altitudeResponse: "penalised",
    altitudeNote:
      "The sear phase does not care; the covered braise phase does. Once the lid traps vapour, the liquid ceiling follows the local boiling point and the braise runs cooler and slower.",
    humidityNote:
      "The lid is a humidity control. Cracking it converts the covered phase from a hold at the evaporative ceiling to a reduction, which is the whole difference between braising and roasting in one vessel.",
    equipmentPriority: "spreading",
    recommendedMaterials: ["cast_iron", "aluminium"],
    equipmentNote:
      "The defining problem is area: a large floor over discrete burners makes spreading conductance the binding constraint, not stored mass. Thin spots scorch while the far corner is still grey.",
  },

  grilling: {
    rateLimiter: "heat-transfer",
    modes: { conduction: 0.15, convection: 0.15, radiation: 0.7, phaseChange: 0 },
    h: { low: 20, typical: 60, high: 120, regime: "Radiation-dominated. The convective h is small; the linearised radiative component carries most of the load." },
    mediumC: 260,
    surfaceCanBrown: true,
    radiantFluxKwM2: 98.7,
    radiantSourceK: 1200,
    moistureFlux: "out-of-food",
    reactions: [MAILLARD, CARAMELISATION, PROTEIN_DENAT, FAT_RENDER],
    altitudeResponse: "unaffected",
    altitudeNote:
      "Radiant flux is independent of pressure. Combustion is slightly less vigorous in thinner air, so a charcoal bed runs marginally cooler — a second-order effect.",
    humidityNote:
      "Ambient humidity is irrelevant against a 100 kW·m⁻² flux. Surface moisture on the food is not: it must evaporate before the surface can pass 100 °C, so a dry surface is the entire secret of grill marks.",
    equipmentPriority: "thermal-mass",
    recommendedMaterials: ["cast_iron"],
    equipmentNote:
      "Grate mass sets the mark, not the fire. A thin wire grate contacts briefly and gives faint stripes; heavy cast iron bars store enough to conduct a genuine sear into the contact line.",
  },

  broiling: {
    rateLimiter: "heat-transfer",
    modes: { conduction: 0.05, convection: 0.15, radiation: 0.8, phaseChange: 0 },
    h: { low: 25, typical: 70, high: 130, regime: "Top-down radiation from a glowing element; convection is incidental in a vented cavity." },
    mediumC: 274,
    surfaceCanBrown: true,
    radiantFluxKwM2: 69.3,
    radiantSourceK: 1100,
    moistureFlux: "out-of-food",
    reactions: [MAILLARD, CARAMELISATION, WATER_BOIL],
    altitudeResponse: "unaffected",
    altitudeNote: "Radiant flux is pressure-independent. No meaningful altitude correction.",
    humidityNote:
      "Negligible. The flux is high enough to drive off surface water in seconds regardless of the cavity's humidity.",
    equipmentPriority: "spreading",
    recommendedMaterials: ["cast_iron", "stainless_304"],
    equipmentNote:
      "Distance is the only real dial, and it is inverse-square: moving from 4 to 2 inches roughly quadruples the flux. Most broiling failures are a rack-position problem, not a timing one.",
  },

  // ══ WET HEAT ══════════════════════════════════════════════════════════════
  sous_vide: {
    rateLimiter: "heat-transfer",
    modes: { conduction: 0.2, convection: 0.8, radiation: 0, phaseChange: 0 },
    h: { low: 60, typical: 95, high: 200, regime: "Forced convection in a circulated water bath. Low for a liquid because the bag adds a resistance and flow is gentle." },
    mediumC: 60,
    surfaceCanBrown: false,
    moistureFlux: "held",
    reactions: [PROTEIN_DENAT, COLLAGEN, FAT_RENDER],
    altitudeResponse: "unaffected",
    altitudeNote:
      "Below boiling everywhere on Earth, so the bath temperature is exactly what the controller says. The one method altitude leaves alone entirely.",
    humidityNote: "Sealed. Ambient humidity cannot reach the food.",
    equipmentPriority: "sealing",
    recommendedMaterials: ["stainless_304", "borosilicate_glass"],
    equipmentNote:
      "Circulation is the variable that matters. A still bath drops h from ~95 to well under 40, and a bag pressed against the wall can leave a cold face that no amount of extra time fixes.",
  },

  boiling: {
    rateLimiter: "heat-transfer",
    modes: { conduction: 0.05, convection: 0.7, radiation: 0, phaseChange: 0.25 },
    h: { low: 1000, typical: 3000, high: 6000, regime: "Vigorous convection with nucleate boiling at the vessel wall — among the highest coefficients in the kitchen." },
    mediumC: 100,
    surfaceCanBrown: false,
    moistureFlux: "into-food",
    reactions: [STARCH_GEL, PECTIN, ENZYME_KILL, PROTEIN_DENAT, WATER_BOIL],
    altitudeResponse: "penalised",
    altitudeNote:
      "The definitive altitude-sensitive method. The medium temperature IS the boiling point, so it falls with elevation: 100 °C at sea level, 94.7 °C in Denver, 90.0 °C at 3000 m — roughly doubling softening times at 3000 m.",
    humidityNote: "Irrelevant. The food is immersed; ambient air never touches it.",
    equipmentPriority: "thermal-mass",
    recommendedMaterials: ["aluminium", "stainless_304"],
    equipmentNote:
      "Water volume outranks pan material. A large pot barely dips when pasta goes in; a small one falls off the boil and the starch leaches while it climbs back.",
  },

  steaming: {
    rateLimiter: "phase-change",
    modes: { conduction: 0, convection: 0.15, radiation: 0, phaseChange: 0.85 },
    h: { low: 5000, typical: 9000, high: 15000, regime: "Condensing steam. Each kilogram condensing on the food releases ~2.26 MJ of latent heat, giving the highest coefficients of any atmospheric method." },
    mediumC: 100,
    surfaceCanBrown: false,
    moistureFlux: "into-food",
    reactions: [STARCH_GEL, PECTIN, ENZYME_KILL, PROTEIN_DENAT],
    altitudeResponse: "penalised",
    altitudeNote:
      "Capped by the boiling point exactly as boiling is. The enormous h cannot compensate — you cannot drive heat with a temperature difference that no longer exists.",
    humidityNote: "Saturated by definition. This is the 100 % RH case.",
    equipmentPriority: "sealing",
    recommendedMaterials: ["stoneware", "stainless_304"],
    equipmentNote:
      "Bamboo beats metal for dumplings for one reason: it absorbs condensate instead of dripping it back. A metal lid rains onto the food and makes skins soggy.",
  },

  braising: {
    rateLimiter: "heat-transfer",
    modes: { conduction: 0.1, convection: 0.5, radiation: 0.05, phaseChange: 0.35 },
    h: { low: 200, typical: 600, high: 1500, regime: "Split environment — liquid convection below the waterline, condensing steam above it. The two halves cook at different rates." },
    mediumC: 95,
    mediumDivergenceNote:
      "The 275–350 °F envelope is the OVEN dial. The food is not in the oven air — it is in liquid, which cannot pass the boiling point, so the medium actually touching it sits near 203 °F. Turning the oven up does not raise the braise; it only speeds evaporation and reduces the liquid faster.",
    surfaceCanBrown: false,
    moistureFlux: "into-food",
    reactions: [COLLAGEN, PECTIN, FAT_RENDER, PROTEIN_DENAT],
    altitudeResponse: "penalised",
    altitudeNote:
      "The liquid ceiling drops with elevation, and collagen conversion is strongly time-at-temperature — so the loss compounds. Expect meaningfully longer holds at altitude, not merely proportionally longer.",
    humidityNote:
      "Sealed vessel, so internal humidity is saturated. Lid fit is the real control: a loose lid reduces, a tight one holds at the ceiling.",
    equipmentPriority: "inertness",
    recommendedMaterials: ["enamelled_cast_iron", "stoneware"],
    equipmentNote:
      "Hours of acidic liquid demand a non-reactive surface — bare cast iron will give a braise a metallic edge. The mass is a bonus; the inertness is the requirement.",
  },

  poaching: {
    rateLimiter: "heat-transfer",
    modes: { conduction: 0.05, convection: 0.95, radiation: 0, phaseChange: 0 },
    h: { low: 50, typical: 150, high: 400, regime: "Natural convection in still water. Deliberately far below boiling's coefficient — the gentleness is the technique." },
    mediumC: 77,
    surfaceCanBrown: false,
    moistureFlux: "into-food",
    reactions: [PROTEIN_DENAT, ENZYME_KILL],
    altitudeResponse: "unaffected",
    altitudeNote:
      "The target sits 20–40 °C below boiling, so there is headroom at any habitable elevation. Above ~4000 m the window starts to narrow.",
    humidityNote: "Irrelevant — immersed.",
    equipmentPriority: "spreading",
    recommendedMaterials: ["copper", "aluminium"],
    equipmentNote:
      "Poaching lives or dies on avoiding local boiling. A pan that spreads well has no hot spot to nucleate bubbles that would tear delicate proteins apart.",
  },

  simmering: {
    rateLimiter: "heat-transfer",
    modes: { conduction: 0.05, convection: 0.8, radiation: 0, phaseChange: 0.15 },
    h: { low: 300, typical: 800, high: 2000, regime: "Convection with intermittent nucleation — the occasional bubble marks the transition, and is the visual cue cooks actually use." },
    mediumC: 91,
    surfaceCanBrown: false,
    moistureFlux: "into-food",
    reactions: [COLLAGEN, STARCH_GEL, PECTIN, PROTEIN_DENAT],
    altitudeResponse: "penalised",
    altitudeNote:
      "A simmer is defined relative to boiling, so its absolute temperature falls with elevation. At 2500 m a simmer runs near 88 °C instead of 96 °C, and extractions slow accordingly.",
    humidityNote: "Irrelevant to the liquid; governs how fast an uncovered pot reduces.",
    equipmentPriority: "spreading",
    recommendedMaterials: ["enamelled_cast_iron", "aluminium"],
    equipmentNote:
      "Scorching at the base is a spreading failure. Single-ply stainless reproduces the burner ring faithfully, which is exactly what a long simmer must not do.",
  },

  pressure_cooking: {
    rateLimiter: "phase-change",
    modes: { conduction: 0, convection: 0.15, radiation: 0, phaseChange: 0.85 },
    h: { low: 5000, typical: 10000, high: 15000, regime: "Condensing steam above atmospheric pressure. h is not the point — the raised medium temperature is." },
    mediumC: 117,
    surfaceCanBrown: false,
    moistureFlux: "into-food",
    reactions: [COLLAGEN, PECTIN, STARCH_GEL],
    altitudeResponse: "compensated",
    altitudeNote:
      "The one method that FIXES altitude. Gauge pressure adds to whatever the ambient is, so a sealed cooker restores — and exceeds — the sea-level ceiling. This is why pressure cookers are standard equipment in high-altitude kitchens.",
    humidityNote: "Saturated and sealed.",
    equipmentPriority: "sealing",
    recommendedMaterials: ["stainless_304", "aluminium"],
    equipmentNote:
      "The gasket is the whole appliance. A 17 °C lift over boiling cuts collagen conversion times several-fold, and a leaking seal silently returns you to an ordinary covered pot.",
  },

  stewing: {
    rateLimiter: "heat-transfer",
    modes: { conduction: 0.1, convection: 0.75, radiation: 0, phaseChange: 0.15 },
    h: { low: 150, typical: 500, high: 1200, regime: "Liquid convection through a thickening, increasingly viscous medium — the coefficient falls as the stew develops body." },
    mediumC: 88,
    surfaceCanBrown: false,
    moistureFlux: "into-food",
    reactions: [COLLAGEN, PECTIN, STARCH_GEL, FAT_RENDER],
    altitudeResponse: "penalised",
    altitudeNote:
      "Same ceiling as simmering, with the same compounding penalty on collagen conversion. Long cooks at altitude need genuinely more time, not a hotter burner.",
    humidityNote: "Governed by the lid, not the room.",
    equipmentPriority: "inertness",
    recommendedMaterials: ["enamelled_cast_iron", "stoneware"],
    equipmentNote:
      "As the liquid thickens, convection weakens and the base approaches conduction only — which is when a thin pan starts to catch. Thickness buys forgiveness in the last hour.",
  },

  // ══ MOLECULAR ═════════════════════════════════════════════════════════════
  spherification: {
    rateLimiter: "mass-transfer",
    modes: { conduction: 0, convection: 0, radiation: 0, phaseChange: 0 },
    h: null,
    mediumC: 20,
    surfaceCanBrown: false,
    moistureFlux: "neutral",
    reactions: [
      {
        name: "Alginate–calcium crosslinking",
        onsetC: 0,
        note: "Ca²⁺ bridges guluronic acid blocks into an 'egg-box' gel. Ionic, not thermal — it proceeds at fridge temperature and is unaffected by heating.",
      },
    ],
    altitudeResponse: "unaffected",
    altitudeNote: "No pressure dependence. Ionic crosslinking is unaffected by the atmosphere.",
    humidityNote: "No effect. The reaction happens inside a liquid bath.",
    equipmentPriority: "inertness",
    recommendedMaterials: ["borosilicate_glass", "stainless_304"],
    equipmentNote:
      "Membrane thickness is set by immersion time, not by equipment — it advances as roughly the square root of time, so doubling the dip is only about 40 % more skin.",
  },

  gelification: {
    rateLimiter: "reaction-kinetics",
    modes: { conduction: 0.7, convection: 0.3, radiation: 0, phaseChange: 0 },
    h: { low: 20, typical: 100, high: 400, regime: "Conduction through a still, setting gel. Falls sharply as the network forms and convection stops." },
    mediumC: 60,
    surfaceCanBrown: false,
    moistureFlux: "held",
    reactions: [
      { name: "Agar hydration / set", onsetC: 90, note: "Hydrates near 90 °C, sets near 35 °C, and will not re-melt until ~85 °C — a hysteresis of 50 °C that makes agar gels heat-stable on the plate." },
      { name: "Gelatin set", onsetC: 35, note: "Melts near body temperature, which is exactly why gelatin gels feel like they dissolve in the mouth and agar gels do not." },
      { name: "Gellan set", onsetC: 80, note: "Low-acyl sets brittle, high-acyl sets elastic; blending the two is how texture is dialled in." },
    ],
    altitudeResponse: "penalised",
    altitudeNote:
      "Agar needs a genuine ~90 °C hydration. Above roughly 2500 m the boiling point approaches that threshold and full hydration becomes unreliable — a weak set at altitude is usually under-hydration, not under-dosing.",
    humidityNote: "No effect during setting; surface drying matters on the plate.",
    equipmentPriority: "inertness",
    recommendedMaterials: ["borosilicate_glass", "stainless_304"],
    equipmentNote:
      "Setting is limited by how fast heat leaves the gel, so vessel geometry beats vessel material: a shallow tray sets several times faster than a deep mould of the same volume.",
  },

  emulsification: {
    rateLimiter: "mass-transfer",
    modes: { conduction: 0.3, convection: 0.7, radiation: 0, phaseChange: 0 },
    h: { low: 50, typical: 200, high: 600, regime: "Convection in a stirred liquid. Present but incidental — mechanical shear does the work, not heat." },
    mediumC: 49,
    surfaceCanBrown: false,
    moistureFlux: "neutral",
    reactions: [
      { name: "Droplet dispersion", onsetC: 0, note: "Shear rate sets droplet size; surfactant then stabilises the new interface. Energy in, not heat in." },
      { name: "Emulsion breaking", onsetC: 85, note: "Above ~85 °C egg proteins coagulate rather than emulsify — the reason hollandaise splits from overheating, not from over-whisking." },
    ],
    altitudeResponse: "unaffected",
    altitudeNote: "No pressure dependence within the working range.",
    humidityNote: "No meaningful effect.",
    equipmentPriority: "spreading",
    recommendedMaterials: ["copper", "stainless_304"],
    equipmentNote:
      "The classic copper bowl is a chemical effect, not a thermal one: trace Cu²⁺ binds egg-white conalbumin and stabilises the foam. For a warm emulsion, copper's responsiveness is what keeps you off the coagulation threshold.",
  },

  cryo_cooking: {
    rateLimiter: "phase-change",
    modes: { conduction: 0.2, convection: 0.2, radiation: 0, phaseChange: 0.6 },
    h: { low: 100, typical: 250, high: 600, regime: "Film boiling of liquid nitrogen. The vapour blanket is insulating, so h is far LOWER than the −196 °C bath suggests — the Leidenfrost effect working against you." },
    mediumC: -196,
    surfaceCanBrown: false,
    moistureFlux: "held",
    reactions: [
      { name: "Ice nucleation", onsetC: 0, note: "Rate decides crystal size. Fast freezing gives small crystals and preserved cell walls; slow freezing gives large ones that rupture them." },
      { name: "Glass transition", onsetC: -135, note: "Below roughly −135 °C water vitrifies rather than crystallising, which is the point of going cryogenic at all." },
    ],
    altitudeResponse: "unaffected",
    altitudeNote: "Nitrogen's boiling point shifts slightly with pressure; irrelevant against a 220 °C gradient.",
    humidityNote:
      "Highly relevant, and the opposite way round from cooking: ambient moisture frosts instantly onto cold surfaces and ruins clean release.",
    equipmentPriority: "thermal-mass",
    recommendedMaterials: ["stainless_304"],
    equipmentNote:
      "Never glass. Borosilicate survives thermal shock upward far better than downward, and a 220 °C drop will crack it. Vessels must also be uninsulated and vented — sealed cryogenic containers are an explosion risk.",
  },

  // ══ TRADITIONAL ═══════════════════════════════════════════════════════════
  fermentation: {
    rateLimiter: "microbial",
    modes: { conduction: 0, convection: 0, radiation: 0, phaseChange: 0 },
    h: null,
    mediumC: 22,
    surfaceCanBrown: false,
    moistureFlux: "neutral",
    reactions: [
      { name: "Lactic acid fermentation", onsetC: 15, note: "Lactobacillus works from ~15 °C, optimally near 30 °C, and stalls above ~40 °C. Temperature selects WHICH organism wins, which is why the same brine gives different results in different rooms." },
      { name: "Yeast alcoholic fermentation", onsetC: 10, note: "S. cerevisiae runs 10–35 °C; warmer is faster but throws more fusel alcohols, the reason cold-fermented doughs and beers taste cleaner." },
      { name: "Salt-driven selection", onsetC: 0, note: "2–5 % brine suppresses spoilage organisms while lactobacilli tolerate it. Salt, not heat, is the safety control here." },
    ],
    altitudeResponse: "unaffected",
    altitudeNote:
      "No temperature dependence on pressure, but CO₂-producing ferments build headspace pressure faster against a lower ambient — vessels vent sooner at altitude.",
    humidityNote:
      "Critical for surface ferments. Koji and mould-ripened work needs 70–90 % RH; below that the surface dries and the culture fails before it establishes.",
    equipmentPriority: "inertness",
    recommendedMaterials: ["stoneware", "borosilicate_glass"],
    equipmentNote:
      "Never reactive metal — the acid produced will strip it into the food. Stoneware crocks also buffer temperature swings, which matters because the organism's population, not a timer, sets the schedule.",
  },

  pickling: {
    rateLimiter: "mass-transfer",
    modes: { conduction: 0, convection: 0, radiation: 0, phaseChange: 0 },
    h: null,
    mediumC: 20,
    surfaceCanBrown: false,
    moistureFlux: "into-food",
    reactions: [
      { name: "Acid diffusion", onsetC: 0, note: "Fickian: penetration advances as the square root of time, so a piece twice as thick takes four times as long to equilibrate." },
      { name: "Osmotic dehydration", onsetC: 0, note: "Salt draws water out before acid moves in. The initial firming step is osmosis, not pickling." },
      { name: "Pectin acid-firming", onsetC: 0, note: "Below pH 4.6 pectin resists softening — the reason a properly acid pickle stays crisp for months." },
    ],
    altitudeResponse: "unaffected",
    altitudeNote:
      "Cold pickling is unaffected. Water-bath canning is a different matter entirely: process times must be extended at altitude because the ceiling drops.",
    humidityNote: "Irrelevant — submerged in brine.",
    equipmentPriority: "inertness",
    recommendedMaterials: ["borosilicate_glass", "stoneware"],
    equipmentNote:
      "Glass only. pH below 4.6 attacks metal, and the resulting ions both discolour the pickle and taste of it. Cut size beats every other variable: halving the thickness quarters the time.",
  },

  // ══ TRANSFORMATION ════════════════════════════════════════════════════════
  smoking: {
    rateLimiter: "mass-transfer",
    modes: { conduction: 0, convection: 0.85, radiation: 0.15, phaseChange: 0 },
    h: { low: 8, typical: 20, high: 40, regime: "Low-velocity convection. Deliberately feeble — the point is exposure time for deposition, not heat delivery." },
    mediumC: 107,
    surfaceCanBrown: true,
    moistureFlux: "out-of-food",
    reactions: [
      { name: "Phenol deposition", onsetC: 0, note: "Guaiacol and syringol from lignin pyrolysis carry the smoke flavour and deposit onto a tacky surface — the pellicle. A dry-skinned piece takes far less smoke." },
      { name: "Wood pyrolysis", onsetC: 300, note: "Clean smoke needs 300–400 °C at the wood. Smouldering below that gives acrid creosote, which is the difference between good barbecue and an ashtray." },
      MAILLARD,
      { name: "Collagen stall", onsetC: 70, note: "The famous plateau: evaporative cooling from the surface balances heat input, and the internal temperature stops climbing for hours. Wrapping breaks it by stopping evaporation." },
    ],
    altitudeResponse: "unaffected",
    altitudeNote:
      "Chamber temperature is set by the fire. Evaporation is faster in thinner air, so the stall arrives sooner and bites harder at altitude.",
    humidityNote:
      "A primary control. A water pan raises chamber humidity, slows evaporation, and moderates the stall — the standard remedy for a brisket that has parked at 70 °C.",
    equipmentPriority: "airflow",
    recommendedMaterials: ["cast_iron", "stoneware"],
    equipmentNote:
      "Airflow is the real dial. Too little starves the fire into creosote, too much strips deposited phenols back off the surface. The chamber's thermal mass is what keeps a long cook stable overnight.",
  },

  curing: {
    rateLimiter: "mass-transfer",
    modes: { conduction: 0, convection: 0, radiation: 0, phaseChange: 0 },
    h: null,
    mediumC: 4,
    surfaceCanBrown: false,
    moistureFlux: "out-of-food",
    reactions: [
      { name: "Osmotic dehydration", onsetC: 0, note: "Salt lowers water activity (a_w). Below a_w 0.91 most bacteria stop; below 0.85 nearly all do. This is the safety mechanism, and it is chemical, not thermal." },
      { name: "Nitrite curing", onsetC: 0, note: "NO₂⁻ inhibits Clostridium botulinum, fixes the pink colour, and produces the cured flavour. Not optional in anaerobic cures." },
      { name: "Protein cross-linking", onsetC: 0, note: "Salt-induced restructuring firms the texture progressively — the difference between a two-week and a six-month ham." },
    ],
    altitudeResponse: "unaffected",
    altitudeNote: "No pressure dependence. Drying is marginally faster in thinner air.",
    humidityNote:
      "The single most important variable. Dry-curing needs 70–80 % RH: too dry and the surface hardens into a case that traps moisture inside — case hardening, the classic failure — too damp and spoilage outruns the cure.",
    equipmentPriority: "airflow",
    recommendedMaterials: ["stoneware", "borosilicate_glass"],
    equipmentNote:
      "A curing chamber is a humidity controller with a fridge attached. Air movement must be steady and slow; still air breeds mould, fast air case-hardens.",
  },

  dehydrating: {
    rateLimiter: "mass-transfer",
    modes: { conduction: 0.05, convection: 0.95, radiation: 0, phaseChange: 0 },
    h: { low: 15, typical: 30, high: 60, regime: "Forced-air convection at low temperature. Deliberately gentle: heat is a carrier for moisture removal, not a cooking agent." },
    mediumC: 57,
    surfaceCanBrown: false,
    moistureFlux: "out-of-food",
    reactions: [
      { name: "Constant-rate drying", onsetC: 0, note: "While free surface water lasts, the surface holds at the wet-bulb temperature and the rate is set purely by airflow." },
      { name: "Falling-rate drying", onsetC: 0, note: "Once the surface dries, internal diffusion takes over and the rate collapses. Most of the total time is spent in this phase for the last 10 % of the water." },
      { name: "Case hardening", onsetC: 0, note: "Too much heat too early seals the surface and traps water inside. The failure looks like dryness and is the opposite." },
    ],
    altitudeResponse: "accelerated",
    altitudeNote:
      "Genuinely faster at altitude. Lower ambient pressure means a lower vapour-pressure barrier, so moisture leaves more readily — the same principle vacuum drying industrialises.",
    humidityNote:
      "Directly rate-setting. Drying is driven by the vapour-pressure difference between the food surface and the air, so a humid room can stall a dehydrator completely no matter how long you run it.",
    equipmentPriority: "airflow",
    recommendedMaterials: ["stainless_304"],
    equipmentNote:
      "Airflow uniformity beats temperature. Stacked-tray dehydrators without a rear fan dry the bottom trays first, and rotating trays is a workaround for an airflow design problem.",
  },

  infusing: {
    rateLimiter: "mass-transfer",
    modes: { conduction: 0.1, convection: 0.9, radiation: 0, phaseChange: 0 },
    h: { low: 50, typical: 150, high: 400, regime: "Natural convection in a solvent. Heat raises solubility and diffusion rate; it is an accelerant, not the mechanism." },
    mediumC: 60,
    surfaceCanBrown: false,
    moistureFlux: "into-food",
    reactions: [
      { name: "Solvent extraction", onsetC: 0, note: "Polarity selects the compounds: water pulls acids and sugars, fat and alcohol pull terpenes and capsaicin. Choosing the solvent chooses the flavour." },
      { name: "Volatile loss", onsetC: 80, note: "The lightest aromatics — the ones you wanted — boil off first. Above ~80 °C an open infusion loses top notes faster than it gains body." },
      { name: "Tannin extraction", onsetC: 85, note: "Astringent polyphenols come out fast above ~85 °C. This is why over-hot tea turns bitter while the same leaf at 75 °C does not." },
    ],
    altitudeResponse: "penalised",
    altitudeNote:
      "Water infusions are capped by the boiling point, so tea and stock extract measurably less at elevation. A pressure vessel or longer contact time restores it.",
    humidityNote: "No effect on a liquid infusion.",
    equipmentPriority: "spreading",
    recommendedMaterials: ["copper", "borosilicate_glass"],
    equipmentNote:
      "Even, gentle heat with no hot spot: a local boil scorches the aromatics you are trying to capture. Glass adds nothing thermally but lets you watch the extraction, which for tea is the actual control.",
  },

  distilling: {
    rateLimiter: "phase-change",
    modes: { conduction: 0.05, convection: 0.15, radiation: 0, phaseChange: 0.8 },
    h: { low: 1000, typical: 3000, high: 8000, regime: "Boiling in the pot and condensing in the column — latent heat at both ends, which is why throughput is set by cooling capacity, not by the burner." },
    mediumC: 78,
    surfaceCanBrown: false,
    moistureFlux: "out-of-food",
    reactions: [
      { name: "Ethanol–water separation", onsetC: 78, note: "Ethanol boils at 78.4 °C against water's 100 °C. The azeotrope at 95.6 % ABV is the hard ceiling for simple distillation — no number of plates gets past it." },
      { name: "Volatile fractionation", onsetC: 56, note: "Heads first (acetone ~56 °C, methanol 65 °C), then hearts, then tails. Cutting between them is the entire craft." },
      { name: "Vacuum distillation", onsetC: 20, note: "Lowering pressure lowers every boiling point, so aromatics can be separated near room temperature without cooking them — how modern kitchens distil delicate flavours." },
    ],
    altitudeResponse: "penalised",
    altitudeNote:
      "Every boiling point in the system falls together, so the separation between fractions narrows slightly and cut points must be re-found. Altitude is a mild continuous vacuum distillation.",
    humidityNote: "No effect on the still; affects condenser efficiency only marginally.",
    equipmentPriority: "spreading",
    recommendedMaterials: ["copper", "stainless_304"],
    equipmentNote:
      "Copper is chemistry, not conductivity: it binds sulphur compounds out of the vapour. An all-stainless still runs fine thermally and makes a noticeably sulphurous spirit.",
  },

  marinating: {
    rateLimiter: "mass-transfer",
    modes: { conduction: 0, convection: 0, radiation: 0, phaseChange: 0 },
    h: null,
    mediumC: 4,
    surfaceCanBrown: false,
    moistureFlux: "into-food",
    reactions: [
      { name: "Salt diffusion", onsetC: 0, note: "The only component that reliably penetrates. Sodium and chloride are small ions and move millimetres per hour; almost nothing else does." },
      { name: "Acid denaturation", onsetC: 0, note: "Surface only, and self-limiting: acid firms the outer layer into a barrier that slows its own further entry. Long acid marinades make a mushy skin over a raw centre." },
      { name: "Enzymatic tenderising", onsetC: 0, note: "Papain and bromelain cut protein aggressively but stay near the surface, and denature around 70 °C — so their effect ends the moment cooking starts." },
    ],
    altitudeResponse: "unaffected",
    altitudeNote: "No pressure dependence at ordinary elevations.",
    humidityNote: "Irrelevant — submerged.",
    equipmentPriority: "inertness",
    recommendedMaterials: ["borosilicate_glass", "stoneware"],
    equipmentNote:
      "Non-reactive only; acid plus aluminium gives a metallic off-flavour within hours. Vacuum tumbling genuinely accelerates uptake by opening the muscle structure — passive vacuum bags do not.",
  },
};

/** Every method id with a physics profile. */
export const PHYSICS_METHOD_IDS = Object.keys(METHOD_PHYSICS);

export function getMethodPhysics(methodId: string): MethodPhysicsProfile | null {
  return METHOD_PHYSICS[methodId] ?? null;
}

/**
 * Human label for a rate limiter, for UI use.
 */
export const RATE_LIMITER_LABEL: Record<RateLimiter, string> = {
  "heat-transfer": "Heat transfer",
  "mass-transfer": "Mass transfer",
  "reaction-kinetics": "Reaction kinetics",
  microbial: "Microbial growth",
  "phase-change": "Phase change",
};

/**
 * One-line explanation of what a rate limiter means for the cook.
 */
export const RATE_LIMITER_NOTE: Record<RateLimiter, string> = {
  "heat-transfer": "Speed is set by how fast heat crosses into the food. Thickness and the transfer coefficient dominate.",
  "mass-transfer": "Speed is set by how fast molecules diffuse, not by heat. Penetration goes as the square root of time, so thickness is punishing.",
  "reaction-kinetics": "Speed is set by a chemical reaction rate. Temperature matters through the rate constant, not through heat delivery.",
  microbial: "Speed is set by a living population. Temperature selects which organisms dominate; time cannot be traded against it.",
  "phase-change": "Speed is set by latent heat at a phase boundary. Enormous energy moves at a nearly constant temperature.",
};
