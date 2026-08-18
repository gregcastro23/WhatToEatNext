/**
 * The lab solver — the orchestrator behind `/lab`.
 *
 * Every layer under this one is a physics kernel: it computes one thing well
 * and THROWS when asked outside its validity. That is the right contract for a
 * kernel and exactly the wrong one for a user interface, which cannot render a
 * `RangeError`. This module is the seam between the two.
 *
 * ── The one rule that shapes the whole API ──────────────────────────────────
 *
 * **Absence of an answer must not look like an answer.** Every output is a
 * {@link Reading}: either a value, or a plain sentence saying what was asked
 * and why the physics cannot answer it. There is no third state, no `null`
 * standing in for a number, no zero meaning "unknown". A caller that renders a
 * `Reading` without checking `available` will not compile.
 *
 * This mirrors what `src/__tests__/components/methodPanelPresentationGuards.test.tsx`
 * already pins for the cooking-method panels: a missing operand suppresses its
 * delta, absence renders a stated reason, no branch leaks a NaN into panel text.
 *
 * ── What this module does NOT do ────────────────────────────────────────────
 *
 * It computes no physics of its own. Every number here comes from `thermo.ts`,
 * `choiOkos.ts`, `latentHeat.ts`, `volumetrics.ts`, `vessels.ts` or
 * `boundaryNetwork.ts`, all of which are dual-implemented in Rust under a
 * bit-exact parity contract. This file is composition and honest reporting.
 * If a calculation belongs anywhere, it belongs downstairs where the parity
 * fixture can see it.
 *
 * @file src/lib/cooking/labSolver.ts
 */
import { METHOD_PHYSICS } from "@/data/cooking/methodPhysics";
import { getVessel, type LidSeal, type VesselDerived } from "@/data/cooking/vessels";
import { allIngredients } from "@/data/ingredients";
import {
  airProperties,
  coveredWaterLoss,
  evaporativeFlux,
  evaporativePinnedSurfaceC,
  humidAirVapourDensity,
  lidHeatBalance,
  naturalConvectionH,
  plateCharacteristicLength,
  saturatedWaterProperties,
  solveBoundaryNetwork,
  type BoundaryNetworkResult,
} from "@/lib/cooking/boundaryNetwork";
import { foodProperties, type MassFractions } from "@/lib/cooking/choiOkos";
import { latentHeatVaporisation } from "@/lib/cooking/latentHeat";
import {
  saturationCeilingAtElevation,
  slabCoreTime,
  surfaceAreaToVolume,
  type FoodGeometry,
} from "@/lib/cooking/thermo";

// ============================================================================
// The honesty type
// ============================================================================

/**
 * A value the solver either has, or has a stated reason for not having.
 *
 * A discriminated union rather than `T | null` on purpose: `null` collapses
 * "the physics refuses" together with "nobody computed it", and a caller
 * reaching for `?? 0` turns either into a number that looks measured.
 */
export type Reading<T> = { available: true; value: T } | { available: false; reason: string };

const has = <T,>(value: T): Reading<T> => ({ available: true, value });
const missing = <T,>(reason: string): Reading<T> => ({ available: false, reason });

/**
 * Run a kernel call and convert its refusal into a stated reason.
 *
 * The kernels throw `RangeError` with a message written to be read by a person
 * — that was a deliberate choice when each was built — so the message is
 * surfaced rather than replaced with something vaguer.
 */
function attempt<T>(fn: () => T, context: string): Reading<T> {
  try {
    return has(fn());
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    return missing(`${context}: ${detail}`);
  }
}

// ============================================================================
// Ingredients the solver can actually work with
// ============================================================================

export interface SolverIngredient {
  id: string;
  name: string;
  composition: MassFractions;
  /** Mass the five proximate fractions fail to account for. */
  unaccountedFraction: number;
  fdcId?: number;
  fdcDescription?: string;
  retrieved?: string;
}

interface RawComposition {
  water: number;
  protein: number;
  fat: number;
  carbohydrate: number;
  ash: number;
  fdcId?: number;
  fdcDescription?: string;
  retrieved?: string;
}

