/**
 * Vessel registry — the bridge between a food's properties and the pan it sits in.
 *
 * A `cookwareMaterials` entry answers "what is cast iron like". A vessel answers
 * "what is THIS pan like": how wide its liquid surface is, how much steel there
 * is to heat, and whether a lid caps the evaporation. Two litres of stock in a
 * 30 cm skillet and in a 20 cm Dutch oven are not the same cooking problem, and
 * the difference is geometry, not material.
 *
 * ── What a vessel contributes to the heat balance ───────────────────────────
 *
 *   free surface area   sets evaporative loss — the largest single term in a
 *                       simmer, and it scales with DIAMETER SQUARED
 *   base area           the conduction footprint the burner talks to
 *   metal mass          a thermal battery that must be heated before the food
 *                       is, and that gives it back when cold food lands
 *   lid                 caps evaporation and returns condensate
 *
 * ── Composition, not duplication ────────────────────────────────────────────
 *
 * Every vessel references a material id from `cookwareMaterials.ts` and inherits
 * its conductivity, density, specific heat and effusivity. Nothing thermophysical
 * is restated here; a vessel adds only the dimensions that material cannot know.
 *
 * BASIS: dimensions are the manufacturer-stated internal measurements for a
 * common example of each class, named per entry. They are REPRESENTATIVE of the
 * type, not a specification — a reader should treat them as "a pan like this"
 * and override them with their own when it matters.
 *
 * @file src/data/cooking/vessels.ts
 */
import { getCookware, type CookwareDerived } from "@/data/cooking/cookwareMaterials";

/**
 * How well a lid seals, and therefore how much vapour still escapes.
 *
 * ⚠️ THE ESCAPE FRACTIONS ARE A COARSE INDEX, NOT A MEASUREMENT, AND NOT THE
 * MODEL. Prefer `lidHeatBalance` + `coveredWaterLoss` in
 * `src/lib/cooking/boundaryNetwork.ts` wherever a power input is known. These
 * remain only as an ordering of seal states for callers that have no burner
 * setting to work from.
 *
 * ── What happened to the derivation this comment used to promise ────────────
 *
 * An earlier version of this note said the boundary network would DERIVE these
 * fractions: the headspace saturates, so net loss is whatever escapes the seal,
 * and the condensate forming instead is bounded by how fast the lid sheds heat.
 * That reasoning is sound and it derives the WRONG QUANTITY.
 *
 * `[MEASURED 2026-08-18]` The lid's heat loss gives a condensation capacity of
 * 41–66 W across the four lidded vessels here — 53–106 g·h⁻¹, against a
 * free-surface rate of 477–908 g·h⁻¹ over the same areas. That is a return of
 * **11.1–11.6 %**, and it is near-identical for the tight Dutch oven and the
 * loose stockpot, because it is set by lid AREA and ROOM TEMPERATURE, not by
 * seal quality. Substituting it for the 0.92 declared below would make a Dutch
 * oven lose more water than a loose-lidded stockpot — wrong, and wrong in the
 * direction anyone can check with a kitchen scale.
 *
 * The resolution is that **the free-surface rate does not apply under a lid at
 * all.** A closed headspace saturates, the vapour-density driving force
 * collapses, and there is no 900 g·h⁻¹ of evaporation for a fraction to act on.
 * What remains is a circulation the lid's heat loss governs, plus a net loss
 * set by how much steam the POWER INPUT raises beyond it. `[MEASURED 2026-08-18]`
 * the same Dutch oven loses nothing at 50 W, 214 g·h⁻¹ at 200 W and 1171 g·h⁻¹
 * at 800 W — one lid, one seal, three regimes on the dial alone. A per-seal
 * constant cannot express a burner.
 *
 * So this table is not merely imprecise; it has the wrong SHAPE. It is kept,
 * demoted and labelled rather than deleted, because callers with no power input
 * still need seal states ordered — and because a reader who finds it should
 * find this explanation with it.
 *
 * ⚠️ Leakage past the seal remains unmodelled in BOTH routes, and cannot be
 * derived from anything in this repository: it needs a gap dimension that is
 * not a published property of any pan. `coveredWaterLoss` is therefore an upper
 * bound, and a better seal shows up there as a longer `holding` regime rather
 * than as a fitted coefficient.
 */
export type LidSeal = "tight" | "loose" | "cracked" | "none";

