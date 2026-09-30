/** @jest-environment node */

import { probeEsmsContract } from "@/lib/esms-chain/contract";

const ADDRESS = "0x124ECa1bb1E106D3614A22A256f9A412FfeEAd8F";

function reader(chainId: number, code: `0x${string}` | undefined = "0x1234") {
  const getChainId = jest.fn().mockResolvedValue(chainId);
  const getBytecode = jest.fn().mockResolvedValue(code);
  const readContract = jest.fn().mockResolvedValue(false);
  return {
    client: { getChainId, getBytecode, readContract },
    getBytecode,
    readContract,
  };
}

describe("ESMS contract readiness", () => {
  const originalAddress = process.env.ESMS_CONTRACT_ADDRESS;
  const originalChain = process.env.NEXT_PUBLIC_ESMS_CHAIN;

  beforeEach(() => { process.env.ESMS_CONTRACT_ADDRESS = ADDRESS; });
  afterAll(() => {
    if (originalAddress === undefined) delete process.env.ESMS_CONTRACT_ADDRESS;
    else process.env.ESMS_CONTRACT_ADDRESS = originalAddress;
    if (originalChain === undefined) delete process.env.NEXT_PUBLIC_ESMS_CHAIN;
    else process.env.NEXT_PUBLIC_ESMS_CHAIN = originalChain;
  });

  it("identifies the alert's empty-read cause when the address has no code on Base mainnet", async () => {
    process.env.NEXT_PUBLIC_ESMS_CHAIN = "base";
    const mock = reader(8453, "0x");

    const check = await probeEsmsContract(mock.client);

    expect(check).toMatchObject({ status: "contract-missing", expectedChainId: 8453, rpcChainId: 8453 });
    expect(check.message).toContain(ADDRESS);
    expect(mock.readContract).not.toHaveBeenCalled();
  });

  it("detects an RPC pointed at the wrong chain before reading code", async () => {
    process.env.NEXT_PUBLIC_ESMS_CHAIN = "base-sepolia";
    const mock = reader(8453);

    const check = await probeEsmsContract(mock.client);

    expect(check).toMatchObject({ status: "rpc-chain-mismatch", expectedChainId: 84532, rpcChainId: 8453 });
    expect(mock.getBytecode).not.toHaveBeenCalled();
  });

  it("checks the RPC chain even when no contract address is configured", async () => {
    process.env.NEXT_PUBLIC_ESMS_CHAIN = "base-sepolia";
    delete process.env.ESMS_CONTRACT_ADDRESS;
    const mock = reader(8453);

    const check = await probeEsmsContract(mock.client);

    expect(check).toMatchObject({ status: "rpc-chain-mismatch", rpcChainId: 8453 });
    expect(mock.getBytecode).not.toHaveBeenCalled();
  });

  it("marks the Sepolia proxy ready only after redeemedOrders is callable", async () => {
    process.env.NEXT_PUBLIC_ESMS_CHAIN = "base-sepolia";
    const mock = reader(84532);

    const check = await probeEsmsContract(mock.client);

    expect(check.status).toBe("ready");
    expect(mock.readContract).toHaveBeenCalledWith(expect.objectContaining({
      address: ADDRESS,
      functionName: "redeemedOrders",
    }));
  });
});
