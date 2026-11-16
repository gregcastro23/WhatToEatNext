"use client";

import { SystemBadge } from "@/components/lab/SystemBadge";
import type { FormulaTelemetry } from "@/lib/baking/formulaTypes";
import { fmtNum } from "./format";
import type { BakingLab } from "./useBakingLab";
import type { JSX, ReactNode } from "react";

function Metric({ label, value, note }: { label: string; value: ReactNode; note?: string }): JSX.Element {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-white/5 py-1.5" title={note}>
      <span className="text-[12px] text-white/60">{label}</span>
      <span className="bl-num text-[13px]">{value}</span>
    </div>
  );
}

function awText(t: FormulaTelemetry): string {
  return t.waterActivity.available ? t.waterActivity.value.aw.toFixed(3) : "—";
}

function Composition({ t }: { t: FormulaTelemetry }): JSX.Element {
  const c = t.composition;
  return (
    <div className="mt-3">
      <p className="bl-label">Batch composition</p>
      <Metric label="Total" value={`${fmtNum(t.totalGrams, 0)} g`} />
      <Metric label="Water · fat · protein" value={`${fmtNum(c.water, 0)} · ${fmtNum(c.fat, 0)} · ${fmtNum(c.protein, 0)} g`} />
      <Metric label="Starch · sugars · fibre" value={`${fmtNum(c.starch, 0)} · ${fmtNum(c.sugars, 0)} · ${fmtNum(c.fiber, 1)} g`} />
    </div>
  );
}

function Chemistry({ t }: { t: FormulaTelemetry }): JSX.Element {
  const ab = t.acidBase;
  const co2 = t.leavening.neutralisationCo2Grams + t.leavening.thermalCo2Grams + t.leavening.powderMixingCo2Grams + t.leavening.powderHeatCo2Grams;
  return (
    <div className="mt-3">
      <p className="bl-label">Leavening chemistry</p>
      <Metric label="Acid · bicarbonate" value={`${fmtNum(ab.acidMmol, 1)} · ${fmtNum(ab.bicarbonateMmol, 1)} mmol`} note="Titratable acid that can reach the soda, and the soda itself" />
      <Metric label="Unneutralised soda" value={`${fmtNum(ab.excessBaseMmol, 1)} mmol`} note="Decomposes by heat at half the CO₂, leaving alkaline carbonate (soapy, over-browned)" />
      <Metric label="Chemical CO₂" value={`${fmtNum(co2, 2)} g`} />
      <Metric label="Fermented" value={t.leavening.fermented ? "yes — yeast / levain" : "no"} />
    </div>
  );
}

export function TelemetryHUD({ lab, onShowElements }: { lab: BakingLab; onShowElements: () => void }): JSX.Element {
  const { telemetry } = lab.derived;
  return (
    <div className="bl-card">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h2 className="text-lg">Telemetry</h2>
        <SystemBadge system="real" />
      </div>
      {telemetry.available ? <HudBody t={telemetry.value} /> : <p className="text-sm text-amber-200/80">{telemetry.reason}</p>}
      <button type="button" className="bl-btn mt-4 w-full" onClick={onShowElements}>
        Read it as Fire · Water · Earth · Air →
      </button>
      {lab.stale ? <p className="mt-2 text-[11px] text-white/40">Updating…</p> : null}
    </div>
  );
}

function HudBody({ t }: { t: FormulaTelemetry }): JSX.Element {
  return (
    <>
      <Metric label="True hydration" value={t.trueHydrationPct === null ? "—" : `${fmtNum(t.trueHydrationPct, 1)} %`} note="All water (milk, egg, butter, honey, levain) minus the flours' own moisture and fibre-bound water, ÷ flour" />
      <Metric label="Moisture (wet basis)" value={`${fmtNum(t.moistureWbPct, 1)} %`} />
      <Metric label="Water activity (aqueous)" value={awText(t)} note="Norrish multi-solute for dissolved sugars × NaCl (Ross); the crumb's starch binding is not included" />
      <Metric label="Sweetness · POD /100 g" value={fmtNum(t.podPer100g, 1)} note="Sucrose = 100 per gram" />
      <Metric label="Softness · PAC /100 g" value={fmtNum(t.pacPer100g, 1)} note="Colligative power from molar mass, sucrose = 100" />
      <Metric label="Structure : tenderiser" value={fmtNum(t.structure.ratio, 2)} note="(gluten + setting protein + starch + hydrocolloid) ÷ (fat + sugar), by mass" />
      <Metric label="Reducing-sugar share" value={fmtNum(t.reducingSugarFraction * 100, 0, " %")} />
      <Metric label="Fat phase solid at 20 °C" value={t.fatPhaseSolidFatIndex === null ? "—" : fmtNum(t.fatPhaseSolidFatIndex * 100, 0, " %")} />
      <Composition t={t} />
      <Chemistry t={t} />
      {t.caveats.length > 0 ? (
        <ul className="mt-3 space-y-1 text-[11px] text-white/45">
          {t.caveats.map((c) => (
            <li key={c}>• {c}</li>
          ))}
        </ul>
      ) : null}
    </>
  );
}
