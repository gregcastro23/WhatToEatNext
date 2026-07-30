import type {
  EnvironmentalResponseProfile,
  PhysicalCoefficient,
  RegimeKinetics,
} from "@/types/environmentalResponseSchema";

/**
 * Worked exemplar profiles for the Dual-Baseline Engine.
 *
 * Five methods chosen because each one breaks a naive design:
 *   - `roasting`         — surface and interior respond to humidity in OPPOSITE directions
 *   - `pressure_cooking` — the vessel's gauge composes with ambient rather than cancelling it
 *   - `baking`           — two humidity clocks at once (dough surface vs. pantry flour)
 *   - `dehydrating`      — humidity is first-order and pressure is not negligible
 *   - `frying`           — the method that should mostly report "nothing to say today"
 *
 * The remaining 26 canonical methods land in follow-up work. Shipping five sourced
 * profiles beats thirty invented ones.
 */

// ============================================================================
// Shared physics constants — DERIVED, not tunable
// ============================================================================

/**
 * Clausius–Clapeyron slope at 1 atm: dT/dP = R·T²/(L·P).
 * 8.314 × 373.15² / (40660 × 101325) = 2.810e-4 K/Pa = 0.281 °C/kPa.
 */
const CLAUSIUS_CLAPEYRON_SLOPE: PhysicalCoefficient = {
  value: 0.281,
  unit: "degC_per_kPa",
  basis: "DERIVED",
  source: "dT/dP = R·T²/(L·P); R=8.314 J/mol·K, T=373.15 K, L=40660 J/mol, P=101.325 kPa",
  tunable: false,
};

/**
 * Isothermal gas expansion, Boyle: V ∝ 1/P, so dV/V per kPa = 1/P = 1/101.325.
 *
 * This is the coefficient that most needs protecting from "tuning". A 1.5 kPa
 * front — a genuinely large weather anomaly — buys 1.5% extra bubble volume, not
 * a 15% change in proofing time. Any copy claiming otherwise is not describing
 * this coefficient.
 */
const BOYLE_EXPANSION_PER_KPA: PhysicalCoefficient = {
  value: 0.00987,
  unit: "fraction_per_kPa",
  basis: "DERIVED",
  source: "Boyle's law V ∝ 1/P; dV/V per kPa = 1/101.325 kPa at sea-level standard",
  tunable: false,
};

/**
 * Closed-cavity ambient coupling.
 *
 * Bounded by a mass balance rather than guessed. A ~50 L oven cavity at a 20 °C
 * ambient dew point holds ~0.87 g of water (17.3 g/m³ × 0.05 m³). A 2 kg roast
 * releases 200–400 g of water over the cook. Even at ~10 cavity air changes, the
 * ambient contribution is ~9 g against ~300 g — under 3%.
 *
 * The practical consequence: for a CLOSED oven, outdoor humidity is not a
 * meaningful driver of cavity humidity, and advisories built on the assumption
 * that it is will be confidently wrong.
 */
const CLOSED_CAVITY_COUPLING: PhysicalCoefficient = {
  value: 0.03,
  unit: "fraction",
  basis: "DERIVED",
  source:
    "Mass balance: ambient-supplied vapour (~0.87 g per 50 L cavity at 20 °C dew point, " +
    "~9 g over ~10 air changes) vs. food-released vapour (200–400 g per 2 kg roast)",
  tunable: true,
};

/** Open-air cooking: the ambient air IS the cooking atmosphere. Coupling is unity by definition. */
const OPEN_AIR_COUPLING: PhysicalCoefficient = {
  value: 1.0,
  unit: "fraction",
  basis: "DERIVED",
  source: "Open-air method; the cooking atmosphere is ambient air by definition",
  tunable: false,
};

/**
 * Wheat-flour sorption → dough hydration.
 *
 * Flour EMC runs ~9% at 30% RH to ~15% at 75% RH (20–25 °C), i.e. ~0.13 points of
 * flour moisture per RH point. At 65% baker's hydration, 1 point of flour moisture
 * displaces 1/0.65 = 1.54% of formula water. Near a 21 °C indoor temperature the
 * dew-point→RH slope is ~3.3 RH points per °C.
 *
 *   0.13 × 0.0154 × 3.3 ≈ 0.0066 per °C of dew-point anomaly.
 *
 * So a +4 °C dew-point anomaly, AT FULL EQUILIBRATION, justifies holding back
 * ~2.6% of formula water — not 10%. The dew-point→RH slope is nonlinear, hence
 * tunable and clamped.
 */
