import { getPlanetaryResonanceFeed } from "../planetaryResonanceService";

describe("getPlanetaryResonanceFeed", () => {
  const AT = new Date("2026-06-05T12:00:00.000Z");

  it("returns well-formed resonance items for the classical planets", () => {
    const items = getPlanetaryResonanceFeed(AT);
    expect(items.length).toBeGreaterThanOrEqual(6);
    expect(items.length).toBeLessThanOrEqual(7);
    for (const item of items) {
      expect(item.type).toBe("planetary_resonance");
      expect(["Fire", "Water", "Earth", "Air"]).toContain(item.element);
      expect(item.action.length).toBeGreaterThan(0);
      expect(item.icon.length).toBeGreaterThan(0);
      expect(item.agentName).toMatch(/Agent$/);
    }
  });

  it("maps Moon → Water/soups and Mercury → Air/salads", () => {
    const items = getPlanetaryResonanceFeed(AT);
    const moon = items.find((i) => i.planet === "Moon");
    const mercury = items.find((i) => i.planet === "Mercury");
    expect(moon?.element).toBe("Water");
    expect(moon?.domain.toLowerCase()).toContain("soup");
    expect(mercury?.element).toBe("Air");
    expect(mercury?.domain.toLowerCase()).toContain("salad");
  });

  it("is deterministic for a fixed instant", () => {
    const a = getPlanetaryResonanceFeed(AT);
    const b = getPlanetaryResonanceFeed(AT);
    expect(a.map((i) => i.action)).toEqual(b.map((i) => i.action));
  });
});
