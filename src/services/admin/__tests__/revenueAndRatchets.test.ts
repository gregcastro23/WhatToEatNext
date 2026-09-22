/**
 * Pure pieces of the revenue and code-health reads.
 *
 * @file src/services/admin/__tests__/revenueAndRatchets.test.ts
 */

import { readFileSync } from "node:fs";
import path from "node:path";
import { z } from "zod";
import { bundledRatchets, summarizeLintDebt } from "@/services/admin/codeHealthRatchets";
import { monthlyAmount } from "@/services/admin/stripeRevenueReaders";
import { stripeModeFromKey } from "@/services/admin/stripeRevenueService";

describe("monthlyAmount", () => {
  it.each([
    [2400, 1, "month", 1, 2400],
    [24000, 1, "year", 1, 2000],
    [1000, 2, "month", 3, 666.6666666666666],
    [100, 1, "week", 1, (100 * 52) / 12],
  ])("%i×%i per %s/%i → %f / month", (unit, qty, interval, count, expected) => {
    expect(monthlyAmount(unit, qty, interval, count)).toBeCloseTo(expected, 6);
  });

  it("contributes nothing for an interval it does not understand", () => {
    expect(monthlyAmount(500, 1, "fortnight", 1)).toBe(0);
  });
});

describe("stripeModeFromKey", () => {
  it("reads only the mode prefix", () => {
    expect(stripeModeFromKey("sk_live_abc")).toBe("live");
    expect(stripeModeFromKey("rk_test_abc")).toBe("test");
    expect(stripeModeFromKey("whsec_abc")).toBe("unknown");
    expect(stripeModeFromKey(undefined)).toBe("unknown");
  });
});

describe("bundledRatchets", () => {
  it("reports the committed .lint-debt-baseline.json exactly (control against the file itself)", () => {
    const repoRoot = path.resolve(__dirname, "../../../..");
    const raw = z
      .object({
        trackedTotal: z.number(),
        casts: z.object({ total: z.number(), asAny: z.number() }),
        declined: z.object({ total: z.number() }),
      })
      .parse(JSON.parse(readFileSync(path.join(repoRoot, ".lint-debt-baseline.json"), "utf8")));
    const ratchets = bundledRatchets();
    expect(ratchets.lintDebt?.trackedTotal).toBe(raw.trackedTotal);
    expect(ratchets.lintDebt?.castsTotal).toBe(raw.casts.total);
    expect(ratchets.lintDebt?.asAny).toBe(raw.casts.asAny);
    expect(ratchets.lintDebt?.declinedPool).toBe(raw.declined.total);
  });
});

describe("summarizeLintDebt", () => {
  it("returns null — not 0 — for sections an older baseline did not have", () => {
    const old = summarizeLintDebt({ rules: { "no-console": { count: 3 } } });
    expect(old.trackedTotal).toBeNull();
    expect(old.castsTotal).toBeNull();
    expect(old.declinedPool).toBeNull();
    expect(old.topRules).toEqual([{ rule: "no-console", count: 3 }]);
  });
});
