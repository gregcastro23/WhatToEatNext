"use client";

/**
 * Sauce Lineage Tree — Phylogenetic Phylogeny Engine
 *
 * Navigable evolutionary tree of sauces across cuisines. Demonstrates how every
 * traditional sauce descends from structural parents (mother sauces or base-family roots)
 * and where ingredient divergences happen.
 */

import React, { useCallback, useMemo, useState, useEffect } from "react";
import { useAlchemicalData } from "@/contexts/AlchemicalDataContext";
import {
  getSauceForest,
  getLineage,
  getDivergence,
  getFusionBridges,
  getChildren,
  getVariantLeaves,
  searchNodes,
  FAMILY_DESCRIPTIONS,
  type BaseFamily,
  type SauceNode,
} from "@/utils/cuisine/sauceLineage";

// ============================================================================
// Helpers & Tokens
// ============================================================================

const FAMILY_ICONS: Record<BaseFamily, string> = {
  tomato: "🍅",
  dairy: "🥛",
  "egg-emulsion": "🥚",
  "soy-fermented": "🍶",
  chile: "🌶️",
  herb: "🌿",
  citrus: "🍋",
  "stock-reduction": "🍲",
  "nut-seed": "🥜",
  vinegar: "🧂",
  yogurt: "🥣",
  "meat-drippings": "🥩",
  other: "✨",
};

const ORIGIN_BADGES: Record<
  SauceNode["origin"],
  { label: string; className: string }
> = {
  mother: {
    label: "Mother Sauce",
    className: "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_8px_rgba(251,191,36,0.3)]",
  },
  traditional: {
    label: "Traditional",
    className: "bg-violet-500/20 text-violet-300 border border-violet-500/40 shadow-[0_0_8px_rgba(167,139,250,0.3)]",
  },
  global: {
    label: "Catalog",
    className: "bg-sky-500/20 text-sky-300 border border-sky-500/40",
  },
  "variant-only": {
    label: "Variant",
    className: "bg-white/5 text-white/50 border border-white/10",
  },
};

function CuisineChip({ cuisine }: { cuisine?: string | undefined }) {
  if (!cuisine) return null;
  return (
    <span className="text-[9px] font-mono uppercase tracking-wider bg-white/[0.04] text-white/60 border border-white/10 px-1.5 py-0.5 rounded">
      {cuisine}
    </span>
  );
}

