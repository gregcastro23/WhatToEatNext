"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, type JSX } from "react";
import { SystemBadge } from "@/components/lab/SystemBadge";
import { BAKING_TABS, bakingHref, bakingTabFromParam, DEFAULT_BAKING_TAB, goodFromParam, systemForTab, urlForBakingGood, urlForBakingTab, type BakingTab } from "../bakingTabs";
import { benchFor, benchGoodId, benchNotice, defaultPreset, presetToLoad, showsHud, type Bench } from "./bench";
import { ElementsPanel } from "./ElementsPanel";
import { FormulaPanel } from "./FormulaPanel";
import { GoodSearch } from "./GoodSearch";
import { MappingReport } from "./MappingReport";
import { OvenPanel } from "./OvenPanel";
import { RefusedGood } from "./RefusedGood";
import { SourcesPanel } from "./SourcesPanel";
import { SwapPanel } from "./SwapPanel";
import { TelemetryHUD } from "./TelemetryHUD";
import { useBakingCatalogue, type BakingCatalogue } from "./useBakingCatalogue";
import { useBakingLab, type BakingLab } from "./useBakingLab";

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

/** A refused recipe on the alchm tab: no projection exists, and the real-physics report stays on the real tabs. */
function NoElementalReading({ name }: { name: string }): JSX.Element {
  return (
    <div className="bl-card text-sm text-white/60">
      {name} is not simulated, so it has no elemental reading. Why it is refused is on the Formula tab.
    </div>
  );
}

function Panel({ tab, lab, bench, catalogue, onTab }: { tab: BakingTab; lab: BakingLab; bench: Bench; catalogue: BakingCatalogue; onTab: (t: BakingTab) => void }): JSX.Element {
  if (tab === "sources") return <SourcesPanel catalogue={catalogue} />;
  if (bench.kind === "refused") return tab === "elements" ? <NoElementalReading name={bench.entry.name} /> : <RefusedGood id={bench.entry.id} name={bench.entry.name} report={bench.entry.converted.report} />;
  if (bench.kind === "loading") return <div className="bl-card text-sm text-white/55">Loading “{bench.id}” from the site&apos;s recipes…</div>;
  switch (tab) {
    case "formula":
      return (
        <div className="space-y-4">
          <FormulaPanel lab={lab} />
          {bench.kind === "bake" && bench.entry.kind === "recipe" ? <MappingReport report={bench.entry.converted.report} title={bench.entry.name} /> : null}
        </div>
      );
    case "swap":
      return <SwapPanel lab={lab} onShowOven={() => onTab("oven")} />;
    case "oven":
      return <OvenPanel lab={lab} />;
    case "elements":
      return <ElementsPanel lab={lab} />;
  }
}

/**
 * Keeps the lab on the good the URL names. The URL is the one writer: a pick
 * in the search only rewrites it, and this effect loads the good once the
 * router reports the new parameter, so no second writer can race it.
 */
function useBenchSync(lab: BakingLab, bench: Bench): void {
  const preset = presetToLoad(bench);
  const { dispatch } = lab;
  const onBench = lab.state.goodId;
  useEffect(() => {
    if (preset !== null && onBench !== preset.id) dispatch({ type: "good", good: preset });
  }, [preset, onBench, dispatch]);
}

/** The lab body: banner for the active tab's system, the good search, tabs, panel and HUD. */
export function BakingLabApp(): JSX.Element {
  // Typed nullable for the pages router (after `next typegen`); in the app router it is always present.
  const params = useSearchParams();
  const tab = bakingTabFromParam(params?.get("tab") ?? null);
  const goodId = goodFromParam(params?.get("good") ?? null);
  const catalogue = useBakingCatalogue();
  const bench = benchFor(goodId, catalogue.entries, catalogue.load.status);
  const lab = useBakingLab(presetToLoad(bench) ?? defaultPreset());
  useBenchSync(lab, bench);
  const selectTab = (next: BakingTab): void => {
    window.history.replaceState(null, "", urlForBakingTab(window.location.href, next));
  };
  const selectGood = (id: string): void => {
    window.history.replaceState(null, "", urlForBakingGood(window.location.href, id));
  };
  const system = systemForTab(tab);
  const hint = BAKING_TABS.find(([id]) => id === tab)?.[2];
  const notice = benchNotice(bench);
  return (
    <div className="bl-root">
      <div className="px-5 pt-5">
        <SystemBadge
          system={system}
          variant="banner"
          counterpartHref={system === "real" ? bakingHref("elements", goodId) : bakingHref(DEFAULT_BAKING_TAB, goodId)}
          counterpartLabel={system === "real" ? "Read this formula as Fire · Water · Earth · Air" : "Back to the real physics of this formula"}
        />
      </div>
      <GoodSearch catalogue={catalogue} selectedId={benchGoodId(bench, lab.state.goodId)} onSelect={selectGood} />
      <TabNav tab={tab} onSelect={selectTab} />
      {hint === undefined ? null : <p className="px-5 pt-3 text-xs text-white/40">{hint}</p>}
      {notice === null ? null : <p className="bl-warn mx-5 mt-3 text-[13px]">{notice}</p>}
      <div className="bl-grid">
        <section aria-label={BAKING_TABS.find(([id]) => id === tab)?.[1] ?? "Panel"}>
          <Panel tab={tab} lab={lab} bench={bench} catalogue={catalogue} onTab={selectTab} />
        </section>
        {showsHud(tab, bench) ? (
          <aside className="bl-hud" aria-label="Real-physics telemetry">
            <TelemetryHUD lab={lab} onShowElements={() => selectTab("elements")} />
          </aside>
        ) : null}
      </div>
    </div>
  );
}
