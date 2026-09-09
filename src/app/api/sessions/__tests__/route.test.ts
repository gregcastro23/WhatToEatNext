/**
 * Route handler tests for POST /api/sessions.
 *
 * @file src/app/api/sessions/__tests__/route.test.ts
 */

jest.mock("@/lib/auth/auth", () => ({
  auth: jest.fn(),
}));

import { POST } from "../route";
import { auth } from "@/lib/auth/auth";

const mockAuth = jest.mocked(auth);
const USER_ID = "22222222-2222-2222-2222-222222222222";

function makeRequest(json?: unknown): Request {
  return new Request("http://localhost:3000/api/sessions", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: json !== undefined ? JSON.stringify(json) : undefined,
  });
}

beforeEach(() => {
  mockAuth.mockReset();
});

describe("POST /api/sessions", () => {
  it("401s when unauthenticated", async () => {
    mockAuth.mockResolvedValueOnce(null);
    const res = await POST(makeRequest({ memberIds: ["user-1"] }));
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe("Unauthorized");
  });

  it("400s on invalid JSON body", async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: USER_ID } });
    const res = await POST(
      new Request("http://localhost:3000/api/sessions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "not json",
      }),
    );
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Invalid JSON body");
  });

  it("400s when memberIds is missing or empty", async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: USER_ID } });
    const res = await POST(makeRequest({ name: "Solo Session" }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("At least 1 member ID is required");
  });

  it("200s on valid session creation request", async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: USER_ID } });
    const res = await POST(
      makeRequest({
        name: "Dinner Party",
        memberIds: ["user-1", "user-2"],
        strategy: "consensus",
      }),
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.session.name).toBe("Dinner Party");
    expect(data.session.memberIds).toEqual(["user-1", "user-2"]);
    expect(data.session.strategy).toBe("consensus");
    expect(data.session.creatorId).toBe(USER_ID);
  });
});
