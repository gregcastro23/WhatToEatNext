/**
 * @jest-environment node
 *
 * The judge behind scripts/checkSitemapCanonicals.ts. The markup mirrors what
 * Next 15 emits (`<link rel="canonical" href="…"/>`, resolved against
 * metadataBase), including the production defect it exists to catch: a page
 * whose canonical is the homepage.
 */
import {
  extractCanonicals,
  hasNoindex,
  judge,
  normalizeUrl,
  parseSitemapLocs,
} from "../sitemapCanonicals";

const page = (head: string, status = 200, location: string | null = null) => ({
  status,
  location,
  html: `<!DOCTYPE html><html><head>${head}</head><body></body></html>`,
});

describe("parseSitemapLocs", () => {
  it("reads every <loc>, decoding entities", () => {
    const xml = `<?xml version="1.0"?><urlset>
      <url><loc>https://alchm.kitchen</loc></url>
      <url><loc> https://alchm.kitchen/recipes </loc><lastmod>x</lastmod></url>
      <url><loc>https://alchm.kitchen/search?q=a&amp;b=1</loc></url></urlset>`;
    expect(parseSitemapLocs(xml)).toEqual([
      "https://alchm.kitchen",
      "https://alchm.kitchen/recipes",
      "https://alchm.kitchen/search?q=a&b=1",
    ]);
  });
});

describe("extractCanonicals / hasNoindex", () => {
  it("finds rel=canonical in either attribute order and quote style", () => {
    const html = `<link rel="canonical" href="https://a.b/x"/><link href='/y' rel='canonical'><link rel="icon" href="/i.png">`;
    expect(extractCanonicals(html)).toEqual(["https://a.b/x", "/y"]);
  });

  it("reads robots noindex, and only from robots metas", () => {
    expect(hasNoindex(`<meta name="robots" content="noindex, follow"/>`)).toBe(true);
    expect(hasNoindex(`<meta name="robots" content="index, follow"/>`)).toBe(false);
    expect(hasNoindex(`<meta name="description" content="noindex is a word"/>`)).toBe(false);
  });
});

describe("normalizeUrl", () => {
  it("treats the bare origin and a trailing slash as the same URL", () => {
    expect(normalizeUrl("https://alchm.kitchen/")).toBe(normalizeUrl("https://alchm.kitchen"));
    expect(normalizeUrl("https://alchm.kitchen/recipes/")).toBe("https://alchm.kitchen/recipes");
  });
});

describe("judge", () => {
  const loc = "https://alchm.kitchen/recipes";

  it("passes a page that names itself", () => {
    expect(judge(loc, page(`<link rel="canonical" href="https://alchm.kitchen/recipes"/>`))).toEqual({ ok: true });
    expect(judge("https://alchm.kitchen", page(`<link rel="canonical" href="https://alchm.kitchen"/>`))).toEqual({
      ok: true,
    });
  });

  it("fails the production defect: a page whose canonical is the homepage", () => {
    expect(judge(loc, page(`<link rel="canonical" href="https://alchm.kitchen"/>`))).toEqual({
      ok: false,
      kind: "mismatch",
      detail: "canonical https://alchm.kitchen",
    });
  });

  it("fails a page with no canonical, or two", () => {
    expect(judge(loc, page(""))).toMatchObject({ ok: false, kind: "missing" });
    expect(
      judge(loc, page(`<link rel="canonical" href="${loc}"/><link rel="canonical" href="${loc}"/>`)),
    ).toMatchObject({ ok: false, kind: "multiple" });
  });

  it("fails a redirect, an error, and a noindex page before reading any canonical", () => {
    expect(judge(loc, page("", 308, "/recipes/x"))).toEqual({ ok: false, kind: "status", detail: "HTTP 308 → /recipes/x" });
    expect(judge(loc, page("", 500))).toMatchObject({ ok: false, kind: "status" });
    expect(
      judge(loc, page(`<meta name="robots" content="noindex"/><link rel="canonical" href="${loc}"/>`)),
    ).toMatchObject({ ok: false, kind: "noindex" });
  });

  it("resolves a relative canonical against the sitemap URL", () => {
    expect(judge(loc, page(`<link rel="canonical" href="/recipes"/>`))).toEqual({ ok: true });
  });
});
