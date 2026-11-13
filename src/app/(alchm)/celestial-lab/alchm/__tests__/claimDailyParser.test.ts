/**
 * A 200 from /api/economy/claim-daily means the server has ALREADY minted the
 * tokens, so this parser must never throw: drift may cost the yield card, never
 * turn a completed claim into an exception. `success` is true only for the
 * boolean `true`; `yield` survives only for a success body whose distribution
 * and streakCount are usable. Bodies go through JSON.stringify/parse so they
 * are what `response.json()` would return.
 */
import { parseClaimDailyResponse } from "../claimDailyParser";

function wire(body: unknown): unknown {
  const parsed: unknown = JSON.parse(JSON.stringify(body));
  return parsed;
}

function parse(body: unknown): ReturnType<typeof parseClaimDailyResponse> {
  return parseClaimDailyResponse(wire(body));
}

const DISTRIBUTION = { spirit: 3.4, essence: 2.9, matter: 3.1, substance: 3.1 };
const MESSAGE =
  "✨ Cosmic Yield collected! +12.5 tokens across Spirit, Essence, Matter & Substance.";
const CLAIMED = { distribution: DISTRIBUTION, streakCount: 4 };
const EXPECTED = { success: true, message: MESSAGE, yield: CLAIMED };

// A realistic DailyYieldResult (src/types/economy.ts:257-269).
function dailyYield(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  const leg = { natalRatio: 1.1, transitRatio: 0.9, antiGlutFactor: 1, finalYield: 3.1 };
  return {
    totalTokens: 12.5,
    distribution: { ...DISTRIBUTION },
    resonance: { score: 4.2, baseline: 3.5, ratio: 1.2 },
    breakdown: { spirit: leg, essence: leg, matter: leg, substance: leg },
    newBalances: {
      spirit: 103.4,
      essence: 52.9,
      matter: 73.1,
      substance: 33.1,
      lastDailyClaimAt: "2026-11-12T08:15:00.000Z",
      lastDailyClaimAgentsAt: null,
      updatedAt: "2026-11-12T08:15:00.000Z",
    },
    streakCount: 4,
    ...overrides,
  };
}

// route.ts:117-121: { success: true, yield: yieldResult, message }.
function successBody(
  yieldOverrides: Record<string, unknown> = {},
  top: Record<string, unknown> = {},
): Record<string, unknown> {
  return { success: true, yield: dailyYield(yieldOverrides), message: MESSAGE, ...top };
}

describe("parseClaimDailyResponse: bodies that are not objects", (): void => {
  it("reads a real JSON null as { success: false } without throwing", (): void => {
    const parsed: unknown = JSON.parse("null");
    expect(parsed).toBeNull();
    expect(parseClaimDailyResponse(parsed)).toEqual({ success: false });
  });

  it.each([["an array", []], ["a string", "text"], ["a number", 7], ["a boolean", true], ["undefined", undefined]])(
    "treats %s as a non-object body: { success: false }",
    (_label, value): void => {
      expect(parseClaimDailyResponse(value)).toEqual({ success: false });
    },
  );

  it("reads an empty object as { success: false }", (): void => {
    expect(parse({})).toEqual({ success: false });
  });
});

