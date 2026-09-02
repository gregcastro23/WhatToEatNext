// No test-runner import: this repo runs jest, which injects `describe`,
// `it` and `expect` as globals. Importing them from "bun:test" makes the
// whole suite fail to collect ("Cannot find module 'bun:test'"), which is
// how this file went unrun - the same way `authCache.test.ts` did before it.
import { CUISINES_METADATA, getCuisineData } from "@/data/cuisines/index";
import { getAllRecipes } from "@/data/recipes/index";
import { resolveCuisineType } from "@/types/cuisineAliases";

describe("Fusion Cuisine & Chorizo Bolognese Integration", () => {
  it("Fusion is registered in CUISINES_METADATA with valid elemental properties", () => {
    const meta = CUISINES_METADATA.Fusion;
    expect(meta).toBeDefined();
    expect(meta?.name).toBe("Fusion");
    expect(meta?.elementalProperties).toBeDefined();
    const ep = meta!.elementalProperties!;
    const sum = (ep.Fire ?? 0) + (ep.Earth ?? 0) + (ep.Water ?? 0) + (ep.Air ?? 0);
    expect(sum).toBeCloseTo(1.0, 2);
  });

  it("Fusion cuisine resolves through cuisineAliases", () => {
    expect(resolveCuisineType("fusion")).toBe("Fusion");
    expect(resolveCuisineType("asianfusion")).toBe("Fusion");
    expect(resolveCuisineType("latinfusion")).toBe("Fusion");
  });

  it("getCuisineData('Fusion') loads the dishes and includes Chorizo Bolognese", async () => {
    const fusionData = await getCuisineData("Fusion");
    expect(fusionData).toBeDefined();
    expect(fusionData?.dishes).toBeDefined();

    const dinnerDishes = [
      ...(fusionData?.dishes?.dinner?.autumn ?? []),
      ...(fusionData?.dishes?.dinner?.winter ?? []),
      ...(fusionData?.dishes?.dinner?.spring ?? []),
      ...(fusionData?.dishes?.dinner?.summer ?? []),
    ];

    const chorizoDish = dinnerDishes.find((d: any) =>
      (d?.name ?? "").toLowerCase().includes("chorizo bolognese"),
    );
    expect(chorizoDish).toBeDefined();
    expect(chorizoDish?.ingredients?.length).toBeGreaterThan(10);
    expect(chorizoDish?.instructions?.length).toBeGreaterThan(4);
  });

  it("getAllRecipes includes Chorizo Bolognese under Fusion cuisine", async () => {
    const all = await getAllRecipes();
    const chorizo = all.find((r) =>
      (r.name ?? "").toLowerCase().includes("chorizo bolognese"),
    );
    expect(chorizo).toBeDefined();
    expect(chorizo?.cuisine?.toLowerCase()).toBe("fusion");
    expect(chorizo?.elementalProperties).toBeDefined();
  });
});