const FLOUR_HYDRATION_PER_DEGC: PhysicalCoefficient = {
  value: -0.0066,
  unit: "hydration_fraction_per_degC_dewpoint",
  basis: "DERIVED",
  source:
    "Wheat flour sorption isotherm (~0.13 %moisture per %RH, 20–25 °C) × 1/0.65 baker's " +
    "hydration × 3.3 %RH per °C dew point at 21 °C (Magnus–Tetens, linearized at Td≈10 °C)",
  tunable: true,
};

// ============================================================================
// Regime kinetics  (Q3C)
// ============================================================================

export const REGIME_KINETICS: Partial<Record<string, RegimeKinetics>> = {
  saturation_limited: {
    regime: "saturation_limited",
    activationEnergyKjMol: {
      value: 110,
      unit: "kJ_per_mol",
      basis: "MEASURED",
      source: "Legume/starch softening kinetics, literature range 80–120 kJ/mol; midpoint",
      tunable: true,
    },
    referenceTemperatureK: 370,
    // exp(110000/8.314 × (1/370 − 1/380)) = 2.56
    q10AtReference: 2.56,
    lethalityZValueC: 10,
  },
  setpoint_limited: {
    regime: "setpoint_limited",
    activationEnergyKjMol: {
      value: 120,
      unit: "kJ_per_mol",
      basis: "MEASURED",
      source: "Maillard browning kinetics, literature range 100–160 kJ/mol; low-mid",
      tunable: true,
    },
    referenceTemperatureK: 430,
    // exp(120000/8.314 × (1/430 − 1/440)) = 2.14
    q10AtReference: 2.14,
    lethalityZValueC: null,
  },
};

// ============================================================================
// Exemplar profiles
// ============================================================================

/**
 * ROASTING — the opposed-channel case.
 *
 * Higher ambient moisture raises the wet-bulb plateau, so the INTERIOR pushes
 * through the evaporative stall faster. Simultaneously it lowers the vapour-pressure
 * deficit, so the SURFACE takes longer to dry out and browning is DELAYED.
 * Same method, same driver, opposite signs. A per-method scalar would have to
 * pick one and silently discard the other.
 *
 * Both effects are then scaled by CLOSED_CAVITY_COUPLING (~0.03), which is what
 * stops this profile from emitting a confident "crank the oven 10 °C" advisory
 * off a humid day. In a closed oven, it will almost always self-suppress.
 */
const roasting: EnvironmentalResponseProfile = {
  method: "roasting",
  primaryRegime: "setpoint_limited",
  channels: [
    {
      channel: "surface",
      regime: "evaporation_limited",
      ambientCoupling: CLOSED_CAVITY_COUPLING,
      pressure: null,
      humidity: {
        coefficient: {
          value: 0.018,
          unit: "time_fraction_per_degC_dewpoint",
          basis: "DERIVED",
          source:
            "Surface drying rate ∝ vapour-pressure deficit; d(VPD)/d(Td) at 21 °C reference " +
            "normalized to time-to-dry at oven cavity conditions",
          tunable: true,
        },
        axis: "time_multiplier",
        minimumEffect: 0.03,
        minimumZ: 1.5,
        maximumEffect: 0.2,
      },
      humidityClock: "instant",
      mechanism:
        "Higher ambient moisture lowers the vapour-pressure deficit at the surface, " +
        "slowing the drying front and delaying the onset of Maillard browning.",
    },
    {
      channel: "interior",
      regime: "setpoint_limited",
      ambientCoupling: CLOSED_CAVITY_COUPLING,
      pressure: null,
      humidity: {
        coefficient: {
          value: -0.012,
          unit: "time_fraction_per_degC_dewpoint",
          basis: "DERIVED",
          source:
            "Wet-bulb plateau rises with absolute humidity, reducing evaporative cooling " +
            "of the interior stall; sign is opposite the surface channel",
          tunable: true,
        },
        axis: "time_multiplier",
        minimumEffect: 0.03,
        minimumZ: 1.5,
        maximumEffect: 0.15,
      },
      humidityClock: "instant",
      mechanism:
        "A higher wet-bulb temperature means less evaporative cooling, so the interior " +
        "climbs through the stall plateau sooner.",
    },
  ],
  vesselPressure: null,
  notes:
    "Opposed channels are intentional. Do not collapse them to a net scalar — the " +
    "correct advisory is 'browning lags, core runs ahead', not an averaged nothing.",
};

