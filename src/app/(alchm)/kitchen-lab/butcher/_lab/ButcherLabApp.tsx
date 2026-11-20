"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type JSX } from "react";
import { SystemBadge } from "@/components/lab/SystemBadge";
import { getSpeciesSpec } from "@/data/butcher/cutsCatalogue";
import type { ButcherTab, SpeciesId } from "@/lib/butcher/types";
import {
  BUTCHER_TABS,
  DEFAULT_BUTCHER_TAB,
  butcherHref,
  butcherTabFromParam,
  resolveSpeciesAndCutFromParams,
  systemForTab,
  urlForButcherCut,
  urlForButcherTab,
} from "../butcherTabs";
import { BreakdownPanel } from "./BreakdownPanel";
import { ButcherElementsPanel } from "./ButcherElementsPanel";
import { ButchersBlockPanel } from "./ButchersBlockPanel";
import { ButcherSourcesPanel } from "./ButcherSourcesPanel";
import { ButcherTelemetryHUD } from "./ButcherTelemetryHUD";
import { ThermalGrainPanel } from "./ThermalGrainPanel";
import { useButcherLab, type ButcherLabState } from "./useButcherLab";

/**
 * Main 5-tab Alchm Kitchen Butcher Shop workbench (`/kitchen-lab/butcher`).
 *
 * Keeps real meat physics (USDA proximate, shear force, collagen hydrolysis,
 * Butcher's Block scoring) strictly separated from the `alchm` Elements tab via
 * `<SystemBadge />`.
 *
 * @file src/app/(alchm)/kitchen-lab/butcher/_lab/ButcherLabApp.tsx
 */

function TabNav({
  tab,
  onSelect,
}: {
  readonly tab: ButcherTab;
  readonly onSelect: (next: ButcherTab) => void;
}): JSX.Element {
  const navRef = useRef<HTMLElement | null>(null);

  const handleClick = (next: ButcherTab, btn: HTMLButtonElement): void => {
    onSelect(next);
    if (typeof btn.scrollIntoView === "function") {
      btn.scrollIntoView({ block: "nearest", inline: "nearest" });
    }
  };

  return (
    <nav ref={navRef} className="bt-tabs" aria-label="Butcher Shop sections">
      {BUTCHER_TABS.map(([id, label, , system]) => (
        <button
          key={id}
          type="button"
          data-system={system}
          onClick={(e) => handleClick(id, e.currentTarget)}
          aria-current={tab === id ? "page" : undefined}
        >
          {label}
        </button>
      ))}
    </nav>
  );
}

function Panel({
  tab,
  lab,
  onSelectSpecies,
  onSelectCut,
}: {
  readonly tab: ButcherTab;
  readonly lab: ButcherLabState;
  readonly onSelectSpecies: (speciesId: SpeciesId) => void;
  readonly onSelectCut: (speciesId: SpeciesId, cutId: string) => void;
}): JSX.Element {
  switch (tab) {
    case "breakdown":
      return <BreakdownPanel lab={lab} onSelectSpecies={onSelectSpecies} onSelectCut={onSelectCut} />;
    case "game":
      return <ButchersBlockPanel lab={lab} onSelectSpecies={onSelectSpecies} onSelectCut={onSelectCut} />;
    case "thermal":
      return <ThermalGrainPanel lab={lab} />;
    case "elements":
      return <ButcherElementsPanel lab={lab} />;
    case "sources":
      return <ButcherSourcesPanel lab={lab} />;
  }
}

function ButcherLabBody({
  tab,
  lab,
  hint,
  onSelectSpecies,
  onSelectCut,
  onSelectTab,
}: {
  readonly tab: ButcherTab;
  readonly lab: ButcherLabState;
  readonly hint: string | undefined;
  readonly onSelectSpecies: (speciesId: SpeciesId) => void;
  readonly onSelectCut: (speciesId: SpeciesId, cutId: string) => void;
  readonly onSelectTab: (next: ButcherTab) => void;
}): JSX.Element {
  const panelLabel = BUTCHER_TABS.find(([id]) => id === tab)?.[1] ?? "Butcher Panel";
  return (
    <>
      {hint === undefined ? null : <p className="px-5 pt-3 text-xs text-white/45">{hint}</p>}
      <div className="bt-grid">
        <section aria-label={panelLabel}>
          <Panel tab={tab} lab={lab} onSelectSpecies={onSelectSpecies} onSelectCut={onSelectCut} />
        </section>
        {tab !== "elements" ? (
          <aside className="bt-hud" aria-label="Real-physics cut telemetry">
            <ButcherTelemetryHUD cut={lab.cut} onShowElements={() => onSelectTab("elements")} />
          </aside>
        ) : null}
      </div>
    </>
  );
}

export function ButcherLabApp(): JSX.Element {
  const params = useSearchParams();
  const urlTab = butcherTabFromParam(params?.get("tab") ?? null);
  const [tab, setTab] = useState<ButcherTab>(urlTab);
  useEffect(() => {
    setTab(urlTab);
  }, [urlTab]);

  const resolved = resolveSpeciesAndCutFromParams(params?.get("species") ?? null, params?.get("cut") ?? null);
  const lab = useButcherLab(resolved.speciesId, resolved.cutId);

  const selectTab = (next: ButcherTab): void => {
    setTab(next);
    window.history.replaceState(null, "", urlForButcherTab(window.location.href, next));
  };
  const selectCut = (nextSpeciesId: SpeciesId, nextCutId: string): void => {
    lab.syncFromCut(nextSpeciesId, nextCutId);
    window.history.replaceState(null, "", urlForButcherCut(window.location.href, nextSpeciesId, nextCutId));
  };
  const selectSpecies = (nextSpeciesId: SpeciesId): void => {
    selectCut(nextSpeciesId, getSpeciesSpec(nextSpeciesId).defaultCutId);
  };

  const system = systemForTab(tab);
  const hint = BUTCHER_TABS.find(([id]) => id === tab)?.[2];

  return (
    <div className="bt-root">
      <div className="px-5 pt-5">
        <SystemBadge
          system={system}
          variant="banner"
          counterpartHref={
            system === "real"
              ? butcherHref("elements", lab.speciesId, lab.cut.id)
              : butcherHref(DEFAULT_BUTCHER_TAB, lab.speciesId, lab.cut.id)
          }
          counterpartLabel={
            system === "real"
              ? "Read this cut as Fire · Water · Earth · Air"
              : "Back to real meat physics & 3D breakdown"
          }
        />
      </div>
      <TabNav tab={tab} onSelect={selectTab} />
      <ButcherLabBody tab={tab} lab={lab} hint={hint} onSelectSpecies={selectSpecies} onSelectCut={selectCut} onSelectTab={selectTab} />
    </div>
  );
}
