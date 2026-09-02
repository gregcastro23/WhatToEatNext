/**
 * GET /api/zodiac-calendar
 * Returns zodiac calendar data — current period, monthly calendar, or annual map.
 * Actions: current-period | monthly-calendar | year-map | degree-for-date
 */
import { NextResponse } from "next/server";
import { _logger } from "@/lib/logger";
import { rateLimit } from "@/lib/rateLimit";
import { getAccuratePlanetaryPositions, getSignFromLongitude } from "@/utils/astrology/positions";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const ZODIAC_SIGNS = ["aries","taurus","gemini","cancer","leo","virgo","libra","scorpio","sagittarius","capricorn","aquarius","pisces"] as const;
type ZodiacSignName = (typeof ZODIAC_SIGNS)[number];

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

function handleCurrentPeriod(now: Date, raw: ReturnType<typeof getAccuratePlanetaryPositions>): NextResponse {
  const sunPos = raw.Sun;
  const moonPos = raw.Moon;
  if (!sunPos || !moonPos) {
    return NextResponse.json(
      { success: false, error: "position engine omitted Sun or Moon" },
      { status: 503 },
    );
  }
  const sunSign = sunPos.sign.toLowerCase();
  const sunDegree = Math.round(sunPos.degree * 100) / 100;
  const sunLongitude = sunPos.exactLongitude;

  const currentIngress = SUN_INGRESS_2026.find(i => i.sign === sunSign);
  const signIdx = ZODIAC_SIGNS.indexOf(sunSign as ZodiacSignName);
  const nextSign = ZODIAC_SIGNS[((signIdx >= 0 ? signIdx : 0) + 1) % 12];
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
      sign: moonPos.sign,
      degree: Math.round(moonPos.degree * 100) / 100,
      isRetrograde: moonPos.isRetrograde,
    },
    timestamp: now.toISOString(),
  });
}

function handleDegreeForDate(url: URL): NextResponse {
  const dateParam = url.searchParams.get("date");
  if (!dateParam) return NextResponse.json({ error: "Missing date parameter" }, { status: 400 });
  const targetDate = new Date(dateParam);
  const targetRaw = getAccuratePlanetaryPositions(targetDate);
  const tSun = targetRaw.Sun;
  if (!tSun) {
    return NextResponse.json(
      { success: false, error: "position engine omitted Sun" },
      { status: 503 },
    );
  }
  const { sign, degree } = getSignFromLongitude(tSun.exactLongitude);
  return NextResponse.json({
    success: true,
    date: targetDate.toISOString(),
    sun: { sign, degree: Math.round(degree * 100) / 100, exact_longitude: tSun.exactLongitude },
  });
}

function handleMonthlyCalendar(url: URL, now: Date): NextResponse {
  const year = parseInt(url.searchParams.get("year") ?? String(now.getFullYear()), 10);
  const month = parseInt(url.searchParams.get("month") ?? String(now.getMonth()), 10);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const d = new Date(year, month, i + 1, 12, 0, 0);
    const dRaw = getAccuratePlanetaryPositions(d);
    const dSun = dRaw.Sun;
    return {
      date: d.toISOString().slice(0, 10),
      sun_sign: dSun?.sign ?? null,
      sun_degree: dSun ? Math.round(dSun.degree * 10) / 10 : null,
    };
  });
  return NextResponse.json({ success: true, year, month, days });
}

export async function GET(request: Request): Promise<NextResponse> {
  const rl = await rateLimit(request, { window: 60_000, max: 60, bucket: "zodiac-calendar" });
  if (!rl.allowed) return rl.response!;
  try {
    const url = new URL(request.url);
    const action = url.searchParams.get("action") ?? "current-period";
    const now = new Date();
    const raw = getAccuratePlanetaryPositions(now);

    if (action === "current-period") {
      return handleCurrentPeriod(now, raw);
    }

    if (action === "degree-for-date") {
      return handleDegreeForDate(url);
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
      return handleMonthlyCalendar(url, now);
    }

    return NextResponse.json({
      error: "Invalid action",
      available_actions: ["current-period", "degree-for-date", "year-map", "monthly-calendar"],
    }, { status: 400 });
  } catch (error) {
    _logger.error("[zodiac-calendar] Error:", error);
    return NextResponse.json({ success: false, error: "Zodiac calendar calculation failed" }, { status: 500 });
  }
}

export function POST(): NextResponse {
  return NextResponse.json({ error: "Use GET with ?action= parameter" }, { status: 405 });
}
