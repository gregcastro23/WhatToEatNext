/**
 * Crawl a deployment's sitemap and fail if any listed URL does not name itself
 * as its canonical (or is not a 200, or is noindex). The judge is
 * scripts/lib/sitemapCanonicals.ts; the route-level unit test is
 * src/app/__tests__/canonicals.test.ts.
 *
 * Pages are fetched from --base, but each is judged against its <loc>: the
 * sitemap and the canonicals both resolve against the deployment's
 * metadataBase, so on a preview they still name the production origin.
 *
 * Usage:
 *   bun scripts/checkSitemapCanonicals.ts                              # production, every URL
 *   bun scripts/checkSitemapCanonicals.ts --base https://<preview>.vercel.app
 *   bun scripts/checkSitemapCanonicals.ts --include '^/(recipes|cuisines)'  # path regex
 *   bun scripts/checkSitemapCanonicals.ts --limit 50                   # first N matching URLs
 *
 * A protected preview needs its automation bypass secret in
 * VERCEL_PROTECTION_BYPASS. It is sent as a header and never printed.
 */
import { judge, parseSitemapLocs, type Verdict } from "./lib/sitemapCanonicals";

interface Options {
  base: string;
  include: RegExp | null;
  limit: number | null;
  concurrency: number;
}

function flag(argv: readonly string[], name: string): string | null {
  const at = argv.indexOf(name);
  return at === -1 ? null : (argv[at + 1] ?? null);
}

function positiveInt(value: string | null, name: string): number | null {
  if (value === null) return null;
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1) throw new Error(`${name} must be a positive integer, got ${value}`);
  return n;
}

function parseOptions(argv: readonly string[]): Options {
  const include = flag(argv, "--include");
  return {
    base: (flag(argv, "--base") ?? "https://alchm.kitchen").replace(/\/+$/, ""),
    include: include === null ? null : new RegExp(include),
    limit: positiveInt(flag(argv, "--limit"), "--limit"),
    concurrency: positiveInt(flag(argv, "--concurrency"), "--concurrency") ?? 6,
  };
}

function headers(): Record<string, string> {
  const bypass = process.env.VERCEL_PROTECTION_BYPASS;
  return {
    "user-agent": "alchm-canonical-check/1.0 (+https://alchm.kitchen)",
    ...(bypass ? { "x-vercel-protection-bypass": bypass } : {}),
  };
}

async function fetchText(url: string): Promise<{ status: number; location: string | null; html: string }> {
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch(url, { headers: headers(), redirect: "manual", signal: AbortSignal.timeout(30_000) });
      const reading = { status: res.status, location: res.headers.get("location"), html: await res.text() };
      if (reading.status < 500 || attempt === 2) return reading;
    } catch (err) {
      if (attempt === 2) return { status: 0, location: null, html: `fetch failed: ${String(err)}` };
    }
    await new Promise((resolve) => setTimeout(resolve, 1_000));
  }
}

async function mapPool<T, R>(items: readonly T[], width: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array<R>(items.length);
  let next = 0;
  const worker = async (): Promise<void> => {
    for (let i = next++; i < items.length; i = next++) {
      const item = items[i];
      if (item !== undefined) out[i] = await fn(item);
    }
  };
  await Promise.all(Array.from({ length: Math.min(width, items.length) }, worker));
  return out;
}

async function main(): Promise<void> {
  const options = parseOptions(process.argv.slice(2));
  const sitemap = await fetchText(`${options.base}/sitemap.xml`);
  if (sitemap.status !== 200) throw new Error(`${options.base}/sitemap.xml answered HTTP ${sitemap.status}`);
  const all = parseSitemapLocs(sitemap.html);
  if (all.length === 0) throw new Error("the sitemap lists no URLs");

  const selected = all.filter((loc) => options.include === null || options.include.test(new URL(loc).pathname));
  const locs = options.limit === null ? selected : selected.slice(0, options.limit);
  console.log(`${all.length} sitemap URLs; checking ${locs.length} against ${options.base}`);

  const verdicts = await mapPool(locs, options.concurrency, async (loc) => {
    const { pathname, search } = new URL(loc);
    const verdict: Verdict = judge(loc, await fetchText(`${options.base}${pathname}${search}`));
    return { loc, verdict };
  });

  const failures = verdicts.filter(({ verdict }) => !verdict.ok);
  const byKind = new Map<string, number>();
  for (const { verdict } of failures) {
    if (!verdict.ok) byKind.set(verdict.kind, (byKind.get(verdict.kind) ?? 0) + 1);
  }
  for (const { loc, verdict } of failures) {
    if (!verdict.ok) console.log(`✗ ${verdict.kind.padEnd(8)} ${new URL(loc).pathname}  ${verdict.detail}`);
  }
  const summary = [...byKind].map(([kind, n]) => `${n} ${kind}`).join(", ");
  console.log(`\n${verdicts.length - failures.length}/${verdicts.length} name themselves${summary ? ` — ${summary}` : ""}`);
  if (failures.length > 0) process.exit(1);
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
