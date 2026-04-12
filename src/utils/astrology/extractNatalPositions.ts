/**
 * extractNatalPositions
 *
 * Canonical utility for extracting a planet → zodiac-sign map from a stored
 * natal chart object. Handles two storage formats:
 *
 *   1. Nested  (current): { planetaryPositions: { Sun: "Aries", ... }, ... }
 *   2. Flat   (legacy):   { Sun: "Aries", Moon: "Gemini", ... }
 *
 * Returns null when neither format yields any recognisable planet positions,
 * which means the user's natal chart is genuinely incomplete.
 */

const PLANETS = [
  "Sun", "Moon", "Mercury", "Venus", "Mars",
  "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto",
] as const;

function capitalizeSign(sign: string): string {
  return sign.charAt(0).toUpperCase() + sign.slice(1).toLowerCase();
}

function resolveSign(raw: unknown): string | null {
  if (!raw) return null;
  if (typeof raw === "string" && raw.trim().length > 0) return raw.trim();
  if (typeof raw === "object" && raw !== null && "sign" in raw) {
    const s = (raw as { sign: unknown }).sign;
    if (typeof s === "string" && s.trim().length > 0) return s.trim();
  }
  return null;
}

export function extractNatalPositions(
  natalChart: unknown,
): Record<string, string> | null {
  if (!natalChart) return null;

  const chartData =
    typeof natalChart === "string" ? JSON.parse(natalChart) : natalChart;

  if (!chartData || typeof chartData !== "object") return null;

  const positions: Record<string, string> = {};

  // Primary: nested planetaryPositions key (actual stored format)
  const nested = (chartData as Record<string, unknown>).planetaryPositions;
  if (nested && typeof nested === "object") {
    for (const planet of PLANETS) {
      const raw =
        (nested as Record<string, unknown>)[planet] ??
        (nested as Record<string, unknown>)[planet.toLowerCase()];
      const sign = resolveSign(raw);
      if (sign) positions[planet] = capitalizeSign(sign);
    }
  }

  // Fallback: flat top-level keys (legacy format)
  if (Object.keys(positions).length === 0) {
    for (const planet of PLANETS) {
      const raw =
        (chartData as Record<string, unknown>)[planet] ??
        (chartData as Record<string, unknown>)[planet.toLowerCase()];
      const sign = resolveSign(raw);
      if (sign) positions[planet] = capitalizeSign(sign);
    }
  }

  return Object.keys(positions).length > 0 ? positions : null;
}
