import {
  AGENTIC_EMAIL_DOMAIN,
  LEGACY_AGENTS_EMAIL_DOMAIN,
  canonicalizeAgentEmail,
} from "../canonicalizeAgentEmail";

const ALL_PLANETS = [
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
];

const ALL_SIGNS = [
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
];

describe("canonicalizeAgentEmail", () => {
  it("exports canonical and legacy domain constants", () => {
    expect(AGENTIC_EMAIL_DOMAIN).toBe("@agentic.alchm.kitchen");
    expect(LEGACY_AGENTS_EMAIL_DOMAIN).toBe("@agents.alchm.kitchen");
  });

  describe("normalizes unprefixed planetary degree emails", () => {
    it.each(ALL_PLANETS)(
      "prefixes %s-<sign>-<deg>@agentic.alchm.kitchen with planetary-",
      (planet) => {
        expect(
          canonicalizeAgentEmail(`${planet}-leo-7@agentic.alchm.kitchen`),
        ).toBe(`planetary-${planet}-leo-7@agentic.alchm.kitchen`);
      },
    );

    it.each(ALL_SIGNS)(
      "recognizes zodiac sign %s in unprefixed degree emails",
      (sign) => {
        expect(
          canonicalizeAgentEmail(`mars-${sign}-15@agentic.alchm.kitchen`),
        ).toBe(`planetary-mars-${sign}-15@agentic.alchm.kitchen`);
      },
    );

    it.each([0, 7, 29, 30, 359])(
      "normalizes degrees within 0..359 (deg=%d)",
      (deg) => {
        expect(
          canonicalizeAgentEmail(`jupiter-aquarius-${deg}@agentic.alchm.kitchen`),
        ).toBe(`planetary-jupiter-aquarius-${deg}@agentic.alchm.kitchen`);
      },
    );

    it("strips leading zeros on integer degree within 0..359", () => {
      expect(
        canonicalizeAgentEmail("mercury-leo-07@agentic.alchm.kitchen"),
      ).toBe("planetary-mercury-leo-7@agentic.alchm.kitchen");
    });

    it.each([
      "jupiter-aquarius-360@agentic.alchm.kitchen",
      "jupiter-aquarius-999@agentic.alchm.kitchen",
      "jupiter-aquarius-1000@agentic.alchm.kitchen",
      "jupiter-aquarius--1@agentic.alchm.kitchen",
      "chiron-aries-5@agentic.alchm.kitchen",
      "moon-foo-12@agentic.alchm.kitchen",
      "moon-agent-276@agentic.alchm.kitchen",
      "mars-gemini@agentic.alchm.kitchen",
      "moon-cancer@agentic.alchm.kitchen",
    ])("leaves non-degree or invalid-planet/sign/deg email %s unprefixed", (email) => {
      expect(canonicalizeAgentEmail(email)).toBe(email);
    });
  });

  describe("normalizes legacy @agents.alchm.kitchen domain", () => {
    it.each([
      ["socrates@agents.alchm.kitchen", "socrates@agentic.alchm.kitchen"],
      [
        "adam-smith-1723@agents.alchm.kitchen",
        "adam-smith-1723@agentic.alchm.kitchen",
      ],
      [
        "planetary-venus-virgo-8@agents.alchm.kitchen",
        "planetary-venus-virgo-8@agentic.alchm.kitchen",
      ],
      [
        "moon-phase-waning-gibbous-24@agents.alchm.kitchen",
        "moon-phase-waning-gibbous-24@agentic.alchm.kitchen",
      ],
      [
        "moon-agent-276@agents.alchm.kitchen",
        "moon-agent-276@agentic.alchm.kitchen",
      ],
      [
        "mars-leo-8@agents.alchm.kitchen",
        "planetary-mars-leo-8@agentic.alchm.kitchen",
      ],
      [
        "  MARS-LEO-8@AGENTS.ALCHM.KITCHEN  ",
        "planetary-mars-leo-8@agentic.alchm.kitchen",
      ],
    ])("maps %s -> %s", (input, expected) => {
      expect(canonicalizeAgentEmail(input)).toBe(expected);
    });
  });

  describe("preserves canonical, legacy moon-agent, and historical emails", () => {
    it.each([
      "planetary-mercury-leo-7@agentic.alchm.kitchen",
      "moon-phase-waning-gibbous-24@agentic.alchm.kitchen",
      "moon-agent-0@agentic.alchm.kitchen",
      "moon-agent-276@agentic.alchm.kitchen",
      "leonardo-da-vinci@agentic.alchm.kitchen",
      "adam-smith-1723@agentic.alchm.kitchen",
      "mars-gemini@agentic.alchm.kitchen",
      "moon-leo@agentic.alchm.kitchen",
    ])("leaves %s unchanged and is idempotent", (email) => {
      const first = canonicalizeAgentEmail(email);
      expect(first).toBe(email);
      expect(canonicalizeAgentEmail(first)).toBe(email);
    });
  });

  describe("handles human, external, and malformed inputs safely", () => {
    it("only trims and lowercases non-agentic emails", () => {
      expect(canonicalizeAgentEmail("  Alice@Example.COM ")).toBe(
        "alice@example.com",
      );
      expect(canonicalizeAgentEmail("mercury-leo-7@example.com")).toBe(
        "mercury-leo-7@example.com",
      );
    });

    it("handles empty, missing-@, and multi-@ strings without throwing", () => {
      expect(canonicalizeAgentEmail("")).toBe("");
      expect(canonicalizeAgentEmail("   ")).toBe("");
      expect(canonicalizeAgentEmail("@agents.alchm.kitchen")).toBe(
        "@agents.alchm.kitchen",
      );
      expect(canonicalizeAgentEmail("mars-leo-8")).toBe("mars-leo-8");
      expect(canonicalizeAgentEmail("a@b@agents.alchm.kitchen")).toBe(
        "a@b@agents.alchm.kitchen",
      );
    });
  });
});
