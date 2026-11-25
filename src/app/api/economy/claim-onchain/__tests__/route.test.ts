import { NextRequest } from "next/server";

const mockGetDatabaseUserFromRequest = jest.fn();
const mockRateLimit = jest.fn();
const mockExecuteQuery = jest.fn();
const mockEsmsOnchainConfigured = jest.fn();
const mockMinterConfigured = jest.fn();
const mockReadEsmsClaimed = jest.fn();
const mockReadEsmsBalances = jest.fn();
const mockWaitForTransactionReceipt = jest.fn();
const mockMintEsmsClaim = jest.fn();
const mockGetBalances = jest.fn();
const mockDebitAllTokens = jest.fn();
const mockCreditMultipleTokens = jest.fn();
const mockFindPending = jest.fn();
const mockCreatePending = jest.fn();
const mockAttachDebit = jest.fn();
const mockRecordTxHash = jest.fn();
const mockMarkMinted = jest.fn();
const mockRecordError = jest.fn();
const mockMarkRefunded = jest.fn();

jest.mock("@/lib/auth/validateRequest", () => ({
  getDatabaseUserFromRequest: (...args: unknown[]) => mockGetDatabaseUserFromRequest(...args),
}));
jest.mock("@/lib/rateLimit", () => ({
  rateLimit: (...args: unknown[]) => mockRateLimit(...args),
}));
jest.mock("@/lib/database", () => ({
  executeQuery: (...args: unknown[]) => mockExecuteQuery(...args),
}));
jest.mock("@/lib/esms-chain/contract", () => ({
  esmsCaip2: () => "eip155:84532",
  esmsChain: () => ({ id: 84532, name: "Base Sepolia", testnet: true, blockExplorers: { default: { url: "https://sepolia.basescan.org" } } }),
  esmsContractAddress: () => "0x2222222222222222222222222222222222222222",
  esmsOnchainConfigured: () => mockEsmsOnchainConfigured(),
  esmsPublicClient: () => ({ waitForTransactionReceipt: (...args: unknown[]) => mockWaitForTransactionReceipt(...args) }),
  readEsmsBalances: (...args: unknown[]) => mockReadEsmsBalances(...args),
  readEsmsClaimed: (...args: unknown[]) => mockReadEsmsClaimed(...args),
}));
jest.mock("@/lib/esms-chain/minter", () => ({
  minterConfigured: () => mockMinterConfigured(),
  mintEsmsClaim: (...args: unknown[]) => mockMintEsmsClaim(...args),
}));
jest.mock("@/services/TokenEconomyService", () => ({
  tokenEconomy: {
    getBalances: (...args: unknown[]) => mockGetBalances(...args),
    debitAllTokens: (...args: unknown[]) => mockDebitAllTokens(...args),
    creditMultipleTokens: (...args: unknown[]) => mockCreditMultipleTokens(...args),
  },
}));
jest.mock("@/services/esmsOnchainClaimService", () => ({
  esmsOnchainClaimService: {
    findPending: (...args: unknown[]) => mockFindPending(...args),
    listRecent: jest.fn().mockResolvedValue([]),
    createPending: (...args: unknown[]) => mockCreatePending(...args),
    attachDebit: (...args: unknown[]) => mockAttachDebit(...args),
    recordTxHash: (...args: unknown[]) => mockRecordTxHash(...args),
    markMinted: (...args: unknown[]) => mockMarkMinted(...args),
    recordError: (...args: unknown[]) => mockRecordError(...args),
    markRefunded: (...args: unknown[]) => mockMarkRefunded(...args),
  },
}));
jest.mock("@/utils/logger", () => ({
  createLogger: () => ({ info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() }),
}));

import { POST } from "../route";

const WALLET = "0x1111111111111111111111111111111111111111";

function postReq(): NextRequest {
  return new NextRequest("http://localhost:3000/api/economy/claim-onchain", { method: "POST" });
}

