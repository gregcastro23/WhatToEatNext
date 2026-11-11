import { parseClaimResponse, parseGrimoireData } from "../parsers";

const grimoire = {
  success: true,
  sky: {
    dominantElement: "Fire",
    aNumber: 3.2,
    skyMultiplier: 1.1,
    transitWeights: { Sun: 1 },
    rulingDayPlanet: "Sun",
    rulingHourPlanet: "Moon",
    personalized: false,
    timestamp: "2026-11-11T00:00:00.000Z",
  },
  resonance: { spirit: 1, essence: 0.9, matter: 1.2, substance: 1 },
  allowance: { total: 12, spent: 3, remaining: 9 },
  practices: [
    {
      type: "cooking",
      tokenType: "Matter",
      description: "Cook a dish",
      baseAmount: 1,
      dedupe: "daily",
      dailyCap: 3,
      todayAmount: 1.2,
      todayModifier: 1.2,
    },
  ],
  discoveredSurfaces: ["grimoire"],
  streak: {
    current: 4,
    longest: 9,
    nextMilestone: { days: 7, totalTokens: 10 },
    milestones: [{ days: 7, totalTokens: 10 }],
  },
  feats: [
    {
      slug: "first-cook",
      title: "First cook",
      description: null,
      tokenRewardType: "all",
      tokenRewardAmount: 5,
      progress: 1,
      threshold: 1,
      completedAt: "2026-11-10T10:00:00.000Z",
      claimedAt: null,
    },
  ],
};

describe("grimoire wire parsers", (): void => {
  it("accepts the real /api/economy/grimoire payload and ignores extra sky keys", (): void => {
    const out = parseGrimoireData(grimoire);
    expect(out.sky).toEqual({
      dominantElement: "Fire",
      skyMultiplier: 1.1,
      rulingDayPlanet: "Sun",
      rulingHourPlanet: "Moon",
      personalized: false,
    });
    expect(out.streak.nextMilestone).toEqual({ days: 7, totalTokens: 10 });
  });

  it("accepts a streak with no next milestone", (): void => {
    const done = { ...grimoire, streak: { ...grimoire.streak, nextMilestone: null } };
    expect(parseGrimoireData(done).streak.nextMilestone).toBeNull();
  });

  it("rejects a practice dedupe scope outside the closed set the page knows", (): void => {
    const [practice] = grimoire.practices;
    const weekly = { ...grimoire, practices: [{ ...practice, dedupe: "weekly" }] };
    expect(() => parseGrimoireData(weekly)).toThrow(/dedupe/);
    // control: the same practice with a known scope is accepted
    expect(parseGrimoireData({ ...grimoire, practices: [{ ...practice, dedupe: "ever" }] }).practices).toHaveLength(1);
  });

  it("throws on a partial body so the page's catch keeps the grimoire shut", (): void => {
    const { sky: _sky, ...withoutSky } = grimoire;
    expect(() => parseGrimoireData(withoutSky)).toThrow();
    expect(() => parseGrimoireData(null)).toThrow();
  });

  it("parses claim responses, treating a null award as no award", (): void => {
    expect(parseClaimResponse({ success: true, tokensAwarded: 5, questSlug: "x" })).toEqual({ success: true, tokensAwarded: 5 });
    expect(parseClaimResponse({ success: false, message: "nope" })).toEqual({ success: false });
    expect(parseClaimResponse({ success: true, tokensAwarded: null }).tokensAwarded).toBeNull();
    expect(() => parseClaimResponse({ success: true, tokensAwarded: "5" })).toThrow();
  });
});
