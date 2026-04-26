/**
 * Pre-compute a *historical* planetary-longitude dataset for the echo finder.
 *
 * Pluto orbits in 247.94 years, so the only way to answer "when was the last
 * time Pluto was at this exact degree?" is to walk back ~250 years and store
 * planetary longitudes at each step. Other outer planets (Saturn 29y, Jupiter
 * 12y, Uranus 84y, Neptune 165y) get cheaper echoes from the same dataset.
 *
 * Output: src/data/alchemicalEchoSamples.json
 *   - 30-day resolution × 280 years past = ~3400 samples
 *   - Longitudes only (full alchemize is recomputed on demand for matched moments)
 *   - ~450 KB JSON; gzipped ~70 KB
 *
 * Run:
 *   npx tsx scripts/generateHistoricalEchoSamples.ts
 *   npx tsx scripts/generateHistoricalEchoSamples.ts --years=300 --interval=21
 */

import fs from "fs";
import path from "path";
import {
  calculatePlanetaryPositions,
  getFallbackPlanetaryPositions,
} from "../src/utils/serverPlanetaryCalculations";

export const PLANET_ORDER = [
  "Sun",
  "Moon",
  "Mercury",
  "Venus",
  "Mars",
  "Jupiter",
  "Saturn",
  "Uranus",
  "Neptune",
  "Pluto",
] as const;

export interface HistoricalEchoSample {
  /** Unix epoch ms. */
  ts: number;
  /** Ecliptic longitudes (0–360°), order matches PLANET_ORDER. */
  lon: number[];
}

export interface HistoricalEchoFile {
  version: 1;
  generatedAt: string;
  intervalDays: number;
  startMs: number;
  endMs: number;
  planetOrder: readonly string[];
  count: number;
  samples: HistoricalEchoSample[];
}

function parseArgs() {
  const args = process.argv.slice(2);
  const get = (key: string, fallback: number) => {
    const found = args.find((a) => a.startsWith(`--${key}=`));
    if (!found) return fallback;
    const v = Number(found.split("=")[1]);
    return Number.isFinite(v) && v > 0 ? v : fallback;
  };
  return {
    years: get("years", 280),
    interval: get("interval", 30),
    out:
      args.find((a) => a.startsWith("--out="))?.split("=")[1] ??
      "src/data/alchemicalEchoSamples.json",
  };
}

function round(n: number, digits = 4): number {
  if (!Number.isFinite(n)) return 0;
  const f = 10 ** digits;
  return Math.round(n * f) / f;
}

/**
 * Convert sign + degree + minute to ecliptic longitude (0–360°).
 * Used because the existing calculatePlanetaryPositions returns the
 * sign/degree/minute representation.
 */
const SIGN_INDEX: Record<string, number> = {
  aries: 0,
  taurus: 1,
  gemini: 2,
  cancer: 3,
  leo: 4,
  virgo: 5,
  libra: 6,
  scorpio: 7,
  sagittarius: 8,
  capricorn: 9,
  aquarius: 10,
  pisces: 11,
};

function toLongitude(p: { sign?: string; degree?: number; minute?: number; exactLongitude?: number }): number {
  if (typeof p.exactLongitude === "number" && Number.isFinite(p.exactLongitude)) {
    return ((p.exactLongitude % 360) + 360) % 360;
  }
  const idx = SIGN_INDEX[String(p.sign ?? "").toLowerCase()] ?? 0;
  const deg = Number(p.degree) || 0;
  const min = Number(p.minute) || 0;
  return idx * 30 + deg + min / 60;
}

async function main() {
  const { years, interval, out } = parseArgs();
  process.env.LOG_LEVEL = process.env.LOG_LEVEL ?? "warn";

  const now = new Date();
  const stepMs = interval * 24 * 60 * 60 * 1000;
  const startMs = now.getTime() - years * 365.25 * 24 * 60 * 60 * 1000;
  const snappedStart = Math.floor(startMs / stepMs) * stepMs;
  const endMs = now.getTime();
  const total = Math.floor((endMs - snappedStart) / stepMs) + 1;

  // eslint-disable-next-line no-console
  console.log(
    `Historical echoes · ${years}y past · ${interval}d interval · ${total} samples · ${new Date(
      snappedStart,
    )
      .toISOString()
      .slice(0, 10)} → ${new Date(endMs).toISOString().slice(0, 10)}`,
  );

  const samples: HistoricalEchoSample[] = [];
  const fallback = getFallbackPlanetaryPositions();
  const startedAt = Date.now();
  let ok = 0;
  let failed = 0;

  for (let i = 0, ts = snappedStart; ts <= endMs; i++, ts += stepMs) {
    const date = new Date(ts);
    let positions: Record<string, any>;
    try {
      positions = await calculatePlanetaryPositions(date);
    } catch {
      positions = fallback;
      failed++;
    }
    const lon: number[] = [];
    let allOk = true;
    for (const planet of PLANET_ORDER) {
      const p = positions[planet];
      if (!p) {
        allOk = false;
        lon.push(0);
        continue;
      }
      lon.push(round(toLongitude(p)));
    }
    if (allOk) ok++;
    else failed++;
    samples.push({ ts, lon });

    if (i > 0 && i % 200 === 0) {
      const elapsed = ((Date.now() - startedAt) / 1000).toFixed(1);
      // eslint-disable-next-line no-console
      console.log(`  ${i}/${total} (${elapsed}s) ok=${ok} fail=${failed}`);
    }
  }

  const file: HistoricalEchoFile = {
    version: 1,
    generatedAt: new Date().toISOString(),
    intervalDays: interval,
    startMs: samples[0]?.ts ?? snappedStart,
    endMs: samples[samples.length - 1]?.ts ?? endMs,
    planetOrder: PLANET_ORDER,
    count: samples.length,
    samples,
  };

  const outPath = path.resolve(process.cwd(), out);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(file));
  const sizeKb = (fs.statSync(outPath).size / 1024).toFixed(1);
  // eslint-disable-next-line no-console
  console.log(
    `\n✓ Wrote ${samples.length} historical samples to ${outPath} (${sizeKb} KB) — fail=${failed}`,
  );
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("generateHistoricalEchoSamples failed:", err);
  process.exit(1);
});
