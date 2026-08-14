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
 *
 * `longitude` is NOT on this contract. It is accepted on ingest only so that
 * `normaliseNatalPositions` can strip it — see that function.
 */
export interface NatalPositionRow {
  planet?: string;
  sign?: string;
  degree?: number;
  position?: number;
}

/**
 * Strip the dead `longitude` key from an incoming or stored `natal_positions`
 * blob, promoting it to `position` on the one branch where it carries meaning.
 *
 * ── Why the key is dead ─────────────────────────────────────────────────────
 *
 * `[MEASURED 2026-07-26]` `longitude` was present on **710 of 710** stored
 * bodies across all 71 charts, and `0` was its **only distinct value**. It is a
 * fabricated literal, not a measurement. Its origin is upstream, in the
 * agent-authoring repo:
 *
 * ```ts
 * longitude: data?.longitude ?? data?.degrees ?? 0   // extractNatalPositions
 * ```
 *
 * The objects it reads carry `{ sign, degree, retrograde, house }` — neither
 * `longitude` nor `degrees` exists on them, so the chain falls through to the
 * literal `0` every single time.
 *
 * ── Why it is worse than merely useless ─────────────────────────────────────
 *
 * A `p.position ?? p.longitude ?? …` chain does **not** route around it, because
 * `0` is not nullish: the chain stops at the zero and never reaches `degree`.
 * That is how an earlier audit "found" 71 identical all-zero charts — false; the
 * real data was in `sign` + `degree` all along (Adam Smith: Sun Gemini 25°).
 * Sign + degree already determine longitude, so the key is redundant as well as
 * wrong, and the canonical parser below has always ignored it.
 *
 * ── Why a real longitude is promoted rather than dropped ────────────────────
 *
 * Dropping unconditionally would mean that if the upstream fallback is ever
 * fixed, WTEN would silently discard the better value. A non-zero finite
 * `longitude` IS an absolute ecliptic longitude, which is exactly what
 * `position` means here — so it is moved there, where the parser reads it.
 * No stored row takes this branch today (all 710 are 0); it exists so that
 * fixing the producer improves the data instead of being thrown away.
 */
export function normaliseNatalPositions(raw: unknown): unknown {
  if (!Array.isArray(raw)) return raw;
  return raw.map((entry) => {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) return entry;
    const row = entry as Record<string, unknown>;
    if (!("longitude" in row)) return entry;
    const { longitude, ...rest } = row;
    const lon = Number(longitude);
    const carriesMeaning =
      Number.isFinite(lon) && lon !== 0 && rest.position === undefined;
    return carriesMeaning ? { ...rest, position: lon } : rest;
  });
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
 * The write side of the same contract: a chart keyed by planet name becomes the
 * canonical stored row array.
 *
 * `natal_positions` is an ARRAY in every writer. `agents/unified` used to store
 * its `formattedChart.planets` verbatim — an OBJECT keyed by planet name — which
 * `parseNatalPositions` rejects on its first line, so such a chart yielded no
 * full-chart monica at all and every caller skipped the row. No object-shaped row
 * ever reached production (`jsonb_typeof` was `array` for all 5084 rows on
 * 2026-07-26), so this closed a latent divergence, not a live one. The encoder
 * lives beside the parser, and the round-trip between them is asserted in
 * `src/app/api/agents/unified/__tests__/route.test.ts` — the missing assertion is
 * what let the two shapes drift in the first place.
 *
 * The absolute longitude goes in `position`, the key the parser reads — never in
 * `longitude`, for the reasons `normaliseNatalPositions` sets out above. This
 * writer therefore emits nothing for that normaliser to strip, and satisfies
 * `scripts/checkNoFabricatedNatalFields.ts`, which exists to catch exactly this:
 * a NEW write path routing around the strip.
 *
 * Worth knowing if you ever change the key: the parser falls back to
 * `signIndex * 30 + degree`, which on a chart whose `degree` agrees with its sign
 * reconstructs the SAME number. A round-trip assertion alone therefore cannot see
 * the wrong key — hence the explicit `position` assertion in the route test.
 */
export function natalPositionsFromChart(
  planets: Record<string, { sign: string; longitude: number }>,
): NatalPositionRow[] {
  return Object.entries(planets)
    .filter(([, p]) => statesALongitude(p.longitude))
    .map(([planet, p]) => ({
      planet,
      sign: p.sign,
      degree: p.longitude % 30,
      position: p.longitude,
    }));
}

