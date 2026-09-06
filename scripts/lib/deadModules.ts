import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { isDuplicateArtifactPath } from "./lintDebt";

import type * as TSType from "typescript";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const ts = require("typescript") as typeof TSType;

/**
 * Reachability audit for `src/` modules.
 *
 * The criterion is deliberately CONSERVATIVE: a file is only reported dead when
 * no traversal from any entry point reaches it. Every construct that could make
 * a file reachable is modelled as a graph edge, including the ones that have
 * historically refuted "this is dead" claims in this repo:
 *
 *   - `export * from "./x"` barrels (a reachable barrel keeps `x` alive even
 *     when no symbol of `x` is ever named by a consumer)
 *   - `import()` dynamic imports
 *   - `require()` calls
 *   - `import x = require("y")` equals-imports
 *   - tsconfig `paths` aliases (`@/…`, `@utils/…`, …)
 *
 * Template-literal dynamic imports (`import(`../data/planets/${p}`)`) cannot be
 * resolved statically at all. Rather than silently under-counting, they are
 * surfaced as `unresolvableDynamicImports` and every file under the literal
 * prefix is pinned as an entry point, so nothing behind such an import is ever
 * reported dead.
 */

export const SOURCE_EXTENSIONS = [".ts", ".tsx"] as const;

/** Next.js App Router / Pages Router file conventions — implicit entry points. */
export const NEXT_CONVENTION_BASENAMES = new Set([
  "page.tsx",
  "page.ts",
  "route.ts",
  "route.tsx",
  "layout.tsx",
  "layout.ts",
  "template.tsx",
  "loading.tsx",
  "error.tsx",
  "global-error.tsx",
  "not-found.tsx",
  "default.tsx",
  "sitemap.ts",
  "robots.ts",
  "manifest.ts",
  "opengraph-image.tsx",
  "twitter-image.tsx",
  "icon.tsx",
  "apple-icon.tsx",
]);

/** Repo-root-relative files that are entry points regardless of directory. */
export const ROOT_ENTRY_FILES = [
  "src/middleware.ts",
  "src/instrumentation.ts",
] as const;

export interface ModuleEdge {
  /** Raw specifier text as written in the source. */
  specifier: string;
  /** Repo-relative resolved path, or null when it resolves outside src/. */
  resolved: string | null;
}

export interface DeadModuleReport {
  /** Repo-relative paths of files reachable from at least one entry point. */
  reachable: string[];
  /** Repo-relative paths of unreachable `src/` modules. */
  dead: string[];
  /** Dead files that ARE referenced, but only from test/story files. */
  testOnly: string[];
  /** Every file the scan considered a candidate for deadness. */
  candidates: string[];
  /** Entry points the traversal started from. */
  entryPoints: string[];
  /** Template-literal `import()` sites that cannot be resolved statically. */
  unresolvableDynamicImports: { file: string; specifier: string }[];
  /** referrer -> resolved targets, for evidence when refuting a verdict. */
  referrers: Record<string, string[]>;
}

export function isTestLikePath(relPath: string): boolean {
  return (
    /(^|\/)__tests__\//.test(relPath) ||
    /(^|\/)__mocks__\//.test(relPath) ||
    /\.(test|spec)\.tsx?$/.test(relPath) ||
    /\.stories\.tsx?$/.test(relPath)
  );
}

export function isScannableSource(relPath: string): boolean {
  if (!/\.tsx?$/.test(relPath)) return false;
  if (relPath.endsWith(".d.ts")) return false;
  if (isDuplicateArtifactPath(relPath)) return false;
  return true;
}

/**
 * Files that may REFERENCE a module. Strictly wider than the candidate set:
 * `.d.ts` declaration files are included here but can never themselves be
 * reported dead.
 *
 * Declaration files matter because `tsconfig.json` sets `skipLibCheck: true`,
 * so a `.d.ts` holding `typeof import("@/utils/gone")` produces ZERO tsc
 * errors after the target is deleted — red-proven. A reachability scan that
 * skips them therefore reports modules dead that `bun run typecheck` will
 * never object to, and the breakage surfaces only at a use site.
 */
