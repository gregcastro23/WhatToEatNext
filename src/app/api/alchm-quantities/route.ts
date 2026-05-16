/**
 * GET/POST /api/alchm-quantities
 * Backward-compatible payload used by:
 * - alchm-quantities-display
 * - alchm-kinetics
 */
import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rateLimit";
import { AlchmQuantitiesApiResponseSchema } from "@/lib/validation/apiSchemas";
import { getCachedHistoricalStats } from "@/services/HistoricalStatsService";
import { alchemize, type PlanetaryPosition } from "@/services/RealAlchemizeService";
import { createLogger } from "@/utils/logger";
import { isSectDiurnal } from "@/utils/planetaryAlchemyMapping";
import {
  calculatePlanetaryPositions,
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
    try {
      nowPositions = await calculatePlanetaryPositions(now);
      prevPositions = await calculatePlanetaryPositions(oneHourAgo);
      prev2Positions = await calculatePlanetaryPositions(twoHoursAgo);
    } catch (error) {
      logger.warn("Using fallback planetary positions for /api/alchm-quantities", {
        error: error instanceof Error ? error.message : String(error),
      });
      nowPositions = getFallbackPlanetaryPositions();
      prevPositions = getFallbackPlanetaryPositions();
      prev2Positions = getFallbackPlanetaryPositions();
    }

    const nowAlch = alchemize(asPlanetaryPositions(nowPositions), asPlanetaryPositions(prevPositions), now);
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

    const isDiurnalNow = isSectDiurnal(now);

    // Cross-backend verification of quantities
    let crossVerification: any = undefined;
    const isVerificationEnabled =
      process.env.CROSS_BACKEND_SYNC_ENABLED === "true" ||
      process.env.CROSS_BACKEND_RECTIFICATION_ENABLED === "true";

    if (isVerificationEnabled) {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "https://whattoeatnext-production.up.railway.app";
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);

        let response: Response;
        try {
          response = await fetch(`${backendUrl}/api/alchemical/quantities`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${process.env.INTERNAL_API_SECRET || "882133EA-3D06-4DF2-A63C-F4114AB4EFBC"}`
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
          const status = maxDiscrepancy < 0.05 ? ("verified" as const) : ("rectified" as const);

          const originalLocalQuantities = { ...quantities };

          // Rectify local quantities to match backend authoritative values if discrepancy is detected
          if (status === "rectified") {
            quantities.Spirit = backendQuantities.Spirit;
            quantities.Essence = backendQuantities.Essence;
            quantities.Matter = backendQuantities.Matter;
            quantities.Substance = backendQuantities.Substance;
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
