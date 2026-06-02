/**
 * Route handler tests for /api/account/privy (GET, POST, DELETE).
 *
 * Mocks authentication, database services, and the Privy server SDK at module
 * boundaries. Tests status codes, validation, graceful degradation, conflict
 * handling, server-side wallet resolution, and unlink.
 *
 * @file src/app/api/account/privy/__tests__/route.test.ts
 */

jest.mock("@/lib/auth/auth", () => ({
  auth: jest.fn(),
}));

jest.mock("@/services/userDatabaseService", () => ({
  userDatabase: {
    getUserById: jest.fn(),
    getUserByPrivyDid: jest.fn(),
    linkUserPrivyDid: jest.fn(),
    unlinkUserPrivyDid: jest.fn(),
  },
}));

const WALLET = "0x1111111111111111111111111111111111111111";

jest.mock("@privy-io/server-auth", () => {
  return {
    PrivyClient: jest.fn().mockImplementation(() => {
      return {
        verifyAuthToken: jest.fn().mockImplementation(async (token: string) => {
          if (token === "invalid-token") {
            throw new Error("Invalid token signature");
          }
          if (token === "token-no-did") {
            return { userId: "" };
          }
          return { userId: "did:privy:mock-did-1234" };
        }),
        // Server-side embedded-wallet resolution from the verified DID.
        getUser: jest.fn().mockImplementation(async (_did: string) => ({
          linkedAccounts: [
            {
              type: "wallet",
              walletClientType: "privy",
              chainType: "ethereum",
              address: WALLET,
            },
          ],
        })),
      };
    }),
  };
});

import { GET, POST, DELETE } from "@/app/api/account/privy/route";
import { auth } from "@/lib/auth/auth";
import { userDatabase } from "@/services/userDatabaseService";

const mockedAuth = auth as unknown as jest.MockedFunction<() => Promise<unknown>>;
const mockedGetUserById = userDatabase.getUserById as jest.MockedFunction<typeof userDatabase.getUserById>;
const mockedGetUserByPrivyDid = userDatabase.getUserByPrivyDid as jest.MockedFunction<typeof userDatabase.getUserByPrivyDid>;
const mockedLinkUserPrivyDid = userDatabase.linkUserPrivyDid as jest.MockedFunction<typeof userDatabase.linkUserPrivyDid>;
const mockedUnlinkUserPrivyDid = userDatabase.unlinkUserPrivyDid as jest.MockedFunction<typeof userDatabase.unlinkUserPrivyDid>;

const USER_ID = "22222222-2222-2222-2222-222222222222";

function makeRequest(
  url: string,
  init: RequestInit & { json?: unknown } = {}
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
  mockedGetUserById.mockReset();
  mockedGetUserByPrivyDid.mockReset();
  mockedLinkUserPrivyDid.mockReset();
  mockedUnlinkUserPrivyDid.mockReset();

  // Set default env variables for tests
  process.env.NEXT_PUBLIC_PRIVY_APP_ID = "mock-app-id";
  process.env.PRIVY_APP_SECRET = "mock-app-secret";
});

