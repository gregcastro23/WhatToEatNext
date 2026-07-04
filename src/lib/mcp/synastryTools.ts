/**
 * Synastry & Transit-Natal Overlay Tool Handlers
 *
 * Two MCP tools that turn raw natal chart data into the relational
 * ledger the desktop Jing Arena consumes:
 *
 *   - compute_synastry_overlay(agentA, agentB) → inter-aspects between
 *     two natal charts + tension/harmony/intensification scores + the
 *     target's default stance (clash | absorb | mirror).
 *
 *   - get_transit_natal_overlay(agent, transitTime?) → current sky
 *     positions activating the agent's natal points + a per-element
 *     boost vector (replaces the global "Transit Active" badge).
 *
 * The math is pure (sign+degree → λ, then min(|Δλ|, 360-|Δλ|) against
 * canonical orbs). pg is used only as an opt-in cache: when the agents
 * are seeded into `agent_natal_positions`, the `synastry_scores`
 * materialized view collapses the score read to a single indexed row.
 *
 * @file mcp-server/src/synastryTools.ts
 */

import { calculateNatalChart } from "@/services/natalChartService";
import type { ToolResult } from "./tools";

// ─── Constants ────────────────────────────────────────────────────────

const ZODIAC_SIGNS = [
  "aries", "taurus", "gemini", "cancer",
  "leo", "virgo", "libra", "scorpio",
  "sagittarius", "capricorn", "aquarius", "pisces",
] as const;

const SIGN_TO_ELEMENT: Record<string, "fire" | "earth" | "air" | "water"> = {
  aries: "fire", leo: "fire", sagittarius: "fire",
  taurus: "earth", virgo: "earth", capricorn: "earth",
  gemini: "air", libra: "air", aquarius: "air",
  cancer: "water", scorpio: "water", pisces: "water",
};

const DEFAULT_FOCUS_PLANETS = [
  "Sun", "Moon", "Mercury", "Venus", "Mars", "Saturn", "Jupiter",
];

const DEFAULT_TRANSIT_PLANETS = [
  "Sun", "Moon", "Mars", "Saturn", "Jupiter", "Pluto",
];

const ASPECT_ORBS = {
  conjunction: 8,
  sextile: 6,
  square: 8,
  trine: 8,
  opposition: 10,
} as const;

type AspectType = keyof typeof ASPECT_ORBS;
type Harmonic = "friction" | "harmony" | "intensification";
type Stance = "clash" | "absorb" | "mirror";

const ASPECT_HARMONIC: Record<AspectType, Harmonic> = {
  conjunction: "intensification",
  sextile: "harmony",
  trine: "harmony",
  square: "friction",
  opposition: "friction",
};

const ASPECT_ANGLE: Record<AspectType, number> = {
  conjunction: 0,
  sextile: 60,
  square: 90,
  trine: 120,
  opposition: 180,
};

const PLANET_VALENCE: Record<string, string> = {
  Sun: "identity",
  Moon: "emotional",
  Mercury: "reflective",
  Venus: "relational",
  Mars: "assertive",
  Jupiter: "expansive",
  Saturn: "restrictive",
  Uranus: "transformative",
  Neptune: "dissolving",
  Pluto: "transformative",
  Ascendant: "identity",
  ASC: "identity",
  MC: "vocational",
};

// ─── Input types ──────────────────────────────────────────────────────

interface NatalPlanetInput {
  sign: string;
  degree: number;        // 0..30
  retrograde?: boolean;
  house?: number;
}

interface NatalChartInput {
  planets: Record<string, NatalPlanetInput>;
  ascendant?: number | NatalPlanetInput;
  midheaven?: number | NatalPlanetInput;
}

interface AgentInput {
  id: string;
  natalChart: NatalChartInput;
}

export interface SynastryArgs {
  agentA?: AgentInput;
  agentB?: AgentInput;
  focusPlanets?: string[];
  cacheStrategy?: "read" | "write" | "bypass";
}

export interface TransitOverlayArgs {
  agent?: AgentInput;
  transitTime?: string;
  latitude?: number;
  longitude?: number;
  focusPlanets?: string[];
}

// ─── Longitude math ───────────────────────────────────────────────────

function normalizeSign(sign: string): string {
  return String(sign || "").trim().toLowerCase();
}