function OriginBadge({ origin }: { origin: SauceNode["origin"] }) {
  const meta = ORIGIN_BADGES[origin];
  return (
    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-medium ${meta.className}`}>
      {meta.label}
    </span>
  );
}

// ============================================================================
// Tree Node Row
// ============================================================================

interface NodeRowProps {
  node: SauceNode;
  depth: number;
  selectedId: string | null;
  expanded: Set<string>;
  onToggle: (id: string) => void;
  onSelect: (id: string) => void;
  cuisinesData?: Record<string, unknown> | undefined;
}

function NodeRow({
  node,
  depth,
  selectedId,
  expanded,
  onToggle,
  onSelect,
  cuisinesData,
}: NodeRowProps) {
  const forest = useMemo(() => getSauceForest(cuisinesData), [cuisinesData]);
  const children = getChildren(forest, node.id);
  const variants = getVariantLeaves(forest, node.id);
  const isOpen = expanded.has(node.id);
  const hasChildren = children.length > 0 || variants.length > 0;
  const isSelected = selectedId === node.id;

  return (
    <div>
      <div
        className={`flex items-center gap-2 py-1.5 pr-2 rounded-xl transition-all cursor-pointer ${
          isSelected
            ? "bg-violet-950/60 ring-1 ring-violet-500 text-white border-l-2 border-violet-400 shadow-[0_0_15px_rgba(139,92,246,0.2)]"
            : "hover:bg-white/[0.04] text-white/80 hover:text-white"
        }`}
        style={{ paddingLeft: `${depth * 16 + 10}px` }}
      >
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggle(node.id);
            }}
            className="w-4 h-4 flex items-center justify-center text-white/50 hover:text-violet-300 text-xs transition-colors"
            aria-label={isOpen ? "Collapse" : "Expand"}
          >
            {isOpen ? "▾" : "▸"}
          </button>
        ) : (
          <span className="w-4" />
        )}

        <button
          type="button"
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
          onClick={() => onSelect(node.id)}
        >
          <OriginBadge origin={node.origin} />
          <span
            className={`text-xs truncate ${
              node.origin === "mother"
                ? "font-serif text-sm font-semibold text-amber-300"
                : isSelected
                ? "font-medium text-white"
                : "text-white/80"
            }`}
          >
            {node.name}
          </span>
          <CuisineChip cuisine={node.cuisine} />
          {hasChildren && (
            <span className="text-[10px] font-mono text-white/40 ml-auto tabular-nums">
              {children.length + variants.length} desc.
            </span>
          )}
        </button>
      </div>

      {isOpen && hasChildren && (
        <div className="border-l border-white/10 ml-4 my-0.5">
          {children.map((c) => (
            <NodeRow
              key={c.id}
              node={c}
              depth={depth + 1}
              selectedId={selectedId}
              expanded={expanded}
              onToggle={onToggle}
              onSelect={onSelect}
              cuisinesData={cuisinesData}
            />
          ))}
          {variants.map((v) => (
            <div
              key={v.id}
              className="flex items-center gap-2 py-1 pr-2 text-xs text-white/40 italic"
              style={{ paddingLeft: `${(depth + 1) * 16 + 12}px` }}
            >
              <span className="text-white/20">↳</span>
              <span className="truncate">{v.name}</span>
              <span className="text-[8px] font-mono text-white/30 bg-white/[0.02] border border-white/5 px-1 rounded">
                variant
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Detail Pane
// ============================================================================

function DetailPane({
  selectedId,
  onSelect,
  cuisinesData,
}: {
  selectedId: string | null;
  onSelect: (id: string) => void;
  cuisinesData?: Record<string, unknown> | undefined;
}) {
  const forest = useMemo(() => getSauceForest(cuisinesData), [cuisinesData]);

  if (!selectedId) {
    return (
      <div className="p-8 text-white/50 bg-[#0e0c16]/50 rounded-2xl border border-white/10 h-full min-h-[380px] flex flex-col items-center justify-center text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-2xl text-violet-300">
          🌳
        </div>
        <div className="font-serif text-lg text-white font-medium">
          Select a Sauce to Inspect Lineage
        </div>
        <p className="text-xs text-white/60 max-w-sm leading-relaxed">
          Explore its structural ancestry, key ingredient divergences from its parent,
          and close culinary relatives across other world traditions.
        </p>
      </div>
    );
  }

  const node = forest.nodes.get(selectedId);
  if (!node) return null;

  const lineage = getLineage(forest, selectedId);
  const divergence = getDivergence(forest, selectedId);
  const bridges = getFusionBridges(forest, selectedId);
  const variants = getVariantLeaves(forest, selectedId);

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0e0c16]/90 backdrop-blur-xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
      {/* Header Banner */}
      <div className="p-5 border-b border-white/10 bg-gradient-to-r from-violet-950/40 via-[#15121f] to-amber-950/30">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <OriginBadge origin={node.origin} />
          <CuisineChip cuisine={node.cuisine} />
          {node.base && (
            <span className="text-[10px] font-mono text-white/50">
              Base: <span className="text-violet-300 font-medium">{node.base}</span>
            </span>
          )}
        </div>
        <h3 className="text-2xl font-serif font-medium text-white tracking-wide">
          {node.name}
        </h3>
        {node.description && (
          <p className="text-xs text-white/70 mt-2 leading-relaxed">
            {node.description}
          </p>
        )}
      </div>

      <div className="p-5 space-y-5">
        {/* Lineage Breadcrumb */}
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-violet-300 mb-2">
            Ancestral Descent
          </div>
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {lineage.map((n, i) => (
              <React.Fragment key={n.id}>
                {i > 0 && <span className="text-white/30 font-mono">→</span>}
                <button
                  onClick={() => onSelect(n.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
                    n.id === selectedId
                      ? "bg-amber-500/25 border border-amber-500/50 text-amber-200 shadow-[0_0_10px_rgba(251,191,36,0.3)]"
                      : "bg-white/[0.04] border border-white/10 text-white/70 hover:bg-white/[0.08] hover:text-white"
                  }`}
                  title={`${n.name} (${n.cuisine ?? "Global"})`}
                >
                  {n.name}
                </button>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Divergence */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="text-[10px] font-mono uppercase tracking-widest text-white/40">
              Divergence from Parent
            </div>
            {divergence && (
              <span className="text-[10px] font-mono text-violet-300">
                Jaccard Similarity: {(divergence.similarity * 100).toFixed(0)}%
              </span>
            )}
          </div>

          {divergence ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
              {/* Inherited */}
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-3">
                <div className="text-[10px] font-mono text-emerald-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Inherited</span>
                  <span className="font-bold">({divergence.inherited.length})</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {divergence.inherited.length === 0 ? (
                    <span className="text-white/30 text-[10px]">—</span>
                  ) : (
                    divergence.inherited.map((t) => (
                      <span
                        key={t}
                        className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-200 px-1.5 py-0.5 rounded text-[10px]"
                      >
                        {t}
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Added */}
              <div className="rounded-xl border border-sky-500/20 bg-sky-950/20 p-3">
                <div className="text-[10px] font-mono text-sky-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Added</span>
                  <span className="font-bold">({divergence.added.length})</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {divergence.added.length === 0 ? (
                    <span className="text-white/30 text-[10px]">—</span>
                  ) : (
                    divergence.added.map((t) => (
                      <span
                        key={t}
                        className="bg-sky-500/20 border border-sky-500/30 text-sky-200 px-1.5 py-0.5 rounded text-[10px]"
                      >
                        + {t}
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Dropped */}
              <div className="rounded-xl border border-rose-500/20 bg-rose-950/20 p-3">
                <div className="text-[10px] font-mono text-rose-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Dropped</span>
                  <span className="font-bold">({divergence.dropped.length})</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {divergence.dropped.length === 0 ? (
                    <span className="text-white/30 text-[10px]">—</span>
                  ) : (
                    divergence.dropped.map((t) => (
                      <span
                        key={t}
                        className="bg-rose-500/20 border border-rose-500/30 text-rose-200 px-1.5 py-0.5 rounded text-[10px]"
                      >
                        − {t}
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200 flex items-center gap-2">
              <span>⚜️</span>
              <span>Root Mother Sauce — primordial origin point of this base family.</span>
            </div>
          )}
        </div>

        {/* Variants */}
        {variants.length > 0 && (
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-white/40 mb-1.5">
              Documented Variant Leaves
            </div>
            <div className="flex flex-wrap gap-1.5">
              {variants.map((v) => (
                <span
                  key={v.id}
                  className="text-[11px] bg-white/[0.04] border border-white/10 text-white/70 px-2 py-0.5 rounded-md italic"
                >
                  {v.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Fusion Bridges */}
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-violet-300 mb-2 flex items-center justify-between">
            <span>Cross-Cuisine Fusion Bridges</span>
            <span className="text-white/40 font-normal lowercase">
              structural relatives across traditions
            </span>
          </div>

          {bridges.length === 0 ? (
            <div className="text-xs text-white/40 italic p-3 rounded-xl border border-white/5 bg-white/[0.01]">
              No close cross-tradition relatives identified — this sauce stands unique.
            </div>
          ) : (
            <div className="space-y-2">
              {bridges.slice(0, 4).map((b) => {
                const target = forest.nodes.get(b.toId);
                if (!target) return null;
                return (
                  <button
                    key={b.toId}
                    onClick={() => onSelect(b.toId)}
                    className="w-full text-left rounded-xl border border-white/10 bg-white/[0.02] hover:bg-violet-950/25 hover:border-violet-500/40 p-3.5 transition-all group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white group-hover:text-violet-200">
                          {target.name}
                        </span>
                        <CuisineChip cuisine={target.cuisine} />
                        <OriginBadge origin={target.origin} />
                      </div>
                      <span className="text-xs font-mono font-bold text-violet-300 tabular-nums">
                        {(b.similarity * 100).toFixed(0)}% overlap
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-[10px]">
                      <div>
                        <div className="text-emerald-400 font-mono mb-1">
                          Shared ({b.shared.length})
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {b.shared.slice(0, 4).map((t) => (
                            <span
                              key={t}
                              className="bg-emerald-500/20 text-emerald-300 px-1 py-0.5 rounded"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="text-white/50 font-mono mb-1">
                          {node.name} only
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {b.fromUnique.slice(0, 3).map((t) => (
                            <span
                              key={t}
                              className="bg-white/5 text-white/60 px-1 py-0.5 rounded"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="text-violet-300 font-mono mb-1">
                          {target.name} only
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {b.toUnique.slice(0, 3).map((t) => (
                            <span
                              key={t}
                              className="bg-violet-500/20 text-violet-200 px-1 py-0.5 rounded"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Technical Tips & Notes */}
        {(node.preparationNotes ?? node.technicalTips) && (
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 space-y-2">
            {node.preparationNotes && (
              <p className="text-xs text-white/70 leading-relaxed">
                📝 {node.preparationNotes}
              </p>
            )}
            {node.technicalTips && (
              <p className="text-xs text-amber-200 leading-relaxed">
                💡 {node.technicalTips}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export interface SauceLineageTreeProps {
  initialSelectedId?: string | null;
  onSelectSauce?: (id: string) => void;
  className?: string;
}

export default function SauceLineageTree({
  initialSelectedId,
  onSelectSauce,
  className = "",
}: SauceLineageTreeProps) {
  const { cuisines, loading } = useAlchemicalData();
  const forest = useMemo(() => getSauceForest(cuisines ?? undefined), [cuisines]);
  const [activeFamily, setActiveFamily] = useState<BaseFamily>("tomato");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [selectedId, setSelectedId] = useState<string | null>(initialSelectedId ?? null);
  const [searchQuery, setSearchQuery] = useState("");

  const onToggle = useCallback((id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const onSelect = useCallback(
    (id: string) => {
      setSelectedId(id);
      onSelectSauce?.(id);
      const lineage = getLineage(forest, id);
      setExpanded((prev) => {
        const next = new Set(prev);
        for (const n of lineage) next.add(n.id);
        return next;
      });
      const node = forest.nodes.get(id);
      if (node && node.baseFamily !== activeFamily) {
        setActiveFamily(node.baseFamily);
      }
    },
    [forest, activeFamily, onSelectSauce],
  );

  useEffect(() => {
    if (initialSelectedId && initialSelectedId !== selectedId) {
      onSelect(initialSelectedId);
    }
  }, [initialSelectedId, selectedId, onSelect]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    return searchNodes(forest, searchQuery);
  }, [forest, searchQuery]);

  const activeFamilyTree = useMemo(
    () => forest.families.find((f) => f.family === activeFamily),
    [forest, activeFamily],
  );

  useEffect(() => {
    if (selectedId) {
      const node = forest.nodes.get(selectedId);
      if (node) setActiveFamily(node.baseFamily);
    }
  }, [selectedId, forest]);

  useEffect(() => {
    if (forest && forest.families.length > 0) {
      if (!activeFamily || !forest.families.find((f) => f.family === activeFamily)) {
        const [firstFamily] = forest.families;
        if (firstFamily) setActiveFamily(firstFamily.family);
      }
    }
  }, [forest, activeFamily]);

  if (loading && !forest.nodes.size) {
    return (
      <div className="p-12 text-center text-white/50 font-mono text-sm animate-pulse">
        Mapping phylogenetic culinary lineages...
      </div>
    );
  }

  const totalBridges = Math.floor(
    Array.from(forest.fusionByNode.values()).reduce((s, b) => s + b.length, 0) / 2,
  );

  return (
    <div className={`w-full max-w-7xl mx-auto space-y-6 ${className}`}>
      {/* Header Banner */}
      <div className="rounded-2xl border border-white/10 bg-[#0e0c16]/90 p-6 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-violet-300 mb-1">
              Phylogeny & Evolution
            </div>
            <h2 className="text-3xl font-serif font-medium text-white tracking-wide">
              Cross-Cuisine Sauce Lineage
            </h2>
            <p className="text-xs text-white/70 mt-1 max-w-2xl leading-relaxed">
              Every traditional sauce descends from a small set of structural parent foundations.
              Trace the phylogenetic tree, discover how ingredients diverge across generations, and
              explore shared flavor logic across distinct culinary traditions.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono text-white/60">
            <div className="px-3 py-1.5 rounded-xl border border-white/10 bg-white/[0.03]">
              <span className="text-violet-300 font-bold">{forest.nodes.size}</span> Sauces
            </div>
            <div className="px-3 py-1.5 rounded-xl border border-white/10 bg-white/[0.03]">
              <span className="text-amber-300 font-bold">{forest.edges.length}</span> Branches
            </div>
            <div className="px-3 py-1.5 rounded-xl border border-white/10 bg-white/[0.03]">
              <span className="text-emerald-300 font-bold">{totalBridges}</span> Fusion Bridges
            </div>
          </div>
        </div>

        {/* Base Family Tabs */}
        <div className="flex flex-wrap gap-2 mt-6 pt-5 border-t border-white/5">
          {forest.families.map((f) => {
            const isActive = activeFamily === f.family;
            return (
              <button
                key={f.family}
                onClick={() => setActiveFamily(f.family)}
                className={`px-3 py-1.5 rounded-full text-xs font-mono transition-all flex items-center gap-2 border ${
                  isActive
                    ? "bg-violet-600/30 border-violet-400 text-white shadow-[0_0_15px_rgba(139,92,246,0.3)] ring-1 ring-violet-400/40"
                    : "bg-white/[0.03] border-white/10 text-white/60 hover:border-white/20 hover:text-white"
                }`}
                title={f.description}
              >
                <span>{FAMILY_ICONS[f.family]}</span>
                <span>{f.label}</span>
                <span className="text-[10px] text-white/40 tabular-nums">({f.size})</span>
              </button>
            );
          })}
        </div>

        {/* Active Family Summary Card */}
        {activeFamilyTree && (
          <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.02] p-4 text-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-violet-300">
                {activeFamilyTree.label} Foundation
              </span>
              <span className="text-[10px] font-mono text-white/40">
                {activeFamilyTree.cuisines.length} Cuisines Represented
              </span>
            </div>
            <p className="text-xs text-white/70 leading-relaxed">
              {FAMILY_DESCRIPTIONS[activeFamilyTree.family]}
            </p>
            <div className="text-[10px] font-mono text-white/50 mt-2">
              Traditions: {activeFamilyTree.cuisines.join(" · ")}
            </div>
          </div>
        )}
      </div>

      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search by sauce name, cuisine, or key ingredient (e.g. mole, velouté, soy, chili)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#0e0c16]/90 text-white border border-white/15 rounded-2xl px-4 py-3 text-sm focus:border-violet-400 focus:ring-1 focus:ring-violet-400 outline-none backdrop-blur-xl placeholder-white/40 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-4 top-3 text-xs font-mono text-white/40 hover:text-white"
          >
            Clear ✕
          </button>
        )}
      </div>

      {/* Two-Pane Tree & Dossier Explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Tree Pane (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl border border-white/10 bg-[#0e0c16]/90 backdrop-blur-xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.4)] flex flex-col max-h-[720px]">
          <div className="bg-white/[0.03] border-b border-white/10 px-4 py-3 text-[10px] font-mono uppercase tracking-widest text-white/50 flex items-center justify-between">
            <span>{searchResults ? "Search Results" : "Family Forest"}</span>
            {searchResults && (
              <span className="text-violet-300 font-mono">
                {searchResults.length} matches
              </span>
            )}
          </div>

          <div className="overflow-y-auto p-3 flex-1 space-y-1">
            {searchResults ? (
              searchResults.length === 0 ? (
                <div className="p-8 text-center text-xs text-white/40">
                  No sauces found matching &ldquo;{searchQuery}&rdquo;.
                </div>
              ) : (
                searchResults.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => onSelect(n.id)}
                    className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${
                      selectedId === n.id
                        ? "bg-violet-950/60 ring-1 ring-violet-500 text-white border-l-2 border-violet-400"
                        : "hover:bg-white/[0.04] text-white/80"
                    }`}
                  >
                    <span>{FAMILY_ICONS[n.baseFamily]}</span>
                    <OriginBadge origin={n.origin} />
                    <span className="text-xs truncate font-medium">{n.name}</span>
                    <CuisineChip cuisine={n.cuisine} />
                  </button>
                ))
              )
            ) : activeFamilyTree && activeFamilyTree.roots.length > 0 ? (
              activeFamilyTree.roots.map((root) => (
                <NodeRow
                  key={root.id}
                  node={root}
                  depth={0}
                  selectedId={selectedId}
                  expanded={expanded}
                  onToggle={onToggle}
                  onSelect={onSelect}
                  cuisinesData={cuisines ?? undefined}
                />
              ))
            ) : (
              <div className="p-8 text-center text-xs text-white/40">
                No sauces recorded for this base family.
              </div>
            )}
          </div>
        </div>

        {/* Right Detail Pane (7 cols) */}
        <div className="lg:col-span-7">
          <DetailPane
            selectedId={selectedId}
            onSelect={onSelect}
            cuisinesData={cuisines ?? undefined}
          />
        </div>
      </div>
    </div>
  );
}
