/**
 * Full-chart monica — the whole natal chart through the canonical engine (§18n).
 *
 * The third and last of the three constructions. Unlike single-body (§18c) and
 * two-body (§18i) this one adds no vessel and no derived body: a natal chart is
 * already fully populated, so it goes straight through `alchemize()`.
 *
 * ── Both sects, always ──────────────────────────────────────────────────────
 *
 * `[MEASURED 2026-07-22]` **0 of the 71 chart-bearing agents carries birth data**
 * — every one has `natal_positions` but none has a birth moment or birthplace.
 * Sect is therefore UNRESOLVABLE for them: there is no instant and no observer to
 * ask. Rather than invent one (a noon convention, or the server's own clock —
 * the latter being the bug PR #633 fixed), both sects are computed and stored,
 * exactly as single-body does, and `combined` is their mean.
 *
 * When birth data is later authored, `sectFromBirth()` resolves the canonical
 * sect properly and the stored pair stays valid.
 *
 * ── Scale ───────────────────────────────────────────────────────────────────
 *
 * ⚠️ Full-chart monica is NOT on the single-body scale and must never be
 * compared with it (§18o). Measured over the 71: **[0.0018, 0.0337]** combined,
 * against single-body's [−3.197, 3.975]. Mass-normalising them onto a shared
 * scale was proposed and **rejected** — the populations differ in kind, not
 * units, and the comparability has no consumer. Write it to
 * `monica_full_chart`, never to `monica_constant`.
 */
import { alchemize, type PlanetaryPosition } from "@/services/RealAlchemizeService";
import type { AgentMonica } from "@/utils/agentMonica";
import { isDiurnalAt } from "@/utils/astrology/positions";
import { ZODIAC_ELEMENTS } from "@/utils/planetaryAlchemyMapping";

const SIGN_KEYS = Object.keys(ZODIAC_ELEMENTS).map((s) => s.toLowerCase());

/** Minimum bodies before a stored chart is considered usable at all. */
export const MIN_CHART_BODIES = 5;

/**
 * A stored `natal_positions` entry. Both shapes appear in production: some rows
 * carry an absolute `position` (ecliptic longitude), others only `sign`+`degree`.
 */
export interface NatalPositionRow {
  planet?: string;
  sign?: string;
  degree?: number;
  position?: number;
}

/**
 * Parse a stored `natal_positions` blob into engine positions.
 * Returns null when the chart is unusable (not an array, or too few bodies) —
 * never a partial chart silently treated as whole.
 */
export function parseNatalPositions(
  raw: unknown,
): Record<string, PlanetaryPosition> | null {
  if (!Array.isArray(raw)) return null;
  const positions: Record<string, PlanetaryPosition> = {};
  for (const entry of raw as NatalPositionRow[]) {
    if (!entry?.planet) continue;
    const sign = String(entry.sign ?? "").toLowerCase();
    const signIndex = SIGN_KEYS.indexOf(sign);
    if (signIndex < 0) continue;
    const longitude =
      typeof entry.position === "number"
        ? entry.position
        : signIndex * 30 + (entry.degree ?? 0);
    if (!Number.isFinite(longitude)) continue;
    positions[entry.planet] = {
      sign,
      degree: longitude % 30,
      minute: 0,
      exactLongitude: longitude,
    };
  }
  return Object.keys(positions).length >= MIN_CHART_BODIES ? positions : null;
}

/**
 * The reference instant used when a chart has NO birth data.
 *
 * ⚠️ It does NOT decide the answer. Sect is passed explicitly for each sect, so
 * this only feeds the engine's momentum/date plumbing — the quantity that would
 * otherwise vary by wall-clock (§18n / PR #633) is pinned by the caller. Fixed
 * rather than `new Date()` so the result is reproducible: a chart must not
 * change because it was recomputed on a different day.
 */
export const CHARTLESS_REFERENCE_INSTANT = new Date("2000-01-01T12:00:00Z");

/** Resolve the canonical sect for a chart that DOES have birth data (§18n). */
export function sectFromBirth(
  birthMoment: Date,
  latitude: number,
  longitude: number,
): "diurnal" | "nocturnal" {
  return isDiurnalAt(birthMoment, latitude, longitude) ? "diurnal" : "nocturnal";
}

/**
 * The full-chart monica for one sect. Always finite (canonical totality
 * contract — `alchemize` returns φ rather than NaN on a degenerate chart).
 */
export function fullChartMonicaForSect(
  positions: Record<string, PlanetaryPosition>,
  diurnal: boolean,
  instant: Date = CHARTLESS_REFERENCE_INSTANT,
): number {
  const monica = alchemize(positions, null, instant, { diurnal }).monica;
  return Number.isFinite(monica) ? monica : Number.NaN;
}

/**
 * The full-chart monica, both sects, plus their mean.
 *
 * `combined` is what goes in `monica_full_chart`. Returns null when the chart is
 * unusable — the caller must skip the row rather than write a guess.
 */
export function fullChartMonica(
  rawNatalPositions: unknown,
  instant: Date = CHARTLESS_REFERENCE_INSTANT,
): AgentMonica | null {
  const positions = parseNatalPositions(rawNatalPositions);
  if (!positions) return null;
  const diurnal = fullChartMonicaForSect(positions, true, instant);
  const nocturnal = fullChartMonicaForSect(positions, false, instant);
  if (!Number.isFinite(diurnal) || !Number.isFinite(nocturnal)) return null;
  return { diurnal, nocturnal, combined: (diurnal + nocturnal) / 2 };
}
