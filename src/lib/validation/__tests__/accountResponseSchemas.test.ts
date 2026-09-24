/**
 * Producer-to-consumer round trips for the account/security response schemas.
 * Each payload is built the way its route builds it (including the degrade
 * paths that send `null`), serialized, and parsed by the client schema.
 */

import {
  AgentSyncStatusResponseSchema,
  ApiKeyListResponseSchema,
  ApiKeyMintResponseSchema,
  AuthSessionsResponseSchema,
  EconomyBalanceResponseSchema,
  OnchainClaimPostResponseSchema,
  OnchainEsmsStatusSchema,
} from "../accountResponseSchemas";

/** What the browser actually receives: the payload after a JSON round trip. */
function wire(payload: unknown): unknown {
  return JSON.parse(JSON.stringify(payload));
}

const amounts = { spirit: 1.5, essence: 2, matter: 0, substance: 0.25 };

describe("security page: /api/auth/sessions", () => {
  const jwtFallbackPayload = {
    sessions: [
      { id: "current", sub: "kitchen.alchm.kitchen", device: "Mozilla/5.0 (Macintosh", loc: "—", time: "Active now", current: true },
    ],
    source: "jwt-fallback",
    memberSince: null,
  };

  it("accepts the fallback payload, whose memberSince is null", () => {
    expect(jwtFallbackPayload.memberSince).toBeNull();
    const parsed = AuthSessionsResponseSchema.safeParse(wire(jwtFallbackPayload));
    expect(parsed.success).toBe(true);
    expect(parsed.data?.sessions).toHaveLength(1);
    expect(parsed.data?.memberSince).toBeNull();
  });

  it("accepts the db payload with a signup date", () => {
    const parsed = AuthSessionsResponseSchema.safeParse(
      wire({ ...jwtFallbackPayload, source: "db", memberSince: "2026-03-01T12:00:00.000Z" }),
    );
    expect(parsed.data?.memberSince).toBe("2026-03-01T12:00:00.000Z");
  });
});

describe("security page: /api/internal/agent-sync/status", () => {
  it("accepts the fallback payload for an agent identity: active, never synced", () => {
    const parsed = AgentSyncStatusResponseSchema.safeParse(
      wire({ active: true, lastSync: null, source: "fallback" }),
    );
    expect(parsed.success).toBe(true);
    expect(parsed.data).toEqual({ active: true, lastSync: null });
  });

  it("accepts a proxied payload with a sync time", () => {
    const parsed = AgentSyncStatusResponseSchema.safeParse(
      wire({ active: true, lastSync: "2026-09-24T01:00:00Z", source: "proxy" }),
    );
    expect(parsed.data?.lastSync).toBe("2026-09-24T01:00:00Z");
  });
});

describe("/api/economy/balance", () => {
  it("accepts the full EconomyBalanceResponse and keeps the four axes", () => {
    const parsed = EconomyBalanceResponseSchema.safeParse(
      wire({
        success: true,
        balances: { ...amounts, lastDailyClaimAt: null, lastDailyClaimAgentsAt: null, updatedAt: "2026-09-24T00:00:00Z" },
        streak: { currentStreak: 3, longestStreak: 9 },
        canClaimDaily: false,
      }),
    );
    expect(parsed.data?.balances).toEqual(amounts);
  });

  it("rejects balances sent as numeric strings", () => {
    const parsed = EconomyBalanceResponseSchema.safeParse(
      wire({ success: true, balances: { spirit: "1.5", essence: "2", matter: "0", substance: "0" } }),
    );
    expect(parsed.success).toBe(false);
  });
});

describe("/api/economy/claim-onchain", () => {
  const storedClaim = {
    id: "5b1c2c9e-0000-4000-8000-000000000001",
    userId: "user-1",
    walletAddress: "0x0000000000000000000000000000000000000001",
    claimId: "0xabc",
    targetChain: "eip155:84532",
    amounts,
    status: "minted",
    txHash: "0xdef",
    error: null,
    transactionGroupId: null,
    createdAt: "2026-09-20T10:00:00.000Z",
  };

  it("accepts the GET payload with no pending claim and one recent claim", () => {
    const parsed = OnchainEsmsStatusSchema.safeParse(
      wire({
        success: true,
        configured: true,
        walletAddress: storedClaim.walletAddress,
        walletLinked: true,
        offchain: amounts,
        onchain: null,
        pendingClaim: null,
        recentClaims: [storedClaim],
        chain: {
          chainId: 84532,
          chainName: "Base Sepolia",
          testnet: true,
          contractAddress: null,
          explorerBaseUrl: "https://sepolia.basescan.org",
        },
      }),
    );
    expect(parsed.success).toBe(true);
    expect(parsed.data?.recentClaims[0]?.amounts).toEqual(amounts);
  });

  it("rejects a claim whose amounts are missing", () => {
    const { amounts: _dropped, ...noAmounts } = storedClaim;
    const parsed = OnchainEsmsStatusSchema.safeParse(
      wire({
        success: true,
        configured: true,
        walletAddress: null,
        walletLinked: false,
        offchain: amounts,
        onchain: null,
        pendingClaim: noAmounts,
        recentClaims: [],
        chain: { chainId: 8453, chainName: "Base", testnet: false, contractAddress: null, explorerBaseUrl: null },
      }),
    );
    expect(parsed.success).toBe(false);
  });

  it("accepts each POST outcome the route sends", () => {
    const claim = { claimId: "0xabc", amounts, status: "pending", txHash: "0xdef", explorerUrl: null };
    for (const payload of [
      { success: true, claim: { ...claim, status: "minted" } },
      { success: true, reconciled: true, claim: { ...claim, status: "minted" } },
      { success: false, code: "mint_pending", retryable: true, claim },
      { success: false, error: "Claim mint could not be sent — try again.", code: "mint_failed", retryable: true },
      { success: false, error: "The on-chain claim reverted; your tokens were returned.", code: "mint_reverted", refunded: true },
      { success: false, message: "Authentication required" },
    ]) {
      expect(OnchainClaimPostResponseSchema.safeParse(wire(payload)).success).toBe(true);
    }
  });
});

describe("/api/account/api-keys", () => {
  const row = {
    id: "key-1",
    name: "laptop",
    scopes: ["mcp:invoke"],
    rate_limit_tier: "standard",
    is_active: true,
    expires_at: null,
    last_used_at: null,
    usage_count: 0,
    created_at: "2026-09-24T00:00:00.000Z",
  };

  it("accepts the list and mint payloads", () => {
    expect(ApiKeyListResponseSchema.safeParse(wire({ success: true, keys: [row] })).success).toBe(true);
    const minted = ApiKeyMintResponseSchema.safeParse(wire({ success: true, key: row, plaintext: "ak_live_x" }));
    expect(minted.data?.plaintext).toBe("ak_live_x");
  });

  it("rejects a row whose usage_count is a string", () => {
    const parsed = ApiKeyListResponseSchema.safeParse(wire({ success: true, keys: [{ ...row, usage_count: "0" }] }));
    expect(parsed.success).toBe(false);
  });
});
