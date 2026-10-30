import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import React from "react";
import { RecipeAgentCouncil } from "../RecipeAgentCouncil";

jest.mock("@/lib/logger", () => ({ _logger: { error: jest.fn() } }));

const mockFetch = jest.fn();
const content = {
  author: "Leonardo da Vinci",
  tip: "A reflection on the ingredients and preparation.",
  agentSlug: "leonardo-da-vinci",
  dominantElement: "Fire",
  contentState: "live",
};

function response(critique: object): Response {
  return new Response(JSON.stringify({ success: true, critique }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

function requestCritique(): void {
  fireEvent.click(screen.getByRole("button", { name: /Leonardo da Vinci/ }));
}

beforeEach(() => {
  mockFetch.mockReset();
  global.fetch = mockFetch;
});

afterEach(cleanup);

describe("RecipeAgentCouncil response and publication truth", () => {
  it.each([
    ["live", "Live agent response"],
    ["gateway-degraded", "Gateway degraded reflection"],
    ["curated", "Curated reflection"],
  ])(
    "labels %s content and notifies only a confirmed feed publication",
    async (contentState, label) => {
      mockFetch.mockResolvedValue(
        response({
          ...content,
          contentState,
          published: true,
          persistedAt: "2026-10-14T12:00:00.000Z",
        }),
      );
      const onPublished = jest.fn();
      render(
        <RecipeAgentCouncil
          recipeId="recipe-1"
          onCritiquePublished={onPublished}
        />,
      );
      requestCritique();

      expect(await screen.findByText(label)).toBeVisible();
      expect(screen.getByText("Published to the activity feed")).toBeVisible();
      expect(screen.queryByText(/★★★★★/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Dual-written/)).not.toBeInTheDocument();
      expect(onPublished).toHaveBeenCalledTimes(1);
      expect(onPublished).toHaveBeenCalledWith();
    },
  );

  it("shows an unpublished reflection without a publication callback or invented timestamp", async () => {
    mockFetch.mockResolvedValue(
      response({ ...content, contentState: "curated", published: false }),
    );
    const onPublished = jest.fn();
    render(
      <RecipeAgentCouncil
        recipeId="recipe-1"
        onCritiquePublished={onPublished}
      />,
    );
    requestCritique();

    expect(await screen.findByText("Generated, not published")).toBeVisible();
    expect(screen.getByText("Curated reflection")).toBeVisible();
    expect(onPublished).not.toHaveBeenCalled();
  });

  it.each([
    {},
    { ...content, tip: { nested: "not text" }, published: false },
    { ...content, contentState: "unknown", published: false },
    { ...content, published: true },
    { ...content, published: false, persistedAt: "2026-10-14T12:00:00.000Z" },
  ])(
    "rejects malformed consumed fields without replacing the previous good reflection %#",
    async (malformed) => {
      mockFetch.mockResolvedValueOnce(
        response({ ...content, published: false }),
      );
      const onPublished = jest.fn();
      render(
        <RecipeAgentCouncil
          recipeId="recipe-1"
          onCritiquePublished={onPublished}
        />,
      );
      requestCritique();
      expect(
        await screen.findByText(/A reflection on the ingredients/),
      ).toBeVisible();

      mockFetch.mockResolvedValueOnce(response(malformed));
      requestCritique();
      expect(await screen.findByRole("alert")).toHaveTextContent(
        "Publication may have succeeded",
      );
      expect(screen.getByText(/A reflection on the ingredients/)).toBeVisible();
      expect(onPublished).not.toHaveBeenCalled();
    },
  );

  it("reports an HTTP rejection separately from an unreadable success", async () => {
    mockFetch.mockResolvedValueOnce(new Response("denied", { status: 401 }));
    render(<RecipeAgentCouncil recipeId="recipe-1" />);
    requestCritique();
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "request was rejected (401)",
    );

    mockFetch.mockResolvedValueOnce(new Response("not JSON", { status: 200 }));
    requestCritique();
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Publication may have succeeded",
      ),
    );
  });
});
