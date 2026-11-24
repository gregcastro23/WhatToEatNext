/**
 * Every homepage kitchen tip names its basis and can be traced back to it.
 *
 * - A METHOD tip is a verbatim quote of that method's expertTips, and the method
 *   has a page (the method page's generateStaticParams lists allCookingMethods' keys).
 * - A CITED tip links to a US government food-safety page over https.
 * - A HOUSE tip claims no number, and links to a page that exists in src/app.
 */
import fs from "node:fs";
import path from "node:path";
import { KITCHEN_TIPS } from "@/components/home/tipOfTheDay";
import { allCookingMethods } from "@/data/cooking/methods";
import { CITED_TIPS, HOUSE_TIPS, METHOD_TIP_PICKS } from "../kitchenTips";

const METHODS: Record<string, { expertTips?: string[] }> = allCookingMethods;
const APP_DIR = path.resolve(__dirname, "../../app");
const GOV_HOSTS = ["www.fsis.usda.gov", "www.fda.gov", "www.foodsafety.gov"];
/** Longer tips would run past three lines on a phone. */
const MAX_TIP_LENGTH = 140;

/** Every page route under src/app, with (group) folders dropped from the path. */
function appRoutes(): Set<string> {
  const routes = new Set<string>();
  const walk = (dir: string, segments: string[]): void => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        const isGroup = /^\(.*\)$/.test(entry.name);
        walk(path.join(dir, entry.name), isGroup ? segments : [...segments, entry.name]);
      } else if (entry.name === "page.tsx") {
        routes.add(`/${segments.join("/")}`);
      }
    }
  };
  walk(APP_DIR, []);
  return routes;
}

describe("method tips", () => {
  const picks = Object.entries(METHOD_TIP_PICKS);

  it("quote their method's expertTips word for word", () => {
    for (const [method, tips] of picks) {
      const source = METHODS[method]?.expertTips ?? [];
      for (const text of tips) expect({ method, text, quoted: source.includes(text) }).toEqual({ method, text, quoted: true });
    }
  });

  it("each come from a method that has its own page", () => {
    for (const [method] of picks) expect(Object.keys(METHODS)).toContain(method);
  });

  it("link to that method's page", () => {
    const methodTips = KITCHEN_TIPS.filter((t) => t.basis === "method");
    expect(methodTips).toHaveLength(picks.reduce((n, [, tips]) => n + tips.length, 0));
    for (const t of methodTips) expect(t.link.href).toBe(`/cooking-methods/${t.id.replace(/-\d+$/, "")}`);
  });
});

describe("cited tips", () => {
  it("link to a US government food-safety page over https", () => {
    for (const { url } of CITED_TIPS) {
      const { protocol, hostname } = new URL(url);
      expect({ url, protocol, gov: GOV_HOSTS.includes(hostname) }).toEqual({ url, protocol: "https:", gov: true });
    }
  });
});

describe("house tips", () => {
  it("claim no number, so they need no source", () => {
    for (const { text } of HOUSE_TIPS) expect(text).not.toMatch(/\d/);
  });

  it("link to pages that exist", () => {
    const routes = appRoutes();
    expect(fs.existsSync(path.join(APP_DIR, "layout.tsx"))).toBe(true); // the walk read the real app
    expect(routes.has("/cooking-methods/[method]")).toBe(true);
    for (const { href } of HOUSE_TIPS) expect({ href, exists: routes.has(href) }).toEqual({ href, exists: true });
  });
});

describe("every tip", () => {
  it(`fits in ${MAX_TIP_LENGTH} characters`, () => {
    const tooLong = KITCHEN_TIPS.filter((t) => t.text.length > MAX_TIP_LENGTH).map((t) => t.text);
    expect(tooLong).toEqual([]);
  });
});
