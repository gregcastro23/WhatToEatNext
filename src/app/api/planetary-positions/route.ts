/**
 * GET/POST /api/planetary-positions
 * Returns current accurate planetary positions.
 * Used by useAlchemical, astrologyDataProvider, astrologyValidation.
 */
import { NextResponse } from "next/server";
import { getAccuratePlanetaryPositions } from "@/utils/astrology/positions";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const raw = getAccuratePlanetaryPositions(new Date());
    const positions: Record<string, { sign: string; degree: number; minute: number; exactLongitude: number; isRetrograde: boolean }> = {};
    Object.entries(raw).forEach(([planet, pos]) => {
      positions[planet] = {
        sign: typeof pos.sign === "string" ? pos.sign : String(pos.sign),
        degree: Math.floor(pos.degree),
        minute: Math.floor((pos.degree % 1) * 60),
        exactLongitude: pos.exactLongitude,
        isRetrograde: pos.isRetrograde,
      };
    });
    return NextResponse.json(positions);
  } catch (error) {
    console.error("[planetary-positions] Error:", error);
    return NextResponse.json({ error: "Failed to compute planetary positions" }, { status: 500 });
  }
}

export async function POST() { return GET(); }