function signIndex(sign: string): number {
  const normalized = normalizeSign(sign);
  const idx = ZODIAC_SIGNS.indexOf(normalized as (typeof ZODIAC_SIGNS)[number]);
  return idx >= 0 ? idx : 0;
}

function toLongitude(sign: string, degree: number): number {
  const clamped = Math.max(0, Math.min(30, degree));
  return ((signIndex(sign) * 30) + clamped) % 360;
}

function deltaLongitude(lonA: number, lonB: number): number {
  const diff = Math.abs(lonA - lonB);
  return Math.min(diff, 360 - diff);
}

interface AspectDetection {
  type: AspectType;
  orb: number;
  exactness: number;
  harmonic: Harmonic;
}

function detectAspect(delta: number): AspectDetection | null {
  for (const type of Object.keys(ASPECT_ORBS) as AspectType[]) {
    const target = ASPECT_ANGLE[type];
    const orb = Math.abs(delta - target);
    if (orb <= ASPECT_ORBS[type]) {
      return {
        type,
        orb,
        exactness: 1 - orb / ASPECT_ORBS[type],
        harmonic: ASPECT_HARMONIC[type],
      };
    }
  }
  return null;
}

// ─── Normalize input → list of {planet, longitude, sign, degree} ──────

interface PlanetPoint {
  planet: string;
  longitude: number;
  sign: string;
  degreeInSign: number;
  retrograde: boolean;
  house?: number;
}

interface TransitPlanetInput {
  name?: string;
  sign?: string;
  position?: number;
}

function hasTransitPosition(value: unknown): value is TransitPlanetInput {
  return (
    !!value &&
    typeof value === "object" &&
    typeof (value as TransitPlanetInput).position === "number"
  );
}

function flattenNatalChart(chart: NatalChartInput): PlanetPoint[] {
  const out: PlanetPoint[] = [];
  for (const [planet, position] of Object.entries(chart.planets || {})) {
    if (!position || typeof position !== "object") continue;
    const sign = normalizeSign(position.sign);
    if (!SIGN_TO_ELEMENT[sign]) continue;
    out.push({
      planet,
      longitude: toLongitude(sign, Number(position.degree) || 0),
      sign,
      degreeInSign: Number(position.degree) || 0,
      retrograde: Boolean(position.retrograde),
      house: position.house,
    });
  }
  const extra = (label: string, input: number | NatalPlanetInput | undefined) => {
    if (input === undefined || input === null) return;
    if (typeof input === "number") {
      out.push({
        planet: label,
        longitude: ((input % 360) + 360) % 360,
        sign: ZODIAC_SIGNS[Math.floor((((input % 360) + 360) % 360) / 30)],
        degreeInSign: ((input % 360) + 360) % 30,
        retrograde: false,
      });
      return;
    }
    const sign = normalizeSign(input.sign);
    if (!SIGN_TO_ELEMENT[sign]) return;
    out.push({
      planet: label,
      longitude: toLongitude(sign, Number(input.degree) || 0),
      sign,
      degreeInSign: Number(input.degree) || 0,
      retrograde: Boolean(input.retrograde),
      house: input.house,
    });
  };
  extra("Ascendant", chart.ascendant);
  extra("MC", chart.midheaven);
  return out;
}

// ─── pg layer (lazy import — mirrors invocationLog pattern) ───────────

const isServerWithDB = (): boolean => !!process.env.DATABASE_URL;

let dbModule:
  | typeof import("@/lib/database/connection")
  | null
  | undefined = undefined;

async function getDb(): Promise<
  typeof import("@/lib/database/connection") | null
> {
  if (dbModule !== undefined) return dbModule;
  if (!isServerWithDB()) {
    dbModule = null;
    return null;
  }
  try {
    dbModule = await import("@/lib/database/connection");
  } catch (err) {
    process.stderr.write(
      `[mcp/synastryTools] DB module load failed: ${String(err)}\n`,
    );
    dbModule = null;
  }
  return dbModule;
}

