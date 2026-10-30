jest.mock("@/lib/database/connection", () => ({
  executeQuery: jest.fn(),
}));

import { GET } from "@/app/api/recipes/[recipeId]/community-tips/route";
import { executeQuery } from "@/lib/database/connection";
import { NextRequest } from "next/server";

const mockedQuery = jest.mocked(executeQuery);

function makeRequest(recipeId: string): NextRequest {
  return new NextRequest(`http://x/api/recipes/${encodeURIComponent(recipeId)}/community-tips`);
}

describe("GET /api/recipes/[recipeId]/community-tips", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns top rated tips when reviews exist", async () => {
    mockedQuery.mockResolvedValueOnce({
      rows: [
        {
          author_name: "Gordon Cook",
          author_email: "gordon@example.com",
          rating: 5,
          review: "Excellent sear, great recipe!",
          updated_at: "2026-05-01T12:00:00Z",
        },
      ],
      rowCount: 1,
      command: "SELECT",
      oid: 0,
      fields: [],
    });

    const response = await GET(makeRequest("recipe-1"), {
      params: Promise.resolve({ recipeId: "recipe-1" }),
    });

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.tips).toHaveLength(1);
    expect(body.tips[0]).toEqual({
      author: "Gordon Cook",
      rating: 5,
      tip: "Excellent sear, great recipe!",
      postedAt: "2026-05-01T12:00:00Z",
    });
  });

  it("returns 200 with empty array on healthy empty tips query", async () => {
    mockedQuery.mockResolvedValueOnce({
      rows: [],
      rowCount: 0,
      command: "SELECT",
      oid: 0,
      fields: [],
    });

    const response = await GET(makeRequest("recipe-none"), {
      params: Promise.resolve({ recipeId: "recipe-none" }),
    });

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.tips).toEqual([]);
  });

  it("returns 503 degraded error on database query failure instead of concealing it", async () => {
    mockedQuery.mockRejectedValueOnce(new Error("Connection refused"));

    const response = await GET(makeRequest("recipe-fail"), {
      params: Promise.resolve({ recipeId: "recipe-fail" }),
    });

    expect(response.status).toBe(503);
    const body = await response.json();
    expect(body.degraded).toBe(true);
    expect(body.error).toMatch(/temporarily unavailable/);
  });
});
