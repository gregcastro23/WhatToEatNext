/**
 * @jest-environment node
 *
 * Navigation IA tests (PR 6 §5). Guards the Tables relabel + the
 * activePrimaryFromPathname cluster additions (/tables, /t/), and confirms the
 * internal PrimaryKey stays "commensal" so downstream consumers don't ripple.
 */

import {
  activePrimaryFromPathname,
  getAllNavRoutes,
  NAV_IA,
} from "@/config/navigation";

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
    ["/lab", "lab"],
    ["/profile", "lab"],
    ["/birth-chart", "lab"],
  ];

  it.each(cases)("maps %s → %s", (pathname, expected) => {
    expect(activePrimaryFromPathname(pathname)).toBe(expected);
  });

  it("does not confuse /tilt or other /t* routes with the /t/ token cluster", () => {
    // /cooking-methods/tilt-skillet must stay in discover, not commensal.
    expect(activePrimaryFromPathname("/cooking-methods/tilt-skillet")).toBe("discover");
  });

  it("falls back to kitchen for unknown routes", () => {
    expect(activePrimaryFromPathname("/totally-unknown")).toBe("kitchen");
    expect(activePrimaryFromPathname(null)).toBe("kitchen");
  });
});
