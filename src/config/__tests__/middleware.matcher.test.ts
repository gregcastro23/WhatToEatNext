/**
 * @jest-environment node
 *
 * Security invariant: moving a route must not move it out of the auth gate.
 *
 * middleware.ts's matcher is PATH-PREFIXED. When /birth-chart moved to
 * /celestial-lab/standing-chart, the entry "/birth-chart/:path*" stopped
 * covering it — the page would have been served with no middleware check, and
 * nothing would have failed: a signed-in developer never sees the redirect, and
 * the page's own auth() call still redirects, so the hole is invisible from the
 * browser. That is precisely the kind of gap that only a test catches.
 *
 * The inverse matters too. /planetary-chart is deliberately PUBLIC, so its new
 * home must NOT be gated — a blanket "/celestial-lab/:path*" would have gated
 * it and broken a public surface just as silently.
 *
 * Parsed as text rather than imported: importing src/middleware.ts pulls the
 * whole next-auth chain into the test environment.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";

import { LEGACY_LAB_REDIRECTS } from "@/config/navigation";

const MIDDLEWARE_PATH = join(__dirname, "..", "..", "middleware.ts");

/** The literal strings inside `export const config = { matcher: [...] }`. */
function parseMatcher(): string[] {
  const src = readFileSync(MIDDLEWARE_PATH, "utf8");

  const start = src.indexOf("matcher:");
  if (start === -1) throw new Error("middleware.ts: no `matcher:` key found");
  const open = src.indexOf("[", start);
  const close = src.indexOf("]", open);
  if (open === -1 || close === -1) {
    throw new Error("middleware.ts: matcher array is not delimited");
  }

  // Strip `//` comments FIRST. The matcher array is heavily commented, and one
  // of those comments quotes a path pattern it is warning against
  // (a blanket celestial-lab matcher). A naive scrape of every quoted string
  // between the brackets reads that warning as a live entry and reports the
  // exact gate the comment exists to forbid. Caught by this suite failing.
  const body = src
    .slice(open, close)
    .split("\n")
    .map((line) => line.replace(/\/\/.*$/, ""))
    .join("\n");

  const entries = [...body.matchAll(/"([^"]+)"/g)].map((m) => m[1]);
  if (entries.length === 0) {
    throw new Error("middleware.ts: parsed 0 matcher entries — parser is broken");
  }
  return entries;
}

/** Does any matcher entry cover `pathname`? Mirrors Next's prefix semantics. */
function isGated(pathname: string, matcher: string[]): boolean {
  return matcher.some((entry) => {
    const base = entry.replace(/\/:path\*$/, "");
    return pathname === base || pathname.startsWith(`${base}/`);
  });
}

describe("middleware matcher parser", () => {
  it("still recognises entries that predate the lab split", () => {
    // Instrument check: if the parse silently returns [], every assertion
    // below about "is not gated" would pass for the wrong reason.
    const matcher = parseMatcher();
    expect(matcher).toContain("/admin/:path*");
    expect(matcher).toContain("/profile/:path*");
  });
});

/**
 * The SECOND path-keyed auth gate.
 *
 * src/lib/auth/auth.config.ts's `authorized` callback re-lists the protected
 * prefixes independently of the middleware matcher. Two hand-maintained lists
 * of the same thing drift, and this one is easy to miss entirely — it lives
 * under lib/auth, not next to the routes it protects.
 */
function parseAuthConfigProtectedPrefixes(): string[] {
  const src = readFileSync(
    join(__dirname, "..", "..", "lib", "auth", "auth.config.ts"),
    "utf8",
  );
  const start = src.indexOf("const isProtected =");
  if (start === -1) {
    throw new Error("auth.config.ts: no `isProtected` block found");
  }
  const end = src.indexOf(";", start);
  const body = src
    .slice(start, end)
    .split("\n")
    .map((line) => line.replace(/\/\/.*$/, ""))
    .join("\n");

  const prefixes = [...body.matchAll(/startsWith\("([^"]+)"\)/g)].map((m) => m[1]);
  if (prefixes.length === 0) {
    throw new Error("auth.config.ts: parsed 0 protected prefixes — parser is broken");
  }
  return prefixes;
}

describe("auth.config.ts protected prefixes", () => {
  it("still recognises prefixes that predate the lab split", () => {
    const prefixes = parseAuthConfigProtectedPrefixes();
    expect(prefixes).toContain("/profile");
    expect(prefixes).toContain("/admin");
  });

  it("protects both the legacy and the moved chart paths", () => {
    const prefixes = parseAuthConfigProtectedPrefixes();
    const covers = (p: string): boolean =>
      prefixes.some((prefix) => p === prefix || p.startsWith(`${prefix}/`));

    for (const legacy of ["/birth-chart", "/current-chart"]) {
      expect(covers(legacy)).toBe(true);
      expect(covers(LEGACY_LAB_REDIRECTS[legacy])).toBe(true);
    }
  });

  it("does not protect the public planetary surface at either path", () => {
    const prefixes = parseAuthConfigProtectedPrefixes();
    const covers = (p: string): boolean =>
      prefixes.some((prefix) => p === prefix || p.startsWith(`${prefix}/`));

    expect(covers("/planetary-chart")).toBe(false);
    expect(covers("/celestial-lab/mechanics")).toBe(false);
    expect(covers("/celestial-lab")).toBe(false);
  });
});

describe("the lab split preserves every auth boundary", () => {
  // Ground truth taken from the matcher as it stood BEFORE the split. Written
  // as literals on purpose: deriving them from the current file would make the
  // test agree with whatever the file says, which proves nothing.
  const GATED_BEFORE = ["/birth-chart", "/current-chart"];
  const PUBLIC_BEFORE = ["/planetary-chart"];

  it("keeps every previously-gated lab route gated at its new path", () => {
    const matcher = parseMatcher();

    for (const legacy of GATED_BEFORE) {
      expect(isGated(legacy, matcher)).toBe(true); // still gated at the old path
      const moved = LEGACY_LAB_REDIRECTS[legacy];
      expect(moved).toBeDefined();
      expect(isGated(moved, matcher)).toBe(true); // AND at the new one
    }
  });

  it("does not gate the deliberately-public planetary surface", () => {
    const matcher = parseMatcher();

    for (const legacy of PUBLIC_BEFORE) {
      expect(isGated(legacy, matcher)).toBe(false);
      const moved = LEGACY_LAB_REDIRECTS[legacy];
      expect(moved).toBeDefined();
      // /celestial-lab/mechanics must stay reachable signed-out.
      expect(isGated(moved, matcher)).toBe(false);
    }
  });

  it("does not gate the celestial lab wholesale", () => {
    const matcher = parseMatcher();
    // The overview is a public explainer of the two models.
    expect(isGated("/celestial-lab", matcher)).toBe(false);
    expect(isGated("/celestial-lab/alchm", matcher)).toBe(false);
  });

  it("leaves the kitchen lab public", () => {
    const matcher = parseMatcher();
    for (const p of ["/kitchen-lab", "/kitchen-lab/physics", "/kitchen-lab/alchm"]) {
      expect(isGated(p, matcher)).toBe(false);
    }
  });
});
