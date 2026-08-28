jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((body, init) => ({
      status: init?.status ?? 200,
      json: async () => body,
    })),
  },
}));

jest.mock("@/lib/auth/validateRequest", () => ({
  validateRequest: jest.fn(),
  getUserIdFromRequest: jest.fn(),
}));

jest.mock("@/services/questEventReporter", () => ({
  reportQuestEventBestEffort: jest.fn(),
}));

import { validateRequest } from "@/lib/auth/validateRequest";
import { reportQuestEventBestEffort } from "@/services/questEventReporter";
import { POST } from "@/app/api/food-lab/route";
import { memStore } from "@/app/api/food-lab/shared";
import type { NextRequest } from "next/server";

function makeRequest(body: unknown): NextRequest {
  return { json: async () => body } as unknown as NextRequest;
}

describe("POST /api/food-lab request boundary", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    memStore.clear();
    delete process.env.DATABASE_URL;
    (validateRequest as jest.Mock).mockResolvedValue({
      user: { userId: "user-1" },
    });
  });

  it("preserves the missing dish-name validation message", async () => {
    const response = await POST(makeRequest({}));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      message: "dishName is required",
    });
  });

  it("rejects malformed nested fields before writing", async () => {
    const response = await POST(
      makeRequest({ dishName: "Soup", photos: "not-an-array" }),
    );

    expect(response.status).toBe(400);
    expect(memStore.size).toBe(0);
    expect(reportQuestEventBestEffort).not.toHaveBeenCalled();
  });

  it("normalizes defaults for a minimal valid entry", async () => {
    const response = await POST(makeRequest({ dishName: "Soup" }));
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.entry).toMatchObject({
      dishName: "Soup",
      photos: [],
      elementalTags: {},
      alchemicalTags: {},
      planetaryContext: {},
      tags: [],
      isPublic: false,
    });
    expect(reportQuestEventBestEffort).toHaveBeenCalledWith(
      "user-1",
      "cook_recipe",
    );
  });
});
