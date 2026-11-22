/**
 * Canonicalize incoming and outbound Planetary Agent email addresses.
 *
 * Pure, dependency-free normalizer applied before user lookup or
 * auto-provisioning so legacy domain aliases and unprefixed degree slugs
 * converge onto a single canonical `users.email` row:
 *
 *   - `*@agents.alchm.kitchen` -> `*@agentic.alchm.kitchen`
 *   - `<planet>-<sign>-<deg>@agentic.alchm.kitchen`
 *       (10 classical/outer planets, 12 zodiac signs, integer deg 0..359)
 *       -> `planetary-<planet>-<sign>-<deg>@agentic.alchm.kitchen`
 *
 * Already-canonical `planetary-*`, `moon-phase-*`, historical figure emails,
 * sign-level slugs (e.g. `mars-gemini@agentic.alchm.kitchen`), and existing
 * legacy `moon-agent-*` rows pass through unchanged.
 */

export const AGENTIC_EMAIL_DOMAIN = "@agentic.alchm.kitchen";
export const LEGACY_AGENTS_EMAIL_DOMAIN = "@agents.alchm.kitchen";

const PLANETS: ReadonlySet<string> = new Set([
  "sun",
  "moon",
  "mercury",
  "venus",
  "mars",
  "jupiter",
  "saturn",
  "uranus",
  "neptune",
  "pluto",
]);

const ZODIAC_SIGNS: ReadonlySet<string> = new Set([
  "aries",
  "taurus",
  "gemini",
  "cancer",
  "leo",
  "virgo",
  "libra",
  "scorpio",
  "sagittarius",
  "capricorn",
  "aquarius",
  "pisces",
]);

const UNPREFIXED_DEGREE_LOCAL_RE = /^([a-z]+)-([a-z]+)-(\d{1,3})$/;

/**
 * Canonicalize an agent email address (idempotent).
 * Non-agentic emails are only trimmed and lowercased.
 */
export function canonicalizeAgentEmail(rawEmail: string): string {
  const trimmed = rawEmail.trim().toLowerCase();
  const atIndex = trimmed.indexOf("@");
  if (atIndex <= 0 || trimmed.indexOf("@", atIndex + 1) !== -1) {
    return trimmed;
  }

  let localPart = trimmed.slice(0, atIndex);
  let domain = trimmed.slice(atIndex);

  if (domain === LEGACY_AGENTS_EMAIL_DOMAIN) {
    domain = AGENTIC_EMAIL_DOMAIN;
  }

  if (domain !== AGENTIC_EMAIL_DOMAIN) {
    return `${localPart}${domain}`;
  }

  const match = UNPREFIXED_DEGREE_LOCAL_RE.exec(localPart);
  if (match) {
    const [, planet, sign, rawDeg] = match;
    if (planet && sign && rawDeg && PLANETS.has(planet) && ZODIAC_SIGNS.has(sign)) {
      const deg = Number(rawDeg);
      if (Number.isInteger(deg) && deg >= 0 && deg <= 359) {
        localPart = `planetary-${planet}-${sign}-${deg}`;
      }
    }
  }

  return `${localPart}${domain}`;
}
