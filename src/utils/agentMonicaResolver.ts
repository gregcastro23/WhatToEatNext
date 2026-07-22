/**
 * Resolving an agent's real monica from what the agent actually is (§18e).
 *
 * A planetary agent has NO birthchart — it *is* a single placement, agentified —
 * so its configuration is read from its NAME, not from a chart (§18g). This
 * module is the single place that turns an agent name into a placement, so the
 * three write sites and the backfill all agree.
 *
 * The names in production span five families, not the four §18g records. Measured
 * over all 4800 agent rows on 2026-07-21:
 *
 *   | shape                                | n    | example                               |
 *   |--------------------------------------|------|---------------------------------------|
 *   | `<Planet> in <Sign> <N> Degree`      | 3240 | Jupiter in Aquarius 0 Degree          |
 *   | `<Planet> <Sign> <N>`                |  676 | Jupiter Leo 2                         |
 *   | `<Planet> Agent <N>`                 |  360 | Moon Agent 0                          |
 *   | `<Phase> Moon in <Sign> <N> Degree`  |  360 | First Quarter Moon in Cancer 0 Degree |
 *   | `Moon Phase <Phase> <N>`             |   89 | Moon Phase First Quarter 0            |
 *
 * `<Planet> in <Sign> <N> Degree` is the DOMINANT family and is absent from the
 * §18g taxonomy — a parser written from the doc alone would drop 3240 of 4276
 * planetary agents on the floor. The two `<N>`-is-an-absolute-degree families
 * (`<Planet> Agent <N>`, `Moon Phase <Phase> <N>`) carry 0–359, not 1–360 as the
 * doc states, so the sign is `floor(N/30)` with no off-by-one correction.
 *
 * Parsing VALIDATES the planet and sign against the canonical tables rather than
 * matching on shape. That is load-bearing: `Moon Agent 5` matches the same
 * `<word> <word> <number>` shape as `Mercury Aquarius 16`, and a shape-only
 * parser reads "Agent" as a sign.
 */
import { agentMonica, type AgentMonica } from "@/utils/agentMonica";
import { twoBodyMonica } from "@/utils/agentMonicaTwoBody";
import {
  PLANETARY_SECTARIAN_ESMS,
  ZODIAC_ELEMENTS,
} from "@/utils/planetaryAlchemyMapping";

const SIGNS = Object.keys(ZODIAC_ELEMENTS);
const PLANETS = Object.keys(PLANETARY_SECTARIAN_ESMS);

const titleCase = (s: string) =>
  s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

const asSign = (s: string): string | null => {
  const k = titleCase(s);
  return SIGNS.includes(k) ? k : null;
};
const asPlanet = (s: string): string | null => {
  const k = titleCase(s);
  return PLANETS.includes(k) ? k : null;
};

/** Absolute ecliptic degree (0–359) → sign + degree within that sign. */
function fromAbsoluteDegree(n: number): { sign: string; degree: number } {
  const a = ((n % 360) + 360) % 360;
  return { sign: SIGNS[Math.floor(a / 30)], degree: a % 30 };
}

export interface AgentPlacement {
  /**
   * `single` — one body at one position; gets the §18c single-body monica via
   *            `agentMonicaFromName`.
   * `phase`  — a Moon phase, which is a Sun–Moon *relationship*; it gets the
   *            §18i genuine two-body monica via `twoBodyMonicaFromName`, and is
   *            deliberately NEVER given a single-body value.
   */
  kind: "single" | "phase";
  planet: string;
  sign: string;
  degree: number;
  phase?: string;
  /** Set when the source name is not in canonical form. */
  canonicalName?: string;
}

/**
 * Parse an agent name into a placement, or null if the name is not a placement
 * (a real person's name, a test row, anything unrecognised). Never guesses.
 */