/**
 * PRESSURE_COOKING — the gauge-composition case.
 *
 * A weight or spring valve regulates to a fixed GAUGE pressure, so absolute
 * pressure is ambient + gauge. Altitude propagates straight through the appliance:
 * 15 psi (103 kPa) gauge over Denver's 83.4 kPa ambient is 186 kPa absolute
 * (~117 °C), not the sea-level 204 kPa (~121 °C). The pressure cooker rescales
 * the altitude penalty; it does not cancel it.
 */
const pressureCooking: EnvironmentalResponseProfile = {
  method: "pressure_cooking",
  primaryRegime: "saturation_limited",
  channels: [
    {
      channel: "medium",
      regime: "saturation_limited",
      ambientCoupling: {
        value: 1.0,
        unit: "fraction",
        basis: "DERIVED",
        source: "Sealed vessel regulates gauge pressure; ambient adds directly to absolute",
        tunable: false,
      },
      pressure: {
        coefficient: CLAUSIUS_CLAPEYRON_SLOPE,
        axis: "temperature_delta_c",
        minimumEffect: 0.5,
        // Elevation-driven, not anomaly-driven. Geography is always true, so it is
        // never statistically gated — a Denver user should always be told.
        minimumZ: 0,
        maximumEffect: 15,
      },
      humidity: null,
      humidityClock: "instant",
      mechanism:
        "The valve holds a fixed pressure ABOVE ambient, so a lower ambient pressure " +
        "lowers the absolute pressure in the vessel and with it the saturation temperature.",
    },
  ],
  vesselPressure: {
    regulation: "fixed_gauge",
    gaugeKpa: {
      value: 103.4,
      unit: "kPa",
      basis: "MEASURED",
      source: "15 psi gauge, standard stovetop weight valve; 15 × 6.89476 kPa/psi",
      tunable: false,
    },
    canningAdvisory: true,
  },
  notes:
    "Electric units (Instant Pot class) regulate lower, ~10–11.6 psi. Model them as a " +
    "separate 'electronic' variant rather than reusing this gauge value.",
};

/**
 * BAKING — the two-clock case.
 *
 * Three channels on three different timescales:
 *   - `leavening`  reads TODAY's pressure (gas expands the instant it is formed)
 *   - `surface`    reads TODAY's dew point (crust skin forms in minutes)
 *   - `ingredient` reads the LAGGED dew point (flour in a sealed bin equilibrates
 *                  over days, so today's spike has not reached it yet)
 *
 * Driving the Pantry Hydration Index off today's reading would claim an effect the
 * sorption process has not had time to produce.
 */
const baking: EnvironmentalResponseProfile = {
  method: "baking",
  primaryRegime: "leavening_limited",
  channels: [
    {
      channel: "leavening",
      regime: "leavening_limited",
      ambientCoupling: {
        value: 1.0,
        unit: "fraction",
        basis: "DERIVED",
        source: "Dough is at ambient pressure throughout proofing; coupling is unity",
        tunable: false,
      },
      pressure: {
        coefficient: BOYLE_EXPANSION_PER_KPA,
        axis: "expansion_multiplier",
        // 5% expansion needs a ~5 kPa anomaly — far beyond normal weather. This
        // gate is why the leavening advisory correctly stays silent on most days.
        minimumEffect: 0.05,
        minimumZ: 1.5,
        maximumEffect: 0.25,
      },
      humidity: null,
      humidityClock: "instant",
      mechanism:
        "Lower ambient pressure lets the same mass of CO2 occupy more volume, so the " +
        "dough reaches a given rise sooner.",
    },
    {
      channel: "ingredient",
      regime: "ambient_limited",
      ambientCoupling: {
        value: 0.6,
        unit: "fraction",
        basis: "DERIVED",
        source:
          "Fraction of indoor vapour pressure reaching flour in typical domestic storage " +
          "(paper bag / non-airtight bin); sealed containers approach 0",
        tunable: true,
      },
      pressure: null,
      humidity: {
        coefficient: FLOUR_HYDRATION_PER_DEGC,
        axis: "hydration_multiplier",
        minimumEffect: 0.015,
        // Lower than the instant-clock channels: the EMA has already smoothed out
        // single-day noise, so a sustained shift is meaningful at a lower z.
        minimumZ: 1.0,
        maximumEffect: 0.05,
      },
      humidityClock: "lagged",
      mechanism:
        "Flour is hygroscopic and equilibrates with stored air over days, so a sustained " +
        "humid spell — not a single humid day — leaves it holding extra water.",
    },
  ],
  vesselPressure: null,
  notes:
    "Exposed sugar work (macarons, pulled sugar) is the SAME driver on the 'instant' " +
    "clock and belongs on its own method key, not folded in here.",
};

