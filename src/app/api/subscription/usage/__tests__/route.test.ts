/**
 * Route handler tests for POST /api/subscription/usage.
 *
 * @file src/app/api/subscription/usage/__tests__/route.test.ts
 */

jest.mock("@/lib/auth/auth", () => ({
  auth: jest.fn(),
}));

jest.mock("@/services/subscriptionService", () => ({
  subscriptionService: {
    incrementUsage: jest.fn(),
  },
}));

import { POST } from "../route";
import { auth } from "@/lib/auth/auth";
import { subscriptionService } from "@/services/subscriptionService";

const mockedAuth = jest.mocked(auth);
const mockedIncrement = jest.mocked(subscriptionService.incrementUsage);

const USER_ID = "22222222-2222-2222-2222-222222222222";

function makeRequest(json?: unknown): Request {
  return new Request("http://localhost:3000/api/subscription/usage", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: json !== undefined ? JSON.stringify(json) : undefined,
  });
}

beforeEach(() => {
  mockedAuth.mockReset();
  mockedIncrement.mockReset();
});

describe("POST /api/subscription/usage", () => {
  it("401s when unauthenticated", async () => {
    mockedAuth.mockResolvedValueOnce(null);
    const res = await POST(makeRequest({ feature: "recipes" }));
    expect(res.status).toBe(401);
  });

  it("400s on invalid JSON body", async () => {
    mockedAuth.mockResolvedValueOnce({ user: { id: USER_ID } });
    const res = await POST(
      new Request("http://localhost:3000/api/subscription/usage", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "not json",
      }),
    );
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Invalid JSON body");
  });

  it("400s when feature parameter is missing or empty", async () => {
    mockedAuth.mockResolvedValueOnce({ user: { id: USER_ID } });
    const res = await POST(makeRequest({ feature: "" }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("Missing feature parameter");
  });

  it("increments usage and returns count on success", async () => {
    mockedAuth.mockResolvedValueOnce({ user: { id: USER_ID } });
    mockedIncrement.mockResolvedValueOnce(5);

    const res = await POST(makeRequest({ feature: "recipe_export" }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.count).toBe(5);
    expect(data.feature).toBe("recipe_export");
    expect(mockedIncrement).toHaveBeenCalledWith(USER_ID, "recipe_export");
  });
});
