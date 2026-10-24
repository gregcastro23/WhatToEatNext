import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import type { CraftedAgentProfile } from "@/lib/agents/craftedAgentTypes";
import AgentProfile, { type Balances, type RecentActivity } from "../AgentProfile";

jest.mock("@/components/time-laboratory/planetary-agent-chat", () => {
  return function MockPlanetaryAgentChat() {
    return <div data-testid="mock-agent-chat">Planetary Chat Modal</div>;
  };
});

const mockAgent: CraftedAgentProfile = {
  name: "Leonardo da Vinci",
  title: "Polymath & Alchemical Master",
  era: "Italian Renaissance (1452–1519)",
  appearance: {
    color: "#ef4444",
    symbol: "⚗️",
  },
  consciousness: {
    dominantElement: "Fire",
    level: "Master",
    natalChart: {},
  },
  personality: {
    core: {
      essence: "Perpetual seeker of alchemical wisdom",
      expression: "Living culinary and philosophical mastery",
      emotion: "Serene contemplation",
    },
    voice: {
      tone: "Reflective and visionary",
      greeting: "Greetings, fellow seeker of knowledge.",
      farewell: "May your hearth burn eternal.",
    },
    philosophy: {
      principles: ["Observation precedes theory", "Nature is the supreme master"],
      quotes: ["Simplicity is the ultimate sophistication."],
    },
  },
};

const mockBalances: Balances = {
  spirit: 15,
  essence: 25,
  matter: 10,
  substance: 8,
};