export function isReferrerSource(relPath: string): boolean {
  if (!/\.tsx?$/.test(relPath)) return false;
  if (isDuplicateArtifactPath(relPath)) return false;
  return true;
}

/**
 * A candidate is a non-test, non-declaration `src/` module that is not itself an
 * implicit Next.js entry point.
 */
export function isDeadnessCandidate(relPath: string): boolean {
  if (!relPath.startsWith("src/")) return false;
  if (!isScannableSource(relPath)) return false;
  if (isTestLikePath(relPath)) return false;
  if (NEXT_CONVENTION_BASENAMES.has(path.basename(relPath))) return false;
  // Pages Router: every file under src/pages is a route.
  if (relPath.startsWith("src/pages/")) return false;
  if ((ROOT_ENTRY_FILES as readonly string[]).includes(relPath)) return false;
  return true;
}

export function isEntryPoint(relPath: string): boolean {
  // Ambient declaration files are loaded by tsc unconditionally, so anything
  // they name is live. They are referrers that nothing imports, so without
  // this they sit outside the traversal and their edges are never followed.
  if (relPath.endsWith(".d.ts")) return true;
  if ((ROOT_ENTRY_FILES as readonly string[]).includes(relPath)) return true;
  if (relPath.startsWith("src/pages/")) return isScannableSource(relPath);
  if (!relPath.startsWith("src/")) return false;
  return NEXT_CONVENTION_BASENAMES.has(path.basename(relPath));
}

/** Extract every static + dynamic module specifier from one source file. */
export function extractSpecifiers(
  sourceText: string,
  fileName: string,
): { specifiers: string[]; templateDynamicImports: string[] } {
  const pre = ts.preProcessFile(sourceText, true, true);
  const specifiers = pre.importedFiles.map((f) => f.fileName);

  // preProcessFile only reports statically-analysable specifiers. Template
  // literal imports are invisible to it, so find them separately.
  const templateDynamicImports: string[] = [];
  const source = ts.createSourceFile(
    fileName,
    sourceText,
    ts.ScriptTarget.Latest,
    /* setParentNodes */ false,
    fileName.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  const visit = (node: TSType.Node): void => {
    if (
      ts.isCallExpression(node) &&
      node.expression.kind === ts.SyntaxKind.ImportKeyword
    ) {
      const arg = node.arguments[0];
      if (arg && !ts.isStringLiteralLike(arg)) {
        templateDynamicImports.push(arg.getText(source));
      } else if (arg && ts.isNoSubstitutionTemplateLiteral(arg)) {
        specifiers.push(arg.text);
      }
    }
    ts.forEachChild(node, visit);
  };
  ts.forEachChild(source, visit);

  return { specifiers, templateDynamicImports };
}

/**
 * The literal directory prefix of a template-literal import, e.g.
 * `` `../data/planets/${p}` `` -> `../data/planets`. Everything under that
 * prefix is pinned reachable.
 */
export function templatePrefix(exprText: string): string | null {
  const match = exprText.match(/^`([^`$]*)\$\{/);
  if (!match || match[1] === undefined) return null;
  const literal = match[1];
  const slash = literal.lastIndexOf("/");
  return slash === -1 ? null : literal.slice(0, slash);
}

export interface BuildGraphOptions {
  repoRoot: string;
  /** Repo-relative paths of every file that may REFERENCE a src module. */
  referrerFiles: string[];
  /** Repo-relative paths of files that are candidates for being dead. */
  candidateFiles: string[];
  compilerOptions: TSType.CompilerOptions;
  /** Entry points no import graph can see (package.json script targets). */
  extraEntryPoints?: string[];
}