/**
 * Share of free-surface evaporation that still escapes, by seal state.
 *
 * See the warning on {@link LidSeal}: `none` is definitional, the rest are a
 * graded ORDERING of seal states. For an actual water loss, use
 * `coveredWaterLoss` with a power input instead.
 */
export const VAPOUR_ESCAPE_FRACTION: Record<LidSeal, number> = {
  /** No lid. A free surface loses what a free surface loses. */
  none: 1,
  /** Deliberately ajar, or a lid with a vent hole open. */
  cracked: 0.55,
  /** A lid that sits on but does not seat — most stockpot lids. */
  loose: 0.25,
  /** A heavy, well-seated lid. Not zero: no domestic lid is gas-tight. */
  tight: 0.08,
};

export interface VesselLid {
  /** Material id from `cookwareMaterials.ts`. */
  materialId: string;
  /** Lids are rarely the same gauge as the vessel they cover. */
  thicknessMm: number;
  seal: LidSeal;
}

/**
 * The profile of the vessel's interior, which decides how capacity and liquid
 * surface follow from the rim diameter.
 *
 * ⚠️ NOT COSMETIC. `[MEASURED 2026-08-18]` Modelling everything as a cylinder
 * gave a 14 in wok a capacity of 8.91 L and a liquid surface of 0.099 m². A wok
 * is a bowl: it holds roughly half that, and two litres in it sit well below the
 * rim across a far smaller circle. Since evaporation scales with the LIQUID
 * surface, a cylinder assumption overstates a wok's evaporative loss about
 * twofold — in the one vessel whose whole technique is rapid evaporation.
 */
export type VesselShape =
  /** Straight sides — skillets, saucepans, stockpots, sheet pans. */
  | "cylindrical"
  /** Spherical bowl — a wok. */
  | "bowl"
  /** Straight but flared or curved sides — a saucier. */
  | "sloped";

export interface Vessel {
  id: string;
  name: string;
  shape: VesselShape;
  /** Material id from `cookwareMaterials.ts`. */
  materialId: string;
  /** Internal diameter — this is what drives evaporation, not the rim width. */
  internalDiameterMm: number;
  /** Internal depth to the rim. */
  internalHeightMm: number;
  /** Side wall gauge. */
  wallThicknessMm: number;
  /** Base gauge, which is usually heavier than the walls. */
  baseThicknessMm: number;
  lid?: VesselLid;
  /** The example these dimensions were taken from. */
  basisNote: string;
  /** What this vessel is actually for. */
  characterNote: string;
}

/**
 * `[BASIS]` Internal dimensions for a common example of each class; the example
 * is named in `basisNote`. Representative of the type, not a specification.
 */