describe("AgentProfile - Recent Culinary Reflections & Activity", () => {
  afterEach(cleanup);

  it("links to saved version URL and renders adaptation badge for recipe_adapted events", () => {
    const activity: RecentActivity[] = [
      {
        id: "evt-1",
        eventType: "recipe_adapted",
        createdAt: new Date().toISOString(),
        metadataPayload: {
          recipeId: "orig-123",
          recipeName: "Chicken Parmigiana",
          versionName: "Leonardo's Vegetarian Chicken Parmigiana (Tofu)",
          versionId: "ver-456",
          versionPath: "/recipes/versions/ver-456",
          source: "recipe_adaptation",
        },
      },
    ];

    render(
      <AgentProfile
        agent={mockAgent}
        balances={mockBalances}
        handle="leonardo@agentic.alchm.kitchen"
        recentActivity={activity}
        userId="leonardo-uid"
      />,
    );

    const versionLink = screen.getByRole("link", {
      name: /Leonardo's Vegetarian Chicken Parmigiana \(Tofu\)/i,
    });
    expect(versionLink).toHaveAttribute("href", "/recipes/versions/ver-456");
    expect(screen.getByText("Saved Adaptation")).toBeInTheDocument();
    expect(screen.queryByText(/★/)).not.toBeInTheDocument();
  });

  it("renders critique and provenance badges while suppressing fabricated ratings on catalog_critique", () => {
    const activity: RecentActivity[] = [
      {
        id: "evt-2",
        eventType: "recipe_review",
        createdAt: new Date().toISOString(),
        metadataPayload: {
          recipeId: "rec-789",
          recipeName: "Tuscan White Bean Stew",
          source: "catalog_critique",
          contentState: "curated",
          rating: 5, // Legacy untrustworthy rating that must NOT be displayed
          review: "Remarkable harmony with herbal Saturnine roots.",
        },
      },
    ];

    render(
      <AgentProfile
        agent={mockAgent}
        balances={mockBalances}
        handle="leonardo@agentic.alchm.kitchen"
        recentActivity={activity}
        userId="leonardo-uid"
      />,
    );

    const recipeLink = screen.getByRole("link", {
      name: /Tuscan White Bean Stew/i,
    });
    expect(recipeLink).toHaveAttribute("href", "/recipes/rec-789");
    expect(screen.getByText("Critique")).toBeInTheDocument();
    expect(screen.getByText("Curated")).toBeInTheDocument();

    const reviewMatches = screen.getAllByText(/Remarkable harmony with herbal Saturnine roots/);
    expect(reviewMatches.length).toBeGreaterThanOrEqual(1);

    // Must NOT invent or display a 5-star rating badge
    expect(screen.queryByText(/5\/5/)).not.toBeInTheDocument();
    expect(screen.queryByText(/★/)).not.toBeInTheDocument();
  });

  it("renders live content provenance badge when critique is live", () => {
    const activity: RecentActivity[] = [
      {
        id: "evt-3",
        eventType: "recipe_review",
        createdAt: new Date().toISOString(),
        metadataPayload: {
          recipeId: "rec-101",
          recipeName: "Wild Fennel Broth",
          source: "catalog_critique",
          contentState: "live",
          review: "Fresh green vitality.",
        },
      },
    ];

    render(
      <AgentProfile
        agent={mockAgent}
        balances={mockBalances}
        handle="leonardo@agentic.alchm.kitchen"
        recentActivity={activity}
        userId="leonardo-uid"
      />,
    );

    expect(screen.getByText("Live")).toBeInTheDocument();
  });

  it("renders transmuted badge and link for recipe_generation events", () => {
    const activity: RecentActivity[] = [
      {
        id: "evt-4",
        eventType: "recipe_generation",
        createdAt: new Date().toISOString(),
        metadataPayload: {
          recipeId: "gen-202",
          recipeName: "Cosmic Saffron Elixir",
          source: "catalog_review",
        },
      },
    ];

    render(
      <AgentProfile
        agent={mockAgent}
        balances={mockBalances}
        handle="leonardo@agentic.alchm.kitchen"
        recentActivity={activity}
        userId="leonardo-uid"
      />,
    );

    expect(screen.getByText("Transmuted")).toBeInTheDocument();
    const link = screen.getByRole("link", { name: /Cosmic Saffron Elixir/i });
    expect(link).toHaveAttribute("href", "/recipes/gen-202");
  });

  it("suppresses broken recipe links when mcpCatalog is false and renders insightContent blockquotes", () => {
    const activity: RecentActivity[] = [
      {
        id: "evt-ungrounded",
        eventType: "recipe_generation",
        createdAt: new Date().toISOString(),
        metadataPayload: {
          recipeId: "recipe-001",
          recipeName: "Ungrounded Prototype Dish",
          mcpCatalog: false,
        },
      },
      {
        id: "evt-insight",
        eventType: "insight",
        createdAt: new Date().toISOString(),
        metadataPayload: {
          insightTitle: "On Botanical Proportion",
          insightContent: "Proportions in the kitchen mirror the harmonic ratios of the spheres.",
        },
      },
    ];

    render(
      <AgentProfile
        agent={mockAgent}
        balances={mockBalances}
        handle="leonardo@agentic.alchm.kitchen"
        recentActivity={activity}
        userId="leonardo-uid"
      />,
    );

    expect(screen.getByText("Ungrounded Prototype Dish")).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /Ungrounded Prototype Dish/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(/Proportions in the kitchen mirror the harmonic ratios of the spheres/i),
    ).toBeInTheDocument();
  });

  it("renders honest empty state when recentActivity is empty and opens chat modal", () => {
    render(
      <AgentProfile
        agent={mockAgent}
        balances={mockBalances}
        handle="leonardo@agentic.alchm.kitchen"
        recentActivity={[]}
        userId="leonardo-uid"
      />,
    );

    expect(
      screen.getByText(/Leonardo has not yet critiqued a catalog recipe/i),
    ).toBeInTheDocument();

    const communeBtns = screen.getAllByRole("button", { name: /Commune with Leonardo/i });
    expect(communeBtns.length).toBeGreaterThanOrEqual(1);

    const exploreLink = screen.getByRole("link", { name: /Explore Recipes/i });
    expect(exploreLink).toHaveAttribute("href", "/recipes");

    // Click commune button in empty state to verify modal opens
    fireEvent.click(communeBtns[communeBtns.length - 1]);
    expect(screen.getByTestId("mock-agent-chat")).toBeInTheDocument();
  });
});
