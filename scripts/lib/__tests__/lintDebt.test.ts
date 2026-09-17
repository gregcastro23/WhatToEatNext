import path from "node:path";

import {
  ALLOWED_LOGGER_SINKS,
  compareAssertionSites,
  compareCasts,
  compareDeclinedDebt,
  compareLintDebt,
  compareLooseOptionality,
  compareSubBaseline,
  compareSuppressions,
  countAssertionSitesInSource,
  countLooseOptionalityInSource,
  countTypeCasts,
  findFileLevelDisablesInSource,
  findPerRuleRegressions,
  isDuplicateArtifactPath,
  lintDebtBaselineSchema,
  scanAssertionSites,
  scanFileLevelDisables,
  scanLooseOptionality,
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

describe("compareSubBaseline", () => {
  it("allows sub-baseline total to stay equal or decrease", () => {
    expect(compareSubBaseline(692, 692)).toEqual({
      exceedsBaseline: false,
      increasedBy: 0,
    });
    expect(compareSubBaseline(650, 692)).toEqual({
      exceedsBaseline: false,
      increasedBy: 0,
    });
  });

  it("fails when sub-baseline total increases", () => {
    expect(compareSubBaseline(693, 692)).toEqual({
      exceedsBaseline: true,
      increasedBy: 1,
    });
  });

  it("validates baseline schema with subBaselines", () => {
    const valid = {
      trackedTotal: 2970,
      casts: { total: 380, asAny: 106, asUnknownAs: 274, production: 300, test: 80 },
      assertionSites: {
        total: 1000,
        asAny: 10,
        chained: 50,
        single: 940,
        production: 800,
        test: 200,
        asConst: 50,
        nonNull: 20,
      },
      looseOptionality: {
        total: 462,
        production: 462,
        test: 0,
      },
      fileLevelDisables: {
        ceiling: 5,
      },
      suppressions: {
        "no-console": 5,
      },
      subBaselines: {
        preferNullishCoalescing: {
          total: 692,
          verifiedSafe: 95,
          semantic: 566,
          unclassified: 31,
        },
      },
      declined: { rules: {} },
      rules: {
        "@typescript-eslint/prefer-nullish-coalescing": { count: 692, autoFixable: 0 },
      },
    };
    expect(() => lintDebtBaselineSchema.parse(valid)).not.toThrow();
  });
});

describe("findPerRuleRegressions", () => {
  const baselineRules = {
    "no-explicit-any": { count: 275, autoFixable: 0 },
    "no-unnecessary-condition": { count: 1775, autoFixable: 0 },
    "max-lines": { count: 659, autoFixable: 0 },
    "prefer-nullish-coalescing": { count: 214, autoFixable: 0 },
  };
  const ignoredRules = new Set(["prefer-nullish-coalescing"]);

  it("returns empty array when no rules regressed", () => {
    const currentCounts = {
      "no-explicit-any": 270,
      "no-unnecessary-condition": 1775,
      "max-lines": 650,
      "prefer-nullish-coalescing": 220, // ignored, sub-baseline handled separately
    };
    expect(
      findPerRuleRegressions(currentCounts, baselineRules, ignoredRules),
    ).toEqual([]);
  });

  it("detects and sorts regressions on tracked and declined rules", () => {
    const currentCounts = {
      "no-explicit-any": 280, // +5
      "no-unnecessary-condition": 1785, // +10
      "max-lines": 665, // +6 (declined rule regressed)
      "prefer-nullish-coalescing": 220, // ignored
    };
    expect(
      findPerRuleRegressions(currentCounts, baselineRules, ignoredRules),
    ).toEqual([
      {
        rule: "no-unnecessary-condition",
        baselineCount: 1775,
        currentCount: 1785,
        delta: 10,
      },
      {
        rule: "max-lines",
        baselineCount: 659,
        currentCount: 665,
        delta: 6,
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
    asConst: 500,
    nonNull: 600,
  };

  it("allows the total to hold steady or fall", () => {
    expect(compareAssertionSites(base, base)).toEqual({
      exceedsBaseline: false,
      totalIncreasedBy: 0,
      asAnyIncreasedBy: 0,
      singleIncreasedBy: 0,
      productionIncreasedBy: 0,
      nonNullIncreasedBy: 0,
    });
    expect(
      compareAssertionSites({ ...base, total: 4600, single: 4203, production: 3570 }, base),
    ).toEqual({
      exceedsBaseline: false,
      totalIncreasedBy: 0,
      asAnyIncreasedBy: 0,
      singleIncreasedBy: 0,
      productionIncreasedBy: 0,
      nonNullIncreasedBy: 0,
    });
  });

  it("fails when the site total grows", () => {
    expect(compareAssertionSites({ ...base, total: 4640, single: 4243 }, base)).toEqual({
      exceedsBaseline: true,
      totalIncreasedBy: 2,
      asAnyIncreasedBy: 0,
      singleIncreasedBy: 2,
      productionIncreasedBy: 0,
      nonNullIncreasedBy: 0,
    });
  });

  it("blocks a pure relabel: chained down, single up, total flat (Rule 8)", () => {
    // 50 `as unknown as T` rewritten to `as T`. In Phase 34, single assertions
    // are strictly gated so relabelling cannot bypass the gate.
    const relabelled = { ...base, chained: 244, single: 4291 };
    expect(relabelled.total).toBe(base.total);
    expect(compareAssertionSites(relabelled, base)).toEqual({
      exceedsBaseline: true,
      totalIncreasedBy: 0,
      asAnyIncreasedBy: 0,
      singleIncreasedBy: 50,
      productionIncreasedBy: 0,
      nonNullIncreasedBy: 0,
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

  it("fails when nonNull grows beyond baseline", () => {
    const baseWithNonNull = { ...base, nonNull: 605 };
    expect(
      compareAssertionSites({ ...baseWithNonNull, nonNull: 606 }, baseWithNonNull),
    ).toMatchObject({ exceedsBaseline: true, nonNullIncreasedBy: 1 });
  });

  it("fails when single assertion sites grow beyond baseline (relabelling detection)", () => {
    expect(
      compareAssertionSites({ ...base, single: 4242, chained: 175 }, base),
    ).toMatchObject({ exceedsBaseline: true, singleIncreasedBy: 1 });
  });
});

describe("compareLooseOptionality", () => {
  const base = { total: 462, production: 462, test: 0 };

  it("allows loose optionality to stay equal or decrease", () => {
    expect(compareLooseOptionality(base, base)).toEqual({
      exceedsBaseline: false,
      totalIncreasedBy: 0,
      productionIncreasedBy: 0,
    });
    expect(compareLooseOptionality({ total: 450, production: 450, test: 0 }, base)).toEqual({
      exceedsBaseline: false,
      totalIncreasedBy: 0,
      productionIncreasedBy: 0,
    });
  });

  it("fails when loose optionality total increases", () => {
    expect(compareLooseOptionality({ total: 463, production: 463, test: 0 }, base)).toEqual({
      exceedsBaseline: true,
      totalIncreasedBy: 1,
      productionIncreasedBy: 1,
    });
  });

  it("fails when production loose optionality increases even if total is flat", () => {
    const baseWithTest = { total: 462, production: 450, test: 12 };
    expect(
      compareLooseOptionality({ total: 462, production: 455, test: 7 }, baseWithTest),
    ).toEqual({
      exceedsBaseline: true,
      totalIncreasedBy: 0,
      productionIncreasedBy: 5,
    });
  });
});

describe("countLooseOptionalityInSource", () => {
  it("detects single-line and multi-line loose optional properties", () => {
    const code = `
interface Example {
  singleLine?: string | undefined;
  multiLine?:
    | number
    | undefined;
  strictOptional?: string;
  requiredUnion: string | undefined;
  method?(arg?: boolean | undefined): void;
}
`;
    expect(countLooseOptionalityInSource(code, "example.ts")).toBe(3);
  });

  it("returns 0 for clean types without loose optionality", () => {
    const code = `
interface Clean {
  name: string;
  age?: number;
  data: string | null;
}
`;
    expect(countLooseOptionalityInSource(code, "clean.ts")).toBe(0);
  });
});

describe("scanFileLevelDisables", () => {
  it("flags unauthorized no-console file-level disables", () => {
    const repoRoot = path.resolve(__dirname, "../../../");
    const srcDir = path.join(repoRoot, "src");
    const scan = scanFileLevelDisables(srcDir, repoRoot);

    expect(scan.unauthorizedNoConsole).toEqual([]);
    expect(scan.total).toBeLessThanOrEqual(5);

    for (const finding of scan.findings) {
      if (finding.isNoConsole) {
        expect(ALLOWED_LOGGER_SINKS.has(finding.filePath)).toBe(true);
      }
    }
  });

  it("flags unauthorized no-console in arbitrary files (red proof)", () => {
    const maliciousCode = `
/* eslint-disable no-console */
console.log("unauthorized console bypass");
`;
    const result = findFileLevelDisablesInSource(maliciousCode, "src/components/BadComponent.tsx");
    expect(result.unauthorizedNoConsole).toEqual(["src/components/BadComponent.tsx:2"]);
    expect(result.findings).toHaveLength(1);
    expect(result.findings[0]?.isNoConsole).toBe(true);
  });

  it("permits no-console file-level disable in allowed logger sinks (green proof)", () => {
    const sinkCode = `
/* eslint-disable no-console */
export class Logger {}
`;
    const result = findFileLevelDisablesInSource(sinkCode, "src/utils/logger.ts");
    expect(result.unauthorizedNoConsole).toEqual([]);
    expect(result.findings).toHaveLength(1);
    expect(result.findings[0]?.isNoConsole).toBe(true);
  });

  it("ignores line-level and next-line disable comments", () => {
    const code = `
// eslint-disable-next-line no-console
console.log("line level");
console.log("another"); // eslint-disable-line no-console
`;
    const result = findFileLevelDisablesInSource(code, "src/components/Component.tsx");
    expect(result.findings).toEqual([]);
    expect(result.unauthorizedNoConsole).toEqual([]);
  });
});

describe("compareSuppressions", () => {
  const base = { "no-console": 5, "jsx-a11y/no-static-element-interactions": 2 };

  it("allows suppressions to hold flat or decrease", () => {
    expect(compareSuppressions(base, base)).toEqual({
      exceedsBaseline: false,
      regressions: [],
    });
    expect(compareSuppressions({ "no-console": 4 }, base)).toEqual({
      exceedsBaseline: false,
      regressions: [],
    });
  });

  it("detects increases in rule suppressions", () => {
    const result = compareSuppressions(
      { "no-console": 6, "jsx-a11y/no-static-element-interactions": 3 },
      base,
    );
    expect(result.exceedsBaseline).toBe(true);
    expect(result.regressions).toEqual([
      { rule: "no-console", baselineCount: 5, currentCount: 6, delta: 1 },
      { rule: "jsx-a11y/no-static-element-interactions", baselineCount: 2, currentCount: 3, delta: 1 },
    ]);
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

describe("isDuplicateArtifactPath", () => {
  it("skips Finder/sync duplicates that tsconfig and .gitignore already exclude", () => {
    expect(isDuplicateArtifactPath("services/AstrologicalService 2.ts")).toBe(true);
    expect(isDuplicateArtifactPath("calculations/culinaryAstrology 3.ts")).toBe(true);
    expect(isDuplicateArtifactPath("lib/auth/auth 2.config.ts")).toBe(true);
    expect(isDuplicateArtifactPath("app/celestial-lab/mechanics 2/page.tsx")).toBe(true);
  });

  it("keeps real source files, including names that merely contain digits", () => {
    expect(isDuplicateArtifactPath("services/AstrologicalService.ts")).toBe(false);
    expect(isDuplicateArtifactPath("utils/base64.ts")).toBe(false);
    expect(isDuplicateArtifactPath("components/Panel2.tsx")).toBe(false);
    expect(isDuplicateArtifactPath("app/api/v2/route.ts")).toBe(false);
    expect(isDuplicateArtifactPath("__tests__/phase7BatchEComponents.test.tsx")).toBe(false);
  });
});
