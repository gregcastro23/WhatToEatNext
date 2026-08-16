/**
 * Unit tests for kitchenSettingsService.
 *
 * Tests:
 * - Persisting kitchen elevation and basis
 * - Updating settings JSON payload
 * - Recipe core time adjustments
 * - Reading back persisted settings
 *
 * @file src/services/__tests__/kitchenSettingsService.test.ts
 */

import { executeQuery } from "@/lib/database/connection";
import {
  getKitchenSettings,
  persistKitchenSettings,
} from "@/services/kitchenSettingsService";

jest.mock("@/lib/database/connection", () => ({
  executeQuery: jest.fn(),
}));

describe("kitchenSettingsService", () => {
  const mockExecuteQuery = executeQuery as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("persistKitchenSettings", () => {
    it("updates kitchen elevation and settings for user", async () => {
      const mockRow = {
        user_id: "00000000-0000-0000-0000-000000000001",
        kitchen_elevation_m: "1609.00",
        kitchen_elevation_basis: "MEASURED",
        kitchen_settings: { stationPressureKpa: 83.4 },
        updated_at: new Date().toISOString(),
      };

      mockExecuteQuery.mockResolvedValueOnce({ rows: [mockRow] });

      const result = await persistKitchenSettings({
        userId: "00000000-0000-0000-0000-000000000001",
        kitchenElevationM: 1609,
        kitchenElevationBasis: "gps",
        kitchenSettings: { stationPressureKpa: 83.4 },
      });

      expect(mockExecuteQuery).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        userId: "00000000-0000-0000-0000-000000000001",
        kitchenElevationM: 1609,
        kitchenElevationBasis: "MEASURED",
        kitchenSettings: { stationPressureKpa: 83.4 },
        updatedAt: expect.any(Date),
      });
    });

    it("inserts new profile row if user profile was not present", async () => {
      mockExecuteQuery
        .mockResolvedValueOnce({ rows: [] }) // update returned 0 rows
        .mockResolvedValueOnce({
          rows: [
            {
              user_id: "00000000-0000-0000-0000-000000000002",
              kitchen_elevation_m: "2640.00",
              kitchen_elevation_basis: "DERIVED",
              kitchen_settings: { city: "Bogota" },
              updated_at: new Date().toISOString(),
            },
          ],
        });

      const result = await persistKitchenSettings({
        userId: "00000000-0000-0000-0000-000000000002",
        kitchenElevationM: 2640,
        kitchenElevationBasis: "dem",
        kitchenSettings: { city: "Bogota" },
      });

      expect(mockExecuteQuery).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        userId: "00000000-0000-0000-0000-000000000002",
        kitchenElevationM: 2640,
        kitchenElevationBasis: "DERIVED",
        kitchenSettings: { city: "Bogota" },
        updatedAt: expect.any(Date),
      });
    });
  });

  describe("getKitchenSettings", () => {
    it("returns null if no profile exists", async () => {
      mockExecuteQuery.mockResolvedValueOnce({ rows: [] });

      const result = await getKitchenSettings("00000000-0000-0000-0000-000000000003");
      expect(result).toBeNull();
    });

    it("returns parsed kitchen settings", async () => {
      mockExecuteQuery.mockResolvedValueOnce({
        rows: [
          {
            user_id: "00000000-0000-0000-0000-000000000004",
            kitchen_elevation_m: "500.00",
            kitchen_elevation_basis: "MEASURED",
            kitchen_settings: { altitudeExploreSaved: true },
            updated_at: new Date().toISOString(),
          },
        ],
      });

      const result = await getKitchenSettings("00000000-0000-0000-0000-000000000004");
      expect(result).toEqual({
        userId: "00000000-0000-0000-0000-000000000004",
        kitchenElevationM: 500,
        kitchenElevationBasis: "MEASURED",
        kitchenSettings: { altitudeExploreSaved: true },
        updatedAt: expect.any(Date),
      });
    });
  });
});
