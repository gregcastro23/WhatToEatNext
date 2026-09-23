/**
 * Decoders for the alchm-agents-solana program's on-chain accounts.
 *
 * Layouts are the Anchor structs in programs/asol_program/src/state.rs and
 * state/amm.rs (8-byte discriminator, then borsh fields in declaration
 * order), plus the BPF upgradeable loader's ProgramData header. Verified
 * byte-for-byte against devnet on 2026-09-22 (pool 0 reserves matched the
 * 2026-09-04 audit receipt exactly).
 *
 * @file src/services/admin/solanaDecode.ts
 */

const B58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

export function base58Encode(bytes: Uint8Array): string {
  let zeros = 0;
  while (zeros < bytes.length && bytes[zeros] === 0) zeros += 1;
  const digits: number[] = [];
  for (const byte of bytes.subarray(zeros)) {
    let carry = byte;
    for (let j = 0; j < digits.length; j += 1) {
      carry += (digits[j] ?? 0) << 8;
      digits[j] = carry % 58;
      carry = Math.floor(carry / 58);
    }
    while (carry > 0) {
      digits.push(carry % 58);
      carry = Math.floor(carry / 58);
    }
  }
  return "1".repeat(zeros) + digits.reverse().map((d) => B58[d] ?? "").join("");
}

export interface DecodedPool {
  version: number;
  poolId: number;
  elementA: number;
  elementB: number;
  feeBps: number;
  reserveA: string;
  reserveB: string;
  totalShares: string;
  bootstrapped: boolean;
  paused: boolean;
}

/** ConstellationPool: disc(8) u8 u16 u8 u8 u16 u64 u64 u64 bool bool u8 = 42 bytes. */
export function decodeConstellationPool(data: Buffer): DecodedPool | null {
  if (data.length < 42) return null;
  return {
    version: data.readUInt8(8),
    poolId: data.readUInt16LE(9),
    elementA: data.readUInt8(11),
    elementB: data.readUInt8(12),
    feeBps: data.readUInt16LE(13),
    reserveA: data.readBigUInt64LE(15).toString(),
    reserveB: data.readBigUInt64LE(23).toString(),
    totalShares: data.readBigUInt64LE(31).toString(),
    bootstrapped: data.readUInt8(39) === 1,
    paused: data.readUInt8(40) === 1,
  };
}

export interface DecodedConfig {
  version: number;
  admin: string;
  attestor: string;
  pauser: string;
  pauseClaims: boolean;
  pauseRedemptions: boolean;
}

/** ProgramConfig: disc(8) u8 pubkey×3 [u8;32] bool bool u8 = 140 bytes. */
export function decodeProgramConfig(data: Buffer): DecodedConfig | null {
  if (data.length < 140) return null;
  return {
    version: data.readUInt8(8),
    admin: base58Encode(data.subarray(9, 41)),
    attestor: base58Encode(data.subarray(41, 73)),
    pauser: base58Encode(data.subarray(73, 105)),
    pauseClaims: data.readUInt8(137) === 1,
    pauseRedemptions: data.readUInt8(138) === 1,
  };
}

/** BPF upgradeable ProgramData header: u32 tag(=3) u64 slot Option<Pubkey>. */
export function decodeProgramDataHeader(
  data: Buffer,
): { lastDeploySlot: number; upgradeAuthority: string | null } | null {
  if (data.length < 13 || data.readUInt32LE(0) !== 3) return null;
  const hasAuthority = data.readUInt8(12) === 1 && data.length >= 45;
  return {
    lastDeploySlot: Number(data.readBigUInt64LE(4)),
    upgradeAuthority: hasAuthority ? base58Encode(data.subarray(13, 45)) : null,
  };
}
