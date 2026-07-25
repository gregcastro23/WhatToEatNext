/**
 * `jsonbOrNull` is what stops a JSONB column claiming to hold something it doesn't.
 *
 * Background, measured in production: `user_profiles.natal_chart` is NON-NULL but
 * EMPTY in 4940 of 5015 rows, and `birth_data` in 1421 of 1425. The cause was the
 * idiom `JSON.stringify(x || {})`, which writes the literal `'{}'` — a non-null
 * value — whenever there is nothing to store.
 *
 * ⚠️ NOTE ON SCOPE. Every reader was audited before this change and NONE is fooled:
 * they either guard on `.planets` (the API routes, UserContext, the synastry and
 * transit-overlay handlers) or come through the
 * `Object.keys(x).length > 0 ? x : undefined` normalisation in userDatabaseService.
 * The two `readJsonColumn(..., {})` defaults in commensalDatabaseService read
 * `manual_companion_charts`, a different table. So this is NOT a bug fix for a
 * user-visible defect, and the 4940 existing rows are deliberately left alone —
 * migrating them was rejected precisely because no reader impact could be shown.
 *
 * What it IS: making the stored value mean what it says, and closing one place
 * where the old idiom could genuinely destroy data — see the COALESCE test below.
 */
import { jsonbOrNull } from "@/services/userDatabaseService";

describe("jsonbOrNull", () => {
  it("returns SQL NULL for absent values", () => {
    expect(jsonbOrNull(null)).toBeNull();
    expect(jsonbOrNull(undefined)).toBeNull();
  });

  it("returns SQL NULL for an EMPTY object — the whole point", () => {
    // `JSON.stringify({} || {})` is `'{}'`, which is what produced 4940 rows that
    // say "a chart is present" while holding nothing.
    expect(jsonbOrNull({})).toBeNull();
  });

  it("returns SQL NULL for an empty array", () => {
    // natal_positions is an array column and has the same failure mode.
    expect(jsonbOrNull([])).toBeNull();
  });

  it("serialises anything with content", () => {
    expect(jsonbOrNull({ planets: [] })).toBe('{"planets":[]}');
    expect(jsonbOrNull([1, 2])).toBe("[1,2]");
    expect(jsonbOrNull({ a: 1 })).toBe('{"a":1}');
  });

  it("does not treat a legitimate falsy scalar as absent", () => {
    // A guard written as `x ? … : null` would drop all three of these. This is the
    // same class as the `? 3.5 : x` fallback that fabricated monica for 284 agents
    // whose real value was 0.
    expect(jsonbOrNull(0)).toBe("0");
    expect(jsonbOrNull(false)).toBe("false");
    expect(jsonbOrNull("")).toBe('""');
  });

  it("an object with only nested-empty content still counts as present", () => {
    // Emptiness is judged at the TOP level only. `{ planets: [] }` is a caller
    // saying "here is a chart with no planets", which is a different statement
    // from "I have no chart" — and only the reader can decide what to do with it.
    expect(jsonbOrNull({ planets: [], birthData: {} })).not.toBeNull();
  });
});

describe("why the empty object was dangerous, not merely untidy", () => {
  /**
   * agent-sync upserts with
   *   `natal_chart = COALESCE(EXCLUDED.natal_chart, user_profiles.natal_chart)`
   * so the incoming value only wins when it is NON-NULL. That is the intended
   * "leave the stored value alone if I have nothing" semantics.
   *
   * The old guard was `natalChart ? JSON.stringify(natalChart) : null`. An empty
   * object is TRUTHY, so a caller with no chart sent `'{}'` — non-null — which wins
   * the COALESCE and REPLACES a real stored chart with an empty one. This is a
   * write path fed by two sibling repos, so the caller is not under this repo's
   * control.
   */
  const coalesce = (incoming: string | null, stored: string) => incoming ?? stored;
  const REAL_STORED = '{"planets":[{"name":"Sun"}]}';

  it("the OLD truthiness guard destroys a real chart when the caller sends {}", () => {
    const oldGuard = (v: unknown) => (v ? JSON.stringify(v) : null);
    expect(coalesce(oldGuard({}), REAL_STORED)).toBe("{}"); // the stored chart is gone
  });

  it("jsonbOrNull preserves it", () => {
    expect(coalesce(jsonbOrNull({}), REAL_STORED)).toBe(REAL_STORED);
  });

  it("both agree when the caller genuinely has a chart", () => {
    const incoming = { planets: [{ name: "Moon" }] };
    expect(coalesce(jsonbOrNull(incoming), REAL_STORED)).toBe(JSON.stringify(incoming));
  });

  it("both agree when the caller sends nothing at all", () => {
    const oldGuard = (v: unknown) => (v ? JSON.stringify(v) : null);
    expect(coalesce(oldGuard(undefined), REAL_STORED)).toBe(REAL_STORED);
    expect(coalesce(jsonbOrNull(undefined), REAL_STORED)).toBe(REAL_STORED);
  });
});

describe("readers behave identically on NULL and on '{}'", () => {
  // The reason this change is safe to ship without touching the 4940 rows: the
  // two reader idioms in the codebase both test `!value`, which is true for null
  // and for undefined, and both fall back to the same empty default.
  const parseJsonField = <T,>(value: unknown, fallback: T): T => {
    if (!value) return fallback;
    if (typeof value === "string") {
      try {
        return JSON.parse(value) as T;
      } catch {
        return fallback;
      }
    }
    return value as T;
  };

  it("NULL and {} both reach the reader as an empty object", () => {
    expect(parseJsonField(null, {})).toEqual({});
    expect(parseJsonField({}, {})).toEqual({});
  });

  it("the normalisation that protects every downstream guard", () => {
    // userDatabaseService turns both into `undefined` before the profile leaves
    // the service, which is why `if (!natalChart)` in MenuPlannerProvider and
    // `!profile?.profile?.natalChart` in the chart pages are not fooled today.
    const normalise = (x: unknown) =>
      Object.keys((x as object) || {}).length > 0 ? x : undefined;
    expect(normalise(null)).toBeUndefined();
    expect(normalise({})).toBeUndefined();
    expect(normalise({ planets: [1] })).toEqual({ planets: [1] });
  });
});
