/**
 * Every import path in every test file must resolve.
 *
 * Nothing else checks this. Test files are excluded from tsconfig.json (so
 * `tsc --noEmit` never sees them), globally ignored by eslint.config.mjs, and
 * ts-jest transpiles per-file — an UNUSED import is dropped at transform, so
 * the runtime never requires its path either. The result: a test can import a
 * module that does not exist and pass forever, reading as coverage the whole
 * time. HooksCompliance.test.tsx did exactly that for
 * `@/components/home/EnhancedCookingMethodRecommender` (the real component
 * lives under components/recommendations/) — that path is kept below as this
 * suite's negative control.
 *
 * The companion guard for non-test source is
 * `unused-imports/no-unused-imports` in eslint.config.mjs, which bans the
 * unused-import state outright; every surviving import there is used, and
 * used imports are resolved by tsc.
 */
import fs from "fs";
import path from "path";

const ROOT = process.cwd();

// Mirror of jest.config.js `moduleNameMapper`, most-specific first. Kept as a
// literal so this suite has no dependency on importing the config (a .js ESM
// file ts-jest does not transform); the drift test below fails loudly if the
// real mapper changes.
const EXACT_MAPPINGS: Record<string, string> = {
  "@/lib/spacetime/generated": "tests/setup/spacetime-generated-stub.ts",
  "@upstash/redis": "tests/setup/upstash-redis-stub.ts",
};

const EXTENSIONS = [".ts", ".tsx", ".js", ".jsx", ".json"];

function isMacosDuplicate(p: string): boolean {
  return / \d+\.[a-z]+$/.test(p) || / \d+\//.test(p);
}

function collectTestFiles(dir: string, out: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (isMacosDuplicate(full)) continue;
    if (entry.isDirectory()) {
      if (entry.name === "node_modules") continue;
      collectTestFiles(full, out);
    } else if (
      /\.test\.tsx?$/.test(entry.name) ||
      (full.includes(`${path.sep}__tests__${path.sep}`) && /\.tsx?$/.test(entry.name) && !entry.name.endsWith(".d.ts"))
    ) {
      out.push(full);
    }
  }
  return out;
}

function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, "")
    // `//` comments, but not the `//` inside protocol URLs like https://
    .replace(/(^|[^:"'`])\/\/[^\n]*/gm, "$1");
}

function extractSpecifiers(source: string): string[] {
  const stripped = stripComments(source);
  const specs = new Set<string>();
  const patterns = [
    // import x from "...", export { y } from "...", import("..."), import "..."
    /(?:from|import)\s*\(?\s*["']([^"']+)["']/g,
    /jest\.(?:mock|requireActual|requireMock|unmock|doMock)\(\s*["']([^"']+)["']/g,
    /require\(\s*["']([^"']+)["']\s*\)/g,
  ];
  for (const re of patterns) {
    for (const m of stripped.matchAll(re)) specs.add(m[1]);
  }
  return [...specs];
}

function resolves(spec: string, fromFile: string): boolean {
  let base: string;
  if (spec in EXACT_MAPPINGS) {
    base = path.join(ROOT, EXACT_MAPPINGS[spec]);
  } else if (spec.startsWith("@/")) {
    base = path.join(ROOT, "src", spec.slice(2));
  } else if (spec.startsWith("./") || spec.startsWith("../")) {
    base = path.resolve(path.dirname(fromFile), spec);
  } else {
    // Bare package specifier — node_modules territory, out of scope here.
    return true;
  }
  if (fs.existsSync(base) && fs.statSync(base).isFile()) return true;
  for (const ext of EXTENSIONS) {
    if (fs.existsSync(base + ext)) return true;
    if (fs.existsSync(path.join(base, `index${ext}`))) return true;
  }
  return false;
}

describe("test-file import paths all resolve", () => {
  it("every @/ and relative specifier in every test file points at a real module", () => {
    const files = collectTestFiles(path.join(ROOT, "src"));
    // A sweep that found no files would pass vacuously — pin the floor.
    expect(files.length).toBeGreaterThan(100);

    const failures: string[] = [];
    for (const file of files) {
      const source = fs.readFileSync(file, "utf8");
      for (const spec of extractSpecifiers(source)) {
        if (!resolves(spec, file)) {
          failures.push(`${path.relative(ROOT, file)} → "${spec}"`);
        }
      }
    }
    expect(failures).toEqual([]);
  });

  it("negative control: the historical dead path really does fail resolution", () => {
    // The exact specifier that sat unused (and unresolved) in
    // HooksCompliance.test.tsx while the suite stayed green.
    expect(resolves("@/components/home/EnhancedCookingMethodRecommender", path.join(ROOT, "src/__tests__/x.test.ts"))).toBe(false);
    // …and its corrected form resolves, so the control cannot rot silently.
    expect(resolves("@/components/recommendations/EnhancedCookingMethodRecommender", path.join(ROOT, "src/__tests__/x.test.ts"))).toBe(true);
  });

  it("the mapper mirror has not drifted from jest.config.js", () => {
    const config = fs.readFileSync(path.join(ROOT, "jest.config.js"), "utf8");
    expect(config).toContain('"^@/(.*)$": "<rootDir>/src/$1"');
    expect(config).toContain('"^@/lib/spacetime/generated$": "<rootDir>/tests/setup/spacetime-generated-stub.ts"');
    expect(config).toContain('"^@upstash/redis$": "<rootDir>/tests/setup/upstash-redis-stub.ts"');
  });
});
