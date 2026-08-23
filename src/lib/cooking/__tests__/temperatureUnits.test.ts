import {
  celsiusToFahrenheit,
  fahrenheitToCelsius,
  formatCookingTemp,
  formatCookingVolume,
  formatSoluteConcentration,
  explainHeatBottleneck,
  getCarryoverRestGuidance,
} from "../temperatureUnits";

describe("temperatureUnits & culinary synthesizers", () => {
  describe("conversions", () => {
    it("converts freezing, boiling, and oven temperatures accurately", () => {
      expect(celsiusToFahrenheit(0)).toBe(32);
      expect(celsiusToFahrenheit(100)).toBe(212);
      expect(celsiusToFahrenheit(74)).toBeCloseTo(165.2, 1);
      expect(celsiusToFahrenheit(190)).toBe(374);

      expect(fahrenheitToCelsius(32)).toBe(0);
      expect(fahrenheitToCelsius(212)).toBe(100);
      expect(fahrenheitToCelsius(374)).toBe(190);
    });

    it("formats cooking temperatures with appropriate units", () => {
      expect(formatCookingTemp(74, "fahrenheit")).toBe("165°F");
      expect(formatCookingTemp(74, "celsius")).toBe("74°C");
      expect(formatCookingTemp(100, "fahrenheit")).toBe("212°F");
      expect(formatCookingTemp(100, "celsius")).toBe("100°C");
    });
  });

  describe("formatCookingVolume", () => {
    it("converts liters to quarts and cups", () => {
      const vol = formatCookingVolume(1.0);
      expect(vol.primary).toContain("qt");
      expect(vol.secondary).toBe("1.00 L");
      expect(vol.cups).toContain("4.2 cups");
    });
  });

  describe("formatSoluteConcentration", () => {
    it("classifies base broth, demi-glace, and syrup glazes", () => {
      const base = formatSoluteConcentration(1.0);
      expect(base.culinaryStage).toContain("Base Broth");

      const demi = formatSoluteConcentration(2.0);
      expect(demi.culinaryStage).toContain("Demi-Glace");
      expect(demi.flavorImpact).toContain("doubled");

      const glaze = formatSoluteConcentration(4.0);
      expect(glaze.culinaryStage).toContain("Glacé");
    });
  });

  describe("explainHeatBottleneck", () => {
    it("provides human-first culinary takeaways for burner-to-pan links", () => {
      const insight = explainHeatBottleneck("source_vessel", 0.97);
      expect(insight.bottleneckTitle).toContain("97% bottleneck");
      expect(insight.culinaryTip).toContain("Preheat your pan");
    });

    it("provides oil bridge advice for pan-to-food contact links", () => {
      const insight = explainHeatBottleneck("vessel_medium", 0.85);
      expect(insight.culinaryTip).toContain("oil or butter");
    });
  });

  describe("getCarryoverRestGuidance", () => {
    it("computes carryover rise and pull temperature for roast", () => {
      const guidance = getCarryoverRestGuidance(74, 1.2, "slab"); // 74°C = 165°F
      expect(guidance.targetTempF).toBe(165);
      expect(guidance.pullTempF).toBeLessThan(165);
      expect(guidance.carryoverRiseF).toBeGreaterThanOrEqual(5);
      expect(guidance.restAdvice).toContain("Pull from heat");
    });
  });
});
