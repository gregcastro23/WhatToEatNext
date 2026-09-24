import {
  DEFAULT_THRESHOLDS,
  calculateTrueRouteSizes,
  evaluateRouteSizes,
  getLayoutKeysForPage,
  pageKeyToRoute,
  parseBuildLog,
  routeToPageKey,
} from "../routeSizes.cjs";

describe("routeSizes gate", () => {
  describe("getLayoutKeysForPage", () => {
    it("returns root and route group layouts for /(alchm)/page", () => {
      expect(getLayoutKeysForPage("/(alchm)/page")).toEqual([
        "/layout",
        "/(alchm)/layout",
      ]);
    });

    it("returns root and segment layout for /recipe-builder/page", () => {
      expect(getLayoutKeysForPage("/recipe-builder/page")).toEqual([
        "/layout",
        "/recipe-builder/layout",
      ]);
    });

    it("returns root and all ancestor layouts for nested dynamic routes", () => {
      expect(getLayoutKeysForPage("/recipes/[recipeId]/page")).toEqual([
        "/layout",
        "/recipes/layout",
        "/recipes/[recipeId]/layout",
      ]);
    });

    it("returns full ancestry for nested route groups and segments", () => {
      expect(
        getLayoutKeysForPage("/(alchm)/celestial-lab/standing-chart/page"),
      ).toEqual([
        "/layout",
        "/(alchm)/layout",
        "/(alchm)/celestial-lab/layout",
        "/(alchm)/celestial-lab/standing-chart/layout",
      ]);
    });

    it("returns root layout only for top-level /page", () => {
      expect(getLayoutKeysForPage("/page")).toEqual(["/layout"]);
    });

    it("handles falsy or empty inputs gracefully", () => {
      expect(getLayoutKeysForPage("")).toEqual(["/layout"]);
      // @ts-expect-error testing invalid input
      expect(getLayoutKeysForPage(null)).toEqual(["/layout"]);
    });
  });

  describe("pageKeyToRoute", () => {
    it("strips (alchm) route group to yield root /", () => {
      expect(pageKeyToRoute("/(alchm)/page")).toBe("/");
    });

    it("strips route group for nested pages", () => {
      expect(pageKeyToRoute("/(alchm)/account/page")).toBe("/account");
      expect(pageKeyToRoute("/(alchm)/shop/page")).toBe("/shop");
    });

    it("preserves standard route segments", () => {
      expect(pageKeyToRoute("/recipe-builder/page")).toBe("/recipe-builder");
      expect(pageKeyToRoute("/recipes/[recipeId]/page")).toBe(
        "/recipes/[recipeId]",
      );
      expect(pageKeyToRoute("/ingredients/[slug]/page")).toBe(
        "/ingredients/[slug]",
      );
    });

    it("returns null for non-page keys", () => {
      expect(pageKeyToRoute("/layout")).toBeNull();
      expect(pageKeyToRoute("/(alchm)/layout")).toBeNull();
      expect(pageKeyToRoute("/api/health/route")).toBeNull();
    });
  });

  describe("routeToPageKey", () => {
    const mockPages = {
      "/layout": ["static/chunks/root.js"],
      "/(alchm)/layout": ["static/chunks/alchm.js"],
      "/(alchm)/page": ["static/chunks/home.js"],
      "/recipe-builder/page": ["static/chunks/builder.js"],
    };

    it("resolves route via appPathRoutes mapping if provided", () => {
      const appPathRoutes = {
        "/(alchm)/page": "/",
        "/recipe-builder/page": "/recipe-builder",
      };
      expect(routeToPageKey("/", mockPages, appPathRoutes)).toBe(
        "/(alchm)/page",
      );
    });

    it("falls back to derived route matching when appPathRoutes is absent", () => {
      expect(routeToPageKey("/", mockPages)).toBe("/(alchm)/page");
      expect(routeToPageKey("/recipe-builder", mockPages)).toBe(
        "/recipe-builder/page",
      );
    });

    it("returns null if route does not exist in manifest", () => {
      expect(routeToPageKey("/unknown-route", mockPages)).toBeNull();
    });
  });

  describe("calculateTrueRouteSizes against fixture manifest", () => {
    const fixtureManifest = {
      pages: {
        "/layout": [
          "static/chunks/webpack.js",
          "static/chunks/shared-framework.js",
          "static/chunks/root-header.js",
          "static/css/global.css", // Non-JS should be ignored
        ],
        "/(alchm)/layout": [
          "static/chunks/shared-framework.js", // Shared chunk, must deduplicate
          "static/chunks/alchm-chrome.js",
        ],
        "/(alchm)/page": [
          "static/chunks/shared-framework.js", // Shared chunk, must deduplicate
          "static/chunks/home-page.js",
        ],
        "/recipe-builder/layout": [
          "static/chunks/builder-nav.js",
        ],
        "/recipe-builder/page": [
          "static/chunks/shared-framework.js",
          "static/chunks/builder-canvas.js",
        ],
      },
    };

    // Deterministic mock sizes: each chunk is 10,240 B (10 KiB)
    const mockChunkSize = 10240;
    const mockGetFileSize = jest.fn(() => mockChunkSize);

    beforeEach(() => {
      mockGetFileSize.mockClear();
    });

    it("unions page files and all ancestor layout files with deduplication", () => {
      const results = calculateTrueRouteSizes({
        appBuildManifest: fixtureManifest,
        routes: ["/", "/recipe-builder"],
        getFileGzipSize: mockGetFileSize,
      });

      expect(results).toHaveLength(2);

      const homeResult = results.find((r) => r.route === "/");
      expect(homeResult).toBeDefined();
      expect(homeResult?.found).toBe(true);
      expect(homeResult?.matchedLayoutKeys).toEqual([
        "/layout",
        "/(alchm)/layout",
      ]);

      // Unique JS chunks for /:
      // /layout: webpack.js, shared-framework.js, root-header.js (3)
      // /(alchm)/layout: shared-framework.js (dupe), alchm-chrome.js (1 new)
      // /(alchm)/page: shared-framework.js (dupe), home-page.js (1 new)
      // Total unique JS chunks = 5
      expect(homeResult?.unionFileCount).toBe(5);
      expect(homeResult?.totalBytes).toBe(5 * mockChunkSize);
      expect(homeResult?.totalKb).toBe((5 * mockChunkSize) / 1024);

      // Page-only files: shared-framework.js, home-page.js = 2 chunks
      expect(homeResult?.pageFileCount).toBe(2);
      expect(homeResult?.pageOnlyBytes).toBe(2 * mockChunkSize);

      const builderResult = results.find((r) => r.route === "/recipe-builder");
      expect(builderResult).toBeDefined();
      expect(builderResult?.found).toBe(true);
      expect(builderResult?.matchedLayoutKeys).toEqual([
        "/layout",
        "/recipe-builder/layout",
      ]);

      // Unique JS chunks for /recipe-builder:
      // /layout: webpack.js, shared-framework.js, root-header.js (3)
      // /recipe-builder/layout: builder-nav.js (1 new)
      // /recipe-builder/page: shared-framework.js (dupe), builder-canvas.js (1 new)
      // Total unique JS chunks = 5
      expect(builderResult?.unionFileCount).toBe(5);
      expect(builderResult?.totalBytes).toBe(5 * mockChunkSize);
    });

    it("returns found=false with descriptive error when route is missing", () => {
      const results = calculateTrueRouteSizes({
        appBuildManifest: fixtureManifest,
        routes: ["/non-existent"],
        getFileGzipSize: mockGetFileSize,
      });
      expect(results[0].found).toBe(false);
      expect(results[0].error).toContain("not found in app-build-manifest");
    });
  });

  describe("parseBuildLog", () => {
    it("extracts route and First Load JS from Next 15 build log table", () => {
      const log = `
 Route (app)                                               Size  First Load JS  Revalidate  Expire
┌ ƒ /                                                  27.7 kB         199 kB
├ ○ /menu-planner                                      43.8 kB         289 kB
├ ○ /recipe-builder                                    5.54 kB         184 kB
└ ● /recipes/[recipeId]                                  52 kB         332 kB
+ First Load JS shared by all                           106 kB
      `;
      const parsed = parseBuildLog(log);
      expect(parsed.get("/")).toEqual({ routeKb: 27.7, firstLoadKb: 199 });
      expect(parsed.get("/menu-planner")).toEqual({ routeKb: 43.8, firstLoadKb: 289 });
      expect(parsed.get("/recipe-builder")).toEqual({ routeKb: 5.54, firstLoadKb: 184 });
      expect(parsed.get("/recipes/[recipeId]")).toEqual({ routeKb: 52, firstLoadKb: 332 });
    });
  });

  describe("evaluateRouteSizes", () => {
    const fixtureManifest = {
      pages: {
        "/layout": ["static/chunks/webpack.js", "static/chunks/shared.js"],
        "/(alchm)/layout": ["static/chunks/alchm.js"],
        "/(alchm)/page": ["static/chunks/home.js"],
      },
    };

    const mockGetFileSize = () => 10240; // 10 KiB per chunk

    it("passes when sizes are within thresholds", () => {
      const result = evaluateRouteSizes({
        appBuildManifest: fixtureManifest,
        thresholds: {
          "/": { maxTotalFirstLoadKb: 100 },
        },
        getFileGzipSize: mockGetFileSize,
      });
      expect(result.ok).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.successes).toHaveLength(1);
      expect(result.successes[0]).toContain("within threshold");
    });

    it("fails when route exceeds maxTotalFirstLoadKb", () => {
      const result = evaluateRouteSizes({
        appBuildManifest: fixtureManifest,
        thresholds: {
          "/": { maxTotalFirstLoadKb: 20 }, // 4 chunks * 10 KiB = 40 KiB > 20 KiB
        },
        getFileGzipSize: mockGetFileSize,
      });
      expect(result.ok).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain("exceeded true total first-load threshold");
    });

    it("fails when route exceeds build table thresholds from log", () => {
      const mockLog = `
┌ ƒ /                                                  60.0 kB         250 kB
      `;
      const result = evaluateRouteSizes({
        logContent: mockLog,
        appBuildManifest: fixtureManifest,
        thresholds: {
          "/": { maxRouteKb: 50, maxFirstLoadKb: 220, maxTotalFirstLoadKb: 100 },
        },
        getFileGzipSize: mockGetFileSize,
      });
      expect(result.ok).toBe(false);
      expect(result.errors.some((e) => e.includes("exceeded route size threshold"))).toBe(true);
      expect(result.errors.some((e) => e.includes("exceeded First Load JS threshold"))).toBe(true);
    });

    it("fails when a threshold route is missing from app-build-manifest", () => {
      const result = evaluateRouteSizes({
        appBuildManifest: fixtureManifest,
        thresholds: {
          "/missing-route": { maxTotalFirstLoadKb: 500 },
        },
        getFileGzipSize: mockGetFileSize,
      });
      expect(result.ok).toBe(false);
      expect(result.errors[0]).toContain("Page key for route '/missing-route' not found");
    });
  });

  describe("DEFAULT_THRESHOLDS defensible values", () => {
    it("defines budgets for all 8 key routes with documented basis", () => {
      const routes = [
        "/",
        "/menu-planner",
        "/recipe-builder",
        "/recipe-generator",
        "/recipes/[recipeId]",
        "/shop",
        "/account",
        "/ingredients/[slug]",
      ];
      for (const route of routes) {
        const threshold = DEFAULT_THRESHOLDS[route];
        expect(threshold).toBeDefined();
        expect(threshold.maxTotalFirstLoadKb).toBeGreaterThan(0);
        expect(threshold.maxRouteKb).toBeGreaterThan(0);
        expect(threshold.maxFirstLoadKb).toBeGreaterThan(0);
      }
    });
  });
});
