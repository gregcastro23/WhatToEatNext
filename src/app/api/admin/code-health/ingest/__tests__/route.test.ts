/**
 * POST /api/admin/code-health/ingest — fail closed without the secret.
 *
 * @file src/app/api/admin/code-health/ingest/__tests__/route.test.ts
 */

jest.mock("@/services/admin/codeHealthIngest", () => {
  const actual = jest.requireActual<typeof import("@/services/admin/codeHealthIngest")>("@/services/admin/codeHealthIngest");
  return { ...actual, ingestCodeHealthSnapshot: jest.fn() };
});

import { NextRequest } from "next/server";
import { POST } from "../route";
import { ingestCodeHealthSnapshot } from "@/services/admin/codeHealthIngest";

const mockIngest = jest.mocked(ingestCodeHealthSnapshot);

const SNAPSHOT = {
  commitSha: "ae4c1d9d0000000000000000000000000000abcd",
  branch: "master",
  committedAt: "2026-09-22T12:00:00Z",
  commitMessage: "feat: something",
  measuredAt: "2026-09-22T12:05:00Z",
  source: "ci",
  tsc: { errors: 0, byCode: {}, topFiles: [], durationMs: 19000 },
  eslint: {
    errors: 0,
    warnings: 110,
    filesWithProblems: 65,
    byRule: { "import/order": { errors: 0, warnings: 88 } },
    topFiles: [],
    durationMs: 140000,
  },
  census: { sourceFiles: 2013, sourceLines: 629519, testFiles: 355 },
};

function post(body: unknown, secret?: string): NextRequest {
  return new NextRequest("https://alchm.kitchen/api/admin/code-health/ingest", {
    method: "POST",
    headers: { "content-type": "application/json", ...(secret ? { authorization: `Bearer ${secret}` } : {}) },
    body: JSON.stringify(body),
  });
}

const ORIGINAL = process.env.CODE_HEALTH_INGEST_SECRET;
afterEach(() => {
  if (ORIGINAL === undefined) delete process.env.CODE_HEALTH_INGEST_SECRET;
  else process.env.CODE_HEALTH_INGEST_SECRET = ORIGINAL;
  mockIngest.mockReset();
});

describe("POST /api/admin/code-health/ingest", () => {
  it("is 401 for everyone when no secret is configured", async () => {
    delete process.env.CODE_HEALTH_INGEST_SECRET;
    expect((await POST(post(SNAPSHOT, "anything"))).status).toBe(401);
    expect(mockIngest).not.toHaveBeenCalled();
  });

  it("is 401 with the wrong secret", async () => {
    process.env.CODE_HEALTH_INGEST_SECRET = "right-secret";
    expect((await POST(post(SNAPSHOT, "wrong-secret!"))).status).toBe(401);
  });

  it("is 400 for a malformed snapshot", async () => {
    process.env.CODE_HEALTH_INGEST_SECRET = "right-secret";
    expect((await POST(post({ ...SNAPSHOT, commitSha: "not-a-sha" }, "right-secret"))).status).toBe(400);
    expect(mockIngest).not.toHaveBeenCalled();
  });

  it("stores a valid snapshot", async () => {
    process.env.CODE_HEALTH_INGEST_SECRET = "right-secret";
    mockIngest.mockResolvedValue(undefined);
    const res = await POST(post(SNAPSHOT, "right-secret"));
    expect(res.status).toBe(200);
    expect(mockIngest).toHaveBeenCalledWith(expect.objectContaining({ commitSha: SNAPSHOT.commitSha, source: "ci" }));
  });
});
