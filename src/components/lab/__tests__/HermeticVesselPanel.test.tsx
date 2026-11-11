import { render, screen } from "@testing-library/react";
import { readVessel } from "@/lib/cooking/thermoVessel";
import { DEFAULT_VESSEL, VESSEL_PRESETS, type VesselState } from "@/lib/cooking/vesselState";
import { HermeticVesselPanel } from "../HermeticVesselPanel";
import { setVesselState } from "../useVesselState";

/**
 * The panel must show what readVessel computed — in particular, the
 * dry-surface regimes whenever the setpoint is above the ceiling, including
 * the 2 K band that reads "At the boil" (a review found the panel keyed this
 * off the boiling-state label and hid them for the pressure-cooker preset).
 */

function preset(id: "open" | "sealed" | "vacuum"): VesselState {
  return VESSEL_PRESETS.find((p) => p.id === id)?.state ?? DEFAULT_VESSEL;
}

function renderWith(state: VesselState): void {
  window.localStorage.clear();
  setVesselState(state);
  render(<HermeticVesselPanel />);
}

describe("HermeticVesselPanel", () => {
  it("shows the dry-surface regimes for a pressure cooker held just above its boiling point", () => {
    const state = preset("sealed");
    expect(readVessel(state).boilingState).toBe("at-boil");
    renderWith(state);
    expect(screen.getByText(/Once the surface dries/)).toBeTruthy();
    expect(screen.getByText("Maillard browning at culinary rate")).toBeTruthy();
    expect(screen.queryByText(/at or below the boiling point/)).toBeNull();
  });

  it("says the setpoint is at or below the boil only when it is", () => {
    const state = preset("vacuum");
    expect(readVessel(state).aboveCeiling).toBe(false);
    renderWith(state);
    expect(screen.getByText(/at or below the boiling point/)).toBeTruthy();
    // Control: the wet-surface heading is present, so an absent dry heading means something.
    expect(screen.getByText(/While free water remains/)).toBeTruthy();
    expect(screen.queryByText(/Once the surface dries/)).toBeNull();
  });

  it("discloses when the headspace vapour was capped at the vessel pressure", () => {
    renderWith(preset("sealed"));
    expect(screen.getByText(/capped at the vessel pressure/)).toBeTruthy();
  });

  it("does not call a heat-limited boil 'no net exchange'", () => {
    renderWith(preset("sealed"));
    expect(screen.queryByText(/No net exchange/)).toBeNull();
    expect(screen.getByText(/water leaves as fast as heat arrives/)).toBeTruthy();
  });

  it("shows only SI quantities — no alchm terms on the physics panel", () => {
    renderWith(DEFAULT_VESSEL);
    const text = document.body.textContent ?? "";
    for (const term of ["Spirit", "Essence", "Matter", "Substance", "Kalchm", "Monica"]) {
      expect(text).not.toContain(term);
    }
  });
});
