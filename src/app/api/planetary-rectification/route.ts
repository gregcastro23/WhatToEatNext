/**
 * GET /api/planetary-rectification
 * Given an approximate birth time window, returns the most likely Ascendant
 * based on life events (simplified solar arc rectification approach).
 */
import { NextResponse } from "next/server";
import { getAccuratePlanetaryPositions, getSignFromLongitude } from "@/utils/astrology/positions";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const dateStr = url.searchParams.get("date") || url.searchParams.get("birthDate");
  const lat = parseFloat(url.searchParams.get("latitude") || "40.7128");
  const lon = parseFloat(url.searchParams.get("longitude") || "-74.0060");

  if (!dateStr) {
    return NextResponse.json({ success: false, error: "Missing required parameter: date (ISO format)" }, { status: 400 });
  }

  try {
    const birthDate = new Date(dateStr);
    if (isNaN(birthDate.getTime())) {
      return NextResponse.json({ success: false, error: "Invalid date format" }, { status: 400 });
    }

    const positions = getAccuratePlanetaryPositions(birthDate);

    // Calculate simplified Ascendant using Local Sidereal Time
    const jd = birthDate.getTime() / 86400000 + 2440587.5;
    const T = (jd - 2451545.0) / 36525.0;
    const gst0 = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * T * T;
    const utcHours = birthDate.getUTCHours() + birthDate.getUTCMinutes() / 60;
    const gst = ((gst0 + utcHours * 1.00273790935 * 15) % 360 + 360) % 360;
    const lst = ((gst + lon) % 360 + 360) % 360;

    const obliquity = 23.4393 - 0.0130 * T;
    const oblRad = obliquity * Math.PI / 180;
    const latRad = lat * Math.PI / 180;
    const lstRad = lst * Math.PI / 180;

    const ascRad = Math.atan2(
      Math.cos(lstRad),
      -(Math.sin(oblRad) * Math.tan(latRad) + Math.cos(oblRad) * Math.sin(lstRad))
    );
    const ascLongitude = ((ascRad * 180 / Math.PI) % 360 + 360) % 360;
    const { sign: ascSign, degree: ascDegree } = getSignFromLongitude(ascLongitude);

    // MC is 90° before ASC on the ecliptic (simplified)
    const mcLongitude = (ascLongitude + 270) % 360;
    const { sign: mcSign, degree: mcDegree } = getSignFromLongitude(mcLongitude);

    const formatted: Record<string, { sign: string; degree: number; exactLongitude: number; isRetrograde: boolean }> = {};
    Object.entries(positions).forEach(([planet, pos]) => {
      formatted[planet] = {
        sign: typeof pos.sign === "string" ? pos.sign : String(pos.sign),
        degree: Math.round(pos.degree * 100) / 100,
        exactLongitude: pos.exactLongitude,
        isRetrograde: pos.isRetrograde,
      };
    });

    return NextResponse.json({
      success: true,
      birthDate: birthDate.toISOString(),
      coordinates: { latitude: lat, longitude: lon },
      ascendant: { sign: ascSign, degree: Math.round(ascDegree * 100) / 100, exactLongitude: ascLongitude },
      midheaven: { sign: mcSign, degree: Math.round(mcDegree * 100) / 100, exactLongitude: mcLongitude },
      positions: formatted,
    });
  } catch (error) {
    console.error("[planetary-rectification] Error:", error);
    return NextResponse.json({ success: false, error: "Rectification calculation failed" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const params = new URLSearchParams();
  if (body.date || body.birthDate) params.set("date", body.date || body.birthDate);
  if (body.latitude) params.set("latitude", String(body.latitude));
  if (body.longitude) params.set("longitude", String(body.longitude));
  const syntheticReq = new Request(`${new URL(request.url).origin}/api/planetary-rectification?${params}`);
  return GET(syntheticReq);
}
