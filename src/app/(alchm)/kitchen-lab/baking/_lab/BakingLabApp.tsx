"use client";

import { useSearchParams } from "next/navigation";
import { SystemBadge } from "@/components/lab/SystemBadge";
import { BAKING_PRESETS } from "@/data/baking/presets";
import { BAKING_TABS, bakingTabFromParam, systemForTab, urlForBakingTab, type BakingTab } from "../bakingTabs";
import { ElementsPanel } from "./ElementsPanel";
import { FormulaPanel } from "./FormulaPanel";
import { OvenPanel } from "./OvenPanel";
import { SourcesPanel } from "./SourcesPanel";
import { SwapPanel } from "./SwapPanel";
import { TelemetryHUD } from "./TelemetryHUD";
import { useBakingLab, type BakingLab } from "./useBakingLab";
import type { JSX } from "react";

function TabNav({ tab, onSelect }: { tab: BakingTab; onSelect: (next: BakingTab) => void }): JSX.Element {
  return (
    <nav className="bl-tabs" aria-label="Baking Lab sections">
      {BAKING_TABS.map(([id, label, , system]) => (
        <button
          key={id}
          type="button"
          data-system={system}
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

function PresetBar({ lab }: { lab: BakingLab }): JSX.Element {
  return (
    <div className="flex flex-wrap items-center gap-2 px-5 pt-4" role="group" aria-label="Archetype presets">
      <span className="bl-label mr-1">Archetype</span>
      {BAKING_PRESETS.map((p) => (
        <button key={p.id} type="button" className="bl-btn" aria-pressed={lab.state.presetId === p.id} title={p.blurb} onClick={() => lab.dispatch({ type: "preset", id: p.id })}>
          {p.name}
        </button>
      ))}
    </div>
  );
}

function Panel({ tab, lab, onTab }: { tab: BakingTab; lab: BakingLab; onTab: (t: BakingTab) => void }): JSX.Element {
  switch (tab) {
    case "formula":
      return <FormulaPanel lab={lab} />;
    case "swap":
      return <SwapPanel lab={lab} onShowOven={() => onTab("oven")} />;
    case "oven":
      return <OvenPanel lab={lab} />;
    case "elements":
      return <ElementsPanel lab={lab} />;
    case "sources":
      return <SourcesPanel />;
  }
}

/** The lab body: banner for the active tab's system, presets, tabs, panel and HUD. */
export function BakingLabApp(): JSX.Element {
  // Typed nullable for the pages router (after `next typegen`); in the app router it is always present.
  const tab = bakingTabFromParam(useSearchParams()?.get("tab") ?? null);
  const lab = useBakingLab();
  const select = (next: BakingTab): void => {
    window.history.replaceState(null, "", urlForBakingTab(window.location.href, next));
  };
  const system = systemForTab(tab);
  const hint = BAKING_TABS.find(([id]) => id === tab)?.[2];
  return (
    <div className="bl-root">
      <div className="px-5 pt-5">
        <SystemBadge
          system={system}
          variant="banner"
          counterpartHref={system === "real" ? "/kitchen-lab/baking?tab=elements" : "/kitchen-lab/baking"}
          counterpartLabel={system === "real" ? "Read this formula as Fire · Water · Earth · Air" : "Back to the real physics of this formula"}
        />
      </div>
      <PresetBar lab={lab} />
      <TabNav tab={tab} onSelect={select} />
      {hint === undefined ? null : <p className="px-5 pt-3 text-xs text-white/40">{hint}</p>}
      <div className="bl-grid">
        <section aria-label={BAKING_TABS.find(([id]) => id === tab)?.[1] ?? "Panel"}>
          <Panel tab={tab} lab={lab} onTab={select} />
        </section>
        {tab === "elements" ? null : (
          <aside className="bl-hud" aria-label="Real-physics telemetry">
            <TelemetryHUD lab={lab} onShowElements={() => select("elements")} />
          </aside>
        )}
      </div>
    </div>
  );
}
