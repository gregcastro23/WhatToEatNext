/**
 * Pre-compute alchemical samples for the statistics layer.
 *
 * Walks a date range at a fixed interval, computes alchemize-detailed at each
 * point using astronomy-engine (no backend HTTP), and writes a single JSON
 * file consumed by `src/utils/alchemicalSampleLookup.ts`.
 *
 * Default range: 365 days past + 90 days future at 6-hour resolution
 * → 1820 samples. JSON ≈ 1.5 MB un-gzipped, ≈ 250 KB gzipped over the wire.
 *
 * Run:
 *   npx tsx scripts/generateAlchemicalSamples.ts
 *   npx tsx scripts/generateAlchemicalSamples.ts --past=730 --future=180 --interval=6
 *
 * The output file is intentionally checked in. Re-run weekly (or via cron)
 * to keep the "future" portion fresh.
 */

import fs from "fs";
import path from "path";
import { alchemizeDetailed, type PlanetaryPosition } from "../src/services/RealAlchemizeService";
import {
  calculatePlanetaryPositions,
  getFallbackPlanetaryPositions,
} from "../src/utils/serverPlanetaryCalculations";

interface CompactPlanetBreakdown {
  e: [number, number, number, number]; // ESMS contribution
  l: [number, number, number, number]; // Fire/Water/Earth/Air contribution
  s: string;                            // sign
}

export interface CompactAlchemicalSample {
  /** Unix epoch ms — primary index. */
  ts: number;
  /** Spirit, Essence, Matter, Substance (raw totals, NOT normalized). */
  esms: [number, number, number, number];
  /** heat, entropy, reactivity, gregsEnergy, kalchm, monica. */
  thermo: [number, number, number, number, number, number];
  /** Fire, Water, Earth, Air (raw totals; normalize against sum if needed). */
  el: [number, number, number, number];
  /** Per-planet contribution. */
  pp: Record<string, CompactPlanetBreakdown>;
  /** 1 = diurnal, 0 = nocturnal. */
  d: 0 | 1;
}

export interface AlchemicalSampleFile {
  version: 1;
  generatedAt: string;
  intervalHours: number;
  startMs: number;
  endMs: number;
  count: number;
  /** Order-preserved sample list, sorted ascending by ts. */
  samples: CompactAlchemicalSample[];
}

function parseArgs(): { past: number; future: number; interval: number; out: string } {
  const args = process.argv.slice(2);
  const get = (key: string, fallback: number) => {
    const found = args.find((a) => a.startsWith(`--${key}=`));
    if (!found) return fallback;
    const v = Number(found.split("=")[1]);
    return Number.isFinite(v) && v > 0 ? v : fallback;
  };
  return {
    past: get("past", 365),
    future: get("future", 90),
    interval: get("interval", 6),
    out:
      args.find((a) => a.startsWith("--out="))?.split("=")[1] ??
      "src/data/alchemicalSamples.json",
  };
}

function round(n: number, digits = 5): number {
  if (!Number.isFinite(n)) return 0;
  const f = 10 ** digits;
  return Math.round(n * f) / f;
}

function toRecord(
  positions: Record<string, any>,
): Record<string, PlanetaryPosition> {
  const out: Record<string, PlanetaryPosition> = {};
  for (const [planet, p] of Object.entries(positions)) {
    out[planet] = {
      sign: String(p?.sign ?? "").toLowerCase(),
      degree: Number(p?.degree) || 0,
      minute: Number(p?.minute) || 0,
      isRetrograde: Boolean(p?.isRetrograde),
      exactLongitude: typeof p?.exactLongitude === "number" ? p.exactLongitude : undefined,
    };
  }
  return out;
}