async function upsertNatalPositions(
  agentId: string,
  points: PlanetPoint[],
): Promise<void> {
  const db = await getDb();
  if (!db || points.length === 0) return;
  try {
    for (const p of points) {
      await db.executeQuery(
        `INSERT INTO agent_natal_positions
            (agent_id, planet, longitude, sign, degree_in_sign, house, retrograde, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, now())
         ON CONFLICT (agent_id, planet) DO UPDATE SET
            longitude       = EXCLUDED.longitude,
            sign            = EXCLUDED.sign,
            degree_in_sign  = EXCLUDED.degree_in_sign,
            house           = EXCLUDED.house,
            retrograde      = EXCLUDED.retrograde,
            updated_at      = now()`,
        [agentId, p.planet, p.longitude, p.sign, p.degreeInSign, p.house ?? null, p.retrograde],
      );
    }
    await db.executeQuery("SELECT refresh_synastry_views()", []);
  } catch (err) {
    process.stderr.write(
      `[mcp/synastryTools] upsert/refresh failed for ${agentId}: ${String(err)}\n`,
    );
  }
}

interface CachedScores {
  tension: number;
  harmony: number;
  intensification: number;
  aspectCount: number;
}

async function readCachedScores(
  agentA: string,
  agentB: string,
): Promise<CachedScores | null> {
  const db = await getDb();
  if (!db) return null;
  const [a, b] = [agentA, agentB].sort();
  try {
    const result = await db.executeQuery<{
      tension_score: number;
      harmony_score: number;
      intensification_score: number;
      aspect_count: number;
    }>(
      `SELECT tension_score, harmony_score, intensification_score, aspect_count
         FROM synastry_scores
        WHERE agent_a = $1 AND agent_b = $2`,
      [a, b],
    );
    const row = result.rows?.[0];
    if (!row) return null;
    return {
      tension: Number(row.tension_score) || 0,
      harmony: Number(row.harmony_score) || 0,
      intensification: Number(row.intensification_score) || 0,
      aspectCount: Number(row.aspect_count) || 0,
    };
  } catch (err) {
    process.stderr.write(
      `[mcp/synastryTools] cache read failed: ${String(err)}\n`,
    );
    return null;
  }
}

// ─── Scoring & stance ─────────────────────────────────────────────────

interface InterAspect {
  planetA: string;
  planetB: string;
  longitudeA: number;
  longitudeB: number;
  deltaLongitude: number;
  type: AspectType;
  orb: number;
  exactness: number;
  harmonic: Harmonic;
}

function computeInterAspects(
  pointsA: PlanetPoint[],
  pointsB: PlanetPoint[],
  focus: string[],
): InterAspect[] {
  const focusSet = new Set(focus.map((p) => p.toLowerCase()));
  const inFocus = (p: PlanetPoint) => focusSet.has(p.planet.toLowerCase());
  const aspects: InterAspect[] = [];

  for (const a of pointsA.filter(inFocus)) {
    for (const b of pointsB.filter(inFocus)) {
      const delta = deltaLongitude(a.longitude, b.longitude);
      const detected = detectAspect(delta);
      if (!detected) continue;
      aspects.push({
        planetA: a.planet,
        planetB: b.planet,
        longitudeA: a.longitude,
        longitudeB: b.longitude,
        deltaLongitude: delta,
        type: detected.type,
        orb: detected.orb,
        exactness: detected.exactness,
        harmonic: detected.harmonic,
      });
    }
  }
  return aspects.sort((x, y) => y.exactness - x.exactness);
}

interface Scores {
  tension: number;
  harmony: number;
  intensification: number;
  aspectCount: number;
}

function scoreAspects(aspects: InterAspect[]): Scores {
  let tension = 0;
  let harmony = 0;
  let intensification = 0;
  for (const a of aspects) {
    if (a.harmonic === "friction") tension += a.exactness;
    else if (a.harmonic === "harmony") harmony += a.exactness;
    else if (a.harmonic === "intensification") intensification += a.exactness;
  }
  return { tension, harmony, intensification, aspectCount: aspects.length };
}

function decideStance(scores: Scores): Stance {
  const { tension, harmony, intensification } = scores;
  if (
    intensification > harmony &&
    intensification > tension &&
    intensification > 0.6
  ) {
    return "mirror";
  }
  if (tension > harmony + 0.15) return "clash";
  if (harmony > tension + 0.15) return "absorb";
  // Roughly balanced or zero — weight by which is bigger.
  if (tension === 0 && harmony === 0 && intensification === 0) return "absorb";
  return tension >= harmony ? "clash" : "absorb";
}