/**
 * Every ingredient carrying a real USDA proximate composition, sorted by name.
 *
 * ⚠️ **This is a small set and the surface must say so.** `[MEASURED
 * 2026-08-18]` **40 of 931** ingredients reachable through the index carry a
 * composition. The rest are not "not yet supported" — they cannot be solved at
 * all, because Choi–Okos needs water and ash and there is nowhere else to get
 * them. An ingredient picker that silently listed all 931 and failed on 891 of
 * them would be the same defect this codebase keeps meeting in another costume.
 */
export const SOLVABLE_INGREDIENTS: readonly SolverIngredient[] = Object.entries(allIngredients)
  .flatMap(([id, raw]) => {
    const profile = (raw as { nutritionalProfile?: { composition?: RawComposition } })
      ?.nutritionalProfile?.composition;
    if (!profile) return [];
    const composition: MassFractions = {
      water: profile.water,
      protein: profile.protein,
      fat: profile.fat,
      carbohydrate: profile.carbohydrate,
      ash: profile.ash,
    };
    const name = (raw as { name?: string }).name ?? id.replace(/_/g, " ");
    return [
      {
        id,
        name,
        composition,
        unaccountedFraction:
          1 -
          (profile.water + profile.protein + profile.fat + profile.carbohydrate + profile.ash),
        fdcId: profile.fdcId,
        fdcDescription: profile.fdcDescription,
        retrieved: profile.retrieved,
      },
    ];
  })
  .sort((a, b) => a.name.localeCompare(b.name));

/** Count of ingredients the solver can accept, exported so a surface can state it. */
export const SOLVABLE_INGREDIENT_COUNT = SOLVABLE_INGREDIENTS.length;

/** Total ingredients in the corpus, for the coverage statement beside it. */
export const TOTAL_INGREDIENT_COUNT = Object.keys(allIngredients).length;

export function getSolvableIngredient(id: string): SolverIngredient | null {
  return SOLVABLE_INGREDIENTS.find((i) => i.id === id) ?? null;
}

/**
 * Residual above which the derived properties should not be trusted.
 *
 * BASIS: a complete proximate analysis closes at 1.000, so the residual is the
 * mass the model cannot see. `[MEASURED]` vanilla extract closes at 0.656 —
 * the missing third is ethanol, invisible to Choi–Okos, and the correlation
 * returns ρ = 1641 kg·m⁻³ against a real ~880. Black pepper closes at 0.947
 * because SR Legacy's carbohydrate for it is not by-difference, and its
 * properties are still usable. 5 % separates the two cases.
 */
export const UNACCOUNTED_MASS_LIMIT = 0.05;

// ============================================================================
// Input
// ============================================================================

export interface AmbientConditions {
  /** Kitchen air, °C. */
  airC: number;
  /** Kitchen relative humidity, 0–100. */
  relativeHumidityPct: number;
  /** Air movement over the food, m·s⁻¹. Zero for still air. */
  airVelocityMs: number;
  /** Metres above sea level. Moves the water ceiling. */
  elevationM: number;
}

/** Sea-level standard atmosphere. Deterministic and reproducible, NOT weather. */
export const DEFAULT_AMBIENT: AmbientConditions = {
  airC: 20,
  relativeHumidityPct: 50,
  airVelocityMs: 0,
  elevationM: 0,
};

export interface SolverInput {
  ingredientId: string;
  geometry: FoodGeometry;
  /** Half-thickness for a slab, radius for a cylinder or sphere, m. */
  halfDimensionM: number;
  massKg: number;
  /** Starting core temperature, °C. */
  startC: number;
  /** Target core temperature, °C. */
  targetC: number;
  /** A key of `METHOD_PHYSICS`. */
  methodId: string;
  ambient?: Partial<AmbientConditions>;
  /** A vessel id from the registry. Omit for a roast on a rack. */
  vesselId?: string;
  /** Overrides the vessel's own lid seal. Ignored when the vessel has no lid. */
  lidSeal?: LidSeal;
  /** Power reaching the contents, W. Required for a covered water loss. */
  burnerPowerW?: number;
}

// ============================================================================
// Output
// ============================================================================

