import {
  extractIngredients,
  extractTechniquesAndTextures,
  calculateDishElementalProfile,
  detectDietaryTags,
  alchemizeRawItems,
} from "../restaurantMenuAlchemyService";

describe("restaurantMenuAlchemyService", () => {
  it("extracts culinary ingredients accurately from dish titles and descriptions", () => {
    const dishName = "Truffle Tagliolini";
    const description = "House-made egg tagliolini ribbons tossed in mountain butter, cracked tellicherry pepper, and shaved black winter truffles.";

    const ingredients = extractIngredients(dishName, description);
    expect(ingredients).toContain("Black Truffle");
    expect(ingredients).toContain("Tellicherry Pepper");
    expect(ingredients).toContain("Egg Tagliolini");
    expect(ingredients).toContain("Mountain Butter");
  });

  it("extracts cooking techniques and textural descriptors", () => {
    const dishName = "Wood-Fired Margherita";
    const description = "72-hour fermented sourdough crust charred over oak embers with velvety buffalo mozzarella.";

    const { techniques, textures } = extractTechniquesAndTextures(dishName, description);
    expect(techniques).toContain("Wood-Fired");
    expect(techniques).toContain("Charred");
    expect(techniques).toContain("Fermented");
    expect(textures).toContain("Velvety");
  });

  it("calculates elemental constitutional breakdown and dominant element", () => {
    const fireDish = calculateDishElementalProfile(
      "Wood-Grilled Carne Asada",
      "Prime flank steak seared over oak embers with charred habanero salsa verde.",
      ["Charred Habanero", "Prime Flank Steak"],
    );

    expect(fireDish.dominant).toBe("Fire");
    expect(fireDish.profile.Fire).toBeGreaterThan(fireDish.profile.Water);

    const waterDish = calculateDishElementalProfile(
      "Wild Branzino Crudo",
      "Thinly sliced sea bass in chilled citrus dashi with meyer lemon and fresh herbs.",
      ["Branzino", "Meyer Lemon"],
    );

    expect(waterDish.dominant).toBe("Water");
    expect(waterDish.profile.Water).toBeGreaterThan(waterDish.profile.Fire);
  });

  it("detects dietary and allergen classifications correctly", () => {
    const veganDish = detectDietaryTags(
      "Wild Mushroom & Poblano Enchiladas",
      "Roasted mushrooms and poblano rolled in corn tortillas with mole verde.",
      ["Wild Mushrooms", "Poblano Chili", "Heirloom Corn Tortillas"],
    );

    expect(veganDish).toContain("Vegan");
    expect(veganDish).toContain("Gluten-Free");

    const meatDish = detectDietaryTags(
      "Wagyu Short Rib",
      "Braised prime wagyu short rib.",
      ["Wagyu Beef"],
    );
    expect(meatDish).toContain("High-Protein");
    expect(meatDish).not.toContain("Vegan");
  });

  it("alchemizes an entire menu with aggregate signature and top ingredients", () => {
    const rawItems = [
      {
        name: "Black Garlic Tonkotsu Ramen",
        category: "Ramen",
        description: "24-hour pork bone broth enriched with roasted black garlic mayu and house noodles.",
        price: "$21.00",
      },
      {
        name: "Yuzu Shio Clear Dashi Ramen",
        category: "Ramen",
        description: "Clarified dual-dashi with Japanese yuzu citrus.",
        price: "$20.00",
      },
    ];

    const result = alchemizeRawItems(rawItems, "Celestial Sanctuary");

    expect(result.dishes).toHaveLength(2);
    const [firstDish] = result.dishes;
    expect(firstDish?.dominantElement).toBe("Water");
    expect(result.elementalSignature.dominant).toBe("Water");
    expect(result.topIngredients.length).toBeGreaterThan(0);
    expect(result.summary.dishCount).toBe(2);
  });
});