export const VESSELS: readonly Vessel[] = [
  {
    id: "skillet_12in_carbon",
    shape: "cylindrical",
    name: '12" carbon steel skillet',
    materialId: "carbon_steel",
    internalDiameterMm: 300,
    internalHeightMm: 50,
    wallThicknessMm: 2,
    baseThicknessMm: 2,
    basisNote: "de Buyer Mineral B 32 cm, measured across the cooking floor.",
    characterNote:
      "The widest free surface of anything here, so it evaporates fastest — which is the point. A sauce reduces in a skillet and stalls in a saucepan.",
  },
  {
    id: "skillet_10in_cast_iron",
    shape: "cylindrical",
    name: '10" cast iron skillet',
    materialId: "cast_iron",
    internalDiameterMm: 254,
    internalHeightMm: 45,
    wallThicknessMm: 4.5,
    baseThicknessMm: 5,
    basisNote: "Lodge L8SK3, 10.25 in nominal.",
    characterNote:
      "Two kilos of thermal battery. A cold steak barely dents its surface temperature, which is why the sear does not stall — and why it takes ten minutes to preheat.",
  },
  {
    id: "saucepan_3qt_clad",
    shape: "cylindrical",
    name: "3 qt stainless-clad saucepan",
    materialId: "stainless_304",
    internalDiameterMm: 200,
    internalHeightMm: 100,
    wallThicknessMm: 2,
    baseThicknessMm: 5,
    lid: { materialId: "stainless_304", thicknessMm: 1.5, seal: "loose" },
    basisNote: "All-Clad D3 3 qt; disc base gauge for the clad sandwich.",
    characterNote:
      "Tall and narrow, so the free surface is small relative to the volume. Holds a simmer without reducing much — the opposite trade to a skillet.",
  },
  {
    id: "dutch_oven_55qt",
    shape: "cylindrical",
    name: "5.5 qt enamelled Dutch oven",
    materialId: "enamelled_cast_iron",
    internalDiameterMm: 260,
    internalHeightMm: 115,
    wallThicknessMm: 5,
    baseThicknessMm: 6,
    lid: { materialId: "enamelled_cast_iron", thicknessMm: 6, seal: "tight" },
    basisNote: "Le Creuset 26 cm round, 5.5 qt.",
    characterNote:
      "A heavy lid on a heavy pot: the braising vessel. Its lid is the single largest thermal mass of any lid here, and its seal returns most of the condensate.",
  },
  {
    id: "stockpot_8qt",
    shape: "cylindrical",
    name: "8 qt stainless stockpot",
    materialId: "stainless_304",
    internalDiameterMm: 240,
    internalHeightMm: 190,
    wallThicknessMm: 1.2,
    baseThicknessMm: 4,
    lid: { materialId: "stainless_304", thicknessMm: 1.2, seal: "loose" },
    basisNote: "Vollrath Tribute 8 qt.",
    characterNote:
      "Thin walls and a heavy base — cheap to heat, prone to scorching where the burner touches. Depth keeps the surface small for the volume it holds.",
  },
  {
    id: "wok_14in_carbon",
    shape: "bowl",
    name: '14" carbon steel wok',
    materialId: "carbon_steel",
    internalDiameterMm: 355,
    internalHeightMm: 90,
    wallThicknessMm: 1.6,
    baseThicknessMm: 1.6,
    basisNote: "Traditional hand-hammered 14 in, 16 gauge.",
    characterNote:
      "Almost no thermal mass at all, which is the whole basis of wok technique: it answers the burner in seconds. Crowd it with cold food and the temperature collapses.",
  },
  {
    id: "sheet_pan_half",
    shape: "cylindrical",
    name: "Half sheet pan",
    materialId: "aluminium",
    internalDiameterMm: 393,
    internalHeightMm: 25,
    wallThicknessMm: 1,
    baseThicknessMm: 1,
    basisNote:
      "Nordic Ware half sheet, 46 x 33 cm — diameter is the circle of EQUAL AREA, so surface-driven terms stay comparable with the round vessels.",
    characterNote:
      "Enormous surface, negligible mass. Everything evaporates; nothing is stored. A thin sheet browns bases poorly because it has nothing to give back.",
  },
  {
    id: "saucier_2qt_copper",
    shape: "sloped",
    name: "2 qt copper saucier",
    materialId: "copper",
    internalDiameterMm: 180,
    internalHeightMm: 90,
    wallThicknessMm: 2.5,
    baseThicknessMm: 2.5,
    lid: { materialId: "stainless_304", thicknessMm: 1.5, seal: "loose" },
    basisNote: "Mauviel M'heritage 150 2 qt, 2.5 mm gauge.",
    characterNote:
      "Spreads heat about 25x better than stainless, so the burner's ring disappears. Sloped sides make it the reduction vessel where a whisk has to reach the corner.",
  },
] as const;

// ============================================================================
// Derived geometry — computed here, never transcribed
// ============================================================================

export interface VesselDerived extends Vessel {
  material: CookwareDerived;
  /**
   * Area of the circle at the RIM, m².
   *
   * For a cylindrical vessel this is also the liquid surface at any fill. For a
   * bowl or a sloped pan it is NOT — use {@link VesselDerived.liquidSurfaceAreaM2}.
   */
  rimAreaM2: number;
  /** Conduction footprint the burner talks to, m². */
  baseAreaM2: number;
  /** Brim-full capacity, litres, honouring the vessel's shape. */
  capacityLitres: number;
  /** Energy to raise the whole vessel one kelvin, J·K⁻¹. */
  thermalMassJperK: number;
  /** Energy to raise the lid one kelvin, J·K⁻¹. Zero when there is no lid. */
  lidThermalMassJperK: number;
  /** Share of free-surface evaporation that still escapes, 0–1. */
  vapourEscapeFraction: number;
  /**
   * Share of evaporated vapour that condenses on the lid and returns its latent
   * heat to the food. The complement of what escapes.
   *
   * This is why a covered braise holds temperature so stubbornly: the lid is not
   * merely suppressing a loss, it is handing most of it back. An open pan
   * returns nothing.
   */
  condensateReturnFraction: number;
  /**
   * Liquid surface at a given fill, m² — the area evaporation actually acts on.
   *
   * Constant for a cylinder. For a bowl it SHRINKS as the level falls, which is
   * why a wok reducing a sauce slows down as it goes, and why a cylinder
   * assumption overstates a wok's evaporation about twofold.
   *
   * @throws RangeError when the fill exceeds the vessel's capacity.
   */
  liquidSurfaceAreaM2(fillLitres: number): number;
  /**
   * Liquid surface per litre at FULL capacity, m²·L⁻¹.
   *
   * The number that separates a skillet from a stockpot, and therefore predicts
   * which one reduces.
   */
  surfaceToVolumeM2PerL: number;
}