export interface CoreTimeReading {
  minutes: number;
  /** The coefficient that produced it, W·m⁻²·K⁻¹. */
  hWm2K: number;
  biot: number;
  /** Fourier number at the answer. */
  fourier: number;
  /**
   * False when Fo ≤ 0.2 and the one-term truncation understates the early
   * transient.
   *
   * Surfaced rather than swallowed: it is the difference between a thin cutlet
   * answer that is right and one that is optimistic, and the caller is the only
   * one who can decide whether to show it.
   */
  oneTermValid: boolean;
}

export interface WaterLossReading {
  /** Free-surface or covered, depending on the arrangement. */
  gramsPerHour: number;
  /** Power leaving as latent heat, W. */
  latentWatts: number;
  /** Set when a lid is fitted and a burner power was supplied. */
  covered?: {
    returnedGramsPerHour: number;
    holding: boolean;
    returnFraction: number;
  };
}

export interface SurfaceStateReading {
  /** A LOWER bound: free water evaporating. Real food sits above it. */
  lowerBoundC: number;
  /** The local water ceiling, °C. */
  ceilingC: number;
  /** True when the surface reaches the ceiling and stops. */
  saturated: boolean;
  /** Whether it can reach the Maillard threshold at all. */
  canBrown: boolean;
  browningNote: string;
}

export interface SolverResult {
  ingredient: SolverIngredient;
  /** ρ, cp, k, α from Choi–Okos at the mean of start and target. */
  properties: Reading<ReturnType<typeof foodProperties>>;
  /** Set when the composition leaves too much mass unaccounted for. */
  compositionWarning?: string;
  vessel: VesselDerived | null;
  ambient: AmbientConditions;
  /** Local boiling point, °C, and whether the pressure had to be clamped. */
  ceilingC: number;
  ceilingClamped: boolean;
  surfaceAreaToVolumePerM: number;
  coreTime: Reading<CoreTimeReading>;
  waterLoss: Reading<WaterLossReading>;
  surfaceState: Reading<SurfaceStateReading>;
  bottleneck: Reading<BoundaryNetworkResult>;
}

const MAILLARD_THRESHOLD_C = 140;

/**
 * Solve one arrangement.
 *
 * Never throws for a physical reason — a refusal downstairs becomes an
 * unavailable {@link Reading} with the kernel's own explanation attached. It
 * DOES throw for a programming error: an unknown ingredient, method or vessel
 * id is a bug in the caller, not a fact about the world, and silently
 * degrading it would hide the bug.
 */
