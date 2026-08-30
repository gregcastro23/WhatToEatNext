/**
 * SPL mirror gate: the flag must be literally "true" AND all four mints must
 * parse as base58, or the mirror is OFF. Follows the cryptoPromo.test
 * discipline ("TRUE" and "1" are both false) — the doctrine is "never
 * advertise a crypto rail that isn't actually live."
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  ESMS_SPL_UTILITY,
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

  it("publishes the closed-loop, non-transferable utility doctrine", () => {
    expect(ESMS_SPL_UTILITY).toEqual({
      soulbound: true,
      closedLoop: true,
      decimals: 4,
      disclosure:
        "Non-transferable culinary alchemy units for closed-loop use in alchm.kitchen.",
    });
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

  // The gate fails CLOSED, which is right but silent: one mistyped character
  // in a documented address turns the mirror off with no error anywhere.
  // These assert the shipped .env.example would actually pass the gate.
  describe(".env.example documented mints", () => {
    const envExample = readFileSync(
      join(process.cwd(), ".env.example"),
      "utf8",
    );

    const documented = (name: string): string | undefined =>
      new RegExp(`^${name}=(.+)$`, "m").exec(envExample)?.[1]?.trim();

    it.each([
      ["NEXT_PUBLIC_ESMS_SPL_MINT_SPIRIT", "spirit"],
      ["NEXT_PUBLIC_ESMS_SPL_MINT_ESSENCE", "essence"],
      ["NEXT_PUBLIC_ESMS_SPL_MINT_MATTER", "matter"],
      ["NEXT_PUBLIC_ESMS_SPL_MINT_SUBSTANCE", "substance"],
    ] as const)("%s is present and passes the base58 validator", (envName, coin) => {
      const value = documented(envName);
      expect(value).toBeDefined();
      process.env[envName] = value;
      expect(esmsSplMintAddress(coin)).toBe(value);
    });

    it("the documented set as a whole opens the gate once the flag is set", () => {
      for (const name of [
        "NEXT_PUBLIC_ESMS_SPL_MINT_SPIRIT",
        "NEXT_PUBLIC_ESMS_SPL_MINT_ESSENCE",
        "NEXT_PUBLIC_ESMS_SPL_MINT_MATTER",
        "NEXT_PUBLIC_ESMS_SPL_MINT_SUBSTANCE",
      ]) {
        process.env[name] = documented(name);
      }
      // Ships as false on purpose — a copied env must not advertise the rail.
      expect(documented("NEXT_PUBLIC_ESMS_SPL_ENABLED")).toBe("false");
      expect(esmsSplMirrorEnabled()).toBe(false);
      process.env.NEXT_PUBLIC_ESMS_SPL_ENABLED = "true";
      expect(esmsSplMirrorEnabled()).toBe(true);
    });

    it("the four documented mints are distinct (no copy-paste of one address)", () => {
      const all = [
        "NEXT_PUBLIC_ESMS_SPL_MINT_SPIRIT",
        "NEXT_PUBLIC_ESMS_SPL_MINT_ESSENCE",
        "NEXT_PUBLIC_ESMS_SPL_MINT_MATTER",
        "NEXT_PUBLIC_ESMS_SPL_MINT_SUBSTANCE",
      ].map(documented);
      expect(new Set(all).size).toBe(4);
    });
  });

  describe("zero-signer runtime custody boundary (ADR-014)", () => {
    it("package.json runtime dependencies contains zero @solana/* or @coral-xyz/* packages", () => {
      const pkgJson = JSON.parse(
        readFileSync(join(process.cwd(), "package.json"), "utf8"),
      ) as { dependencies?: Record<string, string> };

      const runtimeDeps = Object.keys(pkgJson.dependencies ?? {});
      const solanaDeps = runtimeDeps.filter(
        (dep) => dep.startsWith("@solana/") || dep.startsWith("@coral-xyz/"),
      );

      expect(solanaDeps).toEqual([]);
    });

    it("solanaMirror transitive closure introduces zero network calls, dynamic imports, or key material", () => {
      const mirrorSource = readFileSync(
        join(process.cwd(), "src/lib/esms-chain/solanaMirror.ts"),
        "utf8",
      );

      // Verify zero imports in solanaMirror.ts
      const importStatements = mirrorSource.match(/import\s+.*?from\s+['"].*?['"]/g);
      expect(importStatements).toBeNull();

      // Verify no dynamic import, fetch, XHR, or key material identifiers
      expect(mirrorSource).not.toMatch(/\bimport\s*\(/);
      expect(mirrorSource).not.toMatch(/\bfetch\s*\(/);
      expect(mirrorSource).not.toMatch(/\bXMLHttpRequest\b/);
      expect(mirrorSource).not.toMatch(/\bKeypair\b/);
      expect(mirrorSource).not.toMatch(/\bPrivateKey\b/);
      expect(mirrorSource).not.toMatch(/\bSigner\b/);
    });
  });
});
