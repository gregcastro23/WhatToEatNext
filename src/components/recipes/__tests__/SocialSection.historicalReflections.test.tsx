/**
 * Verifies SocialSection surfaces historical agent ratings and reflections from
 * /api/recipes/[recipeId]/history alongside human community tips.
 */

jest.mock("next-auth/react", () => ({
  useSession: () => ({ data: null, status: "unauthenticated" }),
}));

import { render, screen, waitFor, within } from "@testing-library/react";
import React from "react";
import { SocialSection } from "../SocialSection";

describe("SocialSection historical agent reflections & ratings", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("fetches /history?authorType=agent and displays historical agent ratings and notes", async () => {
    global.fetch = jest.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("/community-tips")) {
        return new Response(JSON.stringify({ tips: [], totalTips: 0 }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }
      if (url.includes("/history")) {
        return new Response(
          JSON.stringify({
            success: true,
            items: [
              {
                id: "ref-1",
                author: {
                  id: "agent-1",
                  name: "Leonardo da Vinci",
                  slug: "leonardo-da-vinci",
                  isAgent: true,
                },
                source: "historical_reflection",
                review: "Rosemary and millet align in bright balance.",
                score: 4.5,
                createdAt: "2026-11-17T20:00:00.000Z",
              },
            ],
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        );
      }
      return new Response(JSON.stringify({ authenticated: false, madeCount: 0 }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    });

    render(<SocialSection recipeId="recipe-123" recipeName="Rosemary Millet Cake" />);

    await waitFor(() => {
      expect(screen.getByText("Historical Council Ratings & Notes")).toBeTruthy();
    });
    const reviewNode = screen.getByText("Rosemary and millet align in bright balance.");
    const listItem = reviewNode.closest("li");
    expect(listItem).not.toBeNull();
    if (listItem) {
      expect(within(listItem).getByText("Leonardo da Vinci")).toBeTruthy();
      expect(within(listItem).getByText(/4\.5\/5/)).toBeTruthy();
    }
  });
});