export function solveArrangement(input: SolverInput): SolverResult {
  const ingredient = getSolvableIngredient(input.ingredientId);
  if (!ingredient) {
    throw new RangeError(
      `no solvable ingredient "${input.ingredientId}" — only ${SOLVABLE_INGREDIENT_COUNT} of ` +
        `${TOTAL_INGREDIENT_COUNT} ingredients carry a proximate composition`,
    );
  }
  const method = METHOD_PHYSICS[input.methodId];
  if (!method) throw new RangeError(`unknown cooking method "${input.methodId}"`);
  const vessel = input.vesselId ? getVessel(input.vesselId) : null;
  if (input.vesselId && !vessel) throw new RangeError(`unknown vessel "${input.vesselId}"`);

  const ambient: AmbientConditions = { ...DEFAULT_AMBIENT, ...input.ambient };
  const ceiling = saturationCeilingAtElevation(ambient.elevationM);

  const meanC = (input.startC + input.targetC) / 2;
  const properties = attempt(
    () => foodProperties(ingredient.composition, meanC),
    "food properties",
  );
  const compositionWarning =
    Math.abs(ingredient.unaccountedFraction) > UNACCOUNTED_MASS_LIMIT
      ? `${(ingredient.unaccountedFraction * 100).toFixed(1)} % of this ingredient's mass is ` +
        `unaccounted for by the five proximate fractions, so the derived properties are ` +
        `not reliable`
      : undefined;

  const surfaceAreaToVolumePerM = surfaceAreaToVolume(input.geometry, input.halfDimensionM);

  // ── Core time ────────────────────────────────────────────────────────────
  const hTyped = method.h?.typical;
  const coreTime: Reading<CoreTimeReading> = !hTyped
    ? missing(
        `${input.methodId} is ${method.rateLimiter}-limited and declares no heat transfer ` +
          `coefficient, so a core time is not the question it answers`,
      )
    : properties.available
      ? attempt(() => {
          const result = slabCoreTime({
            // `slabCoreTime` takes the FULL thickness in millimetres; this
            // module carries the half-dimension in metres, because that is what
            // the Biot number and the geometry helpers are defined on. The
            // conversion is here, once, rather than at every call site.
            thicknessMm: input.halfDimensionM * 2 * 1000,
            initialC: input.startC,
            mediumC: method.mediumC,
            targetC: input.targetC,
            hWm2K: hTyped,
            kWmK: properties.value.conductivityWmK,
            alphaM2s: properties.value.diffusivityM2S,
          });
          return {
            minutes: result.minutes,
            hWm2K: hTyped,
            biot: result.biot,
            fourier: result.fourier,
            oneTermValid: result.oneTermValid,
          };
        }, "core time")
      : missing(`core time needs the food's properties, which are unavailable`);

  // ── Water loss ───────────────────────────────────────────────────────────
  // Guarded on the same `h` as the rest. Without it the arithmetic still runs
  // and returns a clean `0 g·h⁻¹` — the surface sits at ambient, the driving
  // force vanishes, and the answer is a computed zero to a question nobody
  // asked. Pickling's mass transfer is diffusion into brine, not evaporation
  // into air, and a confident nought is the worst way to say so.
  const waterLoss: Reading<WaterLossReading> = !hTyped
    ? missing(
        `${input.methodId} is ${method.rateLimiter}-limited: its mass transfer is not ` +
          `evaporation into air, so a free-surface water loss is not the question it answers`,
      )
    : attempt<WaterLossReading>(() => {
    const surfaceC = Math.min(ceiling.celsius, method.mediumC);
    const water = saturatedWaterProperties(Math.min(100, Math.max(6.85, surfaceC)));
    const areaM2 = vessel ? vessel.rimAreaM2 : 1 / surfaceAreaToVolumePerM;
    const perimeterM = vessel
      ? Math.PI * (vessel.internalDiameterMm / 1000)
      : Math.PI * Math.sqrt((4 * areaM2) / Math.PI);
    const lc = plateCharacteristicLength(areaM2, perimeterM);
    const filmC = (surfaceC + ambient.airC) / 2;
    const h = naturalConvectionH(
      airProperties(filmC),
      "horizontal-up",
      Math.max(1e-9, surfaceC - ambient.airC),
      lc,
    ).hWm2K;
    const bulk = humidAirVapourDensity(
      ambient.airC,
      ambient.relativeHumidityPct,
      ambient.airC,
    );
    const free = evaporativeFlux(h, surfaceC, ambient.airC, bulk, water.hfgJkg);
    const open: WaterLossReading = {
      gramsPerHour: free.massFluxKgM2s * areaM2 * 3.6e6,
      latentWatts: free.latentFluxWm2 * areaM2,
    };

    const seal: LidSeal | undefined = vessel?.lid ? (input.lidSeal ?? vessel.lid.seal) : undefined;
    if (!vessel?.lid || seal === "none" || input.burnerPowerW === undefined) return open;

    // A lid changes the question entirely: see `coveredWaterLoss`.
    const balance = lidHeatBalance({
      lidAreaM2: vessel.rimAreaM2,
      lidPerimeterM: perimeterM,
      lidThicknessM: vessel.lid.thicknessMm / 1000,
      lidKWmK: vessel.material.kWmK,
      headspaceC: surfaceC,
      ambientC: ambient.airC,
      latentHeatJkg: latentHeatVaporisation(Math.min(100, surfaceC)),
    });
    const covered = coveredWaterLoss(
      input.burnerPowerW,
      balance.condensationCapacityKgS,
      water.hfgJkg,
    );
    return {
      gramsPerHour: covered.netLossKgS * 3.6e6,
      latentWatts: covered.netLossKgS * water.hfgJkg,
      covered: {
        returnedGramsPerHour: covered.condensateReturnedKgS * 3.6e6,
        holding: covered.holding,
        returnFraction: covered.returnFraction,
      },
    };
      }, "water loss");

  // ── Surface state ────────────────────────────────────────────────────────
  const surfaceState: Reading<SurfaceStateReading> = !hTyped
    ? missing(
        `${input.methodId} declares no heat transfer coefficient, so there is no surface ` +
          `energy balance to solve`,
      )
    : attempt(() => {
        const bulk = humidAirVapourDensity(
          ambient.airC,
          ambient.relativeHumidityPct,
          method.mediumC,
        );
        const radiantC = method.radiantSourceK ? method.radiantSourceK - 273.15 : method.mediumC;
        const pinned = evaporativePinnedSurfaceC(
          method.mediumC,
          bulk,
          hTyped,
          radiantC,
          0.9,
          ceiling.celsius,
        );
        // The water ceiling gates browning only WHILE THE SURFACE IS WET. Once
        // it dries there is no evaporation to pin it and it climbs past the
        // ceiling freely — which is why a roast browns in a 100 °C-ceilinged
        // world at all. An earlier version ANDed the method's own verdict with
        // `ceiling >= 140`, which made browning impossible for every method at
        // every elevation, roasting included.
        const canBrown = method.surfaceCanBrown;
        return {
          lowerBoundC: pinned.celsius,
          ceilingC: ceiling.celsius,
          saturated: pinned.saturated,
          canBrown,
          browningNote: canBrown
            ? `the surface must dry first: while wet it cannot exceed ` +
              `${ceiling.celsius.toFixed(1)} °C, and only once dry can it climb to the ` +
              `~${MAILLARD_THRESHOLD_C} °C Maillard threshold`
            : `this method holds the surface wet throughout, so it stays at or below ` +
              `${ceiling.celsius.toFixed(1)} °C and never reaches the ` +
              `~${MAILLARD_THRESHOLD_C} °C Maillard threshold`,
        };
      }, "surface state");

  // ── Bottleneck ───────────────────────────────────────────────────────────
  const bottleneck: Reading<BoundaryNetworkResult> = !hTyped
    ? missing(
        `${input.methodId} has no heat transfer coefficient, so there is no resistance ` +
          `chain to solve`,
      )
    : properties.available
      ? attempt(() => {
          const foodAreaM2 = surfaceAreaToVolumePerM * (input.massKg / properties.value.densityKgM3);
          return solveBoundaryNetwork({
            sourceC: method.mediumC,
            sinkC: input.startC,
            vessel: vessel
              ? {
                  // ⚠️ STATED SIMPLIFICATION. The method's own `h` is the
                  // MEDIUM-TO-FOOD coefficient; it is reused here for the
                  // burner-to-vessel and vessel-to-medium links because the
                  // method registry publishes no separate values for them.
                  //
                  // The two real coefficients differ by orders of magnitude — a
                  // gas ring against a pot base is ~60 W·m⁻²·K⁻¹ while nucleate
                  // boiling on the inside is thousands — so these two links'
                  // magnitudes should be read as placeholders. What survives the
                  // simplification is the comparison the tab exists for: the
                  // food's own interior against everything outside it, since
                  // `medium-to-food` and `food-interior` are both real.
                  //
                  // The Compare tab uses the honest pair (60 / 5000) because it
                  // fixes one arrangement and can afford to name them.
                  sourceToVesselHWm2K: hTyped,
                  areaM2: vessel.baseAreaM2,
                  kWmK: vessel.material.kWmK,
                  thicknessM: vessel.baseThicknessMm / 1000,
                  vesselToMediumHWm2K: hTyped,
                }
              : undefined,
            food: {
              mediumToFoodHWm2K: hTyped,
              geometry: input.geometry,
              halfDimensionM: input.halfDimensionM,
              kWmK: properties.value.conductivityWmK,
              areaM2: foodAreaM2,
            },
          });
        }, "resistance chain")
      : missing(`the resistance chain needs the food's conductivity, which is unavailable`);

  return {
    ingredient,
    properties,
    compositionWarning,
    vessel,
    ambient,
    ceilingC: ceiling.celsius,
    ceilingClamped: ceiling.clamped,
    surfaceAreaToVolumePerM,
    coreTime,
    waterLoss,
    surfaceState,
    bottleneck,
  };
}
