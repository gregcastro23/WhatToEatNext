/**
 * GET/POST /api/planetary-positions
 * Returns current planetary positions.
 * Primary source is the unified Railway backend (/api/planetary/positions).
 * Falls back to local astronomy-engine calculations if backend is unavailable.
 * Used by useAlchemical, astrologyDataProvider, astrologyValidation.
 */
import { NextResponse } from "next/server";
import { getAccuratePlanetaryPositions, getSignFromLongitude } from "@/utils/astrology/positions";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
const INTERNAL_SECRET = process.env.INTERNAL_API_SECRET;

interface NormalizedPlanetPosition {
  sign: string;
  degree: number;
  minute: number;
  exactLongitude: number;
  isRetrograde: boolean;
}

interface PlanetaryRequestBody {
  year?: number;
  month?: number;
  day?: number;
  date?: number;
  hour?: number;
  minute?: number;
  latitude?: number;
  longitude?: number;
}

function parsePlanetaryRequest(request: NextRequest): PlanetaryRequestBody {
  const { searchParams } = new URL(request.url);
  const parseOptionalInt = (value: string | null): number | undefined => {
    if (value === null || value.trim() === "") return undefined;
    const parsed = parseInt(value, 10);
    return Number.isNaN(parsed) ? undefined : parsed;
  };
  const parseOptionalFloat = (value: string | null): number | undefined => {
    if (value === null || value.trim() === "") return undefined;
    const parsed = parseFloat(value);
    return Number.isNaN(parsed) ? undefined : parsed;
  };

  return {
    year: parseOptionalInt(searchParams.get("year")),
    month: parseOptionalInt(searchParams.get("month")),
    day: parseOptionalInt(searchParams.get("day")),
    date: parseOptionalInt(searchParams.get("date")),
    hour: parseOptionalInt(searchParams.get("hour")),
    minute: parseOptionalInt(searchParams.get("minute")),
    latitude: parseOptionalFloat(searchParams.get("latitude")),
    longitude: parseOptionalFloat(searchParams.get("longitude")),
  };
}

function normalizeBackendPositions(backendPayload: any): Record<string, NormalizedPlanetPosition> {
  const rawPositions = backendPayload?.planetary_positions || backendPayload?.positions || backendPayload || {};
  const positions: Record<string, NormalizedPlanetPosition> = {};

  for (const [planet, raw] of Object.entries(rawPositions)) {
    const value = raw as any;
    if (!value || typeof value !== "object") continue;

    const longitude = Number(
      value.exactLongitude ?? value.longitude ?? value.eclipticLongitude ?? 0,
    );

    const hasSign = typeof value.sign === "string" && value.sign.trim() !== "";
    const signInfo = hasSign ? null : getSignFromLongitude(longitude);
    const degreeInSign = hasSign
      ? Number(value.degree ?? 0)
      : Number(signInfo?.degree ?? 0);

    const normalizedSign = hasSign
      ? String(value.sign).toLowerCase()
      : String(signInfo?.sign ?? "aries");

    const degree = Number.isFinite(degreeInSign) ? Math.floor(degreeInSign) : 0;
    const minute = Number.isFinite(value.minute)
      ? Math.floor(Number(value.minute))
      : Math.floor((degreeInSign - Math.floor(degreeInSign)) * 60);

    positions[planet] = {
      sign: normalizedSign,
      degree,
      minute: Number.isFinite(minute) ? minute : 0,
      exactLongitude: Number.isFinite(longitude) ? longitude : 0,
      isRetrograde: Boolean(value.isRetrograde ?? value.retrograde),
    };
  }

  return positions;
}

async function fetchFromBackend(
  payload: PlanetaryRequestBody,
): Promise<Record<string, NormalizedPlanetPosition> | null> {
  if (!BACKEND_URL) return null;

  try {
    const now = new Date();
    const requestPayload = {
      year: payload.year ?? now.getUTCFullYear(),
      month: payload.month ?? now.getUTCMonth() + 1,
      day: payload.day ?? payload.date ?? now.getUTCDate(),
      hour: payload.hour ?? now.getUTCHours(),
      minute: payload.minute ?? now.getUTCMinutes(),
      latitude: payload.latitude,
      longitude: payload.longitude,
    };

    const response = await fetch(`${BACKEND_URL}/api/planetary/positions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(INTERNAL_SECRET ? { "X-Internal-Secret": INTERNAL_SECRET } : {}),
      },
      body: JSON.stringify(requestPayload),
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) return null;
    const json = await response.json();
    const normalized = normalizeBackendPositions(json);
    return Object.keys(normalized).length > 0 ? normalized : null;
  } catch {
    return null;
  }
}

function calculateLocalPositions(date = new Date()): Record<string, NormalizedPlanetPosition> {
  const raw = getAccuratePlanetaryPositions(date);
  const positions: Record<
    string,
    NormalizedPlanetPosition
  > = {};
  Object.entries(raw).forEach(([planet, pos]) => {
    positions[planet] = {
      sign: typeof pos.sign === "string" ? pos.sign : String(pos.sign),
      degree: Math.floor(pos.degree),
      minute: Math.floor((pos.degree % 1) * 60),
      exactLongitude: pos.exactLongitude,
      isRetrograde: pos.isRetrograde,
    };
  });
  return positions;
}

function toResponse(
  positions: Record<string, NormalizedPlanetPosition>,
  source: "backend-pyswisseph" | "local-astronomy-engine",
) {
  // Compatibility:
  // - `positions` for hooks/services expecting wrapped response
  // - spread root keys for legacy callers expecting raw object map
  return NextResponse.json({
    positions,
    source,
    ...positions,
  });
}

export async function GET(request: NextRequest) {
  try {
    const params = parsePlanetaryRequest(request);
    const backendPositions = await fetchFromBackend(params);
    if (backendPositions) {
      return toResponse(backendPositions, "backend-pyswisseph");
    }

    const fallbackDate = params.year && params.month && (params.day || params.date)
      ? new Date(
        Date.UTC(
          params.year,
          params.month - 1,
          params.day ?? params.date ?? 1,
          params.hour ?? 0,
          params.minute ?? 0,
        ),
      )
      : new Date();
    const fallbackPositions = calculateLocalPositions(fallbackDate);
    return toResponse(fallbackPositions, "local-astronomy-engine");
  } catch (error) {
    console.error("[planetary-positions] Error:", error);
    return NextResponse.json({ error: "Failed to compute planetary positions" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as PlanetaryRequestBody;
    const backendPositions = await fetchFromBackend(body || {});
    if (backendPositions) {
      return toResponse(backendPositions, "backend-pyswisseph");
    }

    const fallbackDate = body?.year && body?.month && (body?.day || body?.date)
      ? new Date(
        Date.UTC(
          body.year,
          body.month - 1,
          body.day ?? body.date ?? 1,
          body.hour ?? 0,
          body.minute ?? 0,
        ),
      )
      : new Date();
    const fallbackPositions = calculateLocalPositions(fallbackDate);
    return toResponse(fallbackPositions, "local-astronomy-engine");
  } catch {
    return GET(request);
  }
}
