"use client";

import { SystemBadge } from "@/components/lab/SystemBadge";
import type { SaucePhysicsReport } from "@/lib/sauces/physics/engine";
import type { JSX, ReactNode } from "react";

function MetricRow({
  label,
  value,
  note,
}: {
  label: string;
  value: ReactNode;
  note?: string;
}): JSX.Element {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-white/5 py-1.5" title={note}>
      <span className="text-[12px] text-white/60">{label}</span>
      <span className="sl-num text-[13px]">{value}</span>
    </div>
  );
}

const STABILITY_TONE: Record<SaucePhysicsReport["emulsion"]["stabilityBand"], string> = {
  stable: "text-emerald-300",
  "shear-sensitive": "text-amber-300",
  "split-risk": "text-rose-300 font-semibold",
  "non-emulsion": "text-sky-300",
};

function EmulsionSummary({ report }: { report: SaucePhysicsReport }): JSX.Element {
  const { emulsion, thickener } = report;
  return (
    <div className="mt-3">
      <p className="sl-label">Emulsion & Rheology</p>
      <MetricRow
        label="Dispersed fat fraction φ"
        value={emulsion.stabilityBand === "non-emulsion" ? "—" : `${(emulsion.fatVolumeFraction * 100).toFixed(1)} %`}
        note="Volumetric oil/fat load vs 74 % monodisperse close-packing ceiling"
      />
      <MetricRow
        label="Stability regime"
        value={<span className={STABILITY_TONE[emulsion.stabilityBand]}>{emulsion.stabilityBand}</span>}
      />
      <MetricRow
        label="Relative viscosity η_r"
        value={`${emulsion.relativeViscosity.toFixed(2)}×`}
        note="Krieger–Dougherty monodisperse rigid-sphere packing multiplier"
      />
      <MetricRow
        label="Stokes creaming speed"
        value={emulsion.stabilityBand === "non-emulsion" ? "—" : `${emulsion.stokesCreamingMmMin.toFixed(2)} mm/min`}
      />
      {thickener.gelatinizationPct !== null && (
        <MetricRow label="Thickener activation" value={`${thickener.gelatinizationPct.toFixed(0)} %`} />
      )}
    </div>
  );
}

export function SauceTelemetryHUD({
  report,
  onShowPairing,
}: {
  report: SaucePhysicsReport;
  onShowPairing: () => void;
}): JSX.Element {
  const { composition, thermo, reduction, warnings } = report;
  return (
    <div className="sl-card">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h2 className="text-lg">Telemetry</h2>
        <SystemBadge system="real" />
      </div>
      <MetricRow label="Final batch mass" value={`${report.finalMassG.toFixed(0)} g`} />
      <MetricRow
        label="Water · fat · solids"
        value={`${composition.waterPct.toFixed(1)} · ${composition.fatPct.toFixed(1)} · ${composition.solidsPct.toFixed(1)} %`}
      />
      <MetricRow label="Density ρ" value={`${thermo.densityKgM3.toFixed(0)} kg/m³`} />
      <MetricRow label="Specific heat c_p" value={`${thermo.specificHeatJkgK.toFixed(0)} J/(kg·K)`} />
      <MetricRow label="Thermal conductivity k" value={`${thermo.conductivityWmK.toFixed(3)} W/(m·K)`} />
      <EmulsionSummary report={report} />
      <div className="mt-3">
        <p className="sl-label">Concentration & Boiling</p>
        <MetricRow label="h_fg (vaporisation)" value={`${reduction.hfgKjKg.toFixed(0)} kJ/kg`} />
        <MetricRow label="Simmer duration" value={`${reduction.simmerMinutes.toFixed(1)} min`} />
        <MetricRow label="Solute multiplier" value={`${reduction.soluteConcentrationFactor.toFixed(2)}×`} />
      </div>
      {warnings.length > 0 && (
        <ul className="mt-3 space-y-1.5" aria-label="Physics regime warnings">
          {warnings.map((w) => (
            <li key={w} className="sl-warn">
              {w}
            </li>
          ))}
        </ul>
      )}
      <button type="button" className="sl-btn mt-4 w-full" onClick={onShowPairing}>
        Open Alchm Pairing Studio →
      </button>
    </div>
  );
}