describe("POST /api/economy/claim-onchain quantization", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetDatabaseUserFromRequest.mockResolvedValue({ id: "user-1", walletAddress: WALLET });
    mockRateLimit.mockResolvedValue({ allowed: true });
    mockEsmsOnchainConfigured.mockReturnValue(true);
    mockMinterConfigured.mockReturnValue(true);
    mockFindPending.mockResolvedValue(null);
    mockWaitForTransactionReceipt.mockResolvedValue({ status: "success" });
    mockReadEsmsBalances.mockResolvedValue({ spirit: 0n, essence: 0n, matter: 0n, substance: 0n });
    mockMintEsmsClaim.mockResolvedValue("0xtxhash");
  });

  it("quantizes production-scale off-chain balances with 4-dp floor and passes exact decimal strings", async () => {
    mockGetBalances.mockResolvedValue({
      spirit: 4599.35009,
      essence: 0,
      matter: 0.00019,
      substance: 0,
    });
    mockCreatePending.mockResolvedValue({
      id: "claim-row-1",
      userId: "user-1",
      walletAddress: WALLET,
      claimId: "0xclaim1",
      targetChain: "eip155:84532",
      amounts: { spirit: 4599.35, essence: 0, matter: 0.0001, substance: 0 },
      status: "pending",
      txHash: null,
      error: null,
      transactionGroupId: null,
      createdAt: "2026-11-24T00:00:00Z",
    });
    mockDebitAllTokens.mockResolvedValue({
      success: true,
      transactionGroupId: "grp-1",
      balances: { spirit: 0.00009, essence: 0, matter: 0.00009, substance: 0 },
    });

    const res = await POST(postReq());
    expect(res.status).toBe(200);
    expect(mockDebitAllTokens).toHaveBeenCalledWith(
      "user-1",
      { spirit: 4599.35, essence: 0, matter: 0.0001, substance: 0 },
      "onchain_claim",
      expect.objectContaining({ sourceId: "claim-row-1" }),
    );
    expect(mockMintEsmsClaim).toHaveBeenCalledWith({
      to: WALLET,
      claimId: "0xclaim1",
      amounts: {
        spirit: "4599.3500",
        essence: "0.0000",
        matter: "0.0001",
        substance: "0.0000",
      },
    });
  });

  it("fails closed with 500 on corrupted NaN or negative balances without debiting or minting", async () => {
    mockGetBalances.mockResolvedValue({ spirit: Number.NaN, essence: -1, matter: 0, substance: 0 });

    const res = await POST(postReq());
    const body = await res.json();
    expect(res.status).toBe(500);
    expect(body.code).toBe("invalid_balance");
    expect(mockCreatePending).not.toHaveBeenCalled();
    expect(mockDebitAllTokens).not.toHaveBeenCalled();
    expect(mockMintEsmsClaim).not.toHaveBeenCalled();
  });

  it("preserves stored 4-dp pending claim amounts on retry without re-flooring drift", async () => {
    mockFindPending.mockResolvedValue({
      id: "claim-row-2",
      userId: "user-1",
      walletAddress: WALLET,
      claimId: "0xclaim2",
      targetChain: "eip155:84532",
      amounts: { spirit: 0.0029, essence: 0.0058, matter: 1.5, substance: 0 },
      status: "pending",
      txHash: null,
      error: null,
      transactionGroupId: "grp-2",
      createdAt: "2026-11-24T00:00:00Z",
    });
    mockReadEsmsClaimed.mockResolvedValue(false);

    const res = await POST(postReq());
    expect(res.status).toBe(200);
    expect(mockMintEsmsClaim).toHaveBeenCalledWith({
      to: WALLET,
      claimId: "0xclaim2",
      amounts: {
        spirit: "0.0029",
        essence: "0.0058",
        matter: "1.5000",
        substance: "0.0000",
      },
    });
  });
});