async function main() {
  const { past, future, interval, out } = parseArgs();

  // Silence the chatty per-call logger so progress lines stay legible.
  process.env.LOG_LEVEL = process.env.LOG_LEVEL ?? "warn";

  const now = new Date();
  const startMs = now.getTime() - past * 24 * 60 * 60 * 1000;
  const endMs = now.getTime() + future * 24 * 60 * 60 * 1000;
  const stepMs = interval * 60 * 60 * 1000;
  const total = Math.floor((endMs - startMs) / stepMs) + 1;

  // Snap to the interval grid so consecutive runs land on the same timestamps.
  const snappedStart = Math.floor(startMs / stepMs) * stepMs;

  // eslint-disable-next-line no-console
  console.log(
    `Generating ${total} samples · interval=${interval}h · ${new Date(snappedStart).toISOString()} → ${new Date(endMs).toISOString()}`,
  );

  const samples: CompactAlchemicalSample[] = [];
  const fallback = getFallbackPlanetaryPositions();
  let ok = 0;
  let failed = 0;
  const startedAt = Date.now();

  for (let i = 0, ts = snappedStart; ts <= endMs; i++, ts += stepMs) {
    const date = new Date(ts);
    let positions: Record<string, any>;
    try {
      positions = await calculatePlanetaryPositions(date);
    } catch {
      positions = fallback;
      failed++;
    }
    try {
      const r = alchemizeDetailed(toRecord(positions), null, date);
      const pp: Record<string, CompactPlanetBreakdown> = {};
      for (const [planet, b] of Object.entries(r.perPlanet)) {
        pp[planet] = {
          e: [
            round(b.esms.Spirit),
            round(b.esms.Essence),
            round(b.esms.Matter),
            round(b.esms.Substance),
          ],
          l: [
            round(b.elements.Fire),
            round(b.elements.Water),
            round(b.elements.Earth),
            round(b.elements.Air),
          ],
          s: b.sign,
        };
      }
      samples.push({
        ts,
        esms: [
          round(r.esms.Spirit),
          round(r.esms.Essence),
          round(r.esms.Matter),
          round(r.esms.Substance),
        ],
        thermo: [
          round(r.thermodynamicProperties.heat),
          round(r.thermodynamicProperties.entropy),
          round(r.thermodynamicProperties.reactivity),
          round(r.thermodynamicProperties.gregsEnergy),
          round(Number.isFinite(r.kalchm) ? r.kalchm : 0),
          round(Number.isFinite(r.monica) ? r.monica : 0),
        ],
        el: (() => {
          // Reconstruct raw element totals: alchemize normalizes them, but
          // perPlanet preserves the contributions, so we sum those instead.
          let F = 0, W = 0, Ea = 0, A = 0;
          for (const b of Object.values(r.perPlanet)) {
            F += b.elements.Fire;
            W += b.elements.Water;
            Ea += b.elements.Earth;
            A += b.elements.Air;
          }
          return [round(F), round(W), round(Ea), round(A)];
        })(),
        pp,
        d: r.metadata.isDiurnal ? 1 : 0,
      });
      ok++;
    } catch (err) {
      failed++;
      // eslint-disable-next-line no-console
      console.warn(`Sample at ${date.toISOString()} failed:`, err);
    }

    if (i > 0 && i % 100 === 0) {
      const elapsed = ((Date.now() - startedAt) / 1000).toFixed(1);
      // eslint-disable-next-line no-console
      console.log(`  ${i}/${total} (${elapsed}s) ok=${ok} fail=${failed}`);
    }
  }

  const file: AlchemicalSampleFile = {
    version: 1,
    generatedAt: new Date().toISOString(),
    intervalHours: interval,
    startMs: samples[0]?.ts ?? snappedStart,
    endMs: samples[samples.length - 1]?.ts ?? endMs,
    count: samples.length,
    samples,
  };

  const outPath = path.resolve(process.cwd(), out);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(file));
  const sizeKb = (fs.statSync(outPath).size / 1024).toFixed(1);
  // eslint-disable-next-line no-console
  console.log(
    `\n✓ Wrote ${samples.length} samples to ${outPath} (${sizeKb} KB) — fail=${failed}`,
  );
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("generateAlchemicalSamples failed:", err);
  process.exit(1);
});
