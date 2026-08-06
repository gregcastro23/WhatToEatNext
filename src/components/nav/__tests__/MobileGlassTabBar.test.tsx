/**
 * @jest-environment jsdom
 *
 * MobileGlassTabBar — 5-tab bar (PR 6 §5).
 *
 * Two guards live here:
 *  1. The original adversarial-review finding: Tables and Profile rendered the
 *     same glyph ("ring"), making two adjacent slots visually identical. The
 *     distinct-glyph assertion generalises that to all five.
 *  2. The nav-hierarchy restructure: Discover and Tables (cold-start social
 *     surfaces) gave up their slots to the content library. Cuisines and
 *     Ingredients both resolve to activePrimaryFromPathname's "discover" key,
 *     so active state moved to longest-prefix path matching — if that
 *     regressed to key matching, two tabs would light at once.
 */

import { render } from "@testing-library/react";
import { MobileGlassTabBar, activeTabId } from "../MobileGlassTabBar";

jest.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

jest.mock("next-auth/react", () => ({
  useSession: () => ({ status: "unauthenticated" }),
}));

describe("MobileGlassTabBar", () => {
  it("renders exactly 5 tabs with 5 DISTINCT glyphs (no icon collisions)", () => {
    const { container } = render(<MobileGlassTabBar />);
    const links = container.querySelectorAll("nav a");
    expect(links).toHaveLength(5);

    // Each glyph renders as an inline <svg> whose markup differs per icon
    // name (Glyph.tsx switches on name to distinct <path>/<ellipse>/<circle>
    // children) — compare the rendered markup rather than any internal prop.
    const signatures = Array.from(links).map((a) => a.querySelector("svg")?.innerHTML);
    expect(signatures.every(Boolean)).toBe(true);
    expect(new Set(signatures).size).toBe(5);
  });

  it("leads with the content library, not the cold-start social surfaces", () => {
    const { container } = render(<MobileGlassTabBar />);
    const labels = Array.from(container.querySelectorAll("nav a span:last-child")).map(
      (el) => el.textContent,
    );
    expect(labels).toEqual(["Kitchen", "Cuisines", "Ingredients", "Plan", "Profile"]);
  });

  it("gives no slot to /discover or /tables", () => {
    const { container } = render(<MobileGlassTabBar />);
    const hrefs = Array.from(container.querySelectorAll("nav a")).map((a) =>
      a.getAttribute("href"),
    );
    expect(hrefs).not.toContain("/discover");
    expect(hrefs).not.toContain("/tables");
    expect(hrefs).toEqual(
      expect.arrayContaining(["/cuisines", "/ingredients", "/menu-planner"]),
    );
  });
});

describe("activeTabId", () => {
  it("lights exactly one tab for library routes that share a nav key", () => {
    // The whole reason for prefix matching: both of these are "discover"
    // under activePrimaryFromPathname.
    expect(activeTabId("/cuisines")).toBe("cuisines");
    expect(activeTabId("/ingredients")).toBe("ingredients");
    expect(activeTabId("/cuisines")).not.toBe(activeTabId("/ingredients"));
  });

  it("claims child routes for the owning tab", () => {
    expect(activeTabId("/ingredients/saffron")).toBe("ingredients");
    expect(activeTabId("/cuisines/italian")).toBe("cuisines");
    expect(activeTabId("/cooking-methods/braising")).toBe("ingredients");
    expect(activeTabId("/pantry")).toBe("plan");
  });

  it("treats / as exact so Kitchen does not swallow every path", () => {
    expect(activeTabId("/")).toBe("kitchen");
    expect(activeTabId("/cuisines")).not.toBe("kitchen");
  });

  it("returns null for routes that no longer own a slot", () => {
    // Better a bar with nothing lit than a tab falsely claiming the page.
    expect(activeTabId("/discover")).toBeNull();
    expect(activeTabId("/tables")).toBeNull();
    expect(activeTabId("/lab")).toBeNull();
    expect(activeTabId(null)).toBeNull();
  });

  it("matches on path segments, not bare string prefixes", () => {
    // A naive `pathname.startsWith(prefix)` passes every other assertion in
    // this file, because no current route is a string-prefix of another. These
    // probe the boundary directly: each of these shares a prefix with a real
    // match entry but is a different route, so it must NOT be claimed.
    expect(activeTabId("/profiles")).toBeNull(); // vs "/profile"
    expect(activeTabId("/pantry-archive")).toBeNull(); // vs "/pantry"
    expect(activeTabId("/ingredients-legacy")).toBeNull(); // vs "/ingredients"

    // The genuine route and its children still match.
    expect(activeTabId("/profile")).toBe("profile");
    expect(activeTabId("/pantry")).toBe("plan");
    expect(activeTabId("/recipes")).toBe("cuisines");
  });
});
