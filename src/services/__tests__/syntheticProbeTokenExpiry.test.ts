/**
 * @jest-environment node
 *
 * The synthetic probes all authenticate with one long-lived JWT
 * (`SYNTHETIC_PROBE_TOKEN`). When it expires, all seven probes start failing at
 * the same moment and the dashboard reports a platform-wide incident that is
 * really one expired credential.
 *
 * The variable is marked Sensitive in Vercel, so the expiry cannot be read back
 * to re-derive it — which is exactly how a recorded date rots into one nobody
 * has checked since it was written. Two things stop that: the tripwire below,
 * which turns this suite red 60 days out, and `warnIfProbeTokenNearExpiry`,
 * which re-derives the real `exp` in production where the token actually lives.
 */

jest.mock("@/lib/database/connection", () => ({
  executeQuery: jest.fn().mockResolvedValue({ rows: [] }),
}));

const mockWarn = jest.fn();
jest.mock("@/lib/logger", () => ({
  _logger: { warn: mockWarn, error: jest.fn(), info: jest.fn() },
  logger: { warn: mockWarn, error: jest.fn(), info: jest.fn() },
}));

import {
  daysUntilProbeTokenExpiry,
  decodeJwtExpiry,
  warnIfProbeTokenNearExpiry,
  PROBE_TOKEN_EXPIRY_WARNING_DAYS,
  SYNTHETIC_PROBE_TOKEN_EXPIRES_AT,
} from "@/services/syntheticProbeService";

/** Build an unsigned JWT whose `exp` is `days` from `from`. */
function tokenExpiringIn(days: number, from = new Date()): string {
  const exp = Math.floor((from.getTime() + days * 86_400_000) / 1000);
  const b64 = (o: unknown) =>
    Buffer.from(JSON.stringify(o)).toString("base64url");
  return `${b64({ alg: "HS256" })}.${b64({ sub: "probe", exp })}.signature`;
}

describe("the recorded expiry is still far enough away", () => {
  it("has not come within the warning window", () => {
    // THIS IS THE TRIPWIRE. When it fails, nothing is broken yet — mint a new
    // SYNTHETIC_PROBE_TOKEN, set it in Vercel, and move
    // SYNTHETIC_PROBE_TOKEN_EXPIRES_AT to the new `exp`. Do not widen the
    // window to make it pass.
    const days = daysUntilProbeTokenExpiry(new Date());
    expect(days).toBeGreaterThan(PROBE_TOKEN_EXPIRY_WARNING_DAYS);
  });

  it("is a parseable instant, not a date-shaped string", () => {
    expect(Number.isFinite(Date.parse(SYNTHETIC_PROBE_TOKEN_EXPIRES_AT))).toBe(true);
  });
});

describe("daysUntilProbeTokenExpiry", () => {
  it("counts down toward the recorded date", () => {
    const expiry = new Date(SYNTHETIC_PROBE_TOKEN_EXPIRES_AT);
    const tenDaysBefore = new Date(expiry.getTime() - 10 * 86_400_000);
    expect(daysUntilProbeTokenExpiry(tenDaysBefore)).toBe(10);
  });

  it("goes negative once the date has passed", () => {
    const after = new Date(Date.parse(SYNTHETIC_PROBE_TOKEN_EXPIRES_AT) + 5 * 86_400_000);
    expect(daysUntilProbeTokenExpiry(after)).toBeLessThan(0);
  });
});

describe("decodeJwtExpiry", () => {
  it("reads the exp claim", () => {
    const now = new Date("2026-08-11T00:00:00.000Z");
    const exp = decodeJwtExpiry(tokenExpiringIn(30, now));
    expect(exp).not.toBeNull();
    expect(Math.round((exp!.getTime() - now.getTime()) / 86_400_000)).toBe(30);
  });

  // An unreadable token is a reason to stay quiet, never to break the probe
  // that is about to use it — so every one of these returns null, not throws.
  it.each([
    ["undefined", undefined],
    ["empty", ""],
    ["not a JWT", "just-a-plain-string"],
    ["wrong segment count", "a.b"],
    ["undecodable payload", "aaa.!!!!.ccc"],
    ["payload with no exp", `x.${Buffer.from('{"sub":"p"}').toString("base64url")}.y`],
    ["non-numeric exp", `x.${Buffer.from('{"exp":"soon"}').toString("base64url")}.y`],
  ])("returns null for %s", (_label, token) => {
    expect(decodeJwtExpiry(token as string | undefined)).toBeNull();
  });
});

describe("warnIfProbeTokenNearExpiry", () => {
  const saved = process.env.SYNTHETIC_PROBE_TOKEN;
  const recordedExpiry = new Date(SYNTHETIC_PROBE_TOKEN_EXPIRES_AT);

  beforeEach(() => mockWarn.mockClear());
  afterEach(() => {
    if (saved === undefined) delete process.env.SYNTHETIC_PROBE_TOKEN;
    else process.env.SYNTHETIC_PROBE_TOKEN = saved;
  });

  it("says nothing while the token is comfortably valid", () => {
    // The token must expire when the constant says it does, or this would test
    // the disagreement branch instead of the proximity one.
    const now = new Date(recordedExpiry.getTime() - 400 * 86_400_000);
    process.env.SYNTHETIC_PROBE_TOKEN = tokenExpiringIn(400, now);
    warnIfProbeTokenNearExpiry(now);
    expect(mockWarn).not.toHaveBeenCalled();
  });

  it("warns once the real token is inside the window", () => {
    const now = new Date(recordedExpiry.getTime() - 30 * 86_400_000);
    process.env.SYNTHETIC_PROBE_TOKEN = tokenExpiringIn(30, now);
    warnIfProbeTokenNearExpiry(now);
    expect(mockWarn).toHaveBeenCalledWith(expect.stringMatching(/expires in 30d/));
  });

  it("reports the recorded date disagreeing with the token in use", () => {
    // The half that keeps the constant honest: production holds the real token,
    // so production is where a wrong constant gets caught.
    const now = new Date(recordedExpiry.getTime() - 300 * 86_400_000);
    process.env.SYNTHETIC_PROBE_TOKEN = tokenExpiringIn(5, now);
    warnIfProbeTokenNearExpiry(now);
    expect(mockWarn).toHaveBeenCalledWith(
      expect.stringMatching(/disagrees with the token in use/),
      expect.objectContaining({ recorded: SYNTHETIC_PROBE_TOKEN_EXPIRES_AT }),
    );
  });

  it("falls back to the recorded date when the token cannot be decoded", () => {
    // The Sensitive-variable case: no token in this context, so the constant is
    // all there is — and it still has to be able to raise the alarm.
    delete process.env.SYNTHETIC_PROBE_TOKEN;
    warnIfProbeTokenNearExpiry(new Date(recordedExpiry.getTime() - 10 * 86_400_000));
    expect(mockWarn).toHaveBeenCalledWith(
      expect.stringMatching(/expires in 10d.*recorded — token not decodable here/),
    );
  });

  it("stays quiet with no token when the recorded date is far off", () => {
    delete process.env.SYNTHETIC_PROBE_TOKEN;
    warnIfProbeTokenNearExpiry(new Date(recordedExpiry.getTime() - 500 * 86_400_000));
    expect(mockWarn).not.toHaveBeenCalled();
  });
});
