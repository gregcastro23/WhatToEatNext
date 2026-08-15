/**
 * SPL mirror gate: the flag must be literally "true" AND all four mints must
 * parse as base58, or the mirror is OFF. Follows the cryptoPromo.test
 * discipline ("TRUE" and "1" are both false) — the doctrine is "never
 * advertise a crypto rail that isn't actually live."
 */

import {
  esmsSplCluster,
  esmsSplExplorerUrl,
  esmsSplMintAddress,
  esmsSplMirrorEnabled,
} from "@/lib/esms-chain/solanaMirror";

// Valid base58, 44 chars (a real devnet-shaped address).
const MINT = "K5kwwomtWYydxJacA7bC5yUEW9TtEuVqBKBoqAWLmhQ";

const MIRROR_ENVS = [
  "NEXT_PUBLIC_ESMS_SPL_ENABLED",
  "NEXT_PUBLIC_ESMS_SPL_CLUSTER",
  "NEXT_PUBLIC_ESMS_SPL_MINT_SPIRIT",
  "NEXT_PUBLIC_ESMS_SPL_MINT_ESSENCE",
  "NEXT_PUBLIC_ESMS_SPL_MINT_MATTER",
  "NEXT_PUBLIC_ESMS_SPL_MINT_SUBSTANCE",
];

function configureAllMints(): void {
  process.env.NEXT_PUBLIC_ESMS_SPL_MINT_SPIRIT = MINT;
  process.env.NEXT_PUBLIC_ESMS_SPL_MINT_ESSENCE = MINT;
  process.env.NEXT_PUBLIC_ESMS_SPL_MINT_MATTER = MINT;
  process.env.NEXT_PUBLIC_ESMS_SPL_MINT_SUBSTANCE = MINT;
}

describe("solanaMirror gate", () => {
  const saved: Record<string, string | undefined> = {};

  beforeEach(() => {
    for (const key of MIRROR_ENVS) {
      saved[key] = process.env[key];
      delete process.env[key];
    }
  });

  afterEach(() => {
    for (const key of MIRROR_ENVS) {
      if (saved[key] === undefined) delete process.env[key];
      else process.env[key] = saved[key];
    }
  });

  it("is OFF with no configuration", () => {
    expect(esmsSplMirrorEnabled()).toBe(false);
  });

  it('requires the literal "true" — "TRUE" and "1" are both false', () => {
    configureAllMints();
    process.env.NEXT_PUBLIC_ESMS_SPL_ENABLED = "TRUE";
    expect(esmsSplMirrorEnabled()).toBe(false);
    process.env.NEXT_PUBLIC_ESMS_SPL_ENABLED = "1";
    expect(esmsSplMirrorEnabled()).toBe(false);
    process.env.NEXT_PUBLIC_ESMS_SPL_ENABLED = "true";
    expect(esmsSplMirrorEnabled()).toBe(true);
  });

  it("stays OFF when any one mint is missing — no three-of-four mirror", () => {
    configureAllMints();
    process.env.NEXT_PUBLIC_ESMS_SPL_ENABLED = "true";
    delete process.env.NEXT_PUBLIC_ESMS_SPL_MINT_MATTER;
    expect(esmsSplMirrorEnabled()).toBe(false);
  });

  it("rejects non-base58 addresses (0, O, I, l are not in the alphabet)", () => {
    configureAllMints();
    process.env.NEXT_PUBLIC_ESMS_SPL_ENABLED = "true";
    process.env.NEXT_PUBLIC_ESMS_SPL_MINT_SPIRIT = "0OIl" + MINT.slice(4);
    expect(esmsSplMintAddress("spirit")).toBeUndefined();
    expect(esmsSplMirrorEnabled()).toBe(false);
  });

  it("defaults the cluster to devnet (testnet-safe default)", () => {
    expect(esmsSplCluster()).toBe("devnet");
    process.env.NEXT_PUBLIC_ESMS_SPL_CLUSTER = "mainnet-beta";
    expect(esmsSplCluster()).toBe("mainnet-beta");
    process.env.NEXT_PUBLIC_ESMS_SPL_CLUSTER = "typo-cluster";
    expect(esmsSplCluster()).toBe("devnet");
  });

  it("explorer URLs carry the cluster only off mainnet", () => {
    expect(esmsSplExplorerUrl(MINT)).toBe(
      `https://explorer.solana.com/address/${MINT}?cluster=devnet`,
    );
    process.env.NEXT_PUBLIC_ESMS_SPL_CLUSTER = "mainnet-beta";
    expect(esmsSplExplorerUrl(MINT)).toBe(
      `https://explorer.solana.com/address/${MINT}`,
    );
  });
});
