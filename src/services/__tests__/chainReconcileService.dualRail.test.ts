/**
 * @jest-environment node
 *
 * Dual-rail ledger isolation and invariant tests for chainReconcileService.
 */

const mockExecuteQuery = jest.fn();
jest.mock("@/lib/database", () => ({
  executeQuery: (...args: unknown[]) => mockExecuteQuery(...args),
}));

const mockReadEsmsBalances = jest.fn();
const mockReadEsmsClaimed = jest.fn();
const mockEsmsOnchainConfigured = jest.fn();
jest.mock("@/lib/esms-chain/contract", () => ({
  esmsOnchainConfigured: () => mockEsmsOnchainConfigured(),
  readEsmsBalances: (wallet: string) => mockReadEsmsBalances(wallet),
  readEsmsClaimed: (claimId: string) => mockReadEsmsClaimed(claimId),
  readEsmsRedeemed: jest.fn(),
}));

const mockMintEsmsClaim = jest.fn();
const mockMinterConfigured = jest.fn();
jest.mock("@/lib/esms-chain/minter", () => ({
  mintEsmsClaim: (opts: unknown) => mockMintEsmsClaim(opts),
  minterConfigured: () => mockMinterConfigured(),
}));

jest.mock("@/lib/recipe-nft/contract", () => ({
  recipeNftEnabled: () => false,
}));
jest.mock("@/lib/recipe-nft/minter", () => ({
  defaultRecipient: () => "0x0000000000000000000000000000000000000000",
  mintRecipeOnChain: jest.fn(),
}));

import {
  checkWalletInvariants,
  settleStaleClaims,
} from "@/services/chainReconcileService";
import { esmsOnchainClaimService } from "@/services/esmsOnchainClaimService";
import { walletInvariantsSql } from "@/services/tokenEconomyQueries";
import { parseUnits } from "viem";

describe("chainReconcileService - Dual-Rail Ledger Isolation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("checkWalletInvariants", () => {
    it("returns notConfigured: true for solana:* rails (authority managed elsewhere)", async () => {
      const res = await checkWalletInvariants("solana:mainnet-beta", 20);
      expect(res).toEqual({
        walletsChecked: 0,
        walletsTotal: 0,
        violations: [],
        failures: 0,
        notConfigured: true,
      });
      expect(mockExecuteQuery).not.toHaveBeenCalled();
    });

    it("returns notConfigured: true when eip155 contract is not configured", async () => {
      mockEsmsOnchainConfigured.mockReturnValue(false);
      const res = await checkWalletInvariants("eip155:84532", 20);
      expect(res).toEqual({
        walletsChecked: 0,
        walletsTotal: 0,
        violations: [],
        failures: 0,
        notConfigured: true,
      });
    });

    it("scopes query by rail, counts total wallets, and respects 0.0001 EPSILON for Base", async () => {
      mockEsmsOnchainConfigured.mockReturnValue(true);
      const wallet = "0x1111111111111111111111111111111111111111";

      // 1st call: total distinct wallets
      // 2nd call: rows for invariants
      mockExecuteQuery
        .mockResolvedValueOnce({ rows: [{ total: 42 }] })
        .mockResolvedValueOnce({
          rows: [
            {
              wallet_address: wallet,
              spirit: "10.0000",
              essence: "5.0000",
              matter: "2.0000",
              substance: "1.0000",
            },
          ],
        });

      // On-chain returns spirit within EPSILON tolerance (10.00005 vs 10.0000 -> <= 10.0001)
      mockReadEsmsBalances.mockResolvedValue({
        spirit: parseUnits("10.00005", 18),
        essence: parseUnits("5.0000", 18),
        matter: parseUnits("2.0000", 18),
        substance: parseUnits("1.0000", 18),
      });

      const res = await checkWalletInvariants("eip155:84532", 20);

      expect(res.walletsTotal).toBe(42);
      expect(res.walletsChecked).toBe(1);
      expect(res.violations).toHaveLength(0);
      expect(res.failures).toBe(0);

      // Verify the query passed the rail parameter
      expect(mockExecuteQuery).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining("c.target_chain = $1"),
        ["eip155:84532", 20],
      );
    });

    it("records violation when on-chain exceeds ledger + 0.0001 on Base", async () => {
      mockEsmsOnchainConfigured.mockReturnValue(true);
      const wallet = "0x2222222222222222222222222222222222222222";

      mockExecuteQuery
        .mockResolvedValueOnce({ rows: [{ total: 5 }] })
        .mockResolvedValueOnce({
          rows: [
            {
              wallet_address: wallet,
              spirit: "10.0000",
              essence: "5.0000",
              matter: "2.0000",
              substance: "1.0000",
            },
          ],
        });

      // On-chain returns 10.0002 (exceeds 10.0000 + 0.0001)
      mockReadEsmsBalances.mockResolvedValue({
        spirit: parseUnits("10.0002", 18),
        essence: parseUnits("5.0000", 18),
        matter: parseUnits("2.0000", 18),
        substance: parseUnits("1.0000", 18),
      });

      const res = await checkWalletInvariants("eip155:84532", 20);

      expect(res.violations).toHaveLength(1);
      expect(res.violations[0]).toEqual({
        wallet,
        coin: "spirit",
        onchain: 10.0002,
        ledger: 10,
      });
    });
  });

  describe("settleStaleClaims", () => {
    it("returns empty summary immediately for solana:* rail", async () => {
      const listSpy = jest.spyOn(esmsOnchainClaimService, "listStalePending");
      const res = await settleStaleClaims("solana:mainnet-beta", 25);
      expect(res).toEqual({ scanned: 0, reconciled: 0, retried: 0, failures: 0 });
      expect(listSpy).not.toHaveBeenCalled();
    });

    it("passes rail to listStalePending and reconciles already claimed mints", async () => {
      mockEsmsOnchainConfigured.mockReturnValue(true);
      mockMinterConfigured.mockReturnValue(true);

      const listSpy = jest
        .spyOn(esmsOnchainClaimService, "listStalePending")
        .mockResolvedValueOnce([
          {
            id: "claim-1",
            claimId: "0xclaim1",
            userId: "u1",
            walletAddress: "0x1111111111111111111111111111111111111111",
            amounts: { spirit: 1, essence: 2, matter: 3, substance: 4 },
            status: "pending",
            txHash: null,
            targetChain: "eip155:84532",
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ]);
      const markSpy = jest
        .spyOn(esmsOnchainClaimService, "markMinted")
        .mockResolvedValueOnce(undefined as never);
      mockReadEsmsClaimed.mockResolvedValueOnce(true);

      const res = await settleStaleClaims("eip155:84532", 25);

      expect(listSpy).toHaveBeenCalledWith(30, 25, "eip155:84532");
      expect(mockReadEsmsClaimed).toHaveBeenCalledWith("0xclaim1");
      expect(markSpy).toHaveBeenCalledWith("claim-1");
      expect(res).toEqual({ scanned: 1, reconciled: 1, retried: 0, failures: 0 });
    });
  });

  describe("walletInvariantsSql", () => {
    it("includes hourly rotation expression and rail parameter", () => {
      const q = walletInvariantsSql({ rail: "eip155:84532", maxWallets: 20 });
      expect(q.sql).toContain(
        "ORDER BY md5(u.wallet_address || to_char(now(), 'YYYY-MM-DD-HH24'))",
      );
      expect(q.sql).toContain("c.target_chain = $1");
      expect(q.values).toEqual(["eip155:84532", 20]);
    });
  });
});
