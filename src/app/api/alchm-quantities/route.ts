/**
 * GET/POST /api/alchm-quantities
 * Backward-compatible payload used by:
 * - alchm-quantities-display
 * - alchm-kinetics
 */
import { NextResponse } from "next/server";
import { PLANET_WEIGHTS, normalizePlanetWeight } from "@/data/planets";
import { rateLimit } from "@/lib/rateLimit";
import { getServiceUrlSafe } from "@/lib/serviceUrls";
import { AlchmQuantitiesApiResponseSchema } from "@/lib/validation/apiSchemas";
import { getCachedHistoricalStats } from "@/services/HistoricalStatsService";
import { alchemize, type PlanetaryPosition } from "@/services/RealAlchemizeService";
import type { DegradedInfo } from "@/types/degraded";
import { isCurrentSkyDiurnal } from "@/utils/astrology/positions";
import { createLogger } from "@/utils/logger";
import { PLANETARY_ALCHEMY } from "@/utils/planetaryAlchemyMapping";
import {
  calculatePlanetaryPositions,
  calculatePlanetaryPositionsWithMeta,
  getFallbackPlanetaryPositions,
} from "@/utils/serverPlanetaryCalculations";

const logger = createLogger("AlchmQuantitiesAPI");

const ALCHM_QUANTITIES_LIMIT = { window: 60_000, max: 30, bucket: "alchm-quantities" };

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 300;

type EsmsKey = "Spirit" | "Essence" | "Matter" | "Substance";

const ESMS_KEYS: EsmsKey[] = ["Spirit", "Essence", "Matter", "Substance"];

function toFinite(value: unknown, fallback = 0): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function round(value: number, digits = 4): number {
  const factor = 10 ** digits;
  return Math.round(toFinite(value) * factor) / factor;
}

function asPlanetaryPositions(
  positions: Record<string, any>,
): Record<string, PlanetaryPosition> {
  const normalized: Record<string, PlanetaryPosition> = {};

  Object.entries(positions).forEach(([planet, pos]) => {
    normalized[planet] = {
      sign: String(pos?.sign ?? "").toLowerCase(),
      degree: toFinite(pos?.degree),
      minute: toFinite(pos?.minute),
      isRetrograde: Boolean(pos?.isRetrograde),
      // Carried through so aspects get real angular separations; dropping it
      // forces a reconstruction from sign + degree.
      exactLongitude:
        typeof pos?.exactLongitude === "number" ? pos.exactLongitude : undefined,
    };
  });

  return normalized;
}

function buildVelocity(
  current: Record<EsmsKey, number>,
  previous: Record<EsmsKey, number>,
  deltaHours: number,
): Record<EsmsKey, number> {
  return {
    Spirit: round((current.Spirit - previous.Spirit) / deltaHours, 6),
    Essence: round((current.Essence - previous.Essence) / deltaHours, 6),
    Matter: round((current.Matter - previous.Matter) / deltaHours, 6),
    Substance: round((current.Substance - previous.Substance) / deltaHours, 6),
  };
}

function buildAcceleration(
  velocityNow: Record<EsmsKey, number>,
  velocityPrev: Record<EsmsKey, number>,
  deltaHours: number,
): Record<EsmsKey, number> {
  return {
    Spirit: round((velocityNow.Spirit - velocityPrev.Spirit) / deltaHours, 6),
    Essence: round((velocityNow.Essence - velocityPrev.Essence) / deltaHours, 6),
    Matter: round((velocityNow.Matter - velocityPrev.Matter) / deltaHours, 6),
    Substance: round((velocityNow.Substance - velocityPrev.Substance) / deltaHours, 6),
  };
}

function buildMomentum(
  quantities: Record<EsmsKey, number>,
  velocity: Record<EsmsKey, number>,
): Record<EsmsKey, number> {
  return {
    Spirit: round(quantities.Spirit * velocity.Spirit, 6),
    Essence: round(quantities.Essence * velocity.Essence, 6),
    Matter: round(quantities.Matter * velocity.Matter, 6),
    Substance: round(quantities.Substance * velocity.Substance, 6),
  };
}

