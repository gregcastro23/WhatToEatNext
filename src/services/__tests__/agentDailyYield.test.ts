import { planetSignsFromNatal } from "../agentDailyYield";

describe("planetSignsFromNatal", () => {
  it("maps an array of {planet, sign} entries into a planet→sign map", () => {
    expect(
      planetSignsFromNatal([
        { planet: "Sun", sign: "Aries", degree: 0 },
        { planet: "Moon", sign: "Sagittarius", degree: 27 },
      ]),
    ).toEqual({ Sun: "Aries", Moon: "Sagittarius" });
  });

  it("parses a JSON string and ignores malformed entries", () => {
    expect(
      planetSignsFromNatal('[{"planet":"Mars","sign":"Scorpio"},{"x":1},{"planet":"Venus"}]'),
    ).toEqual({ Mars: "Scorpio" });
  });

  it("returns {} for empty arrays, non-arrays, and unparseable strings", () => {
    expect(planetSignsFromNatal([])).toEqual({});
    expect(planetSignsFromNatal(null)).toEqual({});
    expect(planetSignsFromNatal({})).toEqual({});
    expect(planetSignsFromNatal("not json")).toEqual({});
  });

  it("keeps the last sign when a planet repeats", () => {
    expect(
      planetSignsFromNatal([
        { planet: "Sun", sign: "Aries" },
        { planet: "Sun", sign: "Taurus" },
      ]),
    ).toEqual({ Sun: "Taurus" });
  });
});

// ─── The run loop's tally ──────────────────────────────────────────────

describe("runAgentDailyYield — how a failed credit is counted", () => {
  const AGENT = {
    id: "agent-1",
    email: "agent@example.com",
    name: "Agent One",
    natal_positions: [
      { planet: "Sun", sign: "Leo" },
      { planet: "Moon", sign: "Cancer" },
    ],
  };

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  async function runWith(claim: unknown) {
    const claimDailyYield = jest.fn().mockResolvedValue(claim);
    const executeQuery = jest.fn().mockResolvedValue({ rows: [AGENT] });

    jest.doMock("@/lib/database", () => ({ executeQuery }));
    jest.doMock("@/services/DailyYieldService", () => ({
      dailyYieldService: { claimDailyYield },
    }));
    jest.doMock("@/lib/logger", () => ({
      _logger: { error: jest.fn(), warn: jest.fn(), info: jest.fn(), debug: jest.fn() },
    }));

    // Imported inside the same window as doMock: jest runs with resetModules,
    // so a module loaded earlier would not see these factories.
    const { runAgentDailyYield } = await import("@/services/agentDailyYield");
    return runAgentDailyYield(1);
  }

  it("counts a rolled-back credit as FAILED, not alreadyClaimed", async () => {
    // The defect: any falsy result landed in `alreadyClaimed`, so a run that
    // credited nobody reported a clean sheet and raised nothing.
    const result = await runWith({
      status: "failed",
      code: "40P01",
      constraint: null,
      message: "deadlock detected",
    });

    expect(result.failed).toBe(1);
    expect(result.alreadyClaimed).toBe(0);
    expect(result.credited).toBe(0);
    expect(result.tokensMinted).toBe(0);
  });

  it("still counts a genuine same-day claim as alreadyClaimed", async () => {
    const result = await runWith({ status: "already_claimed" });

    expect(result.alreadyClaimed).toBe(1);
    expect(result.failed).toBe(0);
  });

  it("counts a successful claim and adds its tokens", async () => {
    const result = await runWith({
      status: "claimed",
      result: { totalTokens: 12.5 },
    });

    expect(result.credited).toBe(1);
    expect(result.tokensMinted).toBe(12.5);
    expect(result.failed).toBe(0);
    expect(result.alreadyClaimed).toBe(0);
  });
});
