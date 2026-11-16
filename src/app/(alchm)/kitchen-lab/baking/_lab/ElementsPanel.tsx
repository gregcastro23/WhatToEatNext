"use client";

import { ElementalMeter } from "@/components/ui/alchm/ElementalMeter";
import { BAKING_ELEMENTS, type ElementalReading } from "@/lib/baking/elemental";
import { fmtNum } from "./format";
import type { BakingLab } from "./useBakingLab";
import type { JSX } from "react";

const ICON: Record<(typeof BAKING_ELEMENTS)[number], string> = { Fire: "🔥", Water: "💧", Earth: "🌍", Air: "💨" };
const COLOR_VAR: Record<(typeof BAKING_ELEMENTS)[number], string> = { Fire: "var(--el-fire)", Water: "var(--el-water)", Earth: "var(--el-earth)", Air: "var(--el-air)" };

function Breakdown({ reading }: { reading: ElementalReading }): JSX.Element {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {BAKING_ELEMENTS.map((e) => (
        <div key={e} className="bl-card">
          <div className="flex items-baseline justify-between">
            <h3 className="text-lg" style={{ color: COLOR_VAR[e] }}>
              <span aria-hidden="true">{ICON[e]}</span> {e}
            </h3>
            <span className="bl-num text-xl">{fmtNum(reading.scores[e], 0)}</span>
          </div>
          <ul className="mt-1 space-y-0.5 text-[12px] text-white/65">
            {reading.components[e].map((c) => (
              <li key={c.label} className="flex justify-between gap-2">
                <span>{c.label}</span>
                <span className="bl-num">{fmtNum(c.value * 100, 0)}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

/**
 * The ALCHM reading of the current formula. Rendered on its own tab, under
 * the alchm banner (the page header switches with the tab), because the nav
 * model forbids mixing it into a real-physics view.
 */
export function ElementsPanel({ lab }: { lab: BakingLab }): JSX.Element {
  const reading = lab.derived.elements;
  if (reading === null) return <div className="bl-card text-sm text-white/60">No elemental reading: the formula itself could not be read.</div>;
  const { scores } = reading;
  return (
    <div className="space-y-4">
      <div className="bl-card grid items-center gap-6 md:grid-cols-[200px_1fr]">
        <ElementalMeter layout="radial" values={{ fire: scores.Fire / 100, water: scores.Water / 100, earth: scores.Earth / 100, air: scores.Air / 100 }} />
        <div>
          <h2 className="text-xl">
            {lab.state.formula.name}: {reading.dominant}-led
          </h2>
          <p className="mt-2 text-sm text-white/70">
            Each element is the mean of quantities that are already 0–1 by definition — mass fractions, a water activity, shares — taken from the real telemetry and, once baked, from the
            simulated crust and crumb. It is a projection defined by this project: nothing here feeds back into the physics, and nothing on this tab is a measurement.
          </p>
          <p className="bl-num mt-2 text-[12px] text-white/50">
            shares · Fire {fmtNum(reading.shares.Fire * 100, 0)} % · Water {fmtNum(reading.shares.Water * 100, 0)} % · Earth {fmtNum(reading.shares.Earth * 100, 0)} % · Air {fmtNum(reading.shares.Air * 100, 0)} %
          </p>
        </div>
      </div>
      <Breakdown reading={reading} />
    </div>
  );
}
