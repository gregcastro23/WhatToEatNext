/**
 * @jest-environment node
 *
 * Guards the Cost Burndown panel against re-fabrication. There is no billing
 * integration, so the panel must report the honest "no source" state (empty
 * items, live=false) — which the UI renders as "connect Vercel + Railway
 * billing APIs to populate" — rather than hardcoded/derived dollar figures
 * flagged "● LIVE".
 */

jest.mock("@/lib/database", () => ({ executeQuery: jest.fn() }));

import { getCostBurndown } from "@/services/dashboardPanelsService";

describe("getCostBurndown", () => {
  it("returns the honest no-billing-source state (no fabricated figures)", async () => {
    const result = await getCostBurndown();
    expect(result.live).toBe(false);
    expect(result.items).toEqual([]);
    expect(result.totalMtd).toBe(0);
    expect(result.projectedTotal).toBe(0);
  });
});