export function parseAgentPlacement(rawName: string): AgentPlacement | null {
  if (!rawName) return null;
  const name = rawName.trim().replace(/\s+/g, " ");

  // `Moon Phase <Phase> <N>` — N is an absolute ecliptic degree.
  let m = name.match(/^([A-Za-z]+) Phase (.+?) (\d+)$/);
  if (m && asPlanet(m[1])) {
    const { sign, degree } = fromAbsoluteDegree(Number(m[3]));
    const phase = m[2].trim();
    return {
      kind: "phase",
      planet: asPlanet(m[1])!,
      sign,
      degree,
      phase,
      canonicalName: `${phase} Moon in ${sign} ${degree} Degree`,
    };
  }

  // `<Planet> Agent <N>` — N is an absolute ecliptic degree.
  m = name.match(/^([A-Za-z]+) Agent (\d+)$/);
  if (m && asPlanet(m[1])) {
    const planet = asPlanet(m[1])!;
    const { sign, degree } = fromAbsoluteDegree(Number(m[2]));
    return {
      kind: "single",
      planet,
      sign,
      degree,
      canonicalName: `${planet} ${sign} ${degree}`,
    };
  }

  // `<Phase> Moon in <Sign> <N> [Degree]` — the canonical phase form.
  m = name.match(/^(.+?) Moon in ([A-Za-z]+) (\d+)(?: Degree)?$/);
  if (m && asSign(m[2])) {
    return {
      kind: "phase",
      planet: "Moon",
      sign: asSign(m[2])!,
      degree: Number(m[3]),
      phase: m[1].trim(),
    };
  }

  // `<Planet> in <Sign> <N> [Degree]` — the dominant production family.
  m = name.match(/^([A-Za-z]+) in ([A-Za-z]+) (\d+)(?: Degree)?$/);
  if (m && asPlanet(m[1]) && asSign(m[2])) {
    const planet = asPlanet(m[1])!;
    const sign = asSign(m[2])!;
    const degree = Number(m[3]);
    return {
      kind: "single",
      planet,
      sign,
      degree,
      canonicalName: `${planet} ${sign} ${degree}`,
    };
  }

  // `<Planet> <Sign> <N> [Degree]` — already canonical.
  m = name.match(/^([A-Za-z]+) ([A-Za-z]+) (\d+)(?: Degree)?$/);
  if (m && asPlanet(m[1]) && asSign(m[2])) {
    return {
      kind: "single",
      planet: asPlanet(m[1])!,
      sign: asSign(m[2])!,
      degree: Number(m[3]),
    };
  }

  return null;
}

/**
 * The real single-body monica for a named planetary agent, or null when the name
 * is not a single-body placement (a person, a phase agent, an unparseable row).
 * Callers must treat null as "leave the existing value alone" — never as zero.
 */
export function agentMonicaFromName(name: string): AgentMonica | null {
  const placement = parseAgentPlacement(name);
  if (!placement || placement.kind !== "single") return null;
  return agentMonica(placement.planet, placement.sign, placement.degree);
}

/**
 * The real TWO-BODY monica for a named Moon-phase agent (§18i), or null when the
 * name is not a phase agent (a single-body placement, a person, an unparseable
 * row). The mirror of `agentMonicaFromName`, which returns null for exactly the
 * rows this one serves — between them they cover every parseable agent name.
 *
 * Callers must treat null as "not a phase agent — leave it to the single-body
 * path", never as zero.
 *
 * ⚠️ A name that IS a phase agent but whose phase cannot be classified THROWS
 * `UnknownMoonPhaseError` rather than returning null. The two outcomes mean
 * different things — null is "not my population", the throw is "my population,
 * unclassified" — and collapsing the second into the first would silently drop
 * rows from the backfill. A backfill that wants to survive one bad row catches
 * it and reports; it must not default the phase.
 */
export function twoBodyMonicaFromName(name: string): AgentMonica | null {
  const placement = parseAgentPlacement(name);
  if (!placement || placement.kind !== "phase") return null;
  return twoBodyMonica(placement.phase ?? "", placement.sign, placement.degree);
}
