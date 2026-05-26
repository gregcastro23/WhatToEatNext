/**
 * Route handler tests for /api/account/api-keys (GET, POST) and
 * /api/account/api-keys/[keyId] (DELETE).
 *
 * DB + auth are mocked at module boundaries — this is a unit test on
 * the handlers themselves: validation, status codes, one-time plaintext
 * reveal contract, ownership checks via revokeApiKey delegation.
 */

jest.mock("@/lib/auth/auth", () => ({
  auth: jest.fn(),
}));

jest.mock("@/lib/rateLimit", () => ({
  rateLimit: jest
    .fn()
    .mockResolvedValue({ allowed: true, remaining: 100, resetMs: 60_000 }),
}));

jest.mock("@/lib/api-keys/queries", () => ({
  mintApiKey: jest.fn(),
  listUserApiKeys: jest.fn(),
  revokeApiKey: jest.fn(),
}));

import { auth } from "@/lib/auth/auth";
import {
  listUserApiKeys,
  mintApiKey,
  revokeApiKey,
} from "@/lib/api-keys/queries";
import { GET, POST } from "@/app/api/account/api-keys/route";
import { DELETE } from "@/app/api/account/api-keys/[keyId]/route";

const mockedAuth = auth as unknown as jest.MockedFunction<
  () => Promise<unknown>
>;
const mockedMint = mintApiKey as jest.MockedFunction<typeof mintApiKey>;
const mockedList = listUserApiKeys as jest.MockedFunction<
  typeof listUserApiKeys
>;
const mockedRevoke = revokeApiKey as jest.MockedFunction<typeof revokeApiKey>;

const USER_ID = "11111111-1111-1111-1111-111111111111";

function makeRequest(
  url: string,
  init: RequestInit & { json?: unknown } = {},
): Request {
  const { json, ...rest } = init;
  return new Request(url, {
    ...rest,
    headers: {
      "content-type": "application/json",
      ...(rest.headers as Record<string, string> | undefined),
    },
    body: json !== undefined ? JSON.stringify(json) : (rest.body as BodyInit),
  });
}

beforeEach(() => {
  mockedAuth.mockReset();
  mockedMint.mockReset();
  mockedList.mockReset();
  mockedRevoke.mockReset();
});

describe("GET /api/account/api-keys", () => {
  it("401s when no session", async () => {
    mockedAuth.mockResolvedValueOnce(null);
    const res = await GET(makeRequest("http://x/api/account/api-keys"));
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("Unauthorized");
  });

  it("returns the user's keys (no plaintext) when authed", async () => {
    mockedAuth.mockResolvedValueOnce({ user: { id: USER_ID } });
    mockedList.mockResolvedValueOnce([
      {
        id: "k1",
        name: "Claude Desktop",
        scopes: ["mcp:invoke"],
        rate_limit_tier: "authenticated",
        is_active: true,
        expires_at: null,
        last_used_at: null,
        usage_count: 0,
        created_at: "2026-05-26T05:00:00.000Z",
      },
    ]);
    const res = await GET(makeRequest("http://x/api/account/api-keys"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.keys).toHaveLength(1);
    expect(body.keys[0].id).toBe("k1");
    // Hard contract: GET response NEVER carries a plaintext field.
    expect(JSON.stringify(body)).not.toMatch(/plaintext|sk_alchm_live_/);
    expect(mockedList).toHaveBeenCalledWith(USER_ID);
  });
});

describe("POST /api/account/api-keys", () => {
  it("401s when no session", async () => {
    mockedAuth.mockResolvedValueOnce(null);
    const res = await POST(
      makeRequest("http://x/api/account/api-keys", {
        method: "POST",
        json: { name: "test" },
      }),
    );
    expect(res.status).toBe(401);
  });

  it("400s on empty name", async () => {
    mockedAuth.mockResolvedValueOnce({ user: { id: USER_ID } });
    const res = await POST(
      makeRequest("http://x/api/account/api-keys", {
        method: "POST",
        json: { name: "   " },
      }),
    );
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/name/);
  });

  it("400s on invalid JSON body", async () => {
    mockedAuth.mockResolvedValueOnce({ user: { id: USER_ID } });
    const res = await POST(
      new Request("http://x/api/account/api-keys", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "not json",
      }),
    );
    expect(res.status).toBe(400);
  });

  it("returns the plaintext exactly once on a successful mint", async () => {
    mockedAuth.mockResolvedValueOnce({ user: { id: USER_ID } });
    mockedMint.mockResolvedValueOnce({
      row: {
        id: "k1",
        name: "Cursor",
        scopes: ["mcp:invoke"],
        rate_limit_tier: "authenticated",
        is_active: true,
        expires_at: null,
        last_used_at: null,
        usage_count: 0,
        created_at: "2026-05-26T05:00:00.000Z",
      },
      plaintext:
        "sk_alchm_live_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopq",
    });
    const res = await POST(
      makeRequest("http://x/api/account/api-keys", {
        method: "POST",
        json: { name: "Cursor", scopes: ["mcp:invoke"] },
      }),
    );
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.plaintext).toMatch(/^sk_alchm_live_[A-Za-z0-9_-]{43}$/);
    expect(body.key.id).toBe("k1");
    expect(mockedMint).toHaveBeenCalledWith({
      userId: USER_ID,
      name: "Cursor",
      scopes: ["mcp:invoke"],
      expiresAt: undefined,
    });
  });

  it("500s when the DB layer throws", async () => {
    mockedAuth.mockResolvedValueOnce({ user: { id: USER_ID } });
    mockedMint.mockRejectedValueOnce(new Error("db went away"));
    const res = await POST(
      makeRequest("http://x/api/account/api-keys", {
        method: "POST",
        json: { name: "key" },
      }),
    );
    expect(res.status).toBe(500);
  });
});

describe("DELETE /api/account/api-keys/[keyId]", () => {
  const params = (keyId: string) => ({
    params: Promise.resolve({ keyId }),
  });

  it("401s when no session", async () => {
    mockedAuth.mockResolvedValueOnce(null);
    const res = await DELETE(
      makeRequest("http://x/api/account/api-keys/k1", {
        method: "DELETE",
      }),
      params("k1"),
    );
    expect(res.status).toBe(401);
  });

  it("404s when the key is not owned by this user or already revoked", async () => {
    mockedAuth.mockResolvedValueOnce({ user: { id: USER_ID } });
    mockedRevoke.mockResolvedValueOnce(null);
    const res = await DELETE(
      makeRequest("http://x/api/account/api-keys/k1", { method: "DELETE" }),
      params("k1"),
    );
    expect(res.status).toBe(404);
    expect(mockedRevoke).toHaveBeenCalledWith(USER_ID, "k1");
  });

  it("returns the revoked id on success", async () => {
    mockedAuth.mockResolvedValueOnce({ user: { id: USER_ID } });
    mockedRevoke.mockResolvedValueOnce("k1");
    const res = await DELETE(
      makeRequest("http://x/api/account/api-keys/k1", { method: "DELETE" }),
      params("k1"),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.revoked).toBe("k1");
  });
});
