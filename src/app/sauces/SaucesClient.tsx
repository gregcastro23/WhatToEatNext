"use client";

import dynamic from "next/dynamic";
import React, { useCallback, useEffect, useRef, useState } from "react";

function SaucePanelSkeleton({ label }: { label: string }): React.ReactElement {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0e0c16]/80 p-8 backdrop-blur-xl">
      <div className="h-5 w-48 rounded-full bg-white/10 animate-pulse" />
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <div className="h-24 rounded-xl bg-white/5 animate-pulse" />
        <div className="h-24 rounded-xl bg-white/5 animate-pulse" />
        <div className="h-24 rounded-xl bg-white/5 animate-pulse" />
      </div>
      <p className="mt-4 text-xs font-mono uppercase tracking-wider text-white/40">{label}</p>
    </div>
  );
}

const EnhancedSauceRecommender = dynamic(
  () => import("@/components/recommendations/EnhancedSauceRecommender"),
  { ssr: false, loading: () => <SaucePanelSkeleton label="Loading alchemical sauce recommender..." /> },
);

const SauceLineageTree = dynamic(
  () => import("@/components/recommendations/SauceLineageTree"),
  { ssr: false, loading: () => <SaucePanelSkeleton label="Loading phylogenetic sauce lineage..." /> },
);

export type SaucesViewMode = "recommender" | "lineage" | "both";

export interface SaucesClientProps {
  initialCuisine?: string;
}

const TAB_ITEMS: ReadonlyArray<{ key: SaucesViewMode; icon: string; label: string; hideSm?: boolean }> = [
  { key: "recommender", icon: "⚡", label: "Pairing Studio" },
  { key: "lineage", icon: "🌳", label: "Phylogeny Forest" },
  { key: "both", icon: "🧭", label: "Dual Workbench", hideSm: true },
];

function StudioTabNav({
  viewMode,
  onSelectMode,
}: {
  viewMode: SaucesViewMode;
  onSelectMode: (mode: SaucesViewMode) => void;
}): React.ReactElement {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-2 rounded-2xl border border-white/10 bg-[#0e0c16]/80 backdrop-blur-xl">
      <div className="flex items-center gap-1.5 w-full sm:w-auto">
        {TAB_ITEMS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            aria-pressed={viewMode === tab.key}
            onClick={() => onSelectMode(tab.key)}
            className={`${tab.hideSm ? "hidden md:flex" : "flex-1 sm:flex-initial flex"} min-h-[44px] px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-wider transition-all items-center justify-center gap-2 border focus-visible:outline-2 focus-visible:outline-violet-400 focus-visible:outline-offset-2 ${
              viewMode === tab.key
                ? "bg-violet-600/30 border-violet-400/80 text-white shadow-[0_0_15px_rgba(139,92,246,0.3)] ring-1 ring-violet-400/30"
                : "bg-transparent border-transparent text-white/60 hover:text-white hover:bg-white/[0.04]"
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
      <div className="text-[11px] font-mono text-white/40 hidden sm:flex items-center gap-3 pr-3">
        <span>Four-Element Resonance</span>
        <span>·</span>
        <span>Mother Sauce Phylogeny</span>
      </div>
    </div>
  );
}

export default function SaucesClient({ initialCuisine }: SaucesClientProps): React.ReactElement {
  const [viewMode, setViewMode] = useState<SaucesViewMode>("recommender");
  const [selectedSauceId, setSelectedSauceId] = useState<string | null>(null);
  const lineageRef = useRef<HTMLDivElement>(null);
  const pendingScrollToLineageRef = useRef(false);

  const handleInspectLineage = useCallback((sauceId: string) => {
    setSelectedSauceId(sauceId);
    if (viewMode === "recommender") {
      pendingScrollToLineageRef.current = true;
      setViewMode("lineage");
    } else if (lineageRef.current) {
      lineageRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [viewMode]);

  useEffect(() => {
    if (!pendingScrollToLineageRef.current) return;
    if (viewMode !== "lineage" && viewMode !== "both") return;
    pendingScrollToLineageRef.current = false;
    const raf = window.requestAnimationFrame(() => {
      lineageRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    return (): void => window.cancelAnimationFrame(raf);
  }, [viewMode, selectedSauceId]);

  return (
    <div className="space-y-8">
      <StudioTabNav viewMode={viewMode} onSelectMode={setViewMode} />
      {(viewMode === "recommender" || viewMode === "both") && (
        <section aria-label="Alchemical Sauce Recommender">
          <EnhancedSauceRecommender
            {...(initialCuisine ? { initialCuisine } : {})}
            onInspectLineage={handleInspectLineage}
          />
        </section>
      )}
      {(viewMode === "lineage" || viewMode === "both") && (
        <section ref={lineageRef} aria-label="Sauce Phylogeny Tree" className="scroll-mt-24">
          <SauceLineageTree initialSelectedId={selectedSauceId} onSelectSauce={setSelectedSauceId} />
        </section>
      )}
    </div>
  );
}
