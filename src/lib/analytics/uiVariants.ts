"use client";

/**
 * Deterministic UI variant assignment with URL override (?variant=, ?exp=,
 * ?ab=) and sticky per-tab sessionStorage persistence (`alchm:ui-variant`).
 *
 * @file src/lib/analytics/uiVariants.ts
 */

import { setActiveUiVariant } from "@/components/analytics/PageViewTracker";

const STORAGE_KEY = "alchm:ui-variant";
const SEED_KEY = "alchm:pv-session";

function hashSeed(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function matchArm<T extends string>(raw: string | null, exp: string, arms: readonly [T, ...T[]]): T | null {
  if (!raw) return null;
  for (const part of raw.toLowerCase().split(",")) {
    const token = part.trim();
    if (!token) continue;
    const eqIdx = token.search(/[:=]/);
    if (eqIdx > 0) {
      const k = token.slice(0, eqIdx).trim();
      const v = token.slice(eqIdx + 1).trim();
      if (k === exp.toLowerCase()) {
        const hit = arms.find((a) => a.toLowerCase() === v);
        if (hit) return hit;
      }
    } else {
      const hit = arms.find((a) => a.toLowerCase() === token);
      if (hit) return hit;
    }
  }
  return null;
}

function readUrlArm<T extends string>(exp: string, arms: readonly [T, ...T[]]): T | null {
  const params = new URLSearchParams(window.location.search);
  for (const key of ["variant", "exp", "ab"] as const) {
    const hit = matchArm(params.get(key), exp, arms);
    if (hit) return hit;
  }
  return null;
}

function readStoredArm<T extends string>(exp: string, arms: readonly [T, ...T[]]): T | null {
  try {
    const expSpecific = matchArm(window.sessionStorage.getItem(`${STORAGE_KEY}:${exp}`), exp, arms);
    if (expSpecific) return expSpecific;
    return matchArm(window.sessionStorage.getItem(STORAGE_KEY), exp, arms);
  } catch {
    return null;
  }
}

export function getOrAssignUiVariant<T extends string>(
  experimentName: string,
  arms: readonly [T, ...T[]],
): T {
  if (typeof window === "undefined") return arms[0];

  const fromUrl = readUrlArm(experimentName, arms);
  if (fromUrl) {
    setActiveUiVariant(experimentName, fromUrl);
    return fromUrl;
  }

  const fromStorage = readStoredArm(experimentName, arms);
  if (fromStorage) {
    setActiveUiVariant(experimentName, fromStorage);
    return fromStorage;
  }

  let seed = experimentName;
  try {
    const storedSeed = window.sessionStorage.getItem(SEED_KEY);
    if (storedSeed && storedSeed.length > 0) {
      seed = `${storedSeed}:${experimentName}`;
    } else {
      const generated = Math.random().toString(36).slice(2, 12);
      window.sessionStorage.setItem(SEED_KEY, generated);
      seed = `${generated}:${experimentName}`;
    }
  } catch {
    // Storage blocked — use deterministic experiment fallback seed.
  }

  const chosen = arms[hashSeed(seed) % arms.length] ?? arms[0];
  try {
    window.sessionStorage.setItem(`${STORAGE_KEY}:${experimentName}`, `${experimentName}=${chosen}`);
  } catch {
    // Storage blocked
  }
  setActiveUiVariant(experimentName, chosen);
  return chosen;
}
