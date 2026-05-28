/**
 * Tests for isCurrentSkyDiurnal — the New York "live sky" sect.
 *
 * Sect drives the entire day/night ESMS split, so the boundary must follow the
 * Sun as seen from New York, not raw UTC hours. These assertions sit well clear
 * of the sunrise/sunset twilight window so they stay stable.
 *
 * Late May 2026: NYC is on EDT (UTC-4); sunrise ~05:30, sunset ~20:15 local.
 */
import { isCurrentSkyDiurnal } from "@/utils/astrology/positions";

describe("isCurrentSkyDiurnal (New York sect)", () => {
  it("is day during New York daytime hours", () => {
    expect(isCurrentSkyDiurnal(new Date("2026-05-28T16:00:00Z"))).toBe(true); // 12:00 EDT
    expect(isCurrentSkyDiurnal(new Date("2026-05-28T21:00:00Z"))).toBe(true); // 17:00 EDT
  });

  it("is night during New York nighttime hours", () => {
    expect(isCurrentSkyDiurnal(new Date("2026-05-28T03:00:00Z"))).toBe(false); // 23:00 EDT
    expect(isCurrentSkyDiurnal(new Date("2026-05-28T06:00:00Z"))).toBe(false); // 02:00 EDT
  });

  it("corrects the hours the raw UTC-hour rule got backwards for New York", () => {
    // Old rule (day = UTC 06:00–18:00) mislabeled both of these:
    // 18:00Z = 14:00 EDT — clearly day, old rule said night.
    expect(isCurrentSkyDiurnal(new Date("2026-05-28T18:00:00Z"))).toBe(true);
    // 06:00Z = 02:00 EDT — clearly night, old rule said day.
    expect(isCurrentSkyDiurnal(new Date("2026-05-28T06:00:00Z"))).toBe(false);
  });
});