describe("parseClaimDailyResponse: the producer's success body", (): void => {
  it("keeps success, message and the part of the yield the page reads", (): void => {
    expect(parse(successBody())).toEqual(EXPECTED);
  });

  it("does not carry the yield fields nobody reads", (): void => {
    const out = parse(successBody());
    expect(Object.keys(out.yield ?? {}).sort()).toEqual(["distribution", "streakCount"]);
    expect(Object.keys(out.yield?.distribution ?? {}).sort()).toEqual([
      "essence",
      "matter",
      "spirit",
      "substance",
    ]);
  });

  it("keeps the yield of a milestone claim (route.ts:114-116 adds a bonus note)", (): void => {
    const note = " 🔥 7-day streak milestone: +10 bonus tokens!";
    const body = successBody(
      { streakCount: 7, milestoneBonus: { days: 7, totalTokens: 10 } },
      { message: MESSAGE + note },
    );
    expect(parse(body)).toEqual({
      success: true,
      message: MESSAGE + note,
      yield: { distribution: DISTRIBUTION, streakCount: 7 },
    });
  });

  it("keeps a zero-valued distribution and a zero streak (zero is a number, not absence)", (): void => {
    const zero = { spirit: 0, essence: 0, matter: 0, substance: 0 };
    expect(parse(successBody({ distribution: zero, streakCount: 0 })).yield).toEqual({
      distribution: zero,
      streakCount: 0,
    });
  });
});

describe("parseClaimDailyResponse: every refusal the route and rateLimit send", (): void => {
  const refusals: Array<[string, string]> = [
    ["401 auth", "Authentication required"],
    ["400 no natal chart", "Complete onboarding with your birth data to start earning tokens"],
    ["400 incomplete chart", "Natal chart data is incomplete. Please update your birth data."],
    ["500 claim failed", "Could not collect your Cosmic Yield just now. Please try again."],
    ["409 already claimed", "You have already claimed your Cosmic Yield today. Return tomorrow!"],
    [
      "503 degraded ephemeris",
      "The live sky could not be verified, so no tokens were minted. Please retry shortly.",
    ],
    ["500 generic", "Failed to claim daily yield. Please try again."],
  ];

  it.each(refusals)("%s keeps its message and is not a success", (_label, message): void => {
    expect(parse({ success: false, message })).toEqual({ success: false, message });
  });

  it("reads the 429 rateLimit body (no success key) as a refusal that keeps its message", (): void => {
    const body = {
      error: "rate_limit_exceeded",
      message: "Too many requests. Please try again shortly.",
      retryAfter: 42,
    };
    expect(parse(body)).toEqual({
      success: false,
      message: "Too many requests. Please try again shortly.",
    });
  });
});

describe("parseClaimDailyResponse: success must be the boolean true", (): void => {
  it.each([["string true", "true"], ["number 1", 1], ["string yes", "yes"], ["null", null], ["object", {}]])(
    "does not accept success as %s, and drops the yield",
    (_label, success): void => {
      expect(parse(successBody({}, { success }))).toEqual({ success: false, message: MESSAGE });
      // control: the same body with the boolean true keeps the yield
      expect(parse(successBody({}, { success: true }))).toEqual(EXPECTED);
    },
  );

  it("drops a valid-looking yield from a body whose success is false or missing", (): void => {
    expect(parse(successBody({}, { success: false }))).toEqual({ success: false, message: MESSAGE });
    expect(parse({ yield: dailyYield(), message: MESSAGE })).toEqual({
      success: false,
      message: MESSAGE,
    });
    // control: success true keeps it
    expect(parse(successBody())).toEqual(EXPECTED);
  });
});

describe("parseClaimDailyResponse: message is kept only as a string", (): void => {
  it.each([["number", 42], ["null", null], ["object", { text: "x" }], ["array", ["x"]]])(
    "drops a %s message but keeps a valid yield",
    (_label, message): void => {
      expect(parse(successBody({}, { message }))).toEqual({ success: true, yield: CLAIMED });
      // control: a string message is kept
      expect(parse(successBody({}, { message: "ok" }))).toEqual({
        success: true,
        message: "ok",
        yield: CLAIMED,
      });
    },
  );

  it("keeps an empty string message (the page's ?? only falls back on absence)", (): void => {
    expect(parse({ success: false, message: "" })).toEqual({ success: false, message: "" });
  });
});

