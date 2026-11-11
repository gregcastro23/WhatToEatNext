import {
  formatFixed,
  SATURATION_BAND_K,
  type BoilingState,
  type VaporTransfer,
  type VesselReading,
} from "@/lib/cooking/thermoVessel";
import type { JSX, ReactNode } from "react";

/**
 * The SI readings of the vessel, one card per quantity.
 *
 * @file src/components/lab/vessel/VesselReadouts.tsx
 */

const BOILING_COPY: Readonly<Record<BoilingState, { label: string; detail: string }>> = {
  "sub-boiling": {
    label: "Below the boil",
    detail: "Liquid water is stable at this temperature and pressure.",
  },
  "at-boil": {
    label: "At the boil",
    detail: `Within ${SATURATION_BAND_K} K of the boiling point (a display band). At the boiling point itself, added heat goes into vapour rather than temperature.`,
  },
  "above-saturation": {
    label: "Above saturation",
    detail:
      "Liquid water cannot be this hot at this pressure. A wet surface stays at the ceiling; the setpoint is reached only once the free water has boiled off.",
  },
};

const TRANSFER_COPY: Readonly<Record<VaporTransfer, string>> = {
  evaporating: "Net evaporation from the food surface",
  condensing: "Net condensation onto the food — steam is delivering its latent heat",
  "heat-limited":
    "The headspace is already pure vapour at the vessel pressure, so Δp_v ≈ 0 — but the surface is at the boil, and water leaves as fast as heat arrives. That rate depends on the heat input, which this model does not resolve",
  equilibrium: "No net exchange: the headspace balances the surface",
};

/** While the surface is at the boil, evaporation is also driven by heat input; say so. */
function transferText(reading: VesselReading): string {
  const base = TRANSFER_COPY[reading.transfer];
  return reading.transfer === "evaporating" && reading.wetSurfaceC === reading.saturation.tsatC
    ? `${base}; the surface is at the boil, so heat input drives boil-off too (not modelled)`
    : base;
}

function Card({
  label,
  value,
  children,
}: {
  label: string;
  value: ReactNode;
  children?: ReactNode;
}): JSX.Element {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.02] px-4 py-3">
      <div className="text-[11px] uppercase tracking-wider text-white/40">{label}</div>
      <div className="mt-1 font-mono text-lg tabular-nums text-white/90">{value}</div>
      {children ? <div className="mt-1 text-xs leading-relaxed text-white/45">{children}</div> : null}
    </div>
  );
}

function pct(ratio: number): string {
  const delta = (ratio - 1) * 100;
  return `${delta >= 0 ? "+" : ""}${delta.toFixed(1)} % vs an open pot at sea level`;
}

export function VesselReadouts({ reading }: { reading: VesselReading }): JSX.Element {
  const { saturation } = reading;
  const boiling = BOILING_COPY[reading.boilingState];
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <Card label="Boiling point T_sat(P)" value={`${saturation.tsatC.toFixed(2)} °C`}>
        IAPWS-IF97 region 4 at {saturation.pressureKpa.toFixed(1)} kPa.
      </Card>
      <Card label="Water state" value={boiling.label}>
        {boiling.detail}
      </Card>
      <Card label="Latent heat h_fg" value={`${saturation.latentKjKg.toFixed(1)} kJ·kg⁻¹`}>
        {pct(reading.latentVsSeaLevel)}. h′ {saturation.liquidKjKg.toFixed(1)}, h″{" "}
        {saturation.vaporKjKg.toFixed(1)} kJ·kg⁻¹ (IF97 regions 1 and 2).
      </Card>
      <Card label="Vapour-pressure deficit Δp_v" value={`${formatFixed(reading.vaporDeficitKpa, 2)} kPa`}>
        {transferText(reading)}. Surface {reading.surfaceVaporKpa.toFixed(2)} kPa at{" "}
        {reading.wetSurfaceC.toFixed(2)} °C; headspace {reading.headspaceVaporKpa.toFixed(2)} kPa
        {reading.headspaceVaporCapped ? " (capped at the vessel pressure)" : ""}.
      </Card>
    </div>
  );
}
