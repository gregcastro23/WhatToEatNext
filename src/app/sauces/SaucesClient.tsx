"use client";

import dynamic from "next/dynamic";
import { useState, useCallback, useRef } from "react";

function SaucePanelSkeleton({ label }: { label: string }) {
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
  {
    ssr: false,
    loading: () => <SaucePanelSkeleton label="Loading alchemical sauce recommender..." />,
  },
);

const SauceLineageTree = dynamic(
  () => import("@/components/recommendations/SauceLineageTree"),
  {
    ssr: false,
    loading: () => <SaucePanelSkeleton label="Loading phylogenetic sauce lineage..." />,
  },
);

export type SaucesViewMode = "recommender" | "lineage" | "both";

export default function SaucesClient() {
  const [viewMode, setViewMode] = useState<SaucesViewMode>("recommender");
  const [selectedSauceId, setSelectedSauceId] = useState<string | null>(null);
  const lineageRef = useRef<HTMLDivElement>(null);

  const handleInspectLineage = useCallback((sauceId: string) => {
    setSelectedSauceId(sauceId);
    if (viewMode === "recommender") {
      setViewMode("lineage");
    } else if (viewMode === "both" && lineageRef.current) {
      lineageRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [viewMode]);

  return (
    <div className="space-y-8">
      {/* Studio View Navigation Tabs */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-2 rounded-2xl border border-white/10 bg-[#0e0c16]/80 backdrop-blur-xl">
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setViewMode("recommender")}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-wider transition-all flex items-center justify-center gap-2 border ${
              viewMode === "recommender"
                ? "bg-violet-600/30 border-violet-400/80 text-white shadow-[0_0_15px_rgba(139,92,246,0.3)] ring-1 ring-violet-400/30"
                : "bg-transparent border-transparent text-white/60 hover:text-white hover:bg-white/[0.04]"
            }`}
          >
            <span>⚡</span>
            <span>Pairing Studio</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode("lineage")}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-wider transition-all flex items-center justify-center gap-2 border ${
              viewMode === "lineage"
                ? "bg-violet-600/30 border-violet-400/80 text-white shadow-[0_0_15px_rgba(139,92,246,0.3)] ring-1 ring-violet-400/30"
                : "bg-transparent border-transparent text-white/60 hover:text-white hover:bg-white/[0.04]"
            }`}
          >
            <span>🌳</span>
            <span>Phylogeny Forest</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode("both")}
            className={`hidden md:flex px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-wider transition-all items-center gap-2 border ${
              viewMode === "both"
                ? "bg-violet-600/30 border-violet-400/80 text-white shadow-[0_0_15px_rgba(139,92,246,0.3)] ring-1 ring-violet-400/30"
                : "bg-transparent border-transparent text-white/60 hover:text-white hover:bg-white/[0.04]"
            }`}
          >
            <span>🧭</span>
            <span>Dual Workbench</span>
          </button>
        </div>

        <div className="text-[11px] font-mono text-white/40 hidden sm:flex items-center gap-3 pr-3">
          <span>Four-Element Resonance</span>
          <span>·</span>
          <span>Mother Sauce Phylogeny</span>
        </div>
      </div>

      {/* Recommender Studio Section */}
      {(viewMode === "recommender" || viewMode === "both") && (
        <section aria-label="Alchemical Sauce Recommender">
          <EnhancedSauceRecommender onInspectLineage={handleInspectLineage} />
        </section>
      )}

      {/* Phylogeny Lineage Tree Section */}
      {(viewMode === "lineage" || viewMode === "both") && (
        <section ref={lineageRef} aria-label="Sauce Phylogeny Tree">
          <SauceLineageTree
            initialSelectedId={selectedSauceId}
            onSelectSauce={setSelectedSauceId}
          />
        </section>
      )}
    </div>
  );
}
