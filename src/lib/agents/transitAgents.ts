/**
 * Resolve the planetary-degree agents "involved in" a transit, and build the
 * canonical Planetary-Agents (PA) agent IDs the planetary_agents project expects.
 *
 * A "transit" here is an aspect between two transiting planets. Per product
 * decision the council = exactly those two planets' degree agents. A single
 * transiting planet (clicked on a position-only surface) resolves to the transit
 * it is most tightly involved in (see `useActiveTransits`), and degrades to a
 * solo degree-agent chat when nothing is in orb.
 *
 * Canonical ID format — verified identical in BOTH repos:
 *   - PA seed: `backend/seed_3600_planetary_agents.py`
 *       agent_id = f"planetary-{planet.lower()}-{sign.lower()}-{degree}"
 *   - WTEN:    `src/lib/unified-agent-factory.ts`
 *       `planetary-${planet.toLowerCase()}-${sign.toLowerCase()}-${degree}`
 *   →  planetary-{planet}-{sign}-{degree}   (all lowercase, degree 0-29 within sign)
 *
 * PA pre-seeds all 3600 (10 planets × 12 signs × 30°), so a canonical ID resolves
 * to a real, addressable agent. The PA `/api/chat` parser also accepts the
 * prefixless form, but we always emit the seeded canonical form.
 *
 * This module is pure (no server/client-only imports) so it can be shared by the
 * proxy route, the hooks, and the surface components.
 */

/** The 10 planets that have seeded degree agents (Sun..Pluto), lowercase. */
export const SEEDED_PLANETS = [
  "sun", "moon", "mercury", "venus", "mars",
  "jupiter", "saturn", "uranus", "neptune", "pluto",
] as const;

const SEEDED = new Set<string>(SEEDED_PLANETS);

export interface TransitBody {
  /** Planet name, any case (e.g. "Mars"). */
  planet: string;
  /** Zodiac sign, any case (e.g. "Aries"). */
  sign: string;
  /** Degree WITHIN the sign (0–29.99…); fractional is fine — it is floored. */
  degree: number;
}

export interface TransitParticipant {
  /** Canonical PA agent id: `planetary-{planet}-{sign}-{degree}`. */
  id: string;
  /** Title-cased display planet (e.g. "Mars"). */
  planet: string;
  /** Lowercase sign (e.g. "aries"). */
  sign: string;
  /** Integer degree within the sign (0–29). */
  degree: number;
  /** Display name, mirrors the PA seed: "Mars in Aries 15 Degree". */
  name: string;
}

export interface TransitDescriptor {
  /** Aspect type — "square" | "trine" | … . Omitted for solo clicks. */
  aspect?: string;
  /** Stable key for analytics + PA idempotency, e.g. "mars-aries-15--square--saturn-capricorn-15". */
  key: string;
  /** Human label, e.g. "Mars square Saturn" (or just "Mars" for a solo council). */
  label: string;
}

export interface TransitGroup {
  participants: TransitParticipant[];
  descriptor: TransitDescriptor;
}

function titleCase(s: string): string {
  const t = String(s ?? "").trim();
  return t ? t.charAt(0).toUpperCase() + t.slice(1).toLowerCase() : t;
}

/** Normalize a within-sign degree into an integer 0–29. */
export function normalizeDegree(degree: number): number {
  const d = Math.floor(Number.isFinite(degree) ? degree : 0);
  return ((d % 30) + 30) % 30;
}

/**
 * Build the canonical PA degree-agent id for a transiting body.
 * Returns null for bodies without a seeded degree agent (Nodes, Asc/MC, …) or
 * when the sign is missing.
 */
export function degreeAgentId(planet: string, sign: string, degree: number): string | null {
  const p = String(planet ?? "").trim().toLowerCase();
  const s = String(sign ?? "").trim().toLowerCase();
  if (!SEEDED.has(p) || !s) return null;
  return `planetary-${p}-${s}-${normalizeDegree(degree)}`;
}

/** Turn a transiting body into a participant, or null if it has no seeded agent. */
export function toParticipant(body: TransitBody): TransitParticipant | null {
  const id = degreeAgentId(body.planet, body.sign, body.degree);
  if (!id) return null;
  const planet = titleCase(body.planet);
  const sign = String(body.sign).trim().toLowerCase();
  const degree = normalizeDegree(body.degree);
  return { id, planet, sign, degree, name: `${planet} in ${titleCase(sign)} ${degree} Degree` };
}

/**
 * Resolve the participants + descriptor for an aspect between two transiting
 * bodies. Pass the same body twice for a solo council (it de-dupes to one).
 * Returns null when neither body has a seeded degree agent.
 */
export function groupForAspect(a: TransitBody, b: TransitBody, aspect?: string): TransitGroup | null {
  const participants: TransitParticipant[] = [];
  const seen = new Set<string>();
  for (const body of [a, b]) {
    const p = toParticipant(body);
    if (p && !seen.has(p.id)) {
      seen.add(p.id);
      participants.push(p);
    }
  }
  if (participants.length === 0) return null;

  const idPart = participants.map((p) => `${p.planet.toLowerCase()}-${p.sign}-${p.degree}`);
  const asp = aspect ? String(aspect).toLowerCase() : undefined;

  if (participants.length === 1 || !asp) {
    return {
      participants,
      descriptor: {
        aspect: asp,
        key: idPart.join("--"),
        label: participants.map((p) => p.planet).join(" · "),
      },
    };
  }

  return {
    participants,
    descriptor: {
      aspect: asp,
      key: `${idPart[0]}--${asp}--${idPart[1]}`,
      label: `${participants[0].planet} ${asp} ${participants[1].planet}`,
    },
  };
}
