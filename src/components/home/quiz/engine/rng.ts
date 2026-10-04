/**
 * Seeded randomness for question variety. Each session draws one seed; every
 * choice the selector makes is then reproducible from (seed, step), so a
 * restored session asks the same next question and tests are deterministic.
 */

/** mulberry32: a small, well-distributed 32-bit PRNG. Returns [0, 1). */
export function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return (): number => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** The generator for one selection step of one session. */
export function stepRandom(seed: number, step: number): () => number {
  return mulberry32((seed ^ Math.imul(step + 1, 2654435761)) >>> 0);
}

/** A fresh 32-bit session seed. */
export function newSeed(): number {
  const buffer = new Uint32Array(1);
  globalThis.crypto.getRandomValues(buffer);
  return buffer[0] ?? 1;
}
