/**
 * @jest-environment node
 *
 * Cross-check: next.config.js `redirects()` vs LEGACY_LAB_REDIRECTS.
 *
 * next.config.js is ESM-syntax in a `.js` file, and jest's transform here only
 * covers ts/tsx/mjs — so it can be neither `require`d nor imported from a
 * test. It is therefore read as TEXT and parsed.
 *
 * Why bother: nothing in the type system stops the config and the nav table
 * from drifting. When they drift the failure is invisible in development —
 * Next.js serves the new routes fine, and only someone arriving on an OLD url
 * hits the gap, which is exactly the traffic nobody clicks through by hand.
 *
 * ⚠️ A text parser can fail by matching NOTHING, and "no redirects found"
 * would make every `for` loop below iterate zero times and pass. `parseRedirects`
 * therefore throws on an empty parse, and a dedicated test pins two
 * pre-existing redirects that have nothing to do with the lab split — if the
 * parser silently stops working, that test goes red first.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";

import { LEGACY_LAB_REDIRECTS } from "@/config/navigation";

interface NextRedirect {
  source: string;
  destination: string;
  permanent: boolean;
}

const CONFIG_PATH = join(__dirname, "..", "..", "..", "next.config.js");

/**
 * Pull the `redirects()` entries out of next.config.js.
 *
 * Scoped to the redirects() body so the `headers()` block above it — whose
 * entries also carry a `source` — cannot leak in.
 */
function parseRedirects(): NextRedirect[] {
  const src = readFileSync(CONFIG_PATH, "utf8");

  const start = src.indexOf("async redirects()");
  if (start === -1) {
    throw new Error("next.config.js: no `async redirects()` block found");
  }
  const end = src.indexOf("];", start);
  if (end === -1) {
    throw new Error("next.config.js: `redirects()` block is not terminated");
  }
  const body = src.slice(start, end);

  const entry =
    /\{\s*source:\s*"([^"]+)",\s*destination:\s*"([^"]+)",\s*permanent:\s*(true|false),?\s*\}/g;

  const out: NextRedirect[] = [];
  for (const m of body.matchAll(entry)) {
    out.push({ source: m[1], destination: m[2], permanent: m[3] === "true" });
  }

  if (out.length === 0) {
    throw new Error(
      "next.config.js: parsed 0 redirects — the parser is broken, not the config",
    );
  }
  return out;
}

describe("next.config.js redirect parser", () => {
  it("still recognises redirects that predate the lab split", () => {
    // The instrument check. These two are unrelated to the lab work; if the
    // config's formatting changes enough to defeat the regex, this fails and
    // tells you the parser broke — instead of every assertion below passing on
    // an empty array.
    const all = parseRedirects();
    const bySource = new Map(all.map((r) => [r.source, r]));

    expect(bySource.get("/meal-plan")?.destination).toBe("/menu-planner");
    expect(bySource.get("/premium")?.destination).toBe("/vault");
    expect(all.length).toBeGreaterThanOrEqual(
      5 + Object.keys(LEGACY_LAB_REDIRECTS).length,
    );
  });
});

describe("next.config.js lab redirects", () => {
  it("declares a redirect for every legacy lab path", () => {
    const bySource = new Map(parseRedirects().map((r) => [r.source, r]));

    for (const [source, destination] of Object.entries(LEGACY_LAB_REDIRECTS)) {
      expect(bySource.get(source)?.destination).toBe(destination);
    }
  });

  it("uses 307 (not 308) for the lab moves while the tree is still settling", () => {
    const bySource = new Map(parseRedirects().map((r) => [r.source, r]));

    for (const source of Object.keys(LEGACY_LAB_REDIRECTS)) {
      // A 308 is cached by the browser forever. Until these paths stop moving
      // they must stay reversible.
      expect(bySource.get(source)?.permanent).toBe(false);
    }
  });

  it("does not redirect a lab path to another redirect source", () => {
    const sources = new Set(parseRedirects().map((r) => r.source));

    for (const destination of Object.values(LEGACY_LAB_REDIRECTS)) {
      // e.g. /planetary-chart -> /celestial-lab/mechanics -> somewhere else.
      // Chains cost a round trip and break silently when a hop is deleted.
      expect(sources.has(destination)).toBe(false);
    }
  });

  it("has no duplicate sources anywhere in the redirect table", () => {
    const sources = parseRedirects().map((r) => r.source);
    // Next.js takes the FIRST match, so a duplicate silently shadows the
    // second and the shadowed one looks configured but never fires.
    expect(new Set(sources).size).toBe(sources.length);
  });
});
