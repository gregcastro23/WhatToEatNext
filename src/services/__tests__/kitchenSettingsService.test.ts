/**
 * Unit tests for kitchenSettingsService.
 *
 * ⚠️ SCOPE: these mock the `pg` driver, so they exercise the ARGUMENT MAPPING
 * and the row mapper — not the SQL. A mocked driver cannot tell you whether
 * Postgres can parse the statement or whether the columns exist; only a real
 * `PREPARE` against the live schema can, and that is a separate check.
 *
 * @file src/services/__tests__/kitchenSettingsService.test.ts
 */

import { executeQuery } from "@/lib/database/connection";
import { getKitchenSettings, persistKitchenSettings } from "@/services/kitchenSettingsService";

jest.mock("@/lib/database/connection", () => ({
  executeQuery: jest.fn(),
}));

const mockExecuteQuery = executeQuery as jest.Mock;

/** A row shaped the way node-postgres actually returns it — NUMERIC as string. */
function dbRow(overrides: Record<string, unknown> = {}) {
  return {
    user_id: "00000000-0000-0000-0000-000000000001",
    kitchen_elevation_m: "1609.00",
    kitchen_elevation_basis: "MEASURED",
    kitchen_settings: { stationPressureKpa: 83.4 },
    updated_at: new Date("2026-08-16T12:00:00Z").toISOString(),
    ...overrides,
  };
}

describe("kitchenSettingsService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("persistKitchenSettings", () => {
    it("writes in a SINGLE statement, not an update-then-insert pair", () => {
      // The previous implementation issued an UPDATE, checked for zero rows,
      // then a separate INSERT ... ON CONFLICT. That was racy (another request
      // could insert in between) AND the two paths disagreed on null handling.
      mockExecuteQuery.mockResolvedValueOnce({ rows: [dbRow()] });

      return persistKitchenSettings({
        userId: "00000000-0000-0000-0000-000000000001",
        kitchenElevationM: 1609,
        kitchenElevationBasis: "gps",
      }).then(() => {
        expect(mockExecuteQuery).toHaveBeenCalledTimes(1);
        const [sql] = mockExecuteQuery.mock.calls[0] as [string, unknown[]];
        expect(sql).toMatch(/INSERT INTO user_profiles/);
        expect(sql).toMatch(/ON CONFLICT \(user_id\) DO UPDATE/);
      });
    });

    it("null means 'leave it alone' on the conflict path too", async () => {
      // The specific defect: the conflict clause used to assign bare
      // `EXCLUDED.*`, so a null ERASED a stored elevation whenever the profile
      // row already existed — while the same null PRESERVED it when the row did
      // not. Same input, opposite outcome, decided by invisible state.
      mockExecuteQuery.mockResolvedValueOnce({ rows: [dbRow()] });
      await persistKitchenSettings({ userId: "u", kitchenSettings: { a: 1 } });

      const [sql, params] = mockExecuteQuery.mock.calls[0] as [string, unknown[]];
      expect(sql).toMatch(
        /kitchen_elevation_m\s*=\s*COALESCE\(EXCLUDED\.kitchen_elevation_m, user_profiles\.kitchen_elevation_m\)/,
      );
      expect(sql).toMatch(
        /kitchen_elevation_basis\s*=\s*COALESCE\(EXCLUDED\.kitchen_elevation_basis, user_profiles\.kitchen_elevation_basis\)/,
      );
      // ...and an omitted elevation really is sent as null, not 0.
      expect(params[1]).toBeNull();
    });

    it("accepts the Postgres vocabulary without downgrading it", async () => {
      // `[MEASURED]` The regression this exists for: the service used to route
      // every basis through `provenanceToElevationBasis`, which only knows the
      // Spacetime spellings and falls through to 'COMPUTED'. So a caller
      // passing 'MEASURED' — which is what /api/environment/lookup returns —
      // had it silently rewritten to 'COMPUTED', turning a real measurement
      // into a guess in the one column that decides how much the UI may claim.
      for (const [input, expected] of [
        ["MEASURED", "MEASURED"],
        ["DERIVED", "DERIVED"],
        ["COMPUTED", "COMPUTED"],
        ["ABSENT", "ABSENT"],
      ]) {
        mockExecuteQuery.mockResolvedValueOnce({ rows: [dbRow()] });
        await persistKitchenSettings({ userId: "u", kitchenElevationBasis: input });
        const [, params] = mockExecuteQuery.mock.calls.at(-1) as [string, unknown[]];
        expect(params[2]).toBe(expected);
      }
    });

    it("still maps the Spacetime vocabulary", async () => {
      for (const [input, expected] of [
        ["gps", "MEASURED"],
        ["user", "MEASURED"],
        ["dem", "DERIVED"],
        ["ip", "COMPUTED"],
      ]) {
        mockExecuteQuery.mockResolvedValueOnce({ rows: [dbRow()] });
        await persistKitchenSettings({ userId: "u", kitchenElevationBasis: input });
        const [, params] = mockExecuteQuery.mock.calls.at(-1) as [string, unknown[]];
        expect(params[2]).toBe(expected);
      }
    });

    it("writes no basis at all rather than guessing at an unknown one", async () => {
      mockExecuteQuery.mockResolvedValueOnce({ rows: [dbRow()] });
      await persistKitchenSettings({ userId: "u", kitchenElevationBasis: "carrier-pigeon" });
      const [, params] = mockExecuteQuery.mock.calls[0] as [string, unknown[]];
      expect(params[2]).toBeNull();
    });

    it("returns null when the write returns no row", async () => {
      mockExecuteQuery.mockResolvedValueOnce({ rows: [] });
      await expect(persistKitchenSettings({ userId: "u" })).resolves.toBeNull();
    });
  });

  describe("getKitchenSettings", () => {
    it("returns null when no profile exists", async () => {
      mockExecuteQuery.mockResolvedValueOnce({ rows: [] });
      await expect(getKitchenSettings("nobody")).resolves.toBeNull();
    });

    it("converts the NUMERIC string Postgres actually returns", async () => {
      // node-postgres hands NUMERIC back as a STRING to avoid float precision
      // loss. Returning it unconverted would put "1609.00" where callers expect
      // a number, and `"1609.00" - 0` style coercion downstream would hide it.
      mockExecuteQuery.mockResolvedValueOnce({
        rows: [dbRow({ kitchen_elevation_m: "500.00" })],
      });
      const result = await getKitchenSettings("u");
      expect(result?.kitchenElevationM).toBe(500);
      expect(typeof result?.kitchenElevationM).toBe("number");
    });

    it("keeps a null elevation null rather than coercing it to zero", async () => {
      // `Number(null)` is 0, and 0 m is sea level — a real, wrong claim.
      mockExecuteQuery.mockResolvedValueOnce({
        rows: [dbRow({ kitchen_elevation_m: null, kitchen_elevation_basis: null })],
      });
      const result = await getKitchenSettings("u");
      expect(result?.kitchenElevationM).toBeNull();
      expect(result?.kitchenElevationBasis).toBeNull();
    });

    it("defaults absent settings to an empty object", async () => {
      mockExecuteQuery.mockResolvedValueOnce({ rows: [dbRow({ kitchen_settings: null })] });
      const result = await getKitchenSettings("u");
      expect(result?.kitchenSettings).toEqual({});
    });
  });
});