describe("parseClaimDailyResponse: a success body with an unusable yield", (): void => {
  it.each([
    ["missing", undefined],
    ["null", null],
    ["a string", "yield"],
    ["an array", [dailyYield()]],
    ["empty", {}],
  ])("parses to success without a yield when yield is %s", (_label, value): void => {
    // The page then takes its error branch and shows the server's success message.
    expect(parse(successBody({}, { yield: value }))).toEqual({ success: true, message: MESSAGE });
    // control: a real yield in the same slot is kept
    expect(parse(successBody({}, { yield: dailyYield() }))).toEqual(EXPECTED);
  });

  it.each(["spirit", "essence", "matter", "substance"])(
    "drops the yield when distribution.%s is a string",
    (key): void => {
      const bad = { ...DISTRIBUTION, [key]: "3.4" };
      expect(parse(successBody({ distribution: bad }))).toEqual({ success: true, message: MESSAGE });
      // control: the same key as a number keeps the whole yield
      expect(parse(successBody({ distribution: { ...DISTRIBUTION, [key]: 3.4 } })).yield).toEqual({
        distribution: { ...DISTRIBUTION, [key]: 3.4 },
        streakCount: 4,
      });
    },
  );

  it.each(["spirit", "essence", "matter", "substance"])(
    "drops the yield when distribution.%s is missing or serialised from NaN (null)",
    (key): void => {
      const missing = { ...DISTRIBUTION };
      Reflect.deleteProperty(missing, key);
      expect(parse(successBody({ distribution: missing }))).toEqual({ success: true, message: MESSAGE });
      expect(parse(successBody({ distribution: { ...DISTRIBUTION, [key]: NaN } }))).toEqual({
        success: true,
        message: MESSAGE,
      });
      // control: the key present as a finite number keeps the yield
      expect(parse(successBody({ distribution: { ...DISTRIBUTION, [key]: 1 } })).yield).toBeDefined();
    },
  );

  it("drops the yield when a distribution entry is Infinity (JSON 1e999)", (): void => {
    // Parsed straight from text: re-stringifying Infinity would turn it into null.
    const bodyWith = (spirit: string): unknown =>
      JSON.parse(
        `{"success":true,"yield":{"distribution":{"spirit":${spirit},"essence":2,"matter":3,"substance":4},"streakCount":1}}`,
      );
    expect(parseClaimDailyResponse(bodyWith("1e999"))).toEqual({ success: true });
    // control: the same text with a finite exponent keeps the yield
    expect(parseClaimDailyResponse(bodyWith("1e3")).yield?.distribution.spirit).toBe(1000);
  });

  it.each([["null", null], ["an array", [1, 2, 3, 4]], ["a string", "3.4"], ["missing", undefined]])(
    "drops the yield when distribution is %s",
    (_label, distribution): void => {
      expect(parse(successBody({ distribution }))).toEqual({ success: true, message: MESSAGE });
      // control: a real distribution in the same slot is kept
      expect(parse(successBody({ distribution: { ...DISTRIBUTION } }))).toEqual(EXPECTED);
    },
  );

  it.each([["null (NaN on the wire)", NaN], ["a string", "4"], ["missing", undefined], ["an object", {}]])(
    "drops the yield when streakCount is %s",
    (_label, streakCount): void => {
      expect(parse(successBody({ streakCount }))).toEqual({ success: true, message: MESSAGE });
      // control: a finite streakCount keeps the yield
      expect(parse(successBody({ streakCount: 9 })).yield?.streakCount).toBe(9);
    },
  );

  it("drops the yield when streakCount is Infinity (JSON 1e999)", (): void => {
    const body: unknown = JSON.parse(
      `{"success":true,"yield":{"distribution":{"spirit":1,"essence":1,"matter":1,"substance":1},"streakCount":1e999}}`,
    );
    expect(parseClaimDailyResponse(body)).toEqual({ success: true });
  });

  it("ignores drift in the fields the page never reads", (): void => {
    const body = successBody({ totalTokens: "n/a", resonance: null, breakdown: [], newBalances: 7 });
    expect(parse(body)).toEqual(EXPECTED);
  });
});