// ─── Handler: compute_synastry_overlay ────────────────────────────────

export async function computeSynastryOverlay(
  args: SynastryArgs,
): Promise<ToolResult> {
  const { agentA, agentB } = args;
  if (!agentA?.id || !agentA.natalChart || !agentB?.id || !agentB.natalChart) {
    return {
      ok: false,
      data: null,
      errorCode: "INVALID_ARGS",
      errorMessage: "agentA and agentB (each with {id, natalChart}) are required",
      summary: { reason: "missing-agents" },
    };
  }
  if (agentA.id === agentB.id) {
    return {
      ok: false,
      data: null,
      errorCode: "INVALID_ARGS",
      errorMessage: "agentA.id and agentB.id must differ",
      summary: { reason: "self-pair" },
    };
  }

  const focus = Array.isArray(args.focusPlanets) && args.focusPlanets.length > 0
    ? args.focusPlanets
    : DEFAULT_FOCUS_PLANETS;
  const cacheStrategy = args.cacheStrategy ?? "read";

  const pointsA = flattenNatalChart(agentA.natalChart);
  const pointsB = flattenNatalChart(agentB.natalChart);

  const aspects = computeInterAspects(pointsA, pointsB, focus);
  let scores = scoreAspects(aspects);
  let cacheHit = false;

  if (cacheStrategy === "read") {
    const cached = await readCachedScores(agentA.id, agentB.id);
    if (cached) {
      cacheHit = true;
      scores = {
        tension: cached.tension,
        harmony: cached.harmony,
        intensification: cached.intensification,
        aspectCount: cached.aspectCount,
      };
    }
  }

  if (cacheStrategy !== "bypass") {
    // Fire-and-forget — the upsert below blocks briefly but failure
    // here must not block the duel.
    void upsertNatalPositions(agentA.id, pointsA);
    void upsertNatalPositions(agentB.id, pointsB);
  }

  const stance = decideStance(scores);
  const [pairA, pairB] = [agentA.id, agentB.id].sort();

  const data = {
    pair: {
      agentA: pairA,
      agentB: pairB,
      computedAt: new Date().toISOString(),
      cacheHit,
    },
    interchartAspects: aspects.slice(0, 12),
    scores: {
      tension: Number(scores.tension.toFixed(3)),
      harmony: Number(scores.harmony.toFixed(3)),
      intensification: Number(scores.intensification.toFixed(3)),
      aspectCount: scores.aspectCount,
    },
    dominantStance: stance,
  };

  return {
    ok: true,
    data,
    summary: {
      agentA: pairA,
      agentB: pairB,
      stance,
      aspectCount: scores.aspectCount,
      cacheHit,
    },
  };
}

// ─── Handler: get_transit_natal_overlay ───────────────────────────────

interface TransitActivation {
  transitPlanet: string;
  natalPoint: string;
  longitudeTransit: number;
  longitudeNatal: number;
  deltaLongitude: number;
  type: AspectType;
  orb: number;
  exactness: number;
  natalElement: "fire" | "earth" | "air" | "water";
  valence: string;
}

