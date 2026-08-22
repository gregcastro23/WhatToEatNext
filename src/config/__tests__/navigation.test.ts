/**
 * @jest-environment node
 *
 * Navigation IA tests.
 *
 * Guards two generations of IA change:
 *  - PR 6 §5: the Tables relabel + the activePrimaryFromPathname cluster
 *    additions (/tables, /t/), and that the internal PrimaryKey stays
 *    "commensal" so downstream consumers don't ripple.
 *  - The Lab split: one conflated `lab` section became `kitchenLab` +
 *    `celestialLab`, every legacy lab path still resolves, and each lab leaf
 *    declares the computational system it runs.
 */

import {
  activePrimaryFromPathname,
  getAllNavRoutes,
  LEGACY_LAB_REDIRECTS,
  NAV_IA,
  PRIMARY_KEYS,
  systemFromPathname,
} from "@/config/navigation";
import type { NavIA } from "@/config/navigation";

describe("NAV_IA — Tables relabel keeps the commensal PrimaryKey", () => {
  it("relabels the commensal section to Tables at /tables", () => {
    expect(NAV_IA.commensal.label).toBe("Tables");
    expect(NAV_IA.commensal.path).toBe("/tables");
    expect(NAV_IA.commensal.sub).toMatch(/break bread/i);
  });

  it("lists Tables Home, Discover Tables & People, and keeps the legacy Dinner Party + Restaurant Creator", () => {
    const paths = NAV_IA.commensal.routes.map((r) => r.path);
    expect(paths).toContain("/tables");
    expect(paths).toContain("/discover?tab=tables");
    expect(paths).toContain("/commensal"); // legacy Dinner Party
    expect(paths).toContain("/feed");
    expect(paths).toContain("/restaurant-creator");
  });

  it("still exposes the section through the command-palette flat catalog", () => {
    const routes = getAllNavRoutes();
    expect(routes.some((r) => r.kind === "section" && r.label === "Tables")).toBe(true);
    expect(routes.some((r) => r.path === "/discover?tab=tables")).toBe(true);
  });
});

describe("NAV_IA — the Lab split", () => {
  it("replaces the single lab section with two subject-scoped labs", () => {
    expect(PRIMARY_KEYS).toContain("kitchenLab");
    expect(PRIMARY_KEYS).toContain("celestialLab");
    // The conflated section is gone, not merely relabeled.
    expect(PRIMARY_KEYS).not.toContain("lab");
    expect(NAV_IA).not.toHaveProperty("lab");
  });

  it("roots each lab at its own top-level path", () => {
    expect(NAV_IA.kitchenLab.label).toBe("Kitchen Lab");
    expect(NAV_IA.kitchenLab.path).toBe("/kitchen-lab");
    expect(NAV_IA.celestialLab.label).toBe("Celestial Lab");
    expect(NAV_IA.celestialLab.path).toBe("/celestial-lab");
  });

  it("gives each lab a real-physics subpage and an alchm subpage", () => {
    for (const key of ["kitchenLab", "celestialLab"] as const) {
      const systems = NAV_IA[key].routes.map((r) => r.system).filter(Boolean);
      expect(systems).toContain("real");
      expect(systems).toContain("alchm");
    }
    expect(NAV_IA.kitchenLab.routes.map((r) => r.path)).toContain("/kitchen-lab/physics");
    expect(NAV_IA.kitchenLab.routes.map((r) => r.path)).toContain("/kitchen-lab/alchm");
    expect(NAV_IA.celestialLab.routes.map((r) => r.path)).toContain("/celestial-lab/mechanics");
    expect(NAV_IA.celestialLab.routes.map((r) => r.path)).toContain("/celestial-lab/alchm");
  });

  it("declares a system on every lab leaf except the overviews", () => {
    for (const key of ["kitchenLab", "celestialLab"] as const) {
      for (const route of NAV_IA[key].routes) {
        // The overview is the one page that legitimately shows both models,
        // so it is the one page with no badge.
        const isOverview = route.path === NAV_IA[key].path;
        if (isOverview) {
          expect(route.system).toBeUndefined();
        } else {
          expect(route.system).toBeDefined();
        }
      }
    }
  });

  it("never marks a lab leaf as both systems", () => {
    // ComputationalSystem has no "mixed" member on purpose. This asserts the
    // runtime data agrees with the type, which a cast could otherwise defeat.
    const all = [...NAV_IA.kitchenLab.routes, ...NAV_IA.celestialLab.routes];
    for (const route of all) {
      if (route.system) expect(["real", "alchm"]).toContain(route.system);
    }
  });
});

describe("LEGACY_LAB_REDIRECTS", () => {
  it("covers every path that left the old lab section", () => {
    // These are the eight routes the pre-split `lab` section listed. Six moved;
    // /grimoire and /vault kept their paths and only changed section, so they
    // are deliberately absent from the redirect table.
    expect(Object.keys(LEGACY_LAB_REDIRECTS).sort()).toEqual(
      [
        "/birth-chart",
        "/current-chart",
        "/lab",
        "/lab-book",
        "/planetary-chart",
        "/quantities",
      ].sort(),
    );
  });

  it("points every legacy path at a destination the nav actually lists", () => {
    // A redirect to a path no nav surface knows about is a route that exists
    // only for people holding an old bookmark — the exact way a page rots.
    const known = new Set(getAllNavRoutes().map((r) => r.path));
    for (const [from, to] of Object.entries(LEGACY_LAB_REDIRECTS)) {
      expect(known.has(to)).toBe(true);
      expect(to).not.toBe(from);
    }
  });

  it("never redirects to another redirect source", () => {
    // A → B → C chains cost an extra round trip and break the moment the
    // middle hop is deleted.
    for (const to of Object.values(LEGACY_LAB_REDIRECTS)) {
      expect(LEGACY_LAB_REDIRECTS[to]).toBeUndefined();
    }
  });
});