export async function GET(request: Request) {
  const rl = await rateLimit(request, ALCHM_QUANTITIES_LIMIT);
  if (!rl.allowed) return rl.response!;

  try {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

    let nowPositions: Record<string, any>;
    let prevPositions: Record<string, any>;
    let prev2Positions: Record<string, any>;
    // Degradation of the *current* sky is what the response headlines. prev/prev2
    // only feed velocity/acceleration deltas, so their fallbacks don't flag the payload.
    let positionsDegraded: DegradedInfo | null = null;
    try {
      const nowMeta = await calculatePlanetaryPositionsWithMeta(now);
      nowPositions = nowMeta.positions;
      positionsDegraded = nowMeta.degraded;
      prevPositions = await calculatePlanetaryPositions(oneHourAgo);
      prev2Positions = await calculatePlanetaryPositions(twoHoursAgo);
    } catch (error) {
      logger.warn("Using fallback planetary positions for /api/alchm-quantities", {
        error: error instanceof Error ? error.message : String(error),
      });
      nowPositions = getFallbackPlanetaryPositions();
      prevPositions = getFallbackPlanetaryPositions();
      prev2Positions = getFallbackPlanetaryPositions();
      positionsDegraded = { reasons: ["astronomy-engine-fallback"] };
    }

    const nowAlch = alchemize(
      asPlanetaryPositions(nowPositions),
      asPlanetaryPositions(prevPositions),
      now,
      { incomingDegraded: positionsDegraded },
    );
    const prevAlch = alchemize(asPlanetaryPositions(prevPositions), asPlanetaryPositions(prev2Positions), oneHourAgo);
    const prev2Alch = alchemize(asPlanetaryPositions(prev2Positions), null, twoHoursAgo);

    const quantities = {
      Spirit: round(nowAlch.esms.Spirit),
      Essence: round(nowAlch.esms.Essence),
      Matter: round(nowAlch.esms.Matter),
      Substance: round(nowAlch.esms.Substance),
    };

    const previousQuantities = {
      Spirit: round(prevAlch.esms.Spirit),
      Essence: round(prevAlch.esms.Essence),
      Matter: round(prevAlch.esms.Matter),
      Substance: round(prevAlch.esms.Substance),
    };

    const previous2Quantities = {
      Spirit: round(prev2Alch.esms.Spirit),
      Essence: round(prev2Alch.esms.Essence),
      Matter: round(prev2Alch.esms.Matter),
      Substance: round(prev2Alch.esms.Substance),
    };

    const aNumber = round(
      quantities.Spirit + quantities.Essence + quantities.Matter + quantities.Substance,
    );
    const velocity = buildVelocity(quantities, previousQuantities, 1);
    const velocityPrev = buildVelocity(previousQuantities, previous2Quantities, 1);
    const acceleration = buildAcceleration(velocity, velocityPrev, 1);
    const momentum = buildMomentum(quantities, velocity);

    // Fetch ISR 30-day historical context aggressively without blocking math calculation
    const historicalContext = await getCachedHistoricalStats();

    const heat = round(nowAlch.thermodynamicProperties.heat, 6);
    const entropy = round(nowAlch.thermodynamicProperties.entropy, 6);
    const reactivity = round(nowAlch.thermodynamicProperties.reactivity, 6);
    const energy = round(nowAlch.thermodynamicProperties.gregsEnergy, 6);
    const kalchm = round(nowAlch.kalchm, 6);
    const monica = round(nowAlch.monica, 6);

    const charge = round(quantities.Matter + quantities.Substance, 6);
    const potentialDifference = round(charge > 0 ? energy / charge : 0, 6);
    const currentFlow = round(reactivity * charge * 0.1, 6);
    const power = round(currentFlow * potentialDifference, 6);
    const inertia = round(
      Math.max(
        1,
        quantities.Matter +
        quantities.Substance +
        nowAlch.elementalProperties.Earth * 10,
      ),
      6,
    );
    const forceMagnitude = round(Math.abs(power) / Math.max(inertia, 1), 6);

    const forceClassification: "accelerating" | "decelerating" | "balanced" =
      forceMagnitude > 0.25
        ? "accelerating"
        : forceMagnitude < 0.05
          ? "decelerating"
          : "balanced";

    const thermalDirection: "heating" | "cooling" | "stable" =
      heat > round(prevAlch.thermodynamicProperties.heat, 6) + 0.0001
        ? "heating"
        : heat < round(prevAlch.thermodynamicProperties.heat, 6) - 0.0001
          ? "cooling"
          : "stable";

    const isDiurnalNow = isCurrentSkyDiurnal(now);

    // -----------------------------------------------------------------------
    // VECTOR ESMS + REACTIVE P=IV CIRCUIT — GEOCENTRIC FRAME
    //
    // Reference frame: GEOCENTRIC ecliptic of date. All inputs (exactLongitude,
    // eclipticLatitude, distance, *Speed fields) are measured with Earth at the
    // origin — this is the only frame astrology recognizes.
    //   - exactLongitude/longitudeSpeed: geocentric apparent ecliptic longitude
    //     and its time derivative (deg/day). longitudeSpeed < 0 ⇒ retrograde
    //     (an artifact of geocentric perspective; planets don't truly reverse).
    //   - eclipticLatitude/latitudeSpeed: out-of-ecliptic-plane component.
    //   - distance/distanceSpeed: Earth-to-body range in AU and its rate.
    //
    // Each planet contributes a 3D position vector (geocentric ecliptic
    // Cartesian: x toward 0° Aries, y toward 90° Cancer, z toward N ecliptic
    // pole) and a velocity vector derived by chain rule from the three speeds.
    // We sum these into four ESMS vectors weighted by PLANETARY_ALCHEMY[planet].
    //
    // The circuit treats applying aspects as capacitive (energy storage) and
    // separating aspects as inductive (resistance to change). The elemental
    // mix becomes resistive impedance R. Net reactance X = ωL − 1/(ωC).
    // -----------------------------------------------------------------------
    interface Vec3 { x: number; y: number; z: number }
    const ZERO_VEC: Vec3 = { x: 0, y: 0, z: 0 };
    const addVec = (a: Vec3, b: Vec3): Vec3 => ({
      x: a.x + b.x,
      y: a.y + b.y,
      z: a.z + b.z,
    });
    const scaleVec = (v: Vec3, s: number): Vec3 => ({
      x: v.x * s,
      y: v.y * s,
      z: v.z * s,
    });
    const magnitude = (v: Vec3): number =>
      Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
    const roundVec = (v: Vec3, digits = 6): Vec3 => ({
      x: round(v.x, digits),
      y: round(v.y, digits),
      z: round(v.z, digits),
    });

    const DEG2RAD = Math.PI / 180;

    // Build 3D ecliptic Cartesian + velocity for a position record.
    // Distance defaults to 1 AU when the source didn't provide it.
    const positionVec = (pos: any): { r: Vec3; v: Vec3 } => {
      const lon = toFinite(pos?.exactLongitude) * DEG2RAD;
      const lat = toFinite(pos?.eclipticLatitude) * DEG2RAD;
      const r = toFinite(pos?.distance, 1);
      const lonDot = toFinite(pos?.longitudeSpeed) * DEG2RAD; // rad/day
      const latDot = toFinite(pos?.latitudeSpeed) * DEG2RAD; // rad/day
      const rDot = toFinite(pos?.distanceSpeed); // AU/day

      const cosLat = Math.cos(lat);
      const sinLat = Math.sin(lat);
      const cosLon = Math.cos(lon);
      const sinLon = Math.sin(lon);

      const position: Vec3 = {
        x: r * cosLat * cosLon,
        y: r * cosLat * sinLon,
        z: r * sinLat,
      };
      // dP/dt by chain rule
      const velocity: Vec3 = {
        x:
          rDot * cosLat * cosLon -
          r * sinLat * latDot * cosLon -
          r * cosLat * sinLon * lonDot,
        y:
          rDot * cosLat * sinLon -
          r * sinLat * latDot * sinLon +
          r * cosLat * cosLon * lonDot,
        z: rDot * sinLat + r * cosLat * latDot,
      };
      return { r: position, v: velocity };
    };

    // ESMS vector field: sum planet velocities weighted by alchemical contribution.
    // Result is the directional "flow" of each ESMS axis through 3D space.
    const esmsVectors: Record<EsmsKey, Vec3> = {
      Spirit: { ...ZERO_VEC },
      Essence: { ...ZERO_VEC },
      Matter: { ...ZERO_VEC },
      Substance: { ...ZERO_VEC },
    };
    const esmsForce: Record<EsmsKey, Vec3> = {
      Spirit: { ...ZERO_VEC },
      Essence: { ...ZERO_VEC },
      Matter: { ...ZERO_VEC },
      Substance: { ...ZERO_VEC },
    };

    for (const [planet, pos] of Object.entries(nowPositions)) {
      const alch = (PLANETARY_ALCHEMY as any)[planet];
      if (!alch) continue;
      const { r, v } = positionVec(pos);
      // Force magnitude scales with 1/r² (inverse-square coupling),
      // direction along velocity (motion = force-of-becoming).
      const coupling = 1 / Math.max(magnitude(r) * magnitude(r), 0.01);
      for (const key of ESMS_KEYS) {
        const w = toFinite(alch[key]);
        if (w === 0) continue;
        esmsVectors[key] = addVec(esmsVectors[key], scaleVec(v, w));
        esmsForce[key] = addVec(esmsForce[key], scaleVec(v, w * coupling));
      }
    }

    // Aspects: signed orb velocity per pair → applying (negative) vs separating.
    // We reuse computeOrb-style math inline to avoid an extra API hop.
    const SIGN_LIST = [
      "aries","taurus","gemini","cancer","leo","virgo",
      "libra","scorpio","sagittarius","capricorn","aquarius","pisces",
    ];
    const longitudeOf = (pos: any): number => {
      if (pos?.exactLongitude !== undefined) return toFinite(pos.exactLongitude);
      const idx = SIGN_LIST.indexOf(String(pos?.sign ?? "").toLowerCase());
      return Math.max(0, idx) * 30 + toFinite(pos?.degree) + toFinite(pos?.minute) / 60;
    };
    const orbBetween = (L1: number, L2: number, target: number): number => {
      let diff = Math.abs(L1 - L2) % 360;
      if (diff > 180) diff = 360 - diff;
      return Math.abs(diff - target);
    };
    const ASPECT_DEFS: Array<{ type: string; angle: number }> = [
      { type: "conjunction", angle: 0 },
      { type: "opposition", angle: 180 },
      { type: "trine", angle: 120 },
      { type: "square", angle: 90 },
      { type: "sextile", angle: 60 },
    ];
    const PLANET_MOIETIES: Record<string, number> = {
      Sun: 7.5,
      Moon: 6.0,
      Mercury: 3.5,
      Venus: 3.5,
      Mars: 4.0,
      Jupiter: 4.5,
      Saturn: 4.5,
      Uranus: 2.5,
      Neptune: 2.5,
      Pluto: 2.5,
    };
    const ASPECT_SCALES: Record<string, number> = {
      conjunction: 1.0,
      opposition: 1.0,
      trine: 0.9,
      square: 0.8,
      sextile: 0.6,
    };

    let applyingStrengthSum = 0;
    let separatingStrengthSum = 0;
    let relAngVelMagSum = 0;
    let aspectCount = 0;
    const DT_DAYS = 1 / 24;
    const planetNames = Object.keys(nowPositions).filter(
      (n) => (PLANETARY_ALCHEMY as any)[n],
    );
    for (let i = 0; i < planetNames.length; i++) {
      for (let j = i + 1; j < planetNames.length; j++) {
        const p1 = planetNames[i];
        const p2 = planetNames[j];
        const pos1 = nowPositions[p1];
        const pos2 = nowPositions[p2];
        const L1 = longitudeOf(pos1);
        const L2 = longitudeOf(pos2);
        const m1 = toFinite(pos1?.longitudeSpeed);
        const m2 = toFinite(pos2?.longitudeSpeed);

        const moiety1 = PLANET_MOIETIES[p1] ?? 3.0;
        const moiety2 = PLANET_MOIETIES[p2] ?? 3.0;

        // Gravitational/alchemical physical mass coupling
        const w1 = normalizePlanetWeight(PLANET_WEIGHTS[p1] ?? 1.0);
        const w2 = normalizePlanetWeight(PLANET_WEIGHTS[p2] ?? 1.0);
        const combinedWeight = (w1 + w2) / 2;

        for (const def of ASPECT_DEFS) {
          const aspectScale = ASPECT_SCALES[def.type] ?? 0.5;
          const maxOrb = (moiety1 + moiety2) * aspectScale;

          const orb0 = orbBetween(L1, L2, def.angle);
          if (orb0 > maxOrb) continue;
          const L1n = (L1 + m1 * DT_DAYS + 360) % 360;
          const L2n = (L2 + m2 * DT_DAYS + 360) % 360;
          const orb1 = orbBetween(L1n, L2n, def.angle);
          const orbVel = (orb1 - orb0) / DT_DAYS;
          
          // Cosine Bell Curve for smooth, non-linear degree of influence
          const orbRatio = orb0 / maxOrb;
          const degreeOfInfluence = (1 + Math.cos(Math.PI * orbRatio)) / 2;
          
          // Strength scales with closeness and gravitational mass weight
          const strength = degreeOfInfluence * combinedWeight;
          if (orbVel < 0) applyingStrengthSum += strength;
          else separatingStrengthSum += strength;
          relAngVelMagSum += Math.abs(m1 - m2);
          aspectCount += 1;
        }
      }
    }

    // ω: characteristic angular frequency of the system (rad/day).
    // Empty-aspect fallback: 2π/365.25 ≈ Earth's mean motion.
    const omega = aspectCount > 0
      ? (relAngVelMagSum / aspectCount) * DEG2RAD
      : (2 * Math.PI) / 365.25;

    // Capacitance C: energy storage from applying aspects. Floor avoids ÷0.
    // Enhanced: scaled by Substance and Water element (capacitive holding potential)
    const el = nowAlch.elementalProperties;
    const rawCapacitance = Math.max(0.01, applyingStrengthSum + 0.1);
    const substanceRatio = quantities.Substance / Math.max(1, quantities.Matter);
    const waterElement = toFinite(el.Water, 0.25);
    const capacitance = Math.max(0.01, rawCapacitance * substanceRatio * waterElement * 4);

    // Inductance L: resistance to change from separating aspects.
    // Enhanced: scaled by Matter and Earth element (inductive structural resistance)
    const rawInductance = Math.max(0.01, separatingStrengthSum + 0.1);
    const earthElement = toFinite(el.Earth, 0.25);
    const inductance = Math.max(0.01, rawInductance * quantities.Matter * earthElement * 0.5);

    // Resistance R: elemental dissipation. Earth/Water resist, Fire/Air conduct.
    const resistance = Math.max(
      0.01,
      toFinite(el.Earth) * 2 + toFinite(el.Water) * 1.5 +
      toFinite(el.Fire) * 0.5 + toFinite(el.Air) * 0.3,
    );

    // Reactance X = ωL − 1/(ωC); |Z| = √(R² + X²)
    const inductiveReactance = omega * inductance;
    const capacitiveReactance = 1 / (omega * capacitance);
    const reactance = inductiveReactance - capacitiveReactance;
    const impedance = Math.sqrt(resistance * resistance + reactance * reactance);
    const phaseAngle = Math.atan2(reactance, resistance); // radians
    const powerFactor = impedance > 0 ? resistance / impedance : 1;

    // Voltage = the existing potentialDifference (energy per charge);
    // Current = V / |Z|; Real/Reactive/Apparent power decomposition.
    const acCurrent = impedance > 0 ? potentialDifference / impedance : 0;
    const apparentPower = potentialDifference * acCurrent; // VA
    const realPower = apparentPower * powerFactor;
    const reactivePower = apparentPower * Math.sin(phaseAngle);

    const dominantState: "capacitive" | "inductive" | "resistive" =
      Math.abs(reactance) < resistance * 0.1
        ? "resistive"
        : reactance < 0
          ? "capacitive"
          : "inductive";

    const vectorCircuit = {
      // ESMS as 3D vector field (raw velocity-weighted sums)
      esmsField: {
        Spirit: roundVec(esmsVectors.Spirit),
        Essence: roundVec(esmsVectors.Essence),
        Matter: roundVec(esmsVectors.Matter),
        Substance: roundVec(esmsVectors.Substance),
      },
      // ESMS force vectors (1/r² coupling applied)
      esmsForce: {
        Spirit: roundVec(esmsForce.Spirit),
        Essence: roundVec(esmsForce.Essence),
        Matter: roundVec(esmsForce.Matter),
        Substance: roundVec(esmsForce.Substance),
      },
      // Scalar magnitudes (useful for legacy displays / gauges)
      esmsMagnitude: {
        Spirit: round(magnitude(esmsVectors.Spirit), 6),
        Essence: round(magnitude(esmsVectors.Essence), 6),
        Matter: round(magnitude(esmsVectors.Matter), 6),
        Substance: round(magnitude(esmsVectors.Substance), 6),
      },
      // Aspect-driven circuit parameters
      omega: round(omega, 6),
      capacitance: round(capacitance, 6),
      inductance: round(inductance, 6),
      resistance: round(resistance, 6),
      inductiveReactance: round(inductiveReactance, 6),
      capacitiveReactance: round(capacitiveReactance, 6),
      reactance: round(reactance, 6),
      impedance: round(impedance, 6),
      phaseAngle: round(phaseAngle, 6),
      powerFactor: round(powerFactor, 6),
      // AC power triangle
      acCurrent: round(acCurrent, 6),
      realPower: round(realPower, 6),
      reactivePower: round(reactivePower, 6),
      apparentPower: round(apparentPower, 6),
      dominantState,
      // Aspect coupling summary
      applyingStrength: round(applyingStrengthSum, 6),
      separatingStrength: round(separatingStrengthSum, 6),
      aspectCount,
    };

    // Cross-backend verification of quantities
    let crossVerification: any = undefined;
    const isVerificationEnabled =
      process.env.CROSS_BACKEND_SYNC_ENABLED === "true" ||
      process.env.CROSS_BACKEND_RECTIFICATION_ENABLED === "true";

    const internalSecret = process.env.INTERNAL_API_SECRET;
    if (isVerificationEnabled && !internalSecret) {
      // Fail closed: never call the internal backend with a hardcoded fallback
      // secret. If INTERNAL_API_SECRET is unset, skip cross-verification entirely.
      logger.warn(
        "Cross-backend verification enabled but INTERNAL_API_SECRET is unset; skipping verification.",
      );
    }
    if (isVerificationEnabled && internalSecret) {
      const backendUrl = getServiceUrlSafe("wtenBackend");
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);

        let response: Response;
        try {
          response = await fetch(`${backendUrl}/api/alchemical/quantities`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${internalSecret}`
            },
            body: JSON.stringify({
              recipe: {
                elementalProperties: nowAlch.elementalProperties,
                nutritional_profile: {}
              },
              kinetic_rating: round(power, 4),
              planetary_hour_ruler: isDiurnalNow ? "Sun" : "Moon",
              thermo_rating: round(heat, 4)
            }),
            signal: controller.signal
          });
        } finally {
          clearTimeout(timeoutId);
        }

        if (response.ok) {
          const backendData = await response.json();
          const backendQuantities = {
            Spirit: round(backendData.spirit_score || 0),
            Essence: round(backendData.essence_score || 0),
            Matter: round(backendData.matter_score || 0),
            Substance: round(backendData.substance_score || 0)
          };

          const discrepancy = {
            Spirit: round(Math.abs(quantities.Spirit - backendQuantities.Spirit)),
            Essence: round(Math.abs(quantities.Essence - backendQuantities.Essence)),
            Matter: round(Math.abs(quantities.Matter - backendQuantities.Matter)),
            Substance: round(Math.abs(quantities.Substance - backendQuantities.Substance))
          };

          const maxDiscrepancy = Math.max(discrepancy.Spirit, discrepancy.Essence, discrepancy.Matter, discrepancy.Substance);

          // A backend value is only authoritative when it's finite and > 0. An
          // all-zero or partial payload means the backend couldn't compute it —
          // treat that as a failure rather than rectifying healthy local values
          // down to 0.
          const usableAxes = ESMS_KEYS.filter(
            (k) => Number.isFinite(backendQuantities[k]) && backendQuantities[k] > 0,
          );
          const backendUsable = usableAxes.length > 0;

          const status = !backendUsable
            ? ("failed" as const)
            : maxDiscrepancy < 0.05
              ? ("verified" as const)
              : ("rectified" as const);

          const originalLocalQuantities = { ...quantities };

          // Rectify ONLY the axes where the backend returned a usable (finite, >0)
          // value; never overwrite a healthy local quantity with a 0/NaN.
          if (status === "rectified") {
            for (const k of usableAxes) {
              quantities[k] = backendQuantities[k];
            }
          }

          crossVerification = {
            success: true,
            backendUrl,
            localQuantities: originalLocalQuantities,
            backendQuantities,
            discrepancy,
            status
          };
        } else {
          crossVerification = {
            success: false,
            backendUrl,
            localQuantities: { ...quantities },
            backendQuantities: { Spirit: 0, Essence: 0, Matter: 0, Substance: 0 },
            discrepancy: { Spirit: 0, Essence: 0, Matter: 0, Substance: 0 },
            status: "failed" as const,
            error: `Backend returned HTTP ${response.status}`
          };
        }
      } catch (err: any) {
        crossVerification = {
          success: false,
          backendUrl,
          localQuantities: { ...quantities },
          backendQuantities: { Spirit: 0, Essence: 0, Matter: 0, Substance: 0 },
          discrepancy: { Spirit: 0, Essence: 0, Matter: 0, Substance: 0 },
          status: "failed" as const,
          error: err.message || String(err)
        };
      }
    }

    const payload = {
      success: true as const,
      timestamp: now.toISOString(),

      // Legacy payload expected by alchm-quantities-display
      quantities: {
        ...quantities,
        ANumber: aNumber,
        DayEssence: isDiurnalNow ? quantities.Essence : previousQuantities.Essence,
        NightEssence: isDiurnalNow ? previousQuantities.Essence : quantities.Essence,
      },
      dominantElement: nowAlch.metadata.dominantElement,
      isDiurnal: isDiurnalNow,
      heat,
      entropy,
      reactivity,
      energy,
      kalchm,
      monica,
      // Surfaced only when the sky data or monica is not fully live (see DegradedInfo).
      degraded: nowAlch.degraded,

      // Detailed kinetics payload expected by alchm-kinetics
      kinetics: {
        velocity,
        acceleration,
        momentum,
        // Additional summary metrics preserved for compatibility
        reactivity,
        entropy,
        power,
      },
      circuit: {
        charge,
        potentialDifference,
        currentFlow,
        power,
        inertia,
        forceMagnitude,
        forceClassification,
        thermalDirection,
        primaryElement: nowAlch.metadata.dominantElement,
        elementalBalance: nowAlch.elementalProperties,
        esmsBalance: ESMS_KEYS.reduce(
          (acc, key) => ({ ...acc, [key]: quantities[key] }),
          {} as Record<EsmsKey, number>,
        ),
      },

      // Preserve prior field for any older consumers
      alchemical: quantities,
      planetaryMomentum: nowAlch.planetaryMomentum,
      historicalContext: historicalContext || undefined,
      crossVerification,
      vectorCircuit,
    };

    const validated = AlchmQuantitiesApiResponseSchema.safeParse(payload);
    if (!validated.success) {
      logger.error("Invalid /api/alchm-quantities response payload", {
        issues: validated.error.issues,
      });
      return NextResponse.json(
        {
          success: false,
          error: "Invalid alchm-quantities response shape",
          details: validated.error.flatten(),
        },
        { status: 500 },
      );
    }

    return NextResponse.json(validated.data, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=59",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : "No stack";
    logger.error("Failed to compute /api/alchm-quantities", { error: message, stack });
    return NextResponse.json(
      {
        success: false,
        error: "Failed to compute alchemical quantities",
        details: message,
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  return GET(request);
}
