import path from "node:path";

import {
  compareAssertionSites,
  compareCasts,
  compareDeclinedDebt,
  compareLintDebt,
  countAssertionSitesInSource,
  countTypeCasts,
  findPerRuleRegressions,
  scanAssertionSites,
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
      productionIncreasedBy: 0,
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
      productionIncreasedBy: 0,
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
      productionIncreasedBy: 0,
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
      productionIncreasedBy: 0,
    });
  });

  it("fails when production casts increase even if total cast count stays constant", () => {
    expect(
      compareCasts(
        { total: 868, asAny: 187, asUnknownAs: 681, production: 430 },
        { total: 868, asAny: 187, asUnknownAs: 681, production: 421 },
      ),
    ).toEqual({
      exceedsBaseline: true,
      totalIncreasedBy: 0,
      asAnyIncreasedBy: 0,
      asUnknownAsIncreasedBy: 0,
      productionIncreasedBy: 9,
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

describe("countAssertionSitesInSource", () => {
  const count = (code: string, file = "sample.ts") =>
    countAssertionSitesInSource(code, file);

  it("counts a chain as ONE site, so Rule 8 relabelling cannot move the axis", () => {
    // This is the entire reason the axis exists. `as unknown as Foo` -> `as Foo`
    // overrides the type system in exactly as many places before and after.
    const chained = count("const a = x as unknown as Foo;");
    const relabelled = count("const a = x as Foo;");

    expect(chained.total).toBe(1);
    expect(relabelled.total).toBe(1);
    expect(chained.total).toBe(relabelled.total);

    // ...even though the legacy regex axis drops by one on exactly that edit.
    const legacyBefore = "const a = x as unknown as Foo;".match(
      /\bas\s+unknown\s+as\b/g,
    );
    const legacyAfter = "const a = x as Foo;".match(/\bas\s+unknown\s+as\b/g);
    expect(legacyBefore?.length ?? 0).toBe(1);
    expect(legacyAfter?.length ?? 0).toBe(0);
  });

  it("falls to zero only when the assertion is genuinely removed", () => {
    expect(count("const a = x as Foo;").total).toBe(1);
    expect(count("const a = x;").total).toBe(0);
  });

  it("classifies each assertion shape exactly once", () => {
    const result = count(
      [
        "const a = x as any;",
        "const b = y as unknown as Foo;",
        "const c = z as Bar;",
      ].join("\n"),
    );
    expect(result).toMatchObject({ total: 3, asAny: 1, chained: 1, single: 1 });
    expect(result.total).toBe(result.asAny + result.chained + result.single);
  });

  it("counts assertions the legacy regex is structurally blind to", () => {
    // Each of these is a real type assertion whose target type does not begin
    // with an uppercase identifier, so `\bas\s+(?!unknown|any)[A-Z]\w*` misses it.
    expect(count("const a = k.toLowerCase() as keyof typeof M;").total).toBe(1);
    expect(count("const a = j as { success: boolean } & Data;").total).toBe(1);
    expect(count("const a = s as string[];").total).toBe(1);
    expect(count("const a = n as number;").total).toBe(1);
    expect(count("const a = sign as unknown;").total).toBe(1);
  });

  it("does not count `as const`, which narrows rather than overrides", () => {
    const result = count('const a = ["1h", "24h"] as const;');
    expect(result.total).toBe(0);
    expect(result.asConst).toBe(1);
  });

  it("does not count import/export aliases or `as` inside string literals", () => {
    expect(count('import * as React from "react";').total).toBe(0);
    expect(count('export { default as WeeklyCalendar } from "./W";').total).toBe(0);
    expect(count('import { foo as Bar } from "./m";').total).toBe(0);
    // Code generation that emits the text `as any` is not itself an assertion.
    expect(count("lines.push(`  sign: '${s}' as any,`);").total).toBe(0);
  });

  it("classifies `as any[]` as an array assertion, not a bare `any`", () => {
    const result = count("const a = rows.filter(Boolean) as any[];");
    expect(result.total).toBe(1);
    expect(result.asAny).toBe(0);
    expect(result.single).toBe(1);
  });

  it("counts nested assertions in the operand of an outer assertion", () => {
    const result = count("const a = foo(y as Bar) as unknown as Baz;");
    expect(result.total).toBe(2);
    expect(result.chained).toBe(1);
    expect(result.single).toBe(1);
  });

  it("parses TSX generics without treating them as assertions", () => {
    const result = count("const a = <div id={x as Foo} />;", "sample.tsx");
    expect(result.total).toBe(1);
  });

  it("reports non-null assertions separately from the site total", () => {
    const result = count("const a = maybe!.value;");
    expect(result.total).toBe(0);
    expect(result.nonNull).toBe(1);
  });
});

describe("compareAssertionSites", () => {
  const base = {
    total: 4638,
    asAny: 103,
    chained: 294,
    single: 4241,
    production: 3600,
    test: 1038,
  };

  it("allows the total to hold steady or fall", () => {
    expect(compareAssertionSites(base, base)).toEqual({
      exceedsBaseline: false,
      totalIncreasedBy: 0,
      asAnyIncreasedBy: 0,
      productionIncreasedBy: 0,
    });
    expect(
      compareAssertionSites({ ...base, total: 4600, single: 4203, production: 3570 }, base),
    ).toEqual({
      exceedsBaseline: false,
      totalIncreasedBy: 0,
      asAnyIncreasedBy: 0,
      productionIncreasedBy: 0,
    });
  });

  it("fails when the site total grows", () => {
    expect(compareAssertionSites({ ...base, total: 4640, single: 4243 }, base)).toEqual({
      exceedsBaseline: true,
      totalIncreasedBy: 2,
      asAnyIncreasedBy: 0,
      productionIncreasedBy: 0,
    });
  });

  it("does NOT reward a pure relabel: chained down, single up, total flat", () => {
    // 50 `as unknown as T` rewritten to `as T`. The legacy axis would call this
    // a 50-cast win; the site total is unchanged, so this axis calls it nothing.
    const relabelled = { ...base, chained: 244, single: 4291 };
    expect(relabelled.total).toBe(base.total);
    expect(compareAssertionSites(relabelled, base)).toEqual({
      exceedsBaseline: false,
      totalIncreasedBy: 0,
      asAnyIncreasedBy: 0,
      productionIncreasedBy: 0,
    });
  });

  it("fails when asAny or production grows even with the total flat", () => {
    expect(
      compareAssertionSites({ ...base, asAny: 120, single: 4224 }, base),
    ).toMatchObject({ exceedsBaseline: true, asAnyIncreasedBy: 17 });
    expect(
      compareAssertionSites({ ...base, production: 3650, test: 988 }, base),
    ).toMatchObject({ exceedsBaseline: true, productionIncreasedBy: 50 });
  });
});

describe("scanAssertionSites", () => {
  it("agrees with the regex scanner on the one axis both measure exactly", () => {
    const repoRoot = path.resolve(__dirname, "../../../");
    const srcDir = path.join(repoRoot, "src");
    const sites = scanAssertionSites(srcDir, repoRoot);
    const casts = countTypeCasts(srcDir);

    // `as unknown as` is the only shape the regex matches without false
    // positives or blind spots, so it is a real cross-instrument control.
    expect(sites.summary.chained).toBe(casts.asUnknownAs);

    // The AST sees strictly more real assertions than the uppercase-only regex.
    expect(sites.summary.single).toBeGreaterThan(casts.untrackedSingleAsT ?? 0);
    expect(sites.summary.total).toBe(
      sites.summary.asAny + sites.summary.chained + sites.summary.single,
    );
    expect(sites.summary.total).toBe(
      sites.summary.production + sites.summary.test,
    );
  });
});
