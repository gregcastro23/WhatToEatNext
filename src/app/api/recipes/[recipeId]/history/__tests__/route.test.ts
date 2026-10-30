jest.mock("@/lib/auth/auth", () => ({
  auth: jest.fn(),
}));

jest.mock("@/lib/feed/commentEnforcement", () => ({
  isBlockedBetween: jest.fn(),
}));

import { GET } from "@/app/api/recipes/[recipeId]/history/route";
import { recipeReflectionsService } from "@/services/recipeReflectionsService";
import { auth } from "@/lib/auth/auth";
import { isBlockedBetween } from "@/lib/feed/commentEnforcement";
import { NextRequest } from "next/server";

const mockedAuth = jest.mocked(auth);
const mockedIsBlocked = jest.mocked(isBlockedBetween);

function makeRequest(recipeId: string, params: Record<string, string> = {}): NextRequest {
  const url = new URL(`http://x/api/recipes/${encodeURIComponent(recipeId)}/history`);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }
  return new NextRequest(url.toString());
}

describe("GET /api/recipes/[recipeId]/history", () => {
  beforeEach(() => {
    recipeReflectionsService.clearMemory();
    jest.clearAllMocks();
    mockedAuth.mockResolvedValue(null);
    mockedIsBlocked.mockResolvedValue(false);
  });

  it("returns empty history cleanly with 200", async () => {
    const res = await GET(makeRequest("recipe-empty"), {
      params: Promise.resolve({ recipeId: "recipe-empty" }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.items).toEqual([]);
    expect(body.hasMore).toBe(false);
    expect(body.totalCount).toBe(0);
  });

  it("returns keyset-paginated reflections with stable ordering and individually addressable records", async () => {
    // Insert 3 reflections with timestamps spaced apart
    const ref1 = await recipeReflectionsService.createReflection({
      recipeId: "recipe-pagination",
      authorId: "agent-saturn",
      source: "recipe_alteration",
      review: "Reflection 1: More cumin needed.",
      score: 4,
      isAgent: true,
      instructionReviewRequired: true,
      createdAt: new Date("2026-06-01T10:00:00Z"),
    });

    const ref2 = await recipeReflectionsService.createReflection({
      recipeId: "recipe-pagination",
      authorId: "agent-saturn", // Same actor, multiple comments
      source: "recipe_alteration",
      review: "Reflection 2: Tested with olive oil.",
      score: 5,
      isAgent: true,
      instructionReviewRequired: true,
      createdAt: new Date("2026-06-01T11:00:00Z"),
    });

    const ref3 = await recipeReflectionsService.createReflection({
      recipeId: "recipe-pagination",
      authorId: "human-chef",
      source: "community_tip",
      review: "Reflection 3: Human chef perspective.",
      score: null,
      isAgent: false,
      instructionReviewRequired: false,
      createdAt: new Date("2026-06-01T12:00:00Z"),
    });

    // Page 1: limit 2
    const resPage1 = await GET(
      makeRequest("recipe-pagination", { limit: "2" }),
      { params: Promise.resolve({ recipeId: "recipe-pagination" }) },
    );
    expect(resPage1.status).toBe(200);
    const page1 = await resPage1.json();
    expect(page1.items).toHaveLength(2);
    expect(page1.hasMore).toBe(true);
    expect(page1.nextCursor).toBeDefined();
    // Descending order: ref3 (12:00) then ref2 (11:00)
    expect(page1.items[0].id).toBe(ref3.id);
    expect(page1.items[1].id).toBe(ref2.id);

    // Page 2: with cursor
    const resPage2 = await GET(
      makeRequest("recipe-pagination", { limit: "2", cursor: page1.nextCursor }),
      { params: Promise.resolve({ recipeId: "recipe-pagination" }) },
    );
    expect(resPage2.status).toBe(200);
    const page2 = await resPage2.json();
    expect(page2.items).toHaveLength(1);
    expect(page2.items[0].id).toBe(ref1.id);
    expect(page2.hasMore).toBe(false);
  });

  it("filters reflections by authorType (agent vs human)", async () => {
    await recipeReflectionsService.createReflection({
      recipeId: "recipe-type-filter",
      authorId: "agent-mars",
      source: "planetary_agents",
      review: "Agent suggestion",
      isAgent: true,
    });
    await recipeReflectionsService.createReflection({
      recipeId: "recipe-type-filter",
      authorId: "human-baker",
      source: "user_note",
      review: "Human note",
      isAgent: false,
    });

    // Query agent only
    const resAgent = await GET(
      makeRequest("recipe-type-filter", { authorType: "agent" }),
      { params: Promise.resolve({ recipeId: "recipe-type-filter" }) },
    );
    const bodyAgent = await resAgent.json();
    expect(bodyAgent.items).toHaveLength(1);
    expect(bodyAgent.items[0].author.isAgent).toBe(true);

    // Query human only
    const resHuman = await GET(
      makeRequest("recipe-type-filter", { authorType: "human" }),
      { params: Promise.resolve({ recipeId: "recipe-type-filter" }) },
    );
    const bodyHuman = await resHuman.json();
    expect(bodyHuman.items).toHaveLength(1);
    expect(bodyHuman.items[0].author.isAgent).toBe(false);
  });

  it("applies two-way block filtering", async () => {
    mockedAuth.mockResolvedValue({
      user: { id: "viewer-123" },
      expires: "2099-01-01",
    });

    await recipeReflectionsService.createReflection({
      recipeId: "recipe-blocked",
      authorId: "blocked-author",
      source: "user_note",
      review: "Should not be visible to viewer",
      isAgent: false,
    });
    await recipeReflectionsService.createReflection({
      recipeId: "recipe-blocked",
      authorId: "friendly-author",
      source: "user_note",
      review: "Friendly review",
      isAgent: false,
    });

    mockedIsBlocked.mockImplementation(async (viewer, author) => {
      return author === "blocked-author";
    });

    const res = await GET(makeRequest("recipe-blocked"), {
      params: Promise.resolve({ recipeId: "recipe-blocked" }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.items).toHaveLength(1);
    expect(body.items[0].author.id).toBe("friendly-author");
  });

  it("returns 503 degraded when reflections service fails", async () => {
    jest.spyOn(recipeReflectionsService, "listReflections").mockRejectedValueOnce(
      new Error("Database timeout"),
    );

    const res = await GET(makeRequest("recipe-error"), {
      params: Promise.resolve({ recipeId: "recipe-error" }),
    });

    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body.degraded).toBe(true);
    expect(body.error).toMatch(/temporarily unavailable/);
  });
});
