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

/**
 * The degree a SIGN-LEVEL agent is placed at — an agent whose name gives a
 * planet and a sign but no degree ("Mars Gemini", "Moon Cancer"). §18k k29.
 *
 * ── The ruling ──────────────────────────────────────────────────────────────
 *
 * `[USER 2026-07-28]` A one-body agent with no chart and no degree resolves to
 * the **mathematical average of the 30 degrees of its sign**. This is NOT a
 * fourth construction: it is the existing single-body §18c calc invoked at one
 * more degree value, landing inside the existing population, band, scale and
 * guard. (⚠️ §18k k18 rejected "mean-of-siblings" — the mean of the 30 siblings'
 * OUTPUT monica. That is a different quantity: monica is nonlinear, and the two
 * differ by 7.3× for Mars Gemini. k18's "not worth a 4th construction" rationale
 * does not apply here. See k29.)
 *
 * ── Why 14.5 and not 15 ─────────────────────────────────────────────────────
 *
 * DERIVED as the mean of the integers the degree actually ranges over. Agent
 * names carry `0..29` — MEASURED across the 3240 degree-bearing production rows,
 * min 0 / max 29 — and `fromAbsoluteDegree` below returns `a % 30`, also 0-based.
 * The mean of 0..29 is 14.5.
 *
 * ⚠️ The intuitive "midpoint of a 30° sign" = 15.0 is WRONG here, and silently
 * so. `groundingVessel` floors its argument, so 15.0 and 15.5 both select pillar
 * index `(15 - 1) % 14 = 0` — Solution `{0,2,2,0}` — which is one of only five
 * degrees in thirty that yield a monica of exactly 0. `Moon Cancer` at degree 15
 * computes to **0 in both sects**: indistinguishable from the fabricated-literal
 * class k12 exists to forbid. At 14.5 it floors to 14 → pillar 13, Protection
 * `{1,1,1,1}`, and computes a real 0.011826214870076034.
 *
 * Expressed as an expression rather than a typed literal so it re-derives from
 * its own stated basis (k10), and 14.5 is exactly representable as a double so
 * it round-trips.
 */
const AGENT_DEGREE_MIN = 0;
const AGENT_DEGREE_MAX = 29;
export const SIGN_MIDPOINT_DEGREE = (AGENT_DEGREE_MIN + AGENT_DEGREE_MAX) / 2;

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

  // `<Planet> <Sign>` — a SIGN-LEVEL agent, no degree in the name. §18k k29.
  //
  // This is the LAST branch deliberately: every degree-bearing form above must
  // win, so a name that states its degree never falls back to the midpoint.
  //
  // It is not a guess. The planet and the sign are both stated by the name and
  // both validated against the live tables, so the only missing coordinate is
  // the degree — and the ruling supplies it as the mean of the degrees the sign
  // spans. Contrast the null cases below it: those are missing the planet, the
  // sign, or both, and nothing in the name constrains them.
  m = name.match(/^([A-Za-z]+) ([A-Za-z]+)$/);
  if (m && asPlanet(m[1]) && asSign(m[2])) {
    return {
      kind: "single",
      planet: asPlanet(m[1])!,
      sign: asSign(m[2])!,
      degree: SIGN_MIDPOINT_DEGREE,
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
  if (placement?.kind !== "single") return null;
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
  if (placement?.kind !== "phase") return null;
  return twoBodyMonica(placement.phase ?? "", placement.sign, placement.degree);
}

/** A resolved monica together with the `monica_method` the row must be stamped with. */
export interface ResolvedAgentMonica {
  monica: AgentMonica;
  method: "single-body" | "two-body";
}

/**
 * Both constructions, for a WRITER — the one entry point a request handler should
 * use when provisioning an agent.
 *
 * ── Why this exists ─────────────────────────────────────────────────────────
 *
 * `agentMonicaFromName` covers single-body placements and returns null for
 * everything else. Writers called only that, so every Moon-phase agent was
 * inserted with a NULL monica and left for a backfill to classify.
 * `[MEASURED 2026-07-28]` of 110 unclassified agents, **92 were phase agents**
 * that `twoBodyMonicaFromName` resolves perfectly — the construction existed and
 * was simply never called on the write path.
 *
 * ── Why it cannot throw ─────────────────────────────────────────────────────
 *
 * `twoBodyMonicaFromName` THROWS `UnknownMoonPhaseError` for a name that is a
 * phase agent whose phase cannot be classified. That is right for a backfill: the
 * throw means "my population, unclassified", and swallowing it would silently drop
 * rows. It is wrong inside a request handler on the money path, where it would
 * turn an odd agent name into a failed debit.
 *
 * So the throw is caught here and reported through `onUnclassifiedPhase`, and the
 * row is left NULL for the nightly backfill — which does surface it. The
 * distinction the throw carries is preserved by the callback, not discarded.
 */
export function agentMonicaWithMethod(
  name: string,
  onUnclassifiedPhase?: (error: unknown) => void,
): ResolvedAgentMonica | null {
  const single = agentMonicaFromName(name);
  if (single) return { monica: single, method: "single-body" };

  try {
    const twoBody = twoBodyMonicaFromName(name);
    return twoBody ? { monica: twoBody, method: "two-body" } : null;
  } catch (error) {
    onUnclassifiedPhase?.(error);
    return null;
  }
}
