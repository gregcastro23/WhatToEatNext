/**
 * GET /api/zodiac-calendar
 * Returns zodiac calendar data — current period, monthly calendar, or annual map.
 * Actions: current-period | monthly-calendar | year-map | degree-for-date
 */
import { NextResponse } from "next/server";
import { getAccuratePlanetaryPositions, getSignFromLongitude } from "@/utils/astrology/positions";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const ZODIAC_SIGNS = ["aries","taurus","gemini","cancer","leo","virgo","libra","scorpio","sagittarius","capricorn","aquarius","pisces"] as const;

// Approximate Sun ingress dates for 2026 (UTC)
const SUN_INGRESS_2026: Array<{ sign: string; date: string }> = [
  { sign: "aries",       date: "2026-03-20" },
  { sign: "taurus",      date: "2026-04-19" },
  { sign: "gemini",      date: "2026-05-20" },
  { sign: "cancer",      date: "2026-06-21" },
  { sign: "leo",         date: "2026-07-22" },
  { sign: "virgo",       date: "2026-08-23" },
  { sign: "libra",       date: "2026-09-22" },
  { sign: "scorpio",     date: "2026-10-23" },
  { sign: "sagittarius", date: "2026-11-22" },
  { sign: "capricorn",   date: "2026-12-21" },
  { sign: "aquarius",    date: "2026-01-20" },
  { sign: "pisces",      date: "2026-02-18" },
];

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const action = url.searchParams.get("action") || "current-period";

    const now = new Date();
    const raw = getAccuratePlanetaryPositions(now);
    const sunPos = raw.Sun;
    const sunSign = typeof sunPos?.sign === "string" ? sunPos.sign : "aries";
    const sunDegree = Math.round((sunPos?.degree ?? 0) * 100) / 100;
    const sunLongitude = sunPos?.exactLongitude ?? 0;

    if (action === "current-period") {
      const currentIngress = SUN_INGRESS_2026.find(i => i.sign === sunSign);
      const signIdx = ZODIAC_SIGNS.indexOf(sunSign as any);
      const nextSign = ZODIAC_SIGNS[(signIdx + 1) % 12];
      const nextIngress = SUN_INGRESS_2026.find(i => i.sign === nextSign);

      return NextResponse.json({
        success: true,
        current_period: {
          sign: sunSign,
          degree: sunDegree,
          exact_longitude: sunLongitude,
          ingress_date: currentIngress?.date,
          next_sign: nextSign,
          next_ingress_date: nextIngress?.date,
        },
        moon: {
          sign: typeof raw.Moon?.sign === "string" ? raw.Moon.sign : "aries",
          degree: Math.round((raw.Moon?.degree ?? 0) * 100) / 100,
          isRetrograde: raw.Moon?.isRetrograde ?? false,
        },
        timestamp: now.toISOString(),
      });
    }

    if (action === "degree-for-date") {
      const dateParam = url.searchParams.get("date");
      if (!dateParam) return NextResponse.json({ error: "Missing date parameter" }, { status: 400 });
      const targetDate = new Date(dateParam);
      const targetRaw = getAccuratePlanetaryPositions(targetDate);
      const tSun = targetRaw.Sun;
      const { sign, degree } = getSignFromLongitude(tSun?.exactLongitude ?? 0);
      return NextResponse.json({
        success: true,
        date: targetDate.toISOString(),
        sun: { sign, degree: Math.round(degree * 100) / 100, exact_longitude: tSun?.exactLongitude ?? 0 },
      });
    }

    if (action === "year-map") {
      return NextResponse.json({
        success: true,
        year: now.getFullYear(),
        ingress_dates: SUN_INGRESS_2026,
        note: "Approximate ingress dates based on mean solar motion",
      });
    }

    if (action === "monthly-calendar") {
      const year = parseInt(url.searchParams.get("year") || String(now.getFullYear()), 10);
      const month = parseInt(url.searchParams.get("month") || String(now.getMonth()), 10);
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const days = Array.from({ length: daysInMonth }, (_, i) => {
        const d = new Date(year, month, i + 1, 12, 0, 0);
        const dRaw = getAccuratePlanetaryPositions(d);
        const dSun = dRaw.Sun;
        const s = typeof dSun?.sign === "string" ? dSun.sign : "aries";
        return { date: d.toISOString().split("T")[0], sun_sign: s, sun_degree: Math.round((dSun?.degree ?? 0) * 10) / 10 };
      });
      return NextResponse.json({ success: true, year, month, days });
    }

    return NextResponse.json({
      error: "Invalid action",
      available_actions: ["current-period", "degree-for-date", "year-map", "monthly-calendar"],
    }, { status: 400 });
  } catch (error) {
    console.error("[zodiac-calendar] Error:", error);
    return NextResponse.json({ success: false, error: "Zodiac calendar calculation failed" }, { status: 500 });
  }
}

export async function POST() {
  return NextResponse.json({ error: "Use GET with ?action= parameter" }, { status: 405 });
}