export function buildReport(options: BuildGraphOptions): DeadModuleReport {
  const {
    repoRoot,
    referrerFiles,
    candidateFiles,
    compilerOptions,
    extraEntryPoints = [],
  } = options;
  const host = ts.createCompilerHost(compilerOptions, /* setParentNodes */ false);
  const moduleCache = ts.createModuleResolutionCache(
    repoRoot,
    (f) => f,
    compilerOptions,
  );

  const referrers: Record<string, string[]> = {};
  const unresolvableDynamicImports: { file: string; specifier: string }[] = [];
  const pinnedPrefixes = new Set<string>();

  for (const rel of referrerFiles) {
    const abs = path.join(repoRoot, rel);
    if (!existsSync(abs)) continue;
    const text = readFileSync(abs, "utf8");
    const { specifiers, templateDynamicImports } = extractSpecifiers(text, abs);

    const targets: string[] = [];
    for (const specifier of specifiers) {
      const resolved = ts.resolveModuleName(
        specifier,
        abs,
        compilerOptions,
        host,
        moduleCache,
      ).resolvedModule;
      if (!resolved) continue;
      const resolvedRel = path
        .relative(repoRoot, resolved.resolvedFileName)
        .split(path.sep)
        .join("/");
      if (!resolvedRel.startsWith("src/")) continue;
      if (resolvedRel.endsWith(".d.ts")) continue;
      targets.push(resolvedRel);
    }

    for (const exprText of templateDynamicImports) {
      unresolvableDynamicImports.push({ file: rel, specifier: exprText });
      const prefix = templatePrefix(exprText);
      if (prefix) {
        const absPrefix = path.resolve(path.dirname(abs), prefix);
        const relPrefix = path
          .relative(repoRoot, absPrefix)
          .split(path.sep)
          .join("/");
        if (relPrefix.startsWith("src/")) pinnedPrefixes.add(relPrefix);
      }
    }

    referrers[rel] = [...new Set(targets)];
  }

  // Entry points: Next.js conventions, root entries, every non-src referrer
  // (scripts/, configs, .storybook), plus anything behind a template import.
  const entryPoints = new Set<string>();
  for (const rel of referrerFiles) {
    if (isEntryPoint(rel)) entryPoints.add(rel);
    else if (!rel.startsWith("src/")) entryPoints.add(rel);
    else if (isTestLikePath(rel)) entryPoints.add(rel);
  }
  for (const rel of extraEntryPoints) entryPoints.add(rel);
  for (const rel of candidateFiles) {
    for (const prefix of pinnedPrefixes) {
      if (rel.startsWith(`${prefix}/`)) entryPoints.add(rel);
    }
  }

  // BFS over the reference graph.
  const reachable = new Set<string>();
  const queue = [...entryPoints];
  while (queue.length > 0) {
    const current = queue.pop();
    if (current === undefined) continue;
    if (reachable.has(current)) continue;
    reachable.add(current);
    for (const target of referrers[current] ?? []) {
      if (!reachable.has(target)) queue.push(target);
    }
  }

  // Second traversal ignoring test/story entry points, to separate files that
  // only survive because a test imports them.
  const prodEntries = [...entryPoints].filter((e) => !isTestLikePath(e));
  const prodReachable = new Set<string>();
  const prodQueue = [...prodEntries];
  while (prodQueue.length > 0) {
    const current = prodQueue.pop();
    if (current === undefined) continue;
    if (prodReachable.has(current)) continue;
    prodReachable.add(current);
    for (const target of referrers[current] ?? []) {
      if (!prodReachable.has(target)) prodQueue.push(target);
    }
  }

  const dead: string[] = [];
  const testOnly: string[] = [];
  for (const rel of candidateFiles) {
    if (reachable.has(rel)) continue;
    if (prodReachable.has(rel)) continue;
    dead.push(rel);
  }
  for (const rel of candidateFiles) {
    if (!reachable.has(rel)) continue;
    if (prodReachable.has(rel)) continue;
    testOnly.push(rel);
  }

  return {
    reachable: [...reachable].sort(),
    dead: dead.sort(),
    testOnly: testOnly.sort(),
    candidates: [...candidateFiles].sort(),
    entryPoints: [...entryPoints].sort(),
    unresolvableDynamicImports,
    referrers,
  };
}
