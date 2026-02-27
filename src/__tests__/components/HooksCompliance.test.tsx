/**
 * Tests to verify React Rules of Hooks compliance in components
 * that previously had try-catch wrapping hook calls (the primary crash cause).
 *
 * These tests ensure the components render without crashing when:
 * 1. Inside the AlchemicalProvider (normal case)
 * 2. The alchemical context returns default values
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import { AlchemicalProvider } from "@/contexts/AlchemicalContext/provider";

// Mock the cooking method data to avoid importing large data files
jest.mock("@/data/cooking/methods", () => ({
  dryCookingMethods: {
    grilling: {
      name: "Grilling",
      description: "Direct heat cooking",
      elementalEffect: { Fire: 0.8, Water: 0.1, Earth: 0.05, Air: 0.05 },
      esmsEffect: { Spirit: 1, Essence: 0, Matter: 0, Substance: 0 },
    },
  },
  wetCookingMethods: {},
  molecularCookingMethods: {},
  traditionalCookingMethods: {},
  transformationMethods: {},
}));

// Mock planetaryAlchemyMapping
jest.mock("@/utils/planetaryAlchemyMapping", () => ({
  calculateAlchemicalFromPlanets: () => ({
    Spirit: 4,
    Essence: 5,
    Matter: 6,
    Substance: 3,
  }),
}));

// Mock alchemicalPillarUtils
jest.mock("@/utils/alchemicalPillarUtils", () => ({
  getCookingMethodPillar: () => null,
}));

// Mock alchemicalPillars
jest.mock("@/constants/alchemicalPillars", () => ({
  getCookingMethodThermodynamics: () => ({
    heat: 0.5,
    entropy: 0.3,
    reactivity: 0.4,
  }),
  ALCHEMICAL_PILLARS: [],
  calculateOptimalCookingConditions: () => ({ temperature: 200, duration: 30 }),
  calculatePillarMonicaModifiers: () => ({ modifier: 1 }),
}));

// Mock gregsEnergy — must return the object shape { gregsEnergy, heat, entropy, reactivity }
jest.mock("@/calculations/gregsEnergy", () => ({
  calculateGregsEnergy: () => ({
    gregsEnergy: 0.5,
    heat: 0.3,
    entropy: 0.2,
    reactivity: 0.4,
  }),
}));

// Mock monicaKalchmCalculations
jest.mock("@/utils/monicaKalchmCalculations", () => ({
  calculateKAlchm: () => 1.0,
  calculateMonicaConstant: () => 0.8,
}));

// Mock AstrologicalService
jest.mock("@/services/AstrologicalService", () => ({
  AstrologicalService: {
    getInstance: () => ({
      getCurrentState: () => null,
    }),
  },
}));

describe("CookingMethodPreview — hooks compliance", () => {
  it("renders without crashing inside AlchemicalProvider", async () => {
    // Dynamic import to ensure mocks are in place
    const { default: CookingMethodPreview } = await import(
      "@/components/home/CookingMethodPreview"
    );

    const { container } = render(
      <AlchemicalProvider>
        <CookingMethodPreview />
      </AlchemicalProvider>
    );

    // Component should render without throwing Rules of Hooks error
    expect(container).toBeTruthy();
  });

  it("does not wrap useAlchemical in try-catch", async () => {
    // Read the component source to verify the fix
    const fs = require("fs");
    const path = require("path");
    const source = fs.readFileSync(
      path.join(process.cwd(), "src/components/home/CookingMethodPreview.tsx"),
      "utf8"
    );

    // The old crashing pattern — must NOT exist
    expect(source).not.toMatch(/try\s*\{[\s\S]*?useAlchemical\(\)[\s\S]*?\}\s*catch/);
  });
});

describe("EnhancedCookingMethodRecommender — hooks compliance", () => {
  it("does not wrap useAlchemical in try-catch", async () => {
    const fs = require("fs");
    const path = require("path");
    const source = fs.readFileSync(
      path.join(
        process.cwd(),
        "src/components/recommendations/EnhancedCookingMethodRecommender.tsx"
      ),
      "utf8"
    );

    // The old crashing pattern — must NOT exist
    expect(source).not.toMatch(/try\s*\{[\s\S]*?useAlchemical\(\)[\s\S]*?\}\s*catch/);
  });
});