/** Area of a circle from a diameter in millimetres, m². */
function circleAreaM2(diameterMm: number): number {
  const radiusM = diameterMm / 2000;
  return Math.PI * radiusM * radiusM;
}

/**
 * Capacity as a fraction of the enclosing cylinder, by shape.
 *
 * BASIS, and each is geometry rather than a fitted number:
 *  - `cylindrical` 1 by definition.
 *  - `bowl` a spherical cap whose depth equals the vessel's stated height and
 *    whose rim is the stated diameter. For the shallow caps a wok actually is,
 *    that volume is 2/3 of the enclosing cylinder — V_cap/V_cyl → 2/3 as the cap
 *    flattens, and a 14 in wok 90 mm deep is well inside that limit.
 *  - `sloped` a frustum whose base is about 70 % of the rim diameter, which is
 *    the geometry of a saucier. V_frustum/V_cyl = (1 + r + r²)/3 at r = 0.7.
 */
export const SHAPE_CAPACITY_FACTOR: Record<VesselShape, number> = {
  cylindrical: 1,
  bowl: 2 / 3,
  sloped: (1 + 0.7 + 0.7 * 0.7) / 3,
};

/**
 * Metal mass of a vessel, kg: a base disc plus a cylindrical wall band.
 *
 * Deliberately a simple shell model. A real pan has a radius at the base, a
 * rolled rim and often a disc base of a different alloy, and pretending
 * otherwise would be false precision. What this captures — that a wok has
 * almost no mass and a Dutch oven has a great deal — is the part that changes
 * how the pan behaves.
 */
function shellMassKg(vessel: Vessel, densityKgM3: number): number {
  const baseVolumeM3 = circleAreaM2(vessel.internalDiameterMm) * (vessel.baseThicknessMm / 1000);
  const circumferenceM = Math.PI * (vessel.internalDiameterMm / 1000);
  const wallVolumeM3 =
    circumferenceM * (vessel.internalHeightMm / 1000) * (vessel.wallThicknessMm / 1000);
  return (baseVolumeM3 + wallVolumeM3) * densityKgM3;
}

/**
 * Resolve a vessel's geometry and its material's thermophysics into one object.
 *
 * @throws Error when a vessel or its lid names a material that does not exist —
 *         a silent fallback would produce a plausible pan made of nothing.
 */
