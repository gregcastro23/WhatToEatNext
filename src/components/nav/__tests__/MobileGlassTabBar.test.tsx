/**
 * @jest-environment jsdom
 *
 * MobileGlassTabBar — 5-tab bar (PR 6 §5). Regression guard for the
 * adversarial-review finding: Tables and Profile rendered the same glyph
 * ("ring") before this fix, making two adjacent bottom-nav slots visually
 * identical.
 */

import { render } from "@testing-library/react";
import { MobileGlassTabBar } from "../MobileGlassTabBar";

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

  it("labels the 5 tabs Kitchen, Discover, Plan, Tables, Profile in order", () => {
    const { container } = render(<MobileGlassTabBar />);
    const labels = Array.from(container.querySelectorAll("nav a span:last-child")).map(
      (el) => el.textContent,
    );
    expect(labels).toEqual(["Kitchen", "Discover", "Plan", "Tables", "Profile"]);
  });

  it("Tables uses a distinct glyph from Profile specifically", () => {
    const { container } = render(<MobileGlassTabBar />);
    const links = Array.from(container.querySelectorAll("nav a"));
    const tablesSvg = links[3].querySelector("svg")?.innerHTML;
    const profileSvg = links[4].querySelector("svg")?.innerHTML;
    expect(tablesSvg).toBeTruthy();
    expect(profileSvg).toBeTruthy();
    expect(tablesSvg).not.toBe(profileSvg);
  });
});
