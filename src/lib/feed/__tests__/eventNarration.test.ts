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
});