export async function getTransitNatalOverlay(
  args: TransitOverlayArgs,
): Promise<ToolResult> {
  const { agent } = args;
  if (!agent?.id || !agent.natalChart) {
    return {
      ok: false,
      data: null,
      errorCode: "INVALID_ARGS",
      errorMessage: "agent ({id, natalChart}) is required",
      summary: { reason: "missing-agent" },
    };
  }

  const focus = Array.isArray(args.focusPlanets) && args.focusPlanets.length > 0
    ? args.focusPlanets
    : DEFAULT_TRANSIT_PLANETS;
  const lat = typeof args.latitude === "number" ? args.latitude : 40.7498;
  const lon = typeof args.longitude === "number" ? args.longitude : -73.7976;
  const transitTime = typeof args.transitTime === "string"
    ? args.transitTime
    : new Date().toISOString();

  // Pull the live (or specified) sky via the same engine as
  // get_live_sky_transits.
  let transitChart;
  try {
    transitChart = await calculateNatalChart({
      dateTime: transitTime,
      latitude: lat,
      longitude: lon,
      timezone: "UTC",
    });
  } catch (err) {
    return {
      ok: false,
      data: null,
      errorCode: "INTERNAL",
      errorMessage: `Failed to compute transit chart: ${
        err instanceof Error ? err.message : String(err)
      }`,
      summary: { reason: "transit-chart-failed" },
    };
  }

  // Convert the WTEN-side PlanetInfo[] (with absolute `position` lng) to
  // our PlanetPoint shape for symmetric aspect detection.
  const transitPoints: PlanetPoint[] = (transitChart.planets || [])
    .filter(hasTransitPosition)
    .map((p) => {
      const sign = normalizeSign(String(p.sign || ""));
      return {
        planet: String(p.name),
        longitude: ((Number(p.position) % 360) + 360) % 360,
        sign,
        degreeInSign: Number(p.position) % 30,
        retrograde: false,
      };
    });

  const natalPoints = flattenNatalChart(agent.natalChart);
  const focusSet = new Set(focus.map((p) => p.toLowerCase()));
  const inFocus = (p: PlanetPoint) => focusSet.has(p.planet.toLowerCase());

  const activations: TransitActivation[] = [];
  for (const t of transitPoints.filter(inFocus)) {
    for (const n of natalPoints) {
      const delta = deltaLongitude(t.longitude, n.longitude);
      const detected = detectAspect(delta);
      if (!detected) continue;
      activations.push({
        transitPlanet: t.planet,
        natalPoint: n.planet,
        longitudeTransit: t.longitude,
        longitudeNatal: n.longitude,
        deltaLongitude: delta,
        type: detected.type,
        orb: detected.orb,
        exactness: detected.exactness,
        natalElement: SIGN_TO_ELEMENT[n.sign] || "fire",
        valence: PLANET_VALENCE[t.planet] || "neutral",
      });
    }
  }
  activations.sort((a, b) => b.exactness - a.exactness);

  // Weighted vote: aspect exactness × harmonic weight per element.
  // Harmonic aspects emphasize, friction de-emphasizes but still counts
  // (a square to a fire-sign planet still makes that element hot).
  const harmonicWeight = (a: TransitActivation): number => {
    if (a.type === "conjunction") return 1.0;
    if (a.type === "trine" || a.type === "sextile") return 0.8;
    if (a.type === "square" || a.type === "opposition") return 0.7;
    return 0.5;
  };
  const elementVotes: Record<string, number> = {
    fire: 0, earth: 0, air: 0, water: 0,
  };
  for (const a of activations) {
    elementVotes[a.natalElement] += a.exactness * harmonicWeight(a);
  }
  let boostElement: "fire" | "earth" | "air" | "water" | null = null;
  let maxVote = 0;
  for (const [el, v] of Object.entries(elementVotes)) {
    if (v > maxVote) {
      maxVote = v;
      boostElement = el as "fire" | "earth" | "air" | "water";
    }
  }
  const totalVotes = Object.values(elementVotes).reduce((s, v) => s + v, 0);
  const boostMagnitude = totalVotes > 0
    ? Number((maxVote / Math.max(totalVotes, 1)).toFixed(3))
    : 0;

  // Stress notes — squares/opps to luminaries are the headline.
  const lights = new Set(["Sun", "Moon", "Ascendant", "MC"]);
  const stressNotes: string[] = [];
  for (const a of activations) {
    if (
      lights.has(a.natalPoint) &&
      (a.type === "square" || a.type === "opposition") &&
      a.exactness >= 0.4
    ) {
      stressNotes.push(
        `natal ${a.natalPoint} under transit ${a.transitPlanet} ${a.type}`,
      );
    }
  }

  const headline = activations[0];
  const boostSuffix = boostElement
    ? ` → ${Math.round(boostMagnitude * 100)}% ${boostElement} boost`
    : "";
  const summary = headline
    ? `Transit ${headline.transitPlanet} ${headline.type} natal ${headline.natalPoint}${boostSuffix}`
    : "No active transit aspects within orb";

  return {
    ok: true,
    data: {
      agentId: agent.id,
      transitTime,
      coordinates: { latitude: lat, longitude: lon },
      activations: activations.slice(0, 8),
      boostElement,
      boostMagnitude,
      stressNotes: stressNotes.slice(0, 4),
      summary,
    },
    summary: {
      agentId: agent.id,
      activationCount: activations.length,
      boostElement,
      boostMagnitude,
    },
  };
}