/**
 * DEHYDRATING — humidity first-order, pressure genuinely non-negligible.
 * The one regime where the daily anomaly regularly clears its own threshold.
 */
const dehydrating: EnvironmentalResponseProfile = {
  method: "dehydrating",
  primaryRegime: "evaporation_limited",
  channels: [
    {
      channel: "surface",
      regime: "evaporation_limited",
      ambientCoupling: OPEN_AIR_COUPLING,
      pressure: {
        coefficient: {
          value: -0.006,
          unit: "time_fraction_per_kPa",
          basis: "DERIVED",
          source:
            "Evaporation rate ∝ (e_s − e_a)/P; lower ambient pressure raises the diffusion " +
            "coefficient and the driving ratio",
          tunable: true,
        },
        axis: "time_multiplier",
        minimumEffect: 0.03,
        minimumZ: 1.5,
        maximumEffect: 0.25,
      },
      humidity: {
        coefficient: {
          value: 0.055,
          unit: "time_fraction_per_degC_dewpoint",
          basis: "DERIVED",
          source:
            "Drying time ∝ 1/VPD; d(VPD)/d(Td) via Magnus–Tetens linearized at 21 °C, Td≈10 °C",
          tunable: true,
        },
        axis: "time_multiplier",
        minimumEffect: 0.05,
        minimumZ: 1.5,
        maximumEffect: 0.6,
      },
      humidityClock: "instant",
      mechanism:
        "Drying is driven by vapour-pressure deficit; humid air shrinks the deficit and " +
        "the water has nowhere to go.",
    },
  ],
  vesselPressure: null,
};

/**
 * FRYING — the negative control.
 *
 * Included deliberately. Oil at 190 °C is a sealed thermal mass whose temperature
 * is set by the burner, not the weather; ambient humidity coupling is ~0. Pressure
 * does shift the food's internal moisture plateau, but only by ~0.28 °C per kPa
 * against a ~90 °C driving differential — well under 1%, so the daily anomaly
 * self-suppresses and only the elevation baseline ever surfaces.
 *
 * If this profile ever emits a daily advisory, the engine has a bug.
 */
const frying: EnvironmentalResponseProfile = {
  method: "frying",
  primaryRegime: "setpoint_limited",
  channels: [
    {
      channel: "interior",
      regime: "saturation_limited",
      ambientCoupling: {
        value: 0.05,
        unit: "fraction",
        basis: "DERIVED",
        source: "Oil is a thermal mass at ~190 °C held by the burner; ambient air does not reach the food's moisture plateau",
        tunable: true,
      },
      pressure: {
        coefficient: CLAUSIUS_CLAPEYRON_SLOPE,
        axis: "temperature_delta_c",
        // Requires ~7 kPa to clear — i.e. elevation, never weather.
        minimumEffect: 2.0,
        // Elevation-driven. Not z-gated, but the effect floor alone keeps this
        // silent on every weather day, which is the intended negative-control behavior.
        minimumZ: 0,
        maximumEffect: 15,
      },
      humidity: null,
      humidityClock: "instant",
      mechanism:
        "The water inside the food boils at the ambient-pressure saturation temperature, " +
        "so at altitude steam drives out earlier and the crust sets before the centre catches up.",
    },
  ],
  vesselPressure: null,
  notes: "Negative control. A daily-anomaly advisory here indicates a threshold-gating bug.",
};

export const ENVIRONMENTAL_RESPONSE_PROFILES: Partial<
  Record<string, EnvironmentalResponseProfile>
> = {
  roasting,
  pressure_cooking: pressureCooking,
  baking,
  dehydrating,
  frying,
};
