/**
 * Route handler tests for /api/user/avatar (POST, DELETE).
 *
 * @file src/app/api/user/avatar/__tests__/route.test.ts
 */

jest.mock("@/lib/auth/validateRequest", () => ({
  getUserIdFromRequest: jest.fn(),
}));

jest.mock("@/lib/rateLimit", () => ({
  rateLimit: jest
    .fn()
    .mockResolvedValue({ allowed: true, remaining: 100, resetMs: 60_000 }),
}));

jest.mock("@/lib/database", () => ({
  executeQuery: jest.fn().mockResolvedValue({ rows: [] }),
}));

jest.mock("@/lib/profile/avatarStorage", () => ({
  avatarStorageConfigured: jest.fn().mockReturnValue(true),
  storeAvatar: jest.fn(),
  deleteAvatarObject: jest.fn(),
}));

jest.mock("@/services/practiceRewardService", () => ({
  practiceRewardService: {
    recognize: jest.fn().mockResolvedValue({ rewarded: false }),
  },
}));

import { NextRequest } from "next/server";
import { POST } from "../route";
import { getUserIdFromRequest } from "@/lib/auth/validateRequest";
import { avatarStorageConfigured, storeAvatar } from "@/lib/profile/avatarStorage";

const mockedGetUserId = jest.mocked(getUserIdFromRequest);
const mockedAvatarStorageConfigured = jest.mocked(avatarStorageConfigured);
const mockedStoreAvatar = jest.mocked(storeAvatar);

const USER_ID = "55555555-5555-5555-5555-555555555555";

function makeNextRequest(url: string, method = "POST", json?: unknown): NextRequest {
  return new NextRequest(url, {
    method,
    headers: { "content-type": "application/json" },
    body: json !== undefined ? JSON.stringify(json) : undefined,
  });
}

beforeEach(() => {
  mockedGetUserId.mockReset();
  mockedStoreAvatar.mockReset();
  mockedAvatarStorageConfigured.mockReturnValue(true);
});

describe("POST /api/user/avatar", () => {
  it("401s when unauthenticated", async () => {
    mockedGetUserId.mockResolvedValueOnce(null);
    const res = await POST(makeNextRequest("http://localhost:3000/api/user/avatar", "POST", { photoDataUrl: "data:image/png;base64,abc" }));
    expect(res.status).toBe(401);
  });

  it("503s when avatar storage is not configured", async () => {
    mockedGetUserId.mockResolvedValueOnce(USER_ID);
    mockedAvatarStorageConfigured.mockReturnValueOnce(false);

    const res = await POST(makeNextRequest("http://localhost:3000/api/user/avatar", "POST", { photoDataUrl: "data:image/png;base64,abc" }));
    expect(res.status).toBe(503);
  });

  it("400s on invalid JSON body", async () => {
    mockedGetUserId.mockResolvedValueOnce(USER_ID);
    const res = await POST(
      new NextRequest("http://localhost:3000/api/user/avatar", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "not json",
      }),
    );
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.message).toBe("Invalid JSON body");
  });

  it("400s on missing photoDataUrl", async () => {
    mockedGetUserId.mockResolvedValueOnce(USER_ID);
    const res = await POST(makeNextRequest("http://localhost:3000/api/user/avatar", "POST", {}));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.message).toContain("photoDataUrl is required");
  });

  it("uploads avatar and returns avatarUrl", async () => {
    mockedGetUserId.mockResolvedValueOnce(USER_ID);
    mockedStoreAvatar.mockResolvedValueOnce("https://cdn.alchm.kitchen/avatars/555.webp");

    const res = await POST(makeNextRequest("http://localhost:3000/api/user/avatar", "POST", { photoDataUrl: "data:image/png;base64,xyz" }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.avatarUrl).toBe("https://cdn.alchm.kitchen/avatars/555.webp");
  });
});