describe("activePrimaryFromPathname", () => {
  const cases: Array<[string, string]> = [
    ["/", "kitchen"],
    ["/tables", "commensal"],
    ["/tables/9f3a", "commensal"],
    ["/t/abc123", "commensal"],
    ["/commensal", "commensal"],
    ["/feed", "commensal"],
    ["/restaurant-creator", "commensal"],
    ["/discover", "discover"],
    ["/cuisines", "discover"],
    ["/restaurants", "discover"],
    ["/menu-planner", "plan"],
    ["/pantry", "plan"],
    // Kitchen Lab
    ["/kitchen-lab", "kitchenLab"],
    ["/kitchen-lab/physics", "kitchenLab"],
    ["/kitchen-lab/alchm", "kitchenLab"],
    ["/grimoire", "kitchenLab"],
    // Celestial Lab
    ["/celestial-lab", "celestialLab"],
    ["/celestial-lab/mechanics", "celestialLab"],
    ["/celestial-lab/standing-chart", "celestialLab"],
    ["/vault", "celestialLab"],
    // Legacy paths still highlight the section that now owns them.
    ["/lab", "kitchenLab"],
    ["/lab-book", "kitchenLab"],
    ["/birth-chart", "celestialLab"],
    ["/planetary-chart", "celestialLab"],
    ["/current-chart", "celestialLab"],
    ["/quantities", "celestialLab"],
  ];

  it.each(cases)("maps %s → %s", (pathname, expected) => {
    expect(activePrimaryFromPathname(pathname)).toBe(expected);
  });

  it("does not confuse /tilt or other /t* routes with the /t/ token cluster", () => {
    // /cooking-methods/tilt-skillet must stay in discover, not commensal.
    expect(activePrimaryFromPathname("/cooking-methods/tilt-skillet")).toBe("discover");
  });

  it("keeps /lab-book distinct from /lab", () => {
    // Both currently resolve to kitchenLab, so equality alone proves nothing.
    // Pin them separately: if either moves, this fails instead of silently
    // letting startsWith("/lab") swallow /lab-book.
    expect(activePrimaryFromPathname("/lab-book")).toBe("kitchenLab");
    expect(activePrimaryFromPathname("/lab")).toBe("kitchenLab");
    expect(LEGACY_LAB_REDIRECTS["/lab-book"]).toBe("/kitchen-lab/lab-book");
    expect(LEGACY_LAB_REDIRECTS["/lab"]).toBe("/kitchen-lab");
  });

  it("falls back to kitchen for unknown routes", () => {
    expect(activePrimaryFromPathname("/totally-unknown")).toBe("kitchen");
    expect(activePrimaryFromPathname(null)).toBe("kitchen");
  });
});

describe("systemFromPathname", () => {
  it("reports the system for each lab leaf", () => {
    expect(systemFromPathname("/kitchen-lab/physics")).toBe("real");
    expect(systemFromPathname("/kitchen-lab/alchm")).toBe("alchm");
    expect(systemFromPathname("/celestial-lab/mechanics")).toBe("real");
    expect(systemFromPathname("/celestial-lab/alchm")).toBe("alchm");
  });

  it("prefers the longest match when two system-bearing routes collide", () => {
    // Against the real NAV_IA this tie-break is UNREACHABLE: the overviews
    // carry no `system` and are skipped, so at most one route ever matches.
    // Asserting on NAV_IA here passes even with the tie-break deleted —
    // confirmed by mutating it to first-match and watching every assertion
    // stay green. So inject an IA where the collision genuinely exists.
    const colliding: NavIA = {
      ...NAV_IA,
      kitchenLab: {
        ...NAV_IA.kitchenLab,
        routes: [
          // Ancestor listed FIRST and declaring a system: a first-match scan
          // returns "alchm" here and mislabels the nested real-physics page.
          { label: "Ancestor", path: "/kitchen-lab", glyph: "flask", hint: "", system: "alchm" },
          { label: "Nested", path: "/kitchen-lab/physics", glyph: "flask", hint: "", system: "real" },
        ],
      },
    };

    expect(systemFromPathname("/kitchen-lab/physics", colliding)).toBe("real");
    // ...and the ancestor still wins for its own path.
    expect(systemFromPathname("/kitchen-lab", colliding)).toBe("alchm");
  });

  it("is order-independent within a section", () => {
    // Same collision, routes declared in the opposite order. If the result
    // changes, the function depends on array order rather than path length.
    const reversed: NavIA = {
      ...NAV_IA,
      kitchenLab: {
        ...NAV_IA.kitchenLab,
        routes: [
          { label: "Nested", path: "/kitchen-lab/physics", glyph: "flask", hint: "", system: "real" },
          { label: "Ancestor", path: "/kitchen-lab", glyph: "flask", hint: "", system: "alchm" },
        ],
      },
    };
    expect(systemFromPathname("/kitchen-lab/physics", reversed)).toBe("real");
  });

  it("matches nested paths under a leaf", () => {
    expect(systemFromPathname("/kitchen-lab/physics/latent-heat")).toBe("real");
  });

  it("does not match a sibling that merely shares a prefix", () => {
    // "/kitchen-lab/physics-notes" must NOT inherit the physics badge.
    expect(systemFromPathname("/kitchen-lab/physics-notes")).toBeNull();
  });

  it("returns null for overviews and non-lab routes", () => {
    expect(systemFromPathname("/kitchen-lab")).toBeNull();
    expect(systemFromPathname("/celestial-lab")).toBeNull();
    expect(systemFromPathname("/cuisines")).toBeNull();
    expect(systemFromPathname(null)).toBeNull();
  });
});
