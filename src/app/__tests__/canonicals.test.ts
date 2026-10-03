/**
 * @jest-environment node
 *
 * Every indexable page names itself as its canonical.
 *
 * The root layout used to set `alternates.canonical: "/"`, and Next merges
 * metadata down the layout chain, so /recipes, /cuisines, /pantry… each told
 * search engines they were the homepage (production, 2026-09-24). A
 * layout-level canonical has the same hazard one level down: every child
 * route that sets none inherits it.
 *
 * These tests resolve a route's canonical the way Next does: the real layout
 * chain from src/app down to the page, each module's `metadata` or
 * `generateMetadata`, the deepest `alternates` winning (a child's
 * `alternates` replaces its parent's whole). Only infrastructure is stubbed:
 * auth (ESM-only), `server-only`, and next/font. A new import that needs
 * more fails loudly here; it cannot make a route pass.
 */
import fs from "fs";
import path from "path";
import { SITEMAP_STATIC_ROUTES } from "@/lib/seo/sitemapRoutes";

jest.mock("server-only", () => ({}));
jest.mock("next/font/local", () => () => ({ className: "", variable: "", style: { fontFamily: "" } }));
jest.mock("next-auth/react", () => ({
  useSession: () => ({ data: null, status: "unauthenticated" }),
  signIn: jest.fn(),
  signOut: jest.fn(),
  SessionProvider: ({ children }: { children: unknown }) => children,
}));
jest.mock("@/lib/auth/auth", () => ({ auth: jest.fn(), handlers: {}, signIn: jest.fn(), signOut: jest.fn() }));

const APP = path.resolve(__dirname, "..");

/** Every file named `name` under src/app, skipping tests and API routes. */
function filesNamed(name: string, dir = APP, out: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== "__tests__" && entry.name !== "api") filesNamed(name, full, out);
    } else if (entry.name === name) {
      out.push(full);
    }
  }
  return out;
}

/** A directory's URL segments: route groups `(x)` and parallel slots `@x` add none. */
function urlSegments(dir: string): string[] {
  return path
    .relative(APP, dir)
    .split(path.sep)
    .filter((seg) => seg !== "" && !/^\(.*\)$/.test(seg) && !seg.startsWith("@"));
}

function routeOf(pageFile: string): string {
  return `/${urlSegments(path.dirname(pageFile)).join("/")}`;
}

interface Match {
  page: string;
  params: Record<string, string>;
}

/** The page file serving a concrete URL path, and its dynamic params. Static segments win. */
function findPage(route: string): Match {
  const wanted = route.split("/").filter(Boolean);
  const candidates: Array<Match & { dynamic: number }> = [];
  for (const page of filesNamed("page.tsx")) {
    const segs = urlSegments(path.dirname(page));
    if (segs.length !== wanted.length) continue;
    const params: Record<string, string> = {};
    let dynamic = 0;
    const fits = segs.every((seg, i) => {
      const name = /^\[([^\].]+)\]$/.exec(seg)?.[1];
      const value = wanted[i];
      if (name !== undefined && value !== undefined) {
        params[name] = value;
        dynamic += 1;
        return true;
      }
      return seg === value;
    });
    if (fits) candidates.push({ page, params, dynamic });
  }
  candidates.sort((a, b) => a.dynamic - b.dynamic);
  const best = candidates[0];
  if (!best) throw new Error(`no page.tsx serves ${route}`);
  return best;
}

/** The layouts wrapping a page, root first. */
function layoutsFor(pageFile: string): string[] {
  const layouts: string[] = [];
  let dir = path.dirname(pageFile);
  for (;;) {
    const layout = path.join(dir, "layout.tsx");
    if (fs.existsSync(layout)) layouts.unshift(layout);
    if (dir === APP) break;
    dir = path.dirname(dir);
  }
  return layouts;
}

/** A module's metadata: its `generateMetadata(props)` result, or its `metadata` export. */
async function metadataOf(file: string, params: Record<string, string>): Promise<unknown> {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const mod: unknown = require(file);
  const generate: unknown = Reflect.get(Object(mod), "generateMetadata");
  if (typeof generate === "function") {
    const props = { params: Promise.resolve(params), searchParams: Promise.resolve({}) };
    return await Reflect.apply(generate, undefined, [props, Promise.resolve({})]);
  }
  return Reflect.get(Object(mod), "metadata");
}

function alternatesOf(metadata: unknown): { set: boolean; value: unknown } {
  if (typeof metadata !== "object" || metadata === null || !("alternates" in metadata)) {
    return { set: false, value: undefined };
  }
  return { set: true, value: Reflect.get(metadata, "alternates") };
}

