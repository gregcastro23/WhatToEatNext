/**
 * Golden vectors: real devnet account bytes (captured 2026-09-22) decoded and
 * compared to the values the ASOL audit receipt recorded on 2026-09-04.
 * If the Anchor layout ever shifts by a byte, these fail instead of the
 * admin page quietly printing a wrong reserve or admin key.
 *
 * @file src/services/admin/__tests__/solanaDecode.test.ts
 */

import {
  base58Encode,
  decodeConstellationPool,
  decodeProgramConfig,
  decodeProgramDataHeader,
} from "@/services/admin/solanaDecode";

const POOL_0 = "ejAjAePxd5cBAAAAAR4AIC/2BQAAAAAyk/UFAAAAAADh9QUAAAAAAQD/";
const PROGRAM_CONFIG =
  "xNJa55CVjD8BkBCkR7bp0juTLW2QN9rR0o/ZVsc7yY0paVCOTZVPwP6QEKRHtunSO5MtbZA32tHSj9lWxzvJjSlpUI5NlU/A/pAQpEe26dI7ky1tkDfa0dKP2VbHO8mNKWlQjk2VT8D+jHudHi3axIOjS4S2e8TomCln+adzBhpebXI0cUkleJkAAP8=";
const PROGRAM_DATA_HEADER = "AwAAAGhXZB0AAAAAAZAQpEe26dI7ky1tkDfa0dKP2VbHO8mNKWlQjk2VT8D+";
const DEPLOYER = "AhNRjjyhJ4dR6ZSvWyJNSpbJFbFnxhkRdUNMY31fJ3S5";

describe("base58Encode", () => {
  it("encodes leading zero bytes as '1' and the system program id", () => {
    expect(base58Encode(new Uint8Array(32))).toBe("11111111111111111111111111111111");
    expect(base58Encode(new Uint8Array([0, 0, 1]))).toBe("112");
  });
});

describe("decodeConstellationPool", () => {
  it("decodes devnet pool 0 to the audit receipt's reserves", () => {
    const pool = decodeConstellationPool(Buffer.from(POOL_0, "base64"));
    expect(pool).toEqual({
      version: 1,
      poolId: 0,
      elementA: 0,
      elementB: 1,
      feeBps: 30,
      reserveA: "100020000",
      reserveB: "99980082",
      totalShares: "100000000",
      bootstrapped: true,
      paused: false,
    });
  });

  it("refuses a truncated account instead of reading garbage", () => {
    expect(decodeConstellationPool(Buffer.alloc(20))).toBeNull();
  });
});

describe("decodeProgramConfig", () => {
  it("decodes admin/attestor/pauser to the deployer and both pause flags off", () => {
    const config = decodeProgramConfig(Buffer.from(PROGRAM_CONFIG, "base64"));
    expect(config).toEqual({
      version: 1,
      admin: DEPLOYER,
      attestor: DEPLOYER,
      pauser: DEPLOYER,
      pauseClaims: false,
      pauseRedemptions: false,
    });
  });
});

describe("decodeProgramDataHeader", () => {
  it("reads the last deploy slot and upgrade authority", () => {
    expect(decodeProgramDataHeader(Buffer.from(PROGRAM_DATA_HEADER, "base64"))).toEqual({
      lastDeploySlot: 493115240,
      upgradeAuthority: DEPLOYER,
    });
  });

  it("rejects an account that is not ProgramData (tag != 3)", () => {
    const notProgramData = Buffer.from(PROGRAM_DATA_HEADER, "base64");
    notProgramData.writeUInt32LE(2, 0);
    expect(decodeProgramDataHeader(notProgramData)).toBeNull();
  });
});
