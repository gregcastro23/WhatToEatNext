import {
  extractSpecifiers,
  isReferrerSource,
  isScannableSource,
  isDeadnessCandidate,
  isEntryPoint,
  isTestLikePath,
  templatePrefix,
} from "../deadModules";

describe("extractSpecifiers", () => {
  it("captures plain static imports", () => {
    const { specifiers } = extractSpecifiers(
      `import { a } from "./alpha";\nimport b from "@/lib/beta";`,
      "x.ts",
    );
    expect(specifiers).toEqual(expect.arrayContaining(["./alpha", "@/lib/beta"]));
  });

  it("captures `export * from` re-exports", () => {
    // The construct that refuted three prior delete-as-dead claims in this repo:
    // a reachable barrel keeps its targets alive with no named import anywhere.
    const { specifiers } = extractSpecifiers(
      `export * from "./transformations";\nexport * from "./compatibility";`,
      "index.ts",
    );
    expect(specifiers).toEqual([
      "./transformations",
      "./compatibility",
    ]);
  });

  it("captures named and default re-exports", () => {
    const { specifiers } = extractSpecifiers(
      `export { x } from "./named";\nexport { default as y } from "./def";`,
      "index.ts",
    );
    expect(specifiers).toEqual(expect.arrayContaining(["./named", "./def"]));
  });

  it("captures literal dynamic imports", () => {
    const { specifiers } = extractSpecifiers(
      `const m = await import("./lazy");`,
      "x.ts",
    );
    expect(specifiers).toContain("./lazy");
  });

  it("captures require() calls", () => {
    const { specifiers } = extractSpecifiers(
      `const ts = require("typescript");`,
      "x.ts",
    );
    expect(specifiers).toContain("typescript");
  });

  it("reports template-literal dynamic imports instead of dropping them", () => {
    // Silently dropping these would under-count reachability and produce a
    // false DEAD verdict for every module behind the interpolation.
    const { specifiers, templateDynamicImports } = extractSpecifiers(
      "const m = await import(`../data/planets/${planet}`);",
      "x.ts",
    );
    expect(specifiers).not.toContain("../data/planets/");
    expect(templateDynamicImports).toHaveLength(1);
    expect(templateDynamicImports[0]).toContain("../data/planets/");
  });

  it("reports variable dynamic imports as unresolvable", () => {
    const { templateDynamicImports } = extractSpecifiers(
      `const m = await import(importPath);`,
      "x.ts",
    );
    expect(templateDynamicImports).toEqual(["importPath"]);
  });
});

describe("templatePrefix", () => {
  it("extracts the literal directory prefix before the interpolation", () => {
    expect(templatePrefix("`../data/planets/${planetName}`")).toBe(
      "../data/planets",
    );
    expect(templatePrefix("`@/data/planets/${p.toLowerCase()}`")).toBe(
      "@/data/planets",
    );
  });

  it("returns null when there is no directory prefix to pin", () => {
    expect(templatePrefix("importPath")).toBeNull();
    expect(templatePrefix("`${everything}`")).toBeNull();
  });
});

describe("isTestLikePath", () => {
  it.each([
    "src/__tests__/foo.ts",
    "src/services/__tests__/bar.test.ts",
    "src/x/__mocks__/y.ts",
    "src/components/Button.stories.tsx",
    "src/lib/a.spec.tsx",
  ])("treats %s as test-like", (p) => {
    expect(isTestLikePath(p)).toBe(true);
  });

  it("does not treat a production module as test-like", () => {
    expect(isTestLikePath("src/services/systemStatusService.ts")).toBe(false);
  });
});

describe("isEntryPoint", () => {
  it.each([
    "src/app/page.tsx",
    "src/app/api/health/route.ts",
    "src/app/(alchm)/layout.tsx",
    "src/app/sitemap.ts",
    "src/app/global-error.tsx",
    "src/middleware.ts",
    "src/instrumentation.ts",
    "src/pages/_error.tsx",
  ])("treats %s as an entry point", (p) => {
    expect(isEntryPoint(p)).toBe(true);
  });

  it("does not treat an ordinary module as an entry point", () => {
    expect(isEntryPoint("src/utils/theme.ts")).toBe(false);
  });
});

describe("isDeadnessCandidate", () => {
  it("excludes entry points, tests and declarations from candidacy", () => {
    expect(isDeadnessCandidate("src/app/api/health/route.ts")).toBe(false);
    expect(isDeadnessCandidate("src/pages/_error.tsx")).toBe(false);
    expect(isDeadnessCandidate("src/middleware.ts")).toBe(false);
    expect(isDeadnessCandidate("src/types/foo.d.ts")).toBe(false);
    expect(isDeadnessCandidate("src/x/__tests__/a.test.ts")).toBe(false);
  });

  it("excludes Finder duplicate artifacts", () => {
    expect(isDeadnessCandidate("src/utils/theme 2.ts")).toBe(false);
  });

  it("excludes files outside src/", () => {
    expect(isDeadnessCandidate("scripts/migrate.ts")).toBe(false);
  });

  it("includes an ordinary src module", () => {
    expect(isDeadnessCandidate("src/utils/theme.ts")).toBe(true);
  });
});

describe("declaration files", () => {
  it("treats a .d.ts as an entry point", () => {
    // tsconfig sets skipLibCheck, so a dangling `typeof import()` inside a
    // .d.ts produces ZERO tsc errors after its target is deleted. If the
    // declaration file is not an entry point its edges are never traversed
    // and the module it names is reported dead with nothing to contradict it.
    expect(isEntryPoint("src/types/global-types.d.ts")).toBe(true);
  });

  it("never treats a .d.ts as a deadness candidate", () => {
    expect(isDeadnessCandidate("src/types/global-types.d.ts")).toBe(false);
  });

  it("scans a .d.ts as a referrer even though it is not scannable source", () => {
    expect(isReferrerSource("src/types/global-types.d.ts")).toBe(true);
    expect(isScannableSource("src/types/global-types.d.ts")).toBe(false);
  });
});
