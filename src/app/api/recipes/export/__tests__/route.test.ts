import { GET } from "@/app/api/recipes/export/route";
import { recipeCatalogExportService } from "@/services/recipeCatalogExportService";
import { NextRequest } from "next/server";

function makeRequest(params: Record<string, string> = {}, token?: string): NextRequest {
  const url = new URL("http://x/api/recipes/export");
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return new NextRequest(url.toString(), { headers });
}

describe("GET /api/recipes/export", () => {
  beforeEach(() => {
    process.env.INTERNAL_API_SECRET = "internal-secret";
    recipeCatalogExportService.clearSessions();
  });

  afterEach(() => {
    delete process.env.INTERNAL_API_SECRET;
  });

  it("rejects unauthorized request without valid bearer token", async () => {
    const res = await GET(makeRequest({}, "wrong-token"));
    expect(res.status).toBe(401);
  });

  it("initiates a new snapshot export and returns page 1", async () => {
    const res = await GET(makeRequest({ limit: "50" }, "internal-secret"));
    expect(res.status).toBe(200);
    const body = await res.json();

    expect(body.success).toBe(true);
    expect(body.schemaVersion).toBe(1);
    expect(body.snapshotId).toMatch(/^snap_/);
    expect(body.contentDigest).toBeDefined();
    expect(body.totalRecipes).toBeGreaterThan(1000);
    expect(body.recipes).toHaveLength(50);
    expect(body.pagination.nextCursor).toBeDefined();
    expect(body.pagination.isComplete).toBe(false);

    // Verify deterministic sorting
    const ids = body.recipes.map((r: any) => r.id);
    const sortedIds = [...ids].sort((a, b) => a.localeCompare(b));
    expect(ids).toEqual(sortedIds);

    // Verify recipe structure and truthful nutrition
    const first = body.recipes[0];
    expect(first).toHaveProperty("id");
    expect(first).toHaveProperty("name");
    expect(first).toHaveProperty("nutrition");
    expect(["complete", "partial", "none"]).toContain(first.nutrition.status);
    expect(first).toHaveProperty("contentDigest");
  });

  it("continues retrieval on the same pinned snapshot session", async () => {
    // 1. Get page 1
    const res1 = await GET(makeRequest({ limit: "20" }, "internal-secret"));
    const page1 = await res1.json();
    const snapshotId = page1.snapshotId;
    const nextCursor = page1.pagination.nextCursor;

    // 2. Get page 2 using the pinned snapshotId and nextCursor
    const res2 = await GET(
      makeRequest({ snapshotId, cursor: nextCursor, limit: "20" }, "internal-secret"),
    );
    expect(res2.status).toBe(200);
    const page2 = await res2.json();

    expect(page2.snapshotId).toBe(snapshotId);
    expect(page2.contentDigest).toBe(page1.contentDigest);
    expect(page2.recipes).toHaveLength(20);

    // Verify no overlap between page 1 and page 2
    const page1Ids = new Set(page1.recipes.map((r: any) => r.id));
    for (const r of page2.recipes) {
      expect(page1Ids.has(r.id)).toBe(false);
    }
  });

  it("returns 410 SNAPSHOT_EXPIRED when snapshotId is unknown or expired", async () => {
    const res = await GET(
      makeRequest({ snapshotId: "snap_expired_999999" }, "internal-secret"),
    );
    expect(res.status).toBe(410);
    const body = await res.json();
    expect(body.error).toBe("SNAPSHOT_EXPIRED");
  });
});