describe("GET /api/account/privy", () => {
  it("401s when no session", async () => {
    mockedAuth.mockResolvedValueOnce(null);
    const res = await GET();
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("Unauthorized");
  });

  it("404s when user profile is not found", async () => {
    mockedAuth.mockResolvedValueOnce({ user: { id: USER_ID } });
    mockedGetUserById.mockResolvedValueOnce(null);
    const res = await GET();
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toContain("profile not found");
  });

  it("returns connected: false and null wallet when privy_did is empty", async () => {
    mockedAuth.mockResolvedValueOnce({ user: { id: USER_ID } });
    mockedGetUserById.mockResolvedValueOnce({
      id: USER_ID,
      email: "test@alchm.kitchen",
      passwordHash: "hash",
      roles: ["user"],
      isActive: true,
      createdAt: new Date(),
      profile: { userId: USER_ID, name: "Test User", email: "test@alchm.kitchen", preferences: {} },
    });

    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.connected).toBe(false);
    expect(body.privyDid).toBeNull();
    expect(body.walletAddress).toBeNull();
  });

  it("returns connected: true, masked privyDid, and wallet when linked", async () => {
    mockedAuth.mockResolvedValueOnce({ user: { id: USER_ID } });
    mockedGetUserById.mockResolvedValueOnce({
      id: USER_ID,
      email: "test@alchm.kitchen",
      passwordHash: "hash",
      roles: ["user"],
      isActive: true,
      privyDid: "did:privy:mock-did-1234",
      walletAddress: WALLET,
      createdAt: new Date(),
      profile: { userId: USER_ID, name: "Test User", email: "test@alchm.kitchen", preferences: {} },
    });

    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.connected).toBe(true);
    expect(body.privyDid).toBe("did:privy:mock-d…1234");
    expect(body.walletAddress).toBe(WALLET);
  });
});

describe("POST /api/account/privy", () => {
  it("401s when no session", async () => {
    mockedAuth.mockResolvedValueOnce(null);
    const res = await POST(
      makeRequest("http://x/api/account/privy", {
        method: "POST",
        json: { privyToken: "token" },
      })
    );
    expect(res.status).toBe(401);
  });

  it("400s on empty token", async () => {
    mockedAuth.mockResolvedValueOnce({ user: { id: USER_ID } });
    const res = await POST(
      makeRequest("http://x/api/account/privy", {
        method: "POST",
        json: { privyToken: "   " },
      })
    );
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("required");
  });

  it("400s on invalid JSON body", async () => {
    mockedAuth.mockResolvedValueOnce({ user: { id: USER_ID } });
    const res = await POST(
      new Request("http://x/api/account/privy", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "not json",
      })
    );
    expect(res.status).toBe(400);
  });

  it("409s when Privy DID is already linked to another user account", async () => {
    mockedAuth.mockResolvedValueOnce({ user: { id: USER_ID } });
    // linkUserPrivyDid will check conflict and throw Conflict error
    mockedLinkUserPrivyDid.mockRejectedValueOnce(
      new Error("Conflict: Privy DID is already linked to a different account")
    );

    const res = await POST(
      makeRequest("http://x/api/account/privy", {
        method: "POST",
        json: { privyToken: "token" },
      })
    );
    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body.error).toContain("already linked to a different account");
    expect(mockedLinkUserPrivyDid).toHaveBeenCalledWith(USER_ID, "did:privy:mock-did-1234", WALLET);
  });

  it("links DID + server-resolved wallet and returns masked DID + wallet", async () => {
    mockedAuth.mockResolvedValueOnce({ user: { id: USER_ID } });
    mockedLinkUserPrivyDid.mockResolvedValueOnce(undefined);

    const res = await POST(
      makeRequest("http://x/api/account/privy", {
        method: "POST",
        json: { privyToken: "token" },
      })
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.privyDid).toBe("did:privy:mock-d…1234");
    expect(body.walletAddress).toBe(WALLET);
    // Wallet is resolved server-side from the verified DID, never client-sent.
    expect(mockedLinkUserPrivyDid).toHaveBeenCalledWith(USER_ID, "did:privy:mock-did-1234", WALLET);
  });
});

describe("DELETE /api/account/privy", () => {
  it("401s when no session", async () => {
    mockedAuth.mockResolvedValueOnce(null);
    const res = await DELETE();
    expect(res.status).toBe(401);
  });

  it("unlinks the current user and returns connected: false", async () => {
    mockedAuth.mockResolvedValueOnce({ user: { id: USER_ID } });
    mockedUnlinkUserPrivyDid.mockResolvedValueOnce(undefined);

    const res = await DELETE();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.connected).toBe(false);
    expect(mockedUnlinkUserPrivyDid).toHaveBeenCalledWith(USER_ID);
  });
});