/**
 * Convert a STORED `natal_chart` into canonical `natal_positions` rows.
 *
 * ── Why this exists ─────────────────────────────────────────────────────────
 *
 * `[MEASURED 2026-08-12]` against production: 71 of 71 chart-bearing agents hold
 * `natal_positions`, and **0 of 8** chart-bearing humans do — because the human
 * writer (`createUser`) persists `natal_chart` and `birth_data` and nothing else.
 * `natal_positions` is the column `parseNatalPositions` reads, so every
 * full-chart computation for a human silently yielded nothing at all.
 *
 * `natalPositionsFromChart` above cannot serve this: it takes the calculator's
 * in-memory shape (an object keyed by planet, carrying `longitude`). What is
 * STORED is different — all 8 human charts hold `planets` as an ARRAY of
 * `{ name, sign, position }`. This reads what is actually on disk.
 *
 * ── Contract ────────────────────────────────────────────────────────────────
 *
 * Returns null when the chart cannot yield a usable set, rather than a partial
 * one — the same rule `parseNatalPositions` states, and for the same reason: a
 * short chart silently treated as whole produces a monica that looks fine and
 * means nothing.
 *
 * Longitudes are filtered through `statesALongitude`, so a body whose position
 * is 0 or non-finite is DROPPED rather than placed at 0° of its sign. That zero
 * is the exact defect `checkNoFabricatedNatalFields` exists to catch, and this
 * function must not reintroduce it from the other direction.
 *
 * Emits `position` and never `longitude`, for the reasons documented on
 * `normaliseNatalPositions`.
 */
export function natalPositionsFromStoredChart(
  storedChart: unknown,
): NatalPositionRow[] | null {
  if (!storedChart || typeof storedChart !== "object") return null;
  const chart = storedChart as Record<string, unknown>;

  // `planets` is the array form every stored human chart uses; the object form
  // is what some agent-side writers produce. Accept both, reject anything else.
  const raw = chart.planets ?? chart.planetaryPositions;
  const entries: Array<[string, Record<string, unknown>]> = Array.isArray(raw)
    ? raw
        .filter((b): b is Record<string, unknown> => !!b && typeof b === "object")
        .map((b) => [String(b.planet ?? b.name ?? ""), b])
    : raw && typeof raw === "object"
      ? Object.entries(raw as Record<string, unknown>)
          .filter(([, v]) => !!v && typeof v === "object")
          .map(([k, v]) => [k, v as Record<string, unknown>])
      : [];

  const rows: NatalPositionRow[] = [];
  for (const [planet, body] of entries) {
    if (!planet) continue;
    const sign = String(body.sign ?? "").toLowerCase();
    const signIndex = SIGN_KEYS.indexOf(sign);
    if (signIndex < 0) continue;

    // Two stored dialects, and BOTH are real:
    //   humans — `position` holds the absolute ecliptic longitude
    //   agents — no position at all; `degree` is the degree WITHIN `sign`
    // `parseNatalPositions` already reconciles them by deriving
    // `signIndex * 30 + degree`, so this mirrors that rather than inventing a
    // third rule. Requiring an absolute position here dropped every body on all
    // 71 agent charts and returned null for each.
    //
    // A `position` of 0 or non-finite is treated as ABSENT, not as a veto: it is
    // indistinguishable from an unmeasured value (see `statesALongitude`), while
    // the body's sign+degree may be perfectly good — which is exactly the case
    // `normaliseNatalPositions` handles when it strips a meaningless key and
    // leaves the rest intact.
    const stated = Number(body.position ?? body.longitude);
    const withinSign = Number(body.degree);
    const absolute = statesALongitude(stated)
      ? stated
      : // Deliberately NOT `degree ?? 0`. Defaulting an absent degree to zero
        // places the body at 0° of its sign — a fabricated position with no
        // warning, the very defect `checkNoFabricatedNatalFields` exists for.
        // Dropping the body is the safe direction.
        Number.isFinite(withinSign)
        ? signIndex * 30 + withinSign
        : Number.NaN;
    if (!Number.isFinite(absolute)) continue;

    rows.push({ planet, sign, degree: absolute % 30, position: absolute });
  }

  return rows.length >= MIN_CHART_BODIES ? rows : null;
}

/**
 * Does this value state an ecliptic longitude, or merely occupy the field?
 *
 * ONE rule, shared by everything that writes a chart out of `calculateNatalChart`
 * — the `natal_positions` encoder above and the `natal_chart` ascendant in
 * `agents/unified`. Having it in two places is how the two fields come to
 * disagree about the same body.
 *
 * Non-finite is rejected because JSON renders NaN as null, and the parser's
 * `degree ?? 0` fallback would then place the body at 0° of its sign — a
 * fabricated position with no warning.
 *
 * Exactly `0` is rejected for the same reason one step earlier: every longitude in
 * this pipeline passes through a `?? 0`, so a zero cannot be told apart from an
 * absent measurement. Two known non-observations produce it —
 * `fetchPlanetaryPositions` leaves the ascendant at its 0 initialiser when the
 * astrologize response carries none (deriving only the SIGN, locally, from
 * sidereal time), and the offline planetary fallback carries
 * `Ascendant: [0, 0, 0, "aries"]`, documented in place as a placeholder. Both are
 * systematic; a genuine 0.000000° is measure-zero and indistinguishable anyway.
 * Compare `normaliseNatalPositions` above, which rejects a zero `longitude` on
 * exactly the same grounds.
 */
export function statesALongitude(value: number): boolean {
  return Number.isFinite(value) && value !== 0;
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
  const { monica } = alchemize(positions, null, instant, { diurnal });
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
