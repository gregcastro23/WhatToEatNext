"use client";

import { useState, type JSX } from "react";
import { BoundaryTransferCanvas } from "@/components/lab/BoundaryTransferCanvas";
import { LatentHeatPanel } from "@/components/lab/LatentHeatPanel";
import { SimmerReductionPanel } from "@/components/lab/SimmerReductionPanel";
import { SystemBadge } from "@/components/lab/SystemBadge";
import { BoundariesPanel } from "../_solver/BoundariesPanel";
import { ComparisonPanel } from "../_solver/ComparisonPanel";
import { SolverPanel } from "../_solver/SolverPanel";
import { VolumetricsPanel } from "../_solver/VolumetricsPanel";
import "../_solver/solver.css";

/**
 * `/kitchen-lab/physics` — the REAL physics of a pan of food.
 *
 * Every number on this route is SI and traces to a cited correlation or a
 * measured record: Incropera & DeWitt property tables, Churchill & Chu and
 * Rohsenow correlations, the Fleagle & Andreas latent-heat fit, Choi-Okos
 * composition thermophysics, ISA + Antoine for the altitude water ceiling, and
 * USDA FDC portion measurements.
 *
 * ## Why this is its own route now
 *
 * These four panels used to be tabs on /lab, one click from an ESMS dashboard,
 * with a left rail titled "THERMODYNAMICS" that rendered Spirit/Essence/
 * Matter/Substance. Nothing on the page distinguished a measured watt from an
 * alchm quantity. The split is the fix, and the badge below is what makes it
 * legible rather than merely tidy.
 *
 * ## The one honesty rule these panels keep
 *
 * Every kernel under src/lib/cooking THROWS outside its validity envelope, and
 * labSolver converts those throws into an explicit `Reading<T>` REFUSAL rather
 * than a fallback number. A blank or a dash here means "outside the envelope
 * this correlation was fitted for", never "we could not be bothered". Do not
 * wrap these panels in anything that turns a refusal into a zero.
 *
 * @file src/app/(alchm)/kitchen-lab/physics/page.tsx
 */

type PhysicsTab =
  | "solver"
  | "compare"
  | "boundaries"
  | "volumetrics"
  | "latent"
  | "reduction"
  | "transfer";

const TABS: ReadonlyArray<[PhysicsTab, string, string]> = [
  ["solver", "Thermal solver", "One arrangement, solved end to end"],
  ["compare", "Compare", "Three arrangements against one food"],
  ["boundaries", "Boundaries", "Property tables and correlations"],
  ["volumetrics", "Volumetrics", "Measured mass per volume"],
  ["latent", "Latent heat", "Phase-change energy, through the Rust engine"],
  ["reduction", "Reduction & Live Pot", "Simmer reduction, glaze milestones, and collaborative kitchen pot sync"],
  ["transfer", "Medium transfer", "Heat crossing atmosphere → vessel → solution → food"],
];

export default function KitchenLabPhysicsPage(): JSX.Element {
  const [tab, setTab] = useState<PhysicsTab>("solver");
  const active = TABS.find(([id]) => id === tab);

  return (
    <div className="ma-solver">
      <div className="px-5 pt-5 sm:px-6">
        <SystemBadge
          system="real"
          variant="banner"
          counterpartHref="/kitchen-lab/alchm"
          counterpartLabel="The alchm model of the same kitchen"
        />
      </div>

      <nav className="alchm-lab-tabs" aria-label="physics sections">
        {TABS.map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            aria-current={tab === id ? "page" : undefined}
            className={tab === id ? "is-active" : undefined}
          >
            {label}
          </button>
        ))}
      </nav>

      {active ? (
        <p className="px-5 pt-3 text-xs text-white/40 sm:px-6">{active[2]}</p>
      ) : null}

      <style>{`
        .alchm-lab-tabs {
          display: flex;
          gap: 2px;
          border-bottom: 1px solid var(--line);
          padding: 0 22px;
          background: var(--bg);
          flex-wrap: wrap;
        }
        .alchm-lab-tabs button {
          appearance: none;
          background: none;
          border: 0;
          border-bottom: 2px solid transparent;
          padding: 12px 14px;
          font: inherit;
          font-size: 11px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--fg-mute);
          cursor: pointer;
        }
        .alchm-lab-tabs button.is-active {
          color: var(--accent);
          border-bottom-color: var(--accent);
        }
        .alchm-lab-tabs button:focus-visible { outline: 2px solid var(--accent); outline-offset: -2px; }
      `}</style>

      {tab === "solver" ? <SolverPanel /> : null}
      {tab === "compare" ? <ComparisonPanel /> : null}
      {tab === "boundaries" ? <BoundariesPanel /> : null}
      {tab === "volumetrics" ? <VolumetricsPanel /> : null}
      {tab === "latent" ? <LatentHeatPanel className="px-5 py-6 sm:px-6" /> : null}
      {tab === "reduction" ? (
        <SimmerReductionPanel className="px-5 py-6 sm:px-6" />
      ) : null}
      {tab === "transfer" ? (
        <BoundaryTransferCanvas className="px-5 py-6 sm:px-6" />
      ) : null}
    </div>
  );
}
