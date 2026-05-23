import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rateLimit";
import { getCurrentPlanetaryPositions } from "@/services/astrologizeApi";
import { alchemizeDetailed } from "@/services/RealAlchemizeService";
import { logger } from "@/utils/logger";
import type { NextRequest } from "next/server";

const RATE_LIMIT = { window: 60_000, max: 30, bucket: "philosophers-stone-positions" };

// alchm.kitchen is the canonical math owner — it calculates all alchemical
// quantities. The philosophers-stone endpoint lives there (or will be added
// there). PA is for agent-keyed state only. Local alchemizeDetailed() fallback
// kicks in if alchm.kitchen hasn't shipped the endpoint yet — the math is
// equivalent.
const ALCHM_KITCHEN_URL = (
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.API_BASE_URL ||
  process.env.BACKEND_URL ||
  ""
).replace(/\/+$/, "");

const PROXY_TIMEOUT_MS = 4000;

interface StoneResponse {
  elementalProperties: Record<string, number>;
  thermodynamicProperties: Record<string, number>;
  esms: Record<string, number>;
  planetaryMomentum: Record<string, number>;
  kalchm: number;
  monica: number;
  score: number;
  normalized: boolean;
  confidence: number;
  metadata: Record<string, unknown>;
  perPlanet?: Record<string, unknown>;
}

function dtToBackendParams(dt: Date): URLSearchParams {
  const p = new URLSearchParams();
  p.set("year", String(dt.getUTCFullYear()));
  p.set("month", String(dt.getUTCMonth() + 1));
  p.set("day", String(dt.getUTCDate()));
  p.set("hour", String(dt.getUTCHours()));
  p.set("minute", String(dt.getUTCMinutes()));
  return p;
}

async function fetchFromBackend(
  init: { method: "GET"; dt: Date } | { method: "POST"; body: unknown },
): Promise<StoneResponse | null> {
  if (!ALCHM_KITCHEN_URL) return null;
  const url = `${ALCHM_KITCHEN_URL}/api/philosophers-stone/positions`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PROXY_TIMEOUT_MS);
  try {
    const res =
      init.method === "GET"
        ? await fetch(`${url}?${dtToBackendParams(init.dt).toString()}`, {
            signal: controller.signal,
            cache: "no-store",
          })
        : await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(init.body),
            signal: controller.signal,
            cache: "no-store",
          });
    if (!res.ok) {
      logger.warn(
        `philosophers-stone proxy: backend returned ${res.status}, falling back to local`,
      );
      return null;
    }
    return (await res.json()) as StoneResponse;
  } catch (err) {
    logger.warn("philosophers-stone proxy: backend unreachable, falling back", err);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function computeLocally(dt: Date): Promise<StoneResponse> {
  const positions = await getCurrentPlanetaryPositions();
  // alchemizeDetailed returns DetailedAlchemicalResult whose elementalProperties
  // uses the strictly-typed ElementalProperties (Fire/Water/Earth/Air without
  // an index signature) — incompatible with our wider Record<string, number>
  // contract by structural typing. The shape is correct at runtime, just
  // narrower at the type level, so cast through unknown.
  return alchemizeDetailed(positions, null, dt) as unknown as StoneResponse;
}

/**
 * GET /api/philosophers-stone/positions
 *
 * Proxies the FastAPI backend's identical endpoint and returns its canonical
 * schema (elementalProperties / thermodynamicProperties / esms / perPlanet / ...).
 * Falls back to a local `alchemizeDetailed()` calculation if the backend is
 * unreachable or returns a non-2xx.
 */
export async function GET(request: NextRequest) {
  const rl = await rateLimit(request, RATE_LIMIT);
  if (!rl.allowed) return rl.response!;

  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date");
    const dt = dateParam ? new Date(dateParam) : new Date();
    if (Number.isNaN(dt.getTime())) {
      return NextResponse.json(
        { success: false, error: "Invalid `date` parameter" },
        { status: 400 },
      );
    }

    const proxied = await fetchFromBackend({ method: "GET", dt });
    const data = proxied ?? (await computeLocally(dt));

    return NextResponse.json({
      success: true,
      source: proxied ? "proxy" : "fallback",
      ...data,
    });
  } catch (error) {
    logger.error("Philosophers stone positions error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to retrieve planetary positions",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

/**
 * POST /api/philosophers-stone/positions
 *
 * Forwards the request body (year/month/day/hour/minute/customPlanets) to the
 * backend. Accepts a legacy `date` field as well, which is split into
 * year/month/day/hour/minute before forwarding.
 */
export async function POST(request: NextRequest) {
  const rl = await rateLimit(request, RATE_LIMIT);
  if (!rl.allowed) return rl.response!;

  try {
    const body = (await request.json()) as Record<string, unknown>;

    let dt: Date;
    if (typeof body.date === "string") {
      dt = new Date(body.date);
    } else if (
      typeof body.year === "number" ||
      typeof body.month === "number" ||
      typeof body.day === "number"
    ) {
      const now = new Date();
      dt = new Date(
        Date.UTC(
          (body.year as number) ?? now.getUTCFullYear(),
          ((body.month as number) ?? now.getUTCMonth() + 1) - 1,
          (body.day as number) ?? now.getUTCDate(),
          (body.hour as number) ?? 0,
          (body.minute as number) ?? 0,
        ),
      );
    } else {
      dt = new Date();
    }
    if (Number.isNaN(dt.getTime())) {
      return NextResponse.json(
        { success: false, error: "Invalid date payload" },
        { status: 400 },
      );
    }

    const backendBody = {
      year: dt.getUTCFullYear(),
      month: dt.getUTCMonth() + 1,
      day: dt.getUTCDate(),
      hour: dt.getUTCHours(),
      minute: dt.getUTCMinutes(),
      customPlanets: body.customPlanets,
    };

    const proxied = await fetchFromBackend({ method: "POST", body: backendBody });
    const data = proxied ?? (await computeLocally(dt));

    return NextResponse.json({
      success: true,
      source: proxied ? "proxy" : "fallback",
      ...data,
    });
  } catch (error) {
    logger.error("Custom philosophers stone calculation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to calculate planetary positions",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
