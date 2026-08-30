/** @jest-environment node */

const executeQuery = jest.fn();
const logError = jest.fn();
const mirrorEnabled = jest.fn();
const mirrorCluster = jest.fn();
const mintAddress = jest.fn();

jest.mock("@/lib/database", () => ({ executeQuery }));
jest.mock("@/lib/logger", () => ({
  _logger: { debug: jest.fn(), error: logError, info: jest.fn(), warn: jest.fn() },
}));
jest.mock("@/lib/esms-chain/solanaMirror", () => ({
  esmsSplMirrorEnabled: () => mirrorEnabled(),
  esmsSplCluster: () => mirrorCluster(),
  esmsSplMintAddress: (coin: string) => mintAddress(coin),
}));
jest.mock("@/lib/esms-chain/contract", () => ({ esmsCaip2: () => "eip155:84532" }));

import {
  checkSolanaSupplyInvariants,
  type SupplyAtoms,
} from "@/services/economyIntegrityService";

const ledgerRow = {
  spirit: "10.0000",
  essence: "20.0000",
  matter: "30.0000",
  substance: "40.0000",
};

const backedSupply: SupplyAtoms = {
  spirit: 100_000n,
  essence: 200_000n,
  matter: 300_000n,
  substance: 400_000n,
};

beforeEach(() => {
  jest.clearAllMocks();
  mirrorEnabled.mockReturnValue(true);
  mirrorCluster.mockReturnValue("mainnet-beta");
  mintAddress.mockImplementation((coin: string) => `${coin}-mint-address`);
  executeQuery.mockResolvedValue({ rows: [ledgerRow] });
});

describe("Solana aggregate supply invariant", () => {
  it("accepts supply exactly backed by rail-scoped minted claims", async () => {
    const readSupply = jest.fn().mockResolvedValue(backedSupply);

    const result = await checkSolanaSupplyInvariants("mainnet-beta", readSupply);

    expect(result).toMatchObject({ enabled: true, live: true, violations: [] });
    expect(executeQuery).toHaveBeenCalledWith(
      expect.stringContaining("target_chain = $1 AND status = 'minted'"),
      ["solana:mainnet-beta"],
    );
  });

  it("flags a single 0.0001-token atom above ledger with no epsilon", async () => {
    const readSupply = jest.fn().mockResolvedValue({
      ...backedSupply,
      spirit: backedSupply.spirit + 1n,
    });

    const result = await checkSolanaSupplyInvariants("mainnet-beta", readSupply);

    expect(result.violations).toEqual([
      { token: "spirit", onchainAtoms: "100001", ledgerAtoms: "100000" },
    ]);
    expect(logError).toHaveBeenCalledWith(
      "[economyIntegrity] Solana supply exceeds ledger backing",
      expect.objectContaining({ cluster: "mainnet-beta" }),
    );
  });

  it("does not query either boundary when the mirror is intentionally off", async () => {
    mirrorEnabled.mockReturnValue(false);
    const readSupply = jest.fn();

    const result = await checkSolanaSupplyInvariants("mainnet-beta", readSupply);

    expect(result).toMatchObject({ enabled: false, live: true, violations: [] });
    expect(executeQuery).not.toHaveBeenCalled();
    expect(readSupply).not.toHaveBeenCalled();
  });

  it("reports an unreadable live check and logs the production failure", async () => {
    const failure = new Error("RPC unavailable");
    const readSupply = jest.fn().mockRejectedValue(failure);

    const result = await checkSolanaSupplyInvariants("mainnet-beta", readSupply);

    expect(result).toMatchObject({ enabled: true, live: false, violations: [] });
    expect(logError).toHaveBeenCalledWith(
      "[economyIntegrity] Solana supply invariant failed:",
      failure,
    );
  });
});
