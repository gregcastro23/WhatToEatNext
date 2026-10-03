/**
 * Pure logic for scripts/checkSitemapCanonicals.ts: read a sitemap, read a
 * page's canonical, and decide whether the page names itself.
 *
 * A sitemap URL is a claim that the URL is canonical, so the page it serves
 * must say the same thing: status 200, not a redirect, not noindex, and
 * exactly one <link rel="canonical"> naming that URL.
 */

const ENTITIES: Readonly<Record<string, string>> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&apos;": "'",
};

export function decodeXmlEntities(text: string): string {
  return text.replace(/&(amp|lt|gt|quot|#39|apos);/g, (entity) => ENTITIES[entity] ?? entity);
}

/** Every <loc> in a sitemap (or sitemap index), in document order. */
export function parseSitemapLocs(xml: string): string[] {
  return [...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/g)].map((match) => decodeXmlEntities(match[1] ?? ""));
}

function attribute(tag: string, name: string): string | null {
  const match = new RegExp(`\\s${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, "i").exec(tag);
  if (!match) return null;
  return decodeXmlEntities(match[1] ?? match[2] ?? "");
}

/**
 * Every canonical href in a document. Searched in the whole document, not just
 * <head>: Next can stream metadata after the shell.
 */
export function extractCanonicals(html: string): string[] {
  const hrefs: string[] = [];
  for (const [tag] of html.matchAll(/<link\b[^>]*>/gi)) {
    const rel = attribute(tag, "rel");
    if (rel === null || !rel.toLowerCase().split(/\s+/).includes("canonical")) continue;
    const href = attribute(tag, "href");
    if (href !== null) hrefs.push(href);
  }
  return hrefs;
}

export function hasNoindex(html: string): boolean {
  for (const [tag] of html.matchAll(/<meta\b[^>]*>/gi)) {
    const name = attribute(tag, "name")?.toLowerCase();
    if (name !== "robots" && name !== "googlebot") continue;
    if (/\bnoindex\b/i.test(attribute(tag, "content") ?? "")) return true;
  }
  return false;
}

/** Origin + path + query, with the root's lone "/" and any trailing "/" dropped. */
export function normalizeUrl(url: string): string {
  const parsed = new URL(url);
  const pathname = parsed.pathname.replace(/\/+$/, "");
  return `${parsed.origin}${pathname}${parsed.search}`;
}

export type Verdict =
  | { ok: true }
  | { ok: false; kind: "status"; detail: string }
  | { ok: false; kind: "noindex"; detail: string }
  | { ok: false; kind: "missing"; detail: string }
  | { ok: false; kind: "multiple"; detail: string }
  | { ok: false; kind: "mismatch"; detail: string };

export interface PageReading {
  status: number;
  /** The Location header, for a redirect. */
  location: string | null;
  html: string;
}

/** Does the page served at a sitemap URL name that URL as its canonical? */
export function judge(loc: string, page: PageReading): Verdict {
  if (page.status !== 200) {
    const where = page.location ? ` → ${page.location}` : "";
    return { ok: false, kind: "status", detail: `HTTP ${page.status}${where}` };
  }
  if (hasNoindex(page.html)) return { ok: false, kind: "noindex", detail: "listed in the sitemap but noindex" };
  const canonicals = extractCanonicals(page.html);
  if (canonicals.length === 0) return { ok: false, kind: "missing", detail: "no rel=canonical" };
  if (canonicals.length > 1) return { ok: false, kind: "multiple", detail: canonicals.join(" , ") };
  const [canonical] = canonicals;
  let resolved: string;
  try {
    resolved = normalizeUrl(new URL(canonical ?? "", loc).toString());
  } catch {
    return { ok: false, kind: "mismatch", detail: `unparseable canonical ${canonical ?? ""}` };
  }
  return resolved === normalizeUrl(loc) ? { ok: true } : { ok: false, kind: "mismatch", detail: `canonical ${resolved}` };
}