export function deriveVessel(vessel: Vessel): VesselDerived {
  const material = getCookware(vessel.materialId);
  if (material === null) {
    throw new Error(
      `vessel "${vessel.id}" names material "${vessel.materialId}", which is not in COOKWARE_MATERIALS`,
    );
  }

  const rimAreaM2 = circleAreaM2(vessel.internalDiameterMm);
  const heightM = vessel.internalHeightMm / 1000;
  const capacityLitres = rimAreaM2 * heightM * SHAPE_CAPACITY_FACTOR[vessel.shape] * 1000;
  const thermalMassJperK = shellMassKg(vessel, material.rhoKgM3) * material.cJkgK;

  let lidThermalMassJperK = 0;
  if (vessel.lid) {
    const lidMaterial = getCookware(vessel.lid.materialId);
    if (lidMaterial === null) {
      throw new Error(
        `vessel "${vessel.id}" has a lid of material "${vessel.lid.materialId}", ` +
          `which is not in COOKWARE_MATERIALS`,
      );
    }
    // A lid is a disc covering the mouth.
    const lidMassKg = rimAreaM2 * (vessel.lid.thicknessMm / 1000) * lidMaterial.rhoKgM3;
    lidThermalMassJperK = lidMassKg * lidMaterial.cJkgK;
  }

  const seal: LidSeal = vessel.lid?.seal ?? "none";
  const vapourEscapeFraction = VAPOUR_ESCAPE_FRACTION[seal];
  const { shape } = vessel;

  function liquidSurfaceAreaM2(fillLitres: number): number {
    if (!(fillLitres >= 0)) {
      throw new RangeError(`fillLitres must be non-negative, received ${fillLitres}`);
    }
    if (fillLitres > capacityLitres) {
      throw new RangeError(
        `${fillLitres} L exceeds this vessel's ${capacityLitres.toFixed(2)} L capacity — ` +
          `the surface of liquid that has overflowed is not a meaningful quantity.`,
      );
    }
    // Straight sides: the surface is the rim circle at every level.
    if (shape === "cylindrical") return rimAreaM2;
    // Otherwise the surface shrinks with depth. Both remaining shapes narrow
    // toward the base, so the radius scales with the fill's depth fraction —
    // linearly for a frustum, and near enough for the shallow caps a wok is.
    const fillFraction = capacityLitres === 0 ? 0 : fillLitres / capacityLitres;
    const baseRadiusRatio = shape === "sloped" ? 0.7 : 0;
    const radiusRatio = baseRadiusRatio + (1 - baseRadiusRatio) * Math.cbrt(fillFraction);
    return rimAreaM2 * radiusRatio * radiusRatio;
  }

  return {
    ...vessel,
    material,
    rimAreaM2,
    baseAreaM2: rimAreaM2,
    capacityLitres,
    thermalMassJperK,
    lidThermalMassJperK,
    vapourEscapeFraction,
    condensateReturnFraction: 1 - vapourEscapeFraction,
    liquidSurfaceAreaM2,
    surfaceToVolumeM2PerL: liquidSurfaceAreaM2(capacityLitres) / capacityLitres,
  };
}

export const VESSELS_DERIVED: readonly VesselDerived[] = VESSELS.map(deriveVessel);

export function getVessel(id: string): VesselDerived | null {
  return VESSELS_DERIVED.find((v) => v.id === id) ?? null;
}

// ============================================================================
// What the vessel does to a batch
// ============================================================================

export interface VesselEvaporation {
  /** Vapour actually leaving the system, kg. */
  escapedKg: number;
  /** Vapour that condensed on the lid and returned its latent heat, kg. */
  returnedKg: number;
  /** Net energy lost to evaporation, J — escaped only. */
  netLatentLossJ: number;
  /** Energy the condensate handed back, J. Zero without a lid. */
  returnedLatentJ: number;
}

/**
 * Split an amount of evaporated water into what escapes and what comes back.
 *
 * ⚠️ Uncovered, `returnedKg` is zero and every joule leaves. Covered, most of it
 * returns — which is the mechanism of braising, not a rounding on it. Treating a
 * lid purely as "less evaporation" loses that entirely.
 *
 * @param evaporatedKg Water evaporated from the free surface, kg.
 * @param latentHeatJperKg Enthalpy of vaporisation at the surface temperature —
 *        from `latentHeat.ts`, because it varies 8 % between 20 and 100 °C.
 */
export function splitEvaporation(
  vessel: VesselDerived,
  evaporatedKg: number,
  latentHeatJperKg: number,
): VesselEvaporation {
  if (!(evaporatedKg >= 0)) {
    throw new RangeError(`evaporatedKg must be non-negative, received ${evaporatedKg}`);
  }
  const escapedKg = evaporatedKg * vessel.vapourEscapeFraction;
  const returnedKg = evaporatedKg - escapedKg;
  return {
    escapedKg,
    returnedKg,
    netLatentLossJ: escapedKg * latentHeatJperKg,
    returnedLatentJ: returnedKg * latentHeatJperKg,
  };
}

/**
 * How many kelvin of the batch's heating goes into warming the pan itself.
 *
 * The answer to "why did my wok recover instantly and my Dutch oven take five
 * minutes". A vessel is heated alongside its contents, and for a heavy pot with
 * a heavy lid that share is not small.
 *
 * @param batchHeatCapacityJperK Mass × specific heat of the food, from `choiOkos`.
 */
export function vesselHeatingShare(
  vessel: VesselDerived,
  batchHeatCapacityJperK: number,
): number {
  if (!(batchHeatCapacityJperK > 0)) {
    throw new RangeError(
      `batchHeatCapacityJperK must be positive, received ${batchHeatCapacityJperK}`,
    );
  }
  const vesselTotal = vessel.thermalMassJperK + vessel.lidThermalMassJperK;
  return vesselTotal / (vesselTotal + batchHeatCapacityJperK);
}
