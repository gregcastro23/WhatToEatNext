import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { installFetchMock } from "@/__tests__/helpers/fetchMock";
import SearchGapsPanel, { isHighVelocityGap } from "@/components/admin/SearchGapsPanel";
import { makeDocumentVisible } from "@/__tests__/helpers/pollingTestEnv";

let restoreVisibility: () => void;
beforeAll(() => {
  restoreVisibility = makeDocumentVisible();
});
afterAll(() => restoreVisibility());

const NOW = new Date("2026-11-11T12:00:00.000Z").getTime();

describe("isHighVelocityGap", () => {
  it("returns true for gaps with >= 5 hits within the past 24 hours", () => {
    const gap = {
      id: "gap-1",
      normalizedQuery: "black garlic",
      sampleRawQuery: "Black Garlic",
      hitCount: 7,
      firstSeenAt: "2026-11-10T10:00:00.000Z",
      lastSeenAt: "2026-11-11T08:00:00.000Z", // 4 hours ago
      topFilters: [],
      resolvedAt: null,
      resolvedEntitySlug: null,
    };
    expect(isHighVelocityGap(gap, NOW)).toBe(true);
  });

  it("returns false when hit count is less than 5", () => {
    const gap = {
      id: "gap-2",
      normalizedQuery: "saffron rice",
      sampleRawQuery: "Saffron Rice",
      hitCount: 4,
      firstSeenAt: "2026-11-11T00:00:00.000Z",
      lastSeenAt: "2026-11-11T10:00:00.000Z",
      topFilters: [],
      resolvedAt: null,
      resolvedEntitySlug: null,
    };
    expect(isHighVelocityGap(gap, NOW)).toBe(false);
  });

  it("returns false when last seen is older than 24 hours", () => {
    const gap = {
      id: "gap-3",
      normalizedQuery: "truffle pasta",
      sampleRawQuery: "Truffle Pasta",
      hitCount: 20,
      firstSeenAt: "2026-11-01T00:00:00.000Z",
      lastSeenAt: "2026-11-09T00:00:00.000Z", // > 48h ago
      topFilters: [],
      resolvedAt: null,
      resolvedEntitySlug: null,
    };
    expect(isHighVelocityGap(gap, NOW)).toBe(false);
  });
});

describe("SearchGapsPanel", () => {
  it("renders error state when fetch fails", async () => {
    installFetchMock(
      jest.fn().mockResolvedValue({ ok: false, status: 503, json: async () => ({}) }),
    );
    render(<SearchGapsPanel />);

    await waitFor(() =>
      expect(screen.getByText("Search gaps unavailable")).toBeInTheDocument(),
    );
    expect(screen.getByText(/HTTP 503/)).toBeInTheDocument();
  });

  it("renders empty state when zero gaps exist", async () => {
    installFetchMock(
      jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          generatedAt: "2026-11-11T12:00:00.000Z",
          totals: { unresolvedQueries: 0, unresolvedHits: 0, resolvedQueries: 0 },
          gaps: [],
        }),
      }),
    );
    render(<SearchGapsPanel />);

    await waitFor(() =>
      expect(screen.getByText("No unfulfilled searches recorded yet")).toBeInTheDocument(),
    );
  });

  it("renders high-velocity alert banner and quick-actions for drafting cosmic recipe", async () => {
    const fetchMock = jest.fn().mockImplementation(async (url: string, init?: RequestInit) => {
      if (typeof init?.method === "string" && init.method === "PATCH") {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            success: true,
            action: "queue_cosmic_recipe",
            normalizedQuery: "yuzu kosho",
            resolvedEntitySlug: "cosmic-recipe:yuzu-kosho",
            generationHref: "/recipe-generator?prompt=yuzu%20kosho&fromGap=yuzu%20kosho",
          }),
        };
      }
      return {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          generatedAt: "2026-11-11T12:00:00.000Z",
          totals: { unresolvedQueries: 1, unresolvedHits: 9, resolvedQueries: 0 },
          gaps: [
            {
              id: "gap-10",
              normalizedQuery: "yuzu kosho",
              sampleRawQuery: "Yuzu Kosho",
              hitCount: 9,
              firstSeenAt: new Date(Date.now() - 3600_000).toISOString(),
              lastSeenAt: new Date(Date.now() - 600_000).toISOString(), // 10 min ago
              topFilters: ["diet:vegan"],
              resolvedAt: null,
              resolvedEntitySlug: null,
            },
          ],
        }),
      };
    });
    installFetchMock(fetchMock);

    render(<SearchGapsPanel />);

    await waitFor(() =>
      expect(screen.getByText(/High-Velocity Search Gap/i)).toBeInTheDocument(),
    );

    expect(screen.getByText("⚡ Velocity Alert")).toBeInTheDocument();
    expect(screen.getByText("Draft Recipe")).toBeInTheDocument();
    expect(screen.getByText("Generator ↗")).toBeInTheDocument();

    // Click Draft Recipe quick action
    fireEvent.click(screen.getByText("Draft Recipe"));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/admin/search-gaps",
        expect.objectContaining({
          method: "PATCH",
          body: JSON.stringify({
            normalizedQuery: "yuzu kosho",
            resolvedEntitySlug: null,
            action: "queue_cosmic_recipe",
          }),
        }),
      );
    });
  });

  it("supports multi-select checkbox controls and batch-drafting high-velocity gaps", async () => {
    const fetchMock = jest.fn().mockImplementation(async (url: string, init?: RequestInit) => {
      if (typeof init?.method === "string" && init.method === "PATCH") {
        const body = JSON.parse(String(init.body));
        return {
          ok: true,
          status: 200,
          json: async () => ({
            success: true,
            action: "queue_cosmic_recipe",
            normalizedQuery: body.normalizedQuery,
            resolvedEntitySlug: `cosmic-recipe:${body.normalizedQuery}`,
          }),
        };
      }
      return {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          generatedAt: "2026-11-11T12:00:00.000Z",
          totals: { unresolvedQueries: 2, unresolvedHits: 18, resolvedQueries: 0 },
          gaps: [
            {
              id: "gap-1",
              normalizedQuery: "galangal",
              sampleRawQuery: "Fresh Galangal",
              hitCount: 10,
              firstSeenAt: new Date(Date.now() - 3600_000).toISOString(),
              lastSeenAt: new Date(Date.now() - 600_000).toISOString(),
              topFilters: [],
              resolvedAt: null,
              resolvedEntitySlug: null,
            },
            {
              id: "gap-2",
              normalizedQuery: "lemongrass",
              sampleRawQuery: "Lemongrass",
              hitCount: 8,
              firstSeenAt: new Date(Date.now() - 3600_000).toISOString(),
              lastSeenAt: new Date(Date.now() - 600_000).toISOString(),
              topFilters: [],
              resolvedAt: null,
              resolvedEntitySlug: null,
            },
          ],
        }),
      };
    });
    installFetchMock(fetchMock);

    render(<SearchGapsPanel />);

    await waitFor(() =>
      expect(screen.getByText("Select All High-Velocity")).toBeInTheDocument(),
    );

    fireEvent.click(screen.getByText("Select All High-Velocity"));

    expect(screen.getByText("Draft Selected (2)")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Draft Selected (2)"));

    await waitFor(() => {
      expect(screen.getByText(/Batch drafted 2 recipe\(s\) into pipeline/)).toBeInTheDocument();
    });
  });
});
