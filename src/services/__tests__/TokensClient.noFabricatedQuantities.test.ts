/**
 * TokensClient must never invent a quantity.
 *
 * ── What was there ──────────────────────────────────────────────────────────
 *
 * `computeTokensFromAlchemical` took `unknown`, narrowed each field with
 * `typeof x === "number"`, and substituted a literal when that failed:
 *
 *     const Spirit = typeof esms?.Spirit === "number" ? esms.Spirit : 0.5;
 *     ... Essence, Matter, Substance likewise
 *     kalchm: typeof ar?.kalchm === "number" ? ar.kalchm : 1.0,
 *
 * Five fabricated quantities. Downstream an invented 0.5 is indistinguishable
 * from a measured one — the defect class the thermodynamics programme exists to
 * remove. `0.5` is also the magic number agent registration once wrote into
 * `monicaConstant`.
 *
 * They were also unreachable: the sole caller passes `getCurrentAlchemicalState()`,
 * whose type declares all six fields as required numbers, and a live call
 * returns real values for every one. So the guards defended nothing and the
 * literals could only mislead.
 *
 * ── Where absence really comes from ─────────────────────────────────────────
 *
 * The backend path. `AlchmAPIClient.request` ends in
 * `response.json() as Promise<TResponse>` — a bare assertion over an
 * unvalidated body. That is what `validateRateResponse` now covers.
 */
import { calculateKalchm } from "@/data/unified/alchemicalCalculations";

const mockCalculateTokenRates = jest.fn();

jest.mock("@/lib/api/alchm-client", () => ({
  alchmAPI: {
    calculateTokenRates: (...args: unknown[]) =>
      mockCalculateTokenRates(...args),
  },
}));

jest.mock("@/lib/logger", () => ({
  _logger: { debug: jest.fn(), warn: jest.fn(), info: jest.fn(), error: jest.fn() },
}));

/** A complete, plausible backend body. */
const COMPLETE = {
  Spirit: 2,
  Essence: 1,
  Matter: 1,
  Substance: 1,
  kalchm: 4,
  monica: 1.618,
};

async function clientWithBackend() {
  process.env.NEXT_PUBLIC_BACKEND_URL = "https://backend.invalid";
  process.env.NEXT_PUBLIC_TOKENS_BACKEND = "true";
  jest.resetModules();
  const { TokensClient } = await import("@/services/TokensClient");
  return new TokensClient();
}

describe("TokensClient — no fabricated quantities", () => {
  beforeEach(() => {
    mockCalculateTokenRates.mockReset();
  });

  it("CONTROL: a complete backend body is returned as-is", async () => {
    // Without this, every assertion below could pass because the backend path
    // never runs at all and everything silently falls through to local.
    mockCalculateTokenRates.mockResolvedValue({ ...COMPLETE });
    const result = await (await clientWithBackend()).calculateRates();
    expect(mockCalculateTokenRates).toHaveBeenCalledTimes(1);
    expect(result).toMatchObject(COMPLETE);
  });

  it("recomputes an absent kalchm from the axes instead of defaulting to 1.0", async () => {
    // kalchm is RECOVERABLE — it is a function of the four ESMS axes alone. So
    // deriving it is not inventing it, and 1.0 would have been wrong: for
    // (2,1,1,1) the true value is 4.
    const { kalchm: _drop, ...noKalchm } = COMPLETE;
    mockCalculateTokenRates.mockResolvedValue(noKalchm);
    const result = await (await clientWithBackend()).calculateRates();

    const expected = calculateKalchm({
      Spirit: 2,
      Essence: 1,
      Matter: 1,
      Substance: 1,
    });
    expect(expected).toBe(4); // pin the value, not just the agreement
    expect(result.kalchm).toBe(expected);
    expect(result.kalchm).not.toBe(1.0);
  });

  it("maps an absent monica to null, never to a literal", async () => {
    // The backend returns monica: null BY DESIGN when it has no elemental
    // input. Re-inventing it here would undo exactly the honesty the server
    // just exercised — and 1.0 is not even the degenerate value (that is φ).
    const { monica: _drop, ...noMonica } = COMPLETE;
    mockCalculateTokenRates.mockResolvedValue(noMonica);
    expect((await (await clientWithBackend()).calculateRates()).monica).toBeNull();

    mockCalculateTokenRates.mockResolvedValue({ ...COMPLETE, monica: null });
    expect((await (await clientWithBackend()).calculateRates()).monica).toBeNull();
  });

  it("preserves a legitimate ZERO axis rather than treating it as absent", async () => {
    // 0 is falsy and is a REAL value here — 284 single-body agents have monica
    // exactly 0, an algebraically proven cluster. A truthiness test would
    // replace this with 0.5.
    mockCalculateTokenRates.mockResolvedValue({ ...COMPLETE, Essence: 0 });
    const result = await (await clientWithBackend()).calculateRates();
    expect(result.Essence).toBe(0);
  });

  it.each([
    ["a missing axis", { ...COMPLETE, Matter: undefined }],
    ["a non-numeric axis", { ...COMPLETE, Spirit: "2" }],
    ["a NaN axis", { ...COMPLETE, Substance: Number.NaN }],
    ["an empty body", {}],
    ["null", null],
  ])(
    "falls back to the local engine on %s, rather than fabricating",
    async (_label, body) => {
      mockCalculateTokenRates.mockResolvedValue(body);
      const result = await (await clientWithBackend()).calculateRates();

      // The local engine produced this, so it is complete and real.
      for (const axis of ["Spirit", "Essence", "Matter", "Substance"] as const) {
        expect(typeof result[axis]).toBe("number");
        expect(Number.isFinite(result[axis])).toBe(true);
        // The old code's fabricated value. Any axis landing exactly here would
        // be indistinguishable from a measurement.
        expect(result[axis]).not.toBe(0.5);
      }
      expect(result.kalchm).not.toBe(1.0);
    },
  );

  it("the local path carries the engine's own values through untouched", async () => {
    process.env.NEXT_PUBLIC_TOKENS_BACKEND = "false";
    jest.resetModules();
    const [{ TokensClient }, { getCurrentAlchemicalState }] = await Promise.all([
      import("@/services/TokensClient"),
      import("@/services/RealAlchemizeService"),
    ]);
    const engine = getCurrentAlchemicalState();
    const result = await new TokensClient().calculateRates();

    expect(result.Spirit).toBe(engine.esms.Spirit);
    expect(result.Essence).toBe(engine.esms.Essence);
    expect(result.Matter).toBe(engine.esms.Matter);
    expect(result.Substance).toBe(engine.esms.Substance);
    expect(result.kalchm).toBe(engine.kalchm);
    expect(mockCalculateTokenRates).not.toHaveBeenCalled();
  });
});
