"use client";

import { useCallback, useSyncExternalStore } from "react";
import { z } from "zod";
import {
  clampVesselState,
  DEFAULT_VESSEL,
  type VesselState,
} from "@/lib/cooking/vesselState";

/**
 * One vessel, read by both kitchen-lab pages.
 *
 * A module-level store, so the SI tab and the alchm band in the same tab see
 * the same settings without a context provider. The browser-storage copy is a
 * per-viewer convenience — it carries the vessel from /kitchen-lab/physics to
 * /kitchen-lab/alchm. When storage is blocked or holds something else, the
 * vessel quietly starts from the default; nothing here is load-bearing.
 *
 * @file src/components/lab/useVesselState.ts
 */

const STORAGE_KEY = "wten.kitchenLab.vessel.v1";

const StoredVesselSchema = z.object({
  pressureKpa: z.number(),
  temperatureC: z.number(),
  humidityPct: z.number(),
  headspaceC: z.number(),
  sealMode: z.enum(["open", "hermetic_sealed", "pressure_regulated", "vacuum_pumped"]).optional(),
  durationMinutes: z.number().optional(),
});

let current: VesselState = { ...DEFAULT_VESSEL };
const listeners = new Set<() => void>();

function readStored(): VesselState | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === null) return null;
    const parsed = StoredVesselSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) return null;
    const { sealMode, durationMinutes, ...rest } = parsed.data;
    return clampVesselState({
      ...rest,
      ...(sealMode !== undefined ? { sealMode } : {}),
      ...(durationMinutes !== undefined ? { durationMinutes } : {}),
    });
  } catch {
    return null;
  }
}

function writeStored(state: VesselState): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage blocked (private window, quota): the in-memory vessel still works.
  }
}

/**
 * The first reader to subscribe re-reads storage, so arriving on the other lab
 * page (or a change made in another browser tab) picks up the stored vessel.
 * While a reader is mounted, memory is the source of truth.
 */
function subscribe(listener: () => void): () => void {
  if (listeners.size === 0 && typeof window !== "undefined") {
    const stored = readStored();
    if (stored) current = stored;
  }
  listeners.add(listener);
  return (): void => {
    listeners.delete(listener);
  };
}

function getSnapshot(): VesselState {
  return current;
}

function getServerSnapshot(): VesselState {
  return DEFAULT_VESSEL;
}

/** Replace the whole vessel (clamped) and notify every reader. */
export function setVesselState(next: VesselState): void {
  current = clampVesselState(next);
  writeStored(current);
  for (const listener of listeners) listener();
}

export interface VesselStateHandle {
  vessel: VesselState;
  setVessel: (next: VesselState) => void;
  update: (patch: Partial<VesselState>) => void;
}

/** Read and write the shared vessel. */
export function useVesselState(): VesselStateHandle {
  const vessel = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const update = useCallback((patch: Partial<VesselState>): void => {
    setVesselState({ ...current, ...patch });
  }, []);
  return { vessel, setVessel: setVesselState, update };
}
