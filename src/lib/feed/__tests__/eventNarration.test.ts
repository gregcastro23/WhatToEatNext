import { narrateFeedEvent } from "@/lib/feed/eventNarration";

describe("narrateFeedEvent", () => {
  it("narrates completed weekly menu events from planetary agents", () => {
    const narration = narrateFeedEvent("weekly_menu", {
      menuTitle: "Saturnine Hearth Week",
      weekStartDate: "2026-06-01T00:00:00.000Z",
      mealCount: 21,
      summary: "A steady earth-forward weekly menu",
    });

    expect(narration.icon).toBe("📅");
    expect(narration.action).toContain("completed Saturnine Hearth Week");
    expect(narration.action).toContain("week of Jun 1, 2026");
    expect(narration.action).toContain("21 planned meals");
    expect(narration.label).toBe(
      "Weekly menu: A steady earth-forward weekly menu",
    );
  });

  it("narrates prepared (made_it) recipes with correct href linking", () => {
    const narration = narrateFeedEvent("made_it", {
      recipeName: "Lunar Mint Tea",
      recipeId: "tea-12345",
      rating: 5,
    });

    expect(narration.icon).toBe("✅");
    expect(narration.action).toContain("prepared Lunar Mint Tea and gave it 5 stars.");
    expect(narration.label).toBe("Made: Lunar Mint Tea");
    expect(narration.href).toBe("/recipes/tea-12345");
  });
});
