"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useId, useMemo, useRef, useState, type JSX } from "react";
import { SystemBadge } from "@/components/lab/SystemBadge";
import { computeSaucePhysics, inputsFromPreset, type SauceLabInputs, type SaucePhysicsReport } from "@/lib/sauces/physics/engine";
import { getSaucePreset, SAUCE_BENCH_PRESETS, type SauceBenchPreset } from "@/lib/sauces/physics/presets";
import { sauceHref } from "@/lib/sauces/sauceFocus";
import {
  DEFAULT_SAUCE_TAB,
  SAUCE_TABS,
  sauceLabHref,
  sauceTabFromParam,
  systemForTab,
  urlForSaucePreset,
  urlForSauceTab,
  type SauceLabTab,
} from "../sauceTabs";
import { EmulsionBodyPanel } from "./EmulsionBodyPanel";
import { ReductionPanPanel } from "./ReductionPanPanel";
import { SauceSourcesPanel } from "./SauceSourcesPanel";
import { SauceTelemetryHUD } from "./SauceTelemetryHUD";

const EnhancedSauceRecommender = dynamic(
  () => import("@/components/recommendations/EnhancedSauceRecommender"),
  { ssr: false, loading: () => <p className="sl-card text-sm text-white/55">Loading pairing matrix…</p> },
);

const SauceLineageTree = dynamic(
  () => import("@/components/recommendations/SauceLineageTree"),
  { ssr: false, loading: () => <p className="sl-card text-sm text-white/55">Loading phylogeny forest…</p> },
);

function SauceLabTabs({ tab, onSelect }: { tab: SauceLabTab; onSelect: (next: SauceLabTab) => void }): JSX.Element {
  return (
    <nav className="sl-tabs" aria-label="Sauce Lab sections">
      {SAUCE_TABS.map(([id, label, , system]) => (
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

function BenchBar({ preset, onSelect }: { preset: SauceBenchPreset; onSelect: (id: string) => void }): JSX.Element {
  const selectId = useId();
  return (
    <div className="px-5 pt-4 flex flex-wrap items-center gap-3">
      <label htmlFor={selectId} className="sl-label">
        On The Bench
      </label>
      <select
        id={selectId}
        value={preset.id}
        onChange={(e) => onSelect(e.target.value)}
        className="sl-input min-w-[210px]"
      >
        {SAUCE_BENCH_PRESETS.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name} ({p.cuisine})
          </option>
        ))}
      </select>
      <span className="sl-chip text-white/70">{preset.mechanism}</span>
      {preset.focusKey && (
        <Link href={sauceHref(preset.focusKey)} prefetch={false} className="text-xs text-white/60 underline hover:text-white">
          Site dossier →
        </Link>
      )}
    </div>
  );
}

function RealPanelBody({
  tab,
  inputs,
  report,
  onChange,
  onShowPairing,
}: {
  tab: SauceLabTab;
  inputs: SauceLabInputs;
  report: SaucePhysicsReport;
  onChange: (patch: Partial<SauceLabInputs>) => void;
  onShowPairing: () => void;
}): JSX.Element {
  if (tab === "sources") {
    return (
      <div className="px-5 py-5">
        <SauceSourcesPanel />
      </div>
    );
  }
  return (
    <div className="sl-grid">
      <section aria-label={SAUCE_TABS.find(([id]) => id === tab)?.[1] ?? "Physics Panel"}>
        {tab === "reduction" ? (
          <ReductionPanPanel inputs={inputs} report={report} onChange={onChange} />
        ) : (
          <EmulsionBodyPanel inputs={inputs} report={report} onChange={onChange} />
        )}
      </section>
      <aside className="sl-hud" aria-label="Real-physics sauce telemetry">
        <SauceTelemetryHUD report={report} onShowPairing={onShowPairing} />
      </aside>
    </div>
  );
}

function replaceBrowserUrl(nextUrl: string): void {
  if (typeof window === "undefined") return;
  try {
    window.history.replaceState(null, "", nextUrl);
  } catch {
    // Ignore restricted URL environments
  }
}

export function SauceLabApp(): JSX.Element {
  const params = useSearchParams();
  const initialTab = sauceTabFromParam(params?.get("tab") ?? null);
  const initialPreset = getSaucePreset(params?.get("sauce") ?? null);
  const initialCuisine = params?.get("cuisine") ?? undefined;

  const [tab, setTab] = useState<SauceLabTab>(initialTab);
  const [presetId, setPresetId] = useState<string>(initialPreset.id);
  const [inputs, setInputs] = useState<SauceLabInputs>(() => inputsFromPreset(initialPreset));
  const [selectedSauceId, setSelectedSauceId] = useState<string | null>(initialPreset.catalogueSauceId);
  const studioTopRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  const preset = useMemo(() => getSaucePreset(presetId), [presetId]);
  const report = useMemo(() => computeSaucePhysics(inputs), [inputs]);
  const system = systemForTab(tab);
  const hint = SAUCE_TABS.find(([id]) => id === tab)?.[2];

  const selectTab = useCallback((next: SauceLabTab) => {
    setTab(next);
    if (typeof window !== "undefined") replaceBrowserUrl(urlForSauceTab(window.location.href, next));
  }, []);

  const selectPreset = useCallback((nextId: string) => {
    const nextPreset = getSaucePreset(nextId);
    setPresetId(nextPreset.id);
    setInputs(inputsFromPreset(nextPreset));
    setSelectedSauceId(nextPreset.catalogueSauceId);
    if (typeof window !== "undefined") replaceBrowserUrl(urlForSaucePreset(window.location.href, nextPreset.id));
  }, []);

  const handleInspectLineage = useCallback((sauceId: string) => {
    setSelectedSauceId(sauceId);
    selectTab("lineage");
    window.requestAnimationFrame(() => studioTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }, [selectTab]);

  const patchInputs = useCallback((patch: Partial<SauceLabInputs>) => {
    setInputs((prev) => ({ ...prev, ...patch }));
  }, []);

  return (
    <div ref={studioTopRef} className="sl-root scroll-mt-24">
      <div className="px-5 pt-5">
        <SystemBadge
          system={system}
          variant="banner"
          counterpartHref={system === "real" ? sauceLabHref("pairing", preset.id) : sauceLabHref(DEFAULT_SAUCE_TAB, preset.id)}
          counterpartLabel={system === "real" ? "Explore Alchm pairings & phylogeny" : "Back to Real emulsion physics"}
        />
      </div>
      {(tab === "emulsion" || tab === "reduction") && <BenchBar preset={preset} onSelect={selectPreset} />}
      <SauceLabTabs tab={tab} onSelect={selectTab} />
      {hint && <p className="px-5 pt-3 text-xs text-white/45">{hint}</p>}

      {tab === "pairing" && (
        <div className="px-5 py-6">
          <EnhancedSauceRecommender initialCuisine={initialCuisine ?? preset.cuisine} onInspectLineage={handleInspectLineage} />
        </div>
      )}
      {tab === "lineage" && (
        <div className="px-5 py-6">
          <SauceLineageTree initialSelectedId={selectedSauceId} onSelectSauce={setSelectedSauceId} />
        </div>
      )}
      {system === "real" && (
        <RealPanelBody tab={tab} inputs={inputs} report={report} onChange={patchInputs} onShowPairing={() => selectTab("pairing")} />
      )}
    </div>
  );
}
