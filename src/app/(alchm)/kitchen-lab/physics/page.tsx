"use client";

import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { Suspense, type JSX } from "react";
import { SystemBadge } from "@/components/lab/SystemBadge";
import "../_solver/solver.css";
import { PHYSICS_TABS, tabFromParam, urlForTab, type PhysicsTab } from "./physicsTabs";

const SolverPanel = dynamic(
  () => import("../_solver/SolverPanel").then((m) => m.SolverPanel),
  { ssr: false },
);
const ComparisonPanel = dynamic(
  () => import("../_solver/ComparisonPanel").then((m) => m.ComparisonPanel),
  { ssr: false },
);
const BoundariesPanel = dynamic(
  () => import("../_solver/BoundariesPanel").then((m) => m.BoundariesPanel),
  { ssr: false },
);
const VolumetricsPanel = dynamic(
  () => import("../_solver/VolumetricsPanel").then((m) => m.VolumetricsPanel),
  { ssr: false },
);
const LatentHeatPanel = dynamic(
  () => import("@/components/lab/LatentHeatPanel").then((m) => m.LatentHeatPanel),
  { ssr: false },
);
const SimmerReductionPanel = dynamic(
  () =>
    import("@/components/lab/SimmerReductionPanel").then(
      (m) => m.SimmerReductionPanel,
    ),
  { ssr: false },
);
const BoundaryTransferCanvas = dynamic(
  () =>
    import("@/components/lab/BoundaryTransferCanvas").then(
      (m) => m.BoundaryTransferCanvas,
    ),
  { ssr: false },
);
const HermeticVesselPanel = dynamic(
  () =>
    import("@/components/lab/HermeticVesselPanel").then(
      (m) => m.HermeticVesselPanel,
    ),
  { ssr: false },
);

/**
 * `/kitchen-lab/physics` — the REAL physics of a pan of food.
 *
 * Every number on this route is SI and traces to a cited correlation or a
 * measured record: Incropera & DeWitt property tables, Churchill & Chu and
 * Rohsenow correlations, the Fleagle & Andreas latent-heat fit, Choi-Okos
 * composition thermophysics, ISA + Antoine for the altitude water ceiling,
 * IAPWS-IF97 for sealed and evacuated vessels, and USDA FDC portion
 * measurements.
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

const TAB_CSS = `
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
`;

function PhysicsTabNav({
  tab,
  onSelect,
}: {
  tab: PhysicsTab;
  onSelect: (next: PhysicsTab) => void;
}): JSX.Element {
  return (
    <nav className="alchm-lab-tabs" aria-label="physics sections">
      {PHYSICS_TABS.map(([id, label]) => (
        <button
          key={id}
          type="button"
          onClick={() => onSelect(id)}
          aria-current={tab === id ? "page" : undefined}
          className={tab === id ? "is-active" : undefined}
        >
          {label}
        </button>
      ))}
    </nav>
  );
}

const PANEL_PADDING = "px-5 py-6 sm:px-6";

function PhysicsTabPanel({ tab }: { tab: PhysicsTab }): JSX.Element {
  switch (tab) {
    case "solver":
      return <SolverPanel />;
    case "compare":
      return <ComparisonPanel />;
    case "boundaries":
      return <BoundariesPanel />;
    case "volumetrics":
      return <VolumetricsPanel />;
    case "latent":
      return <LatentHeatPanel className={PANEL_PADDING} />;
    case "reduction":
      return <SimmerReductionPanel className={PANEL_PADDING} />;
    case "transfer":
      return <BoundaryTransferCanvas className={PANEL_PADDING} />;
    case "vessel":
      return <HermeticVesselPanel className={PANEL_PADDING} />;
  }
}

/**
 * The page body. The tab is DERIVED from `?tab=` on every render, so any
 * navigation that changes the query — the redirect from
 * /cooking-methods/tilt-skillet, the "Hermetic Vessel" nav entry, a link
 * between two tabs of this same route — shows the tab it names. Reading it
 * once on mount missed soft navigations within the page, which do not
 * remount it. Clicking a tab writes the URL with history.replaceState, which
 * Next keeps in sync with useSearchParams.
 */
function PhysicsLab(): JSX.Element {
  // Typed nullable for the pages router; in the app router it is always present.
  const tab = tabFromParam(useSearchParams()?.get("tab") ?? null);
  const selectTab = (next: PhysicsTab): void => {
    window.history.replaceState(null, "", urlForTab(window.location.href, next));
  };
  const active = PHYSICS_TABS.find(([id]) => id === tab);

  return (
    <>
      <PhysicsTabNav tab={tab} onSelect={selectTab} />
      {active ? (
        <p className="px-5 pt-3 text-xs text-white/40 sm:px-6">{active[2]}</p>
      ) : null}
      <PhysicsTabPanel tab={tab} />
    </>
  );
}

/**
 * useSearchParams needs a Suspense boundary: the route is prerendered without
 * a query, so the server sends the badge and an empty tab strip slot, and the
 * tab resolves on the client. The badge sits outside the boundary so "which
 * model is this?" is answered on first paint; no panel chunk loads before
 * the query is known.
 */
export default function KitchenLabPhysicsPage(): JSX.Element {
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
      <style>{TAB_CSS}</style>
      <Suspense fallback={null}>
        <PhysicsLab />
      </Suspense>
    </div>
  );
}
