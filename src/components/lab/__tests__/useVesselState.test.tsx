import { act, renderHook } from "@testing-library/react";
import { DEFAULT_VESSEL, VESSEL_PRESETS, VESSEL_RANGES } from "@/lib/cooking/vesselState";
import { setVesselState, useVesselState } from "../useVesselState";

/**
 * The shared vessel: one store read by the physics tab and the alchm cauldron,
 * carried between them through browser storage.
 *
 * The store is module-level. Each test starts it from the default vessel and
 * then shapes storage; the first reader to mount re-reads storage, which is
 * the path that carries a vessel from one lab page to the other.
 */

const STORAGE_KEY = "wten.kitchenLab.vessel.v1";

const sealed = VESSEL_PRESETS.find((p) => p.id === "sealed")?.state ?? DEFAULT_VESSEL;

beforeEach(() => {
  setVesselState(DEFAULT_VESSEL);
  window.localStorage.clear();
});

describe("useVesselState", () => {
  it("reads the in-memory vessel when nothing is stored", () => {
    const { result } = renderHook(() => useVesselState());
    expect(result.current.vessel).toEqual(DEFAULT_VESSEL);
  });

  it("hydrates from storage, so the vessel carries from one lab page to the other", () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sealed));
    const { result } = renderHook(() => useVesselState());
    expect(result.current.vessel).toEqual(sealed);
  });

  it("clamps a stored vessel into the control ranges", () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...sealed, pressureKpa: 9999 }));
    const { result } = renderHook(() => useVesselState());
    expect(result.current.vessel.pressureKpa).toBe(VESSEL_RANGES.pressureKpa.max);
  });

  it("ignores storage that is not a vessel", () => {
    window.localStorage.setItem(STORAGE_KEY, "{not json");
    const { result } = renderHook(() => useVesselState());
    expect(result.current.vessel).toEqual(DEFAULT_VESSEL);
  });

  it("one update reaches every reader and is written back to storage", () => {
    const a = renderHook(() => useVesselState());
    const b = renderHook(() => useVesselState());
    act(() => a.result.current.update({ pressureKpa: 50 }));
    expect(b.result.current.vessel.pressureKpa).toBe(50);
    const stored: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "null");
    expect(stored).toEqual({ ...DEFAULT_VESSEL, pressureKpa: 50 });
  });

  it("a mounted reader is not overwritten by a later storage change", () => {
    const a = renderHook(() => useVesselState());
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sealed));
    const b = renderHook(() => useVesselState());
    expect(a.result.current.vessel).toEqual(DEFAULT_VESSEL);
    expect(b.result.current.vessel).toEqual(DEFAULT_VESSEL);
  });
});