/** The canonical Next would emit for a concrete URL path. */
async function canonicalFor(route: string): Promise<unknown> {
  const { page, params } = findPage(route);
  let alternates: unknown;
  for (const file of [...layoutsFor(page), page]) {
    const found = alternatesOf(await metadataOf(file, params));
    if (found.set) alternates = found.value;
  }
  return typeof alternates === "object" && alternates !== null ? Reflect.get(alternates, "canonical") : undefined;
}

async function firstStaticParam(pageRoute: string, param: string): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const mod: unknown = require(findPage(pageRoute).page);
  const list: unknown = await Reflect.apply(Reflect.get(Object(mod), "generateStaticParams"), undefined, []);
  const first: unknown = Array.isArray(list) ? list[0] : undefined;
  const value: unknown = typeof first === "object" && first !== null ? Reflect.get(first, param) : undefined;
  if (typeof value !== "string" || value === "") throw new Error(`${pageRoute} lists no ${param}`);
  return value;
}

describe("self-canonicals", () => {
  it("walks the real app tree (control: the walker is not vacuous)", () => {
    const pages = filesNamed("page.tsx");
    expect(pages.length).toBeGreaterThan(50);
    expect(findPage("/").page).toBe(path.join(APP, "(alchm)", "page.tsx"));
    expect(findPage("/cuisines/italian").params).toEqual({ slug: "italian" });
    expect(layoutsFor(findPage("/pantry").page)).toEqual([
      path.join(APP, "layout.tsx"),
      path.join(APP, "pantry", "layout.tsx"),
    ]);
  });

  it.each(SITEMAP_STATIC_ROUTES.map(({ path: p }) => [p === "" ? "/" : p]))(
    "sitemap route %s names itself",
    async (route) => {
      expect(await canonicalFor(route)).toBe(route);
    },
  );

  it.each([["/discover"], ["/recipe-generator"]])("public route %s names itself", async (route) => {
    expect(await canonicalFor(route)).toBe(route);
  });

  it("a cuisine names its canonical slug, whatever case was requested", async () => {
    const slug = await firstStaticParam("/cuisines/x", "slug");
    expect(await canonicalFor(`/cuisines/${slug}`)).toBe(`/cuisines/${slug}`);
    expect(await canonicalFor(`/cuisines/${slug.toUpperCase()}`)).toBe(`/cuisines/${slug}`);
  });

  it("a cooking method names its own key, whatever case was requested", async () => {
    const key = await firstStaticParam("/cooking-methods/x", "method");
    expect(await canonicalFor(`/cooking-methods/${key}`)).toBe(`/cooking-methods/${key}`);
    expect(await canonicalFor(`/cooking-methods/${key.toUpperCase()}`)).toBe(`/cooking-methods/${key}`);
  });

  it("a restaurant menu names itself", async () => {
    expect(await canonicalFor("/restaurants/abc-123/menu")).toBe("/restaurants/abc-123/menu");
  });

  it("an unknown cuisine inherits no canonical from /cuisines", async () => {
    expect(await canonicalFor("/cuisines/no-such-cuisine")).toBeUndefined();
  });
});

describe("layout canonicals cannot leak", () => {
  // Every layout, loaded for real: one that fails to load fails this test, so
  // none is skipped.
  const layouts = filesNamed("layout.tsx");

  it("finds the app's layouts (control)", () => {
    expect(layouts).toContain(path.join(APP, "layout.tsx"));
    expect(layouts).toContain(path.join(APP, "pantry", "layout.tsx"));
  });

  it.each(layouts.map((file) => [path.relative(APP, file)]))(
    "%s: a canonical here serves only its own page",
    async (relative) => {
      const layout = path.join(APP, relative);
      const { set, value } = alternatesOf(await metadataOf(layout, {}));
      const canonical = set && typeof value === "object" && value !== null ? Reflect.get(value, "canonical") : undefined;
      if (canonical === undefined || canonical === null) return;

      // Every page under this layout inherits its canonical unless it sets its
      // own. Only the segment's own page may rely on it; anything deeper means
      // the canonical belongs on that page (see recipes/page.tsx).
      const dir = path.dirname(layout);
      const inherited = filesNamed("page.tsx", dir).filter((page) => path.dirname(page) !== dir);
      expect(inherited.map(routeOf)).toEqual([]);
      expect(canonical).toBe(routeOf(path.join(dir, "page.tsx")));
    },
  );
});
