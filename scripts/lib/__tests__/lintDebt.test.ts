import path from "node:path";

import {
  compareCasts,
  compareDeclinedDebt,
  compareLintDebt,
  countTypeCasts,
  findPerRuleRegressions,
} from "../lintDebt";

describe("compareLintDebt", () => {
  it("allows the tracked total to stay equal to its baseline", () => {
    expect(compareLintDebt(22_614, 22_614)).toEqual({
      exceedsBaseline: false,
      increasedBy: 0,
    });
  });

  it("allows the tracked total to fall freely", () => {
    expect(compareLintDebt(22_000, 22_614)).toEqual({
      exceedsBaseline: false,
      increasedBy: 0,
    });
  });

  it("reports the exact increase when the tracked total grows", () => {
    expect(compareLintDebt(22_615, 22_614)).toEqual({
      exceedsBaseline: true,
      increasedBy: 1,
    });
  });
});

describe("compareCasts", () => {
  it("allows cast count to stay equal or decrease", () => {
    expect(
      compareCasts(
        { total: 868, asAny: 187, asUnknownAs: 681 },
        { total: 868, asAny: 187, asUnknownAs: 681 },
      ),
    ).toEqual({
      exceedsBaseline: false,
      totalIncreasedBy: 0,
      asAnyIncreasedBy: 0,
      asUnknownAsIncreasedBy: 0,
    });

    expect(
      compareCasts(
        { total: 850, asAny: 180, asUnknownAs: 670 },
        { total: 868, asAny: 187, asUnknownAs: 681 },
      ),
    ).toEqual({
      exceedsBaseline: false,
      totalIncreasedBy: 0,
      asAnyIncreasedBy: 0,
      asUnknownAsIncreasedBy: 0,
    });
  });

  it("fails when cast total increases", () => {
    expect(
      compareCasts(
        { total: 870, asAny: 188, asUnknownAs: 682 },
        { total: 868, asAny: 187, asUnknownAs: 681 },
      ),
    ).toEqual({
      exceedsBaseline: true,
      totalIncreasedBy: 2,
      asAnyIncreasedBy: 1,
      asUnknownAsIncreasedBy: 1,
    });
  });

  it("fails when asAny increases even if total cast count stays constant", () => {
    // 63 casts shifted from `as unknown as` to `as any`: total is still 868
    expect(
      compareCasts(
        { total: 868, asAny: 250, asUnknownAs: 618 },
        { total: 868, asAny: 187, asUnknownAs: 681 },
      ),
    ).toEqual({
      exceedsBaseline: true,
      totalIncreasedBy: 0,
      asAnyIncreasedBy: 63,
      asUnknownAsIncreasedBy: 0,
    });
  });
});

describe("compareDeclinedDebt", () => {
  it("allows declined total to stay equal or decrease", () => {
    expect(compareDeclinedDebt(6327, 6327)).toEqual({
      exceedsBaseline: false,
      increasedBy: 0,
    });
    expect(compareDeclinedDebt(6300, 6327)).toEqual({
      exceedsBaseline: false,
      increasedBy: 0,
    });
  });

  it("fails when declined total increases", () => {
    expect(compareDeclinedDebt(6330, 6327)).toEqual({
      exceedsBaseline: true,
      increasedBy: 3,
    });
  });
});

describe("findPerRuleRegressions", () => {
  const baselineRules = {
    "no-explicit-any": { count: 275, autoFixable: 0 },
    "no-unnecessary-condition": { count: 1775, autoFixable: 0 },
    "max-lines": { count: 659, autoFixable: 0 },
  };
  const declinedRules = new Set(["max-lines"]);

  it("returns empty array when no tracked rules regressed", () => {
    const currentCounts = {
      "no-explicit-any": 270,
      "no-unnecessary-condition": 1775,
      "max-lines": 700, // declined, should be ignored
    };
    expect(
      findPerRuleRegressions(currentCounts, baselineRules, declinedRules),
    ).toEqual([]);
  });

  it("detects and sorts regressions on tracked rules", () => {
    const currentCounts = {
      "no-explicit-any": 280, // +5
      "no-unnecessary-condition": 1785, // +10
      "max-lines": 700,
    };
    expect(
      findPerRuleRegressions(currentCounts, baselineRules, declinedRules),
    ).toEqual([
      {
        rule: "no-unnecessary-condition",
        baselineCount: 1775,
        currentCount: 1785,
        delta: 10,
      },
      {
        rule: "no-explicit-any",
        baselineCount: 275,
        currentCount: 280,
        delta: 5,
      },
    ]);
  });
});

describe("countTypeCasts", () => {
  it("scans target directory and returns valid cast counts", () => {
    const repoRoot = path.resolve(__dirname, "../../../");
    const srcDir = path.join(repoRoot, "src");
    const counts = countTypeCasts(srcDir);
    expect(typeof counts.total).toBe("number");
    expect(typeof counts.asAny).toBe("number");
    expect(typeof counts.asUnknownAs).toBe("number");
    expect(counts.total).toBe(counts.asAny + counts.asUnknownAs);
    expect(counts.total).toBeGreaterThan(0);
  });
});
