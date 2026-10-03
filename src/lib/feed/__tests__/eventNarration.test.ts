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

  it("narrates cart handoff events to Amazon Fresh", () => {
    const narration = narrateFeedEvent("cart_handoff", {
      itemCount: 8,
      provider: "Amazon Fresh",
    });

    expect(narration.icon).toBe("🛒");
    expect(narration.action).toContain("transferred their culinary pantry cart to Amazon Fresh with 8 ingredients.");
    expect(narration.label).toBe("Cart Handoff · Amazon Fresh");
  });

  it("narrates voice audio walkthrough events with audio URLs", () => {
    const narration = narrateFeedEvent("agent_audio_narration", {
      recipeName: "Solar Saffron Elixir",
      audioUrl: "https://assets.alchm.kitchen/audio/solar_saffron.mp3",
    });

    expect(narration.icon).toBe("🎙️");
    expect(narration.action).toContain("narrated an alchemical walkthrough for Solar Saffron Elixir");
    expect(narration.label).toBe("Voice Walkthrough · Solar Saffron Elixir");
    expect(narration.href).toBe("https://assets.alchm.kitchen/audio/solar_saffron.mp3");
  });
  it("narrates an open Transmutation Circle offer, flagging a generous edge", () => {
    const narration = narrateFeedEvent("transmutation_offer", {
      giveToken: "Spirit",
      giveAmount: 4,
      wantToken: "Essence",
      wantAmount: 2.9091,
      takerEdgePct: 10,
    });
    expect(narration.icon).toBe("⚗️");
    expect(narration.action).toBe(
      "is offering 4 Spirit for 2.9091 Essence in the Transmutation Circle — 10% better than a swap.",
    );
    expect(narration.label).toBe("Offer · 4 Spirit for 2.9091 Essence");
    expect(narration.href).toBe("/feed?tab=transmute");
  });

  it("narrates a completed trade with the partner's shared name", () => {
    const narration = narrateFeedEvent("transmutation_trade", {
      gaveToken: "Essence",
      gaveAmount: 3.2,
      receivedToken: "Spirit",
      receivedAmount: 4,
      partnerName: "Ada",
    });
    expect(narration.icon).toBe("🤝");
    expect(narration.action).toBe("transmuted 3.2 Essence for 4 Spirit with Ada.");
    expect(narration.label).toBe("Trade · 3.2 Essence ⇄ 4 Spirit");
  });

  it("degrades gracefully when trade metadata is missing", () => {
    expect(narrateFeedEvent("transmutation_trade", {}).action).toBe(
      "completed a transmutation with a fellow alchemist.",
    );
    expect(narrateFeedEvent("transmutation_offer", null).action).toBe(
      "opened an offer in the Transmutation Circle.",
    );
  });
});
