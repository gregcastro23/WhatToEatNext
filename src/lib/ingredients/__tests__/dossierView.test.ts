import { buildSensoryAxes, buildYieldCurve, skyMatch } from "@/components/ingredients/dossier/dossierCharts";
import { dominantElement, titleCase, toDossierCard } from "../dossierView";

describe("toDossierCard", () => {
  it("keeps only fields with the shape the page draws", () => {
    const card = toDossierCard(
      {
        name: "spinach",
        category: "vegetable",
        seasonality: "spring, autumn",
        elementalProperties: { Fire: 0.1, Water: 0.4, Earth: 0.3, Air: 0.2 },
        flavorProfile: { bitter: 0.4, sweet: "x" },
        pairingRecommendations: { complementary: ["garlic", 3, "lemon"] },
        astrologicalProfile: { rulingPlanets: ["Venus"] },
        image_url: "",
      },
      "fallback",
    );
    expect(card).toMatchObject({
      name: "spinach",
      seasons: ["spring", "autumn"],
      flavorProfile: { bitter: 0.4 },
      pairings: ["garlic", "lemon"],
      planetaryRuler: "Venus",
      imageUrl: null,
      description: null,
    });
    expect(dominantElement(card.elemental)).toEqual({ key: "water", value: 0.4 });
  });

  it("an incomplete elemental vector is no vector", () => {
    expect(toDossierCard({ elementalProperties: { Fire: 1 } }, "x").elemental).toBeNull();
  });

  it("falls back to `season` and a pairing list", () => {
    const card = toDossierCard({ season: ["all"], pairingRecommendations: ["salt"] }, "salt");
    expect(card).toMatchObject({ name: "salt", category: "ingredient", seasons: ["all"], pairings: ["salt"] });
  });
});

describe("dossier charts", () => {
  it("year-round is every month; a season lights its months and shoulders", () => {
    expect(buildYieldCurve(["all"])).toEqual(new Array(12).fill(1));
    expect(buildYieldCurve(["summer"])).toEqual([0, 0, 0, 0, 0.45, 1, 1, 1, 0.45, 0, 0, 0]);
    expect(buildYieldCurve([])).toEqual(new Array(12).fill(0));
  });

  it("sensory axes clamp to [0, 1] and default to 0", () => {
    expect(buildSensoryAxes({ sweet: 2, SOUR: 0.5 }).slice(0, 3)).toEqual([
      { label: "sweet", value: 1 },
      { label: "salt", value: 0 },
      { label: "sour", value: 0.5 },
    ]);
  });

  it("sky match reads the hour ruler's element", () => {
    const shares = { Fire: 0.1, Water: 0.6, Earth: 0.2, Air: 0.1 };
    expect(skyMatch(shares, "Moon")).toEqual({ hourElement: "Water", score: 0.6 });
    expect(skyMatch(shares, null)).toEqual({ hourElement: "Fire", score: 0.1 });
  });
});

describe("titleCase", () => {
  it.each([
    ["black pepper", "Black Pepper"],
    ["Egg White (albumen)", "Egg White (Albumen)"],
    ["crème fraîche", "Crème Fraîche"],
  ])("%s → %s", (input, output) => {
    expect(titleCase(input)).toBe(output);
  });
});
