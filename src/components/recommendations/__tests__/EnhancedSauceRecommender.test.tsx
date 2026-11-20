/**
 * Component regression tests for EnhancedSauceRecommender.
 * Verifies the 15-tradition cuisine selector is never blank, switching traditions
 * updates telemetry/regions/results immediately, and search + dossier expand work.
 */
import { readFileSync } from "fs";
import { join } from "path";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import React from "react";
import { _resetSauceCatalogueCacheForTests } from "@/hooks/useSauceCatalogue";
import EnhancedSauceRecommender from "../EnhancedSauceRecommender";

jest.mock("@/contexts/AlchemicalContext/hooks", () => ({
  useAlchemical: () => ({
    isDaytime: true,
    planetaryHour: "Jupiter",
    lunarPhase: "waxing gibbous",
  }),
}));

jest.mock("@/hooks/useAstrologicalState", () => ({
  useAstrologicalState: () => ({
    currentZodiac: "Leo",
    currentPlanetaryAlignment: {},
    lunarPhase: "waxing gibbous",
    activePlanets: ["Jupiter"],
    domElements: { Fire: 0.4, Water: 0.2, Earth: 0.2, Air: 0.2 },
    loading: false,
    isReady: true,
    isDaytime: true,
    renderCount: 1,
    currentPlanetaryHour: "Jupiter",
  }),
}));

jest.mock("@/hooks/useCurrentSeason", () => ({
  useCurrentSeason: () => "autumn",
}));

jest.mock("@/hooks/useUserElementalBias", () => ({
  useUserElementalBias: () => ({
    hydrated: true,
    table: [],
    chartOn: false,
    chartSunGlyph: null,
    composite: null,
    bias: null,
    source: null,
    tableSize: 0,
  }),
}));

jest.mock("@/hooks/usePantry", () => ({
  usePantry: () => ({
    items: [{ id: "p-1", name: "Olive Oil", category: "oils", addedDate: new Date() }],
    stats: { totalItems: 1, expiringIn7Days: 0, expired: 0, categoryCounts: { oils: 1 } },
    isLoaded: true,
    hasItem: (n: string) => n.toLowerCase() === "olive oil",
    addItem: jest.fn(),
    removeItem: jest.fn(),
    updateItem: jest.fn(),
    clear: jest.fn(),
    refresh: jest.fn(),
  }),
}));

const CATALOGUE_PATH = join(__dirname, "..", "..", "..", "..", "public", "data", "sauce-catalogue.json");
const CATALOGUE_BODY = readFileSync(CATALOGUE_PATH, "utf8");
const originalFetch = globalThis.fetch;

beforeEach(() => {
  _resetSauceCatalogueCacheForTests();
  globalThis.fetch = (): Promise<Response> =>
    Promise.resolve(
      new Response(CATALOGUE_BODY, {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
});

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe("EnhancedSauceRecommender", () => {
  it("populates all 15 traditions and switches cuisines, regions, search, and dossier cleanly", async () => {
    render(<EnhancedSauceRecommender />);

    expect(screen.getByText("15 Traditions")).toBeInTheDocument();
    const cuisineSelect = screen.getByLabelText(/Cuisine Culture/i);
    expect(cuisineSelect.querySelectorAll("option")).toHaveLength(15);

    // Wait for /data/sauce-catalogue.json hydration to load native sauces & regions
    await waitFor(() => {
      expect(screen.getByLabelText(/Regional Dialect/i)).toBeInTheDocument();
    });

    // Switch from Italian to French
    fireEvent.change(cuisineSelect, { target: { value: "French" } });
    expect(screen.getByText("French Tradition")).toBeInTheDocument();
    expect(screen.getByText("Béchamel")).toBeInTheDocument();

    // Switch to Indian and confirm Indian-native sauces appear
    fireEvent.change(cuisineSelect, { target: { value: "Indian" } });
    expect(screen.getByText("Indian Tradition")).toBeInTheDocument();
    expect(screen.getByText(/Pan-Indian Tradition/i)).toBeInTheDocument();

    // Filter results via search landmark
    const searchInput = screen.getByPlaceholderText(/Filter sauces by name/i);
    fireEvent.change(searchInput, { target: { value: "tikka" } });
    expect(screen.getByText("Tikka Masala")).toBeInTheDocument();

    // Expand traditional dossier drawer
    const expandBtn = screen.getByRole("button", { name: /View Traditional Dossier/i });
    expect(expandBtn).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(expandBtn);
    expect(expandBtn).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText(/Culinary Uses/i)).toBeInTheDocument();
  });

  it("falls back cleanly from unknown initialCuisine, supports origin tabs, and clamps + resets batch scaler", async () => {
    render(<EnhancedSauceRecommender initialCuisine="unknown" />);

    const cuisineSelect = screen.getByLabelText(/Cuisine Culture/i);
    expect(cuisineSelect).toHaveValue("Italian");
    expect(screen.getByText("Italian Tradition")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Besciamella")).toBeInTheDocument();
    });

    const originGroup = screen.getByRole("group", { name: /Filter sauce origin/i });
    expect(within(originGroup).getByRole("button", { name: /^All/i })).toHaveAttribute("aria-pressed", "true");
    expect(within(originGroup).getByRole("button", { name: /^Native/i })).toBeInTheDocument();
    expect(within(originGroup).getByRole("button", { name: /^Mother/i })).toBeInTheDocument();
    expect(within(originGroup).getByRole("button", { name: /^Traditional/i })).toBeInTheDocument();

    const globalTab = within(originGroup).getByRole("button", { name: /^Global/i });
    fireEvent.click(globalTab);
    expect(globalTab).toHaveAttribute("aria-pressed", "true");
    expect(screen.queryByText("Besciamella")).not.toBeInTheDocument();

    fireEvent.click(within(originGroup).getByRole("button", { name: /^Mother/i }));
    expect(screen.getByText("Besciamella")).toBeInTheDocument();

    const expandBtns = screen.getAllByRole("button", { name: /View Recipe & Scaler/i });
    fireEvent.click(expandBtns[0]);
    expect(screen.getByText("2 cups")).toBeInTheDocument();

    const decBtn = screen.getByRole("button", { name: /Decrease batch scale/i });
    const incBtn = screen.getByRole("button", { name: /Increase batch scale/i });
    fireEvent.click(decBtn);
    expect(screen.getByText("1 cup")).toBeInTheDocument();
    expect(decBtn).toBeDisabled();

    for (let i = 0; i < 8; i += 1) fireEvent.click(incBtn);
    expect(screen.getByText("8 cups")).toBeInTheDocument();
    expect(incBtn).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: /Reset batch scale to 1x/i }));
    expect(screen.getByText("2 cups")).toBeInTheDocument();
  });
});
