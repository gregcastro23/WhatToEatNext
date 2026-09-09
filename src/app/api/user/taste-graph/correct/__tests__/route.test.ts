/**
 * Route handler tests for POST /api/user/taste-graph/correct.
 *
 * @file src/app/api/user/taste-graph/correct/__tests__/route.test.ts
 */

jest.mock("@/lib/auth/auth", () => ({
  auth: jest.fn(),
}));

jest.mock("@/services/userInteractionsService", () => ({
  updateTasteCorrections: jest.fn(),
}));

import { POST } from "../route";
import { auth } from "@/lib/auth/auth";
import { updateTasteCorrections } from "@/services/userInteractionsService";

const mockedAuth = jest.mocked(auth);
const mockedUpdate = jest.mocked(updateTasteCorrections);

const USER_ID = "10101010-1010-1010-1010-101010101010";

function makeRequest(json?: unknown): Request {
  return new Request("http://localhost:3000/api/user/taste-graph/correct", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: json !== undefined ? JSON.stringify(json) : undefined,
  });
}

beforeEach(() => {
  mockedAuth.mockReset();
  mockedUpdate.mockReset();
});

describe("POST /api/user/taste-graph/correct", () => {
  it("401s when unauthenticated", async () => {
    mockedAuth.mockResolvedValueOnce(null);
    const res = await POST(makeRequest({ cuisines: { Italian: "love" } }));
    expect(res.status).toBe(401);
  });

  it("400s on invalid JSON body", async () => {
    mockedAuth.mockResolvedValueOnce({ user: { id: USER_ID } });
    const res = await POST(
      new Request("http://localhost:3000/api/user/taste-graph/correct", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "not json",
      }),
    );
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Invalid JSON body");
  });

  it("400s on invalid taste verdict", async () => {
    mockedAuth.mockResolvedValueOnce({ user: { id: USER_ID } });
    const res = await POST(makeRequest({ cuisines: { Italian: "super-love" } }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Invalid taste corrections");
  });

  it("updates taste corrections successfully", async () => {
    mockedAuth.mockResolvedValueOnce({ user: { id: USER_ID } });
    mockedUpdate.mockResolvedValueOnce({ cuisines: { Italian: "love" } });

    const res = await POST(makeRequest({ cuisines: { Italian: "love" } }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.cuisines).toEqual({ Italian: "love" });
    expect(mockedUpdate).toHaveBeenCalledWith(USER_ID, { cuisines: { Italian: "love" } });
  });
});
