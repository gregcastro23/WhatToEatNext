"use client";

/**
 * Sauce Lineage Tree
 *
 * Navigable phylogeny of sauces across cuisines. Demonstrates how every
 * traditional sauce descends from a small set of structural parents
 * (mother sauces or base-family roots) and where divergences happen.
 *
 * Three coordinated panes:
 *   • Family tabs   — Tomato / Dairy / Egg-emulsion / Stock / Soy / etc.
 *   • Tree pane     — expandable forest of root sauces and their descendants
 *   • Detail pane   — selected sauce: lineage breadcrumb, divergence vs.
 *                     parent (inherited / added / dropped), declared variants,
 *                     and cross-cuisine fusion bridges (the bedrock of
 *                     informed, non-fusion-but-cross-cultural cooking).
 *
 * The data is computed once via `getSauceForest()` and memoized.
 */

import React, { useCallback, useMemo, useState, useEffect } from "react";
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
// Helpers
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
  mother: { label: "Mother", className: "bg-amber-500 text-white" },
  traditional: { label: "Traditional", className: "bg-slate-700 text-white" },
  global: { label: "Catalog", className: "bg-slate-200 text-slate-700" },
  "variant-only": { label: "Variant", className: "bg-slate-100 text-slate-500" },
};

function CuisineChip({ cuisine }: { cuisine?: string }) {
  if (!cuisine) return null;
  return (
    <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded uppercase tracking-wider">
      {cuisine}
    </span>
  );
}

function OriginBadge({ origin }: { origin: SauceNode["origin"] }) {
  const meta = ORIGIN_BADGES[origin];
  return (
    <span
      className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${meta.className}`}
    >
      {meta.label}
    </span>
  );
}

// ============================================================================
// Tree node row
// ============================================================================

interface NodeRowProps {
  node: SauceNode;
  depth: number;
  selectedId: string | null;
  expanded: Set<string>;
  onToggle: (id: string) => void;
  onSelect: (id: string) => void;
  forestVersion: number; // bust memo when forest tree changes
}

function NodeRow({
  node,
  depth,
  selectedId,
  expanded,
  onToggle,
  onSelect,
  forestVersion,
}: NodeRowProps) {
  const forest = useMemo(getSauceForest, [forestVersion]);
  const children = getChildren(forest, node.id);
  const variants = getVariantLeaves(forest, node.id);
  const isOpen = expanded.has(node.id);
  const hasChildren = children.length > 0 || variants.length > 0;
  const isSelected = selectedId === node.id;

  return (
    <div>
      <div
        className={`flex items-center gap-2 py-1.5 pr-2 rounded transition-colors cursor-pointer ${
          isSelected
            ? "bg-amber-100/70 ring-1 ring-amber-400"
            : "hover:bg-slate-50"
        }`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={() => onSelect(node.id)}
      >
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggle(node.id);
            }}
            className="w-4 h-4 flex items-center justify-center text-slate-500 hover:text-slate-800 text-xs"
            aria-label={isOpen ? "Collapse" : "Expand"}
          >
            {isOpen ? "▾" : "▸"}
          </button>
        ) : (
          <span className="w-4" />
        )}

        <OriginBadge origin={node.origin} />
        <span
          className={`text-sm ${
            node.origin === "mother"
              ? "font-semibold text-amber-800"
              : "text-slate-700"
          }`}
        >
          {node.name}
        </span>
        <CuisineChip cuisine={node.cuisine} />
        {hasChildren && (
          <span className="text-[10px] text-slate-400 ml-auto">
            {children.length + variants.length} desc.
          </span>
        )}
      </div>

      {isOpen && hasChildren && (
        <div className="border-l border-slate-200 ml-4">
          {children.map((c) => (
            <NodeRow
              key={c.id}
              node={c}
              depth={depth + 1}
              selectedId={selectedId}
              expanded={expanded}
              onToggle={onToggle}
              onSelect={onSelect}
              forestVersion={forestVersion}
            />
          ))}
          {variants.map((v) => (
            <div
              key={v.id}
              className="flex items-center gap-2 py-1 pr-2 text-xs text-slate-500 italic"
              style={{ paddingLeft: `${(depth + 1) * 16 + 12}px` }}
            >
              <span className="text-slate-300">↳</span>
              <span>{v.name}</span>
              <span className="text-[9px] text-slate-400 bg-slate-50 px-1 rounded">
                variant string
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Detail pane
// ============================================================================

function DetailPane({
  selectedId,
  onSelect,
  forestVersion,
}: {
  selectedId: string | null;
  onSelect: (id: string) => void;
  forestVersion: number;
}) {
  const forest = useMemo(getSauceForest, [forestVersion]);
  if (!selectedId) {
    return (
      <div className="p-6 text-sm text-slate-500 bg-slate-50 rounded-lg border border-slate-100 h-full flex flex-col items-center justify-center text-center">
        <div className="text-3xl mb-2">🌳</div>
        <div className="font-medium text-slate-600 mb-1">
          Pick a sauce to inspect its lineage
        </div>
        <div className="text-xs">
          You&apos;ll see its ancestral path, ingredient divergence from its parent,
          and the closest sauces in other cuisines for cross-tradition cooking.
        </div>
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
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-amber-50 to-rose-50">
        <div className="flex items-center gap-2 mb-1">
          <OriginBadge origin={node.origin} />
          <CuisineChip cuisine={node.cuisine} />
          {node.base && (
            <span className="text-[10px] text-slate-500">
              base: <span className="font-medium text-slate-700">{node.base}</span>
            </span>
          )}
        </div>
        <h3 className="text-lg font-bold text-slate-800">{node.name}</h3>
        {node.description && (
          <p className="text-xs text-slate-600 mt-1">{node.description}</p>
        )}
      </div>

      <div className="p-4 space-y-4">
        {/* Lineage breadcrumb */}
        <div>
          <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1">
            Lineage
          </div>
          <div className="flex flex-wrap items-center gap-1 text-xs">
            {lineage.map((n, i) => (
              <React.Fragment key={n.id}>
                {i > 0 && <span className="text-slate-300">→</span>}
                <button
                  onClick={() => onSelect(n.id)}
                  className={`px-2 py-0.5 rounded transition-colors ${
                    n.id === selectedId
                      ? "bg-amber-600 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                  title={n.cuisine}
                >
                  {n.name}
                </button>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Divergence */}
        {divergence ? (
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                Divergence from parent
              </div>
              <span className="text-[10px] text-slate-500">
                Jaccard {(divergence.similarity * 100).toFixed(0)}%
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[11px]">
              <div className="bg-emerald-50 border border-emerald-100 rounded p-2">
                <div className="text-emerald-700 font-semibold mb-1">
                  Inherited ({divergence.inherited.length})
                </div>
                <div className="flex flex-wrap gap-1">
                  {divergence.inherited.length === 0 ? (
                    <span className="text-slate-400">—</span>
                  ) : (
                    divergence.inherited.map((t) => (
                      <span key={t} className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                        {t}
                      </span>
                    ))
                  )}
                </div>
              </div>
              <div className="bg-sky-50 border border-sky-100 rounded p-2">
                <div className="text-sky-700 font-semibold mb-1">
                  Added ({divergence.added.length})
                </div>
                <div className="flex flex-wrap gap-1">
                  {divergence.added.length === 0 ? (
                    <span className="text-slate-400">—</span>
                  ) : (
                    divergence.added.map((t) => (
                      <span key={t} className="bg-sky-100 text-sky-800 px-1.5 py-0.5 rounded">
                        + {t}
                      </span>
                    ))
                  )}
                </div>
              </div>
              <div className="bg-rose-50 border border-rose-100 rounded p-2">
                <div className="text-rose-700 font-semibold mb-1">
                  Dropped ({divergence.dropped.length})
                </div>
                <div className="flex flex-wrap gap-1">
                  {divergence.dropped.length === 0 ? (
                    <span className="text-slate-400">—</span>
                  ) : (
                    divergence.dropped.map((t) => (
                      <span key={t} className="bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded">
                        − {t}
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded bg-amber-50 border border-amber-100 p-2 text-[11px] text-amber-800">
            ⚜️ Root sauce — origin point of its base family.
          </div>
        )}

        {/* Variants */}
        {variants.length > 0 && (
          <div>
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1">
              Declared variants
            </div>
            <div className="flex flex-wrap gap-1">
              {variants.map((v) => (
                <span
                  key={v.id}
                  className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded italic"
                >
                  {v.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Fusion bridges */}
        <div>
          <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1">
            Cross-cuisine bridges
            <span className="ml-2 text-slate-400 lowercase font-normal">
              same flavor logic, different tradition
            </span>
          </div>
          {bridges.length === 0 ? (
            <div className="text-xs text-slate-500 italic">
              No close cross-cuisine relatives — this sauce stands on its own.
            </div>
          ) : (
            <div className="space-y-2">
              {bridges.map((b) => {
                const target = forest.nodes.get(b.toId);
                if (!target) return null;
                return (
                  <button
                    key={b.toId}
                    onClick={() => onSelect(b.toId)}
                    className="w-full text-left bg-gradient-to-br from-violet-50 via-white to-amber-50 hover:from-violet-100 border border-violet-200/50 rounded-lg p-2.5 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-800">
                          {target.name}
                        </span>
                        <CuisineChip cuisine={target.cuisine} />
                        <OriginBadge origin={target.origin} />
                      </div>
                      <div className="text-[10px] text-violet-700 font-bold tabular-nums">
                        {(b.similarity * 100).toFixed(0)}% overlap
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                      <div>
                        <div className="text-emerald-700 font-medium mb-0.5">
                          Shared ({b.shared.length})
                        </div>
                        <div className="flex flex-wrap gap-0.5">
                          {b.shared.slice(0, 6).map((t) => (
                            <span
                              key={t}
                              className="bg-emerald-100 text-emerald-800 px-1 py-0.5 rounded"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-700 font-medium mb-0.5">
                          {node.name} only
                        </div>
                        <div className="flex flex-wrap gap-0.5">
                          {b.fromUnique.slice(0, 5).map((t) => (
                            <span
                              key={t}
                              className="bg-slate-100 text-slate-700 px-1 py-0.5 rounded"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="text-violet-700 font-medium mb-0.5">
                          {target.name} only
                        </div>
                        <div className="flex flex-wrap gap-0.5">
                          {b.toUnique.slice(0, 5).map((t) => (
                            <span
                              key={t}
                              className="bg-violet-100 text-violet-800 px-1 py-0.5 rounded"
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

        {/* Notes */}
        {(node.preparationNotes || node.technicalTips) && (
          <div className="bg-slate-50 rounded p-2 border border-slate-100 space-y-1">
            {node.preparationNotes && (
              <p className="text-[11px] text-slate-600">📝 {node.preparationNotes}</p>
            )}
            {node.technicalTips && (
              <p className="text-[11px] text-amber-700">💡 {node.technicalTips}</p>
            )}
          </div>
        )}

        {/* Influences */}
        {node.astrologicalInfluences.length > 0 && (
          <div>
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1">
              Astrological influences
            </div>
            <div className="flex flex-wrap gap-1">
              {node.astrologicalInfluences.map((a) => (
                <span
                  key={a}
                  className="text-[10px] bg-purple-50 text-purple-700 border border-purple-200/40 px-1.5 py-0.5 rounded capitalize"
                >
                  {a}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Main component
// ============================================================================

export default function SauceLineageTree() {
  const [forestVersion] = useState(0); // Stable for now — forest is purely data-derived
  const forest = useMemo(getSauceForest, [forestVersion]);
  const [activeFamily, setActiveFamily] = useState<BaseFamily>(
    forest.families[0]?.family ?? "tomato",
  );
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [selectedId, setSelectedId] = useState<string | null>(null);
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
      // Auto-expand path to selection
      const lineage = getLineage(forest, id);
      setExpanded((prev) => {
        const next = new Set(prev);
        for (const n of lineage) next.add(n.id);
        return next;
      });
      // Switch family tab if needed
      const node = forest.nodes.get(id);
      if (node && node.baseFamily !== activeFamily) {
        setActiveFamily(node.baseFamily);
      }
    },
    [forest, activeFamily],
  );

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    return searchNodes(forest, searchQuery);
  }, [forest, searchQuery]);

  const activeFamilyTree = useMemo(
    () => forest.families.find((f) => f.family === activeFamily),
    [forest, activeFamily],
  );

  // When a search result is picked, the tree stays in sync via onSelect
  useEffect(() => {
    if (selectedId) {
      const node = forest.nodes.get(selectedId);
      if (node) setActiveFamily(node.baseFamily);
    }
  }, [selectedId, forest]);

  return (
    <div className="w-full bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-violet-50 via-rose-50 to-amber-50">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              Sauce Phylogeny — A Cross-Cuisine Lineage
            </h2>
            <p className="text-slate-600 mt-1 text-sm max-w-3xl">
              Every traditional sauce descends from a small set of structural
              parents. Trace the family tree, see what each sauce inherits or
              drops from its ancestor, and find the closest relatives in other
              cuisines — a structural map for informed, non-fusion-but-cross-tradition cooking.
            </p>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-500">
            <div>
              <span className="font-semibold text-slate-700">{forest.nodes.size}</span> sauces
            </div>
            <div>
              <span className="font-semibold text-slate-700">{forest.edges.length}</span> edges
            </div>
            <div>
              <span className="font-semibold text-slate-700">
                {Array.from(forest.fusionByNode.values()).reduce((s, b) => s + b.length, 0) / 2 | 0}
              </span>{" "}
              bridges
            </div>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Family tabs */}
        <div className="flex flex-wrap gap-1.5">
          {forest.families.map((f) => (
            <button
              key={f.family}
              onClick={() => setActiveFamily(f.family)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5 ${
                activeFamily === f.family
                  ? "bg-slate-800 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
              title={f.description}
            >
              <span>{FAMILY_ICONS[f.family]}</span>
              <span>{f.label}</span>
              <span className="text-[10px] opacity-70">{f.size}</span>
            </button>
          ))}
        </div>

        {activeFamilyTree && (
          <div className="rounded bg-slate-50 border border-slate-100 p-2.5">
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
              {activeFamilyTree.label} family
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              {FAMILY_DESCRIPTIONS[activeFamilyTree.family]}
            </p>
            <div className="text-[10px] text-slate-500 mt-1">
              {activeFamilyTree.cuisines.length} cuisines:{" "}
              {activeFamilyTree.cuisines.join(", ")}
            </div>
          </div>
        )}

        {/* Search */}
        <input
          type="text"
          placeholder="Search by sauce, cuisine, ingredient (e.g. soy, lemon, mole)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Tree pane */}
          <div className="border border-slate-200 rounded-lg bg-white overflow-hidden flex flex-col max-h-[680px]">
            <div className="bg-slate-50 border-b border-slate-200 px-3 py-1.5 text-[10px] uppercase tracking-wider text-slate-500 font-semibold flex items-center justify-between">
              <span>{searchResults ? "Search results" : "Family forest"}</span>
              {searchResults && (
                <span className="text-slate-400 lowercase font-normal">
                  {searchResults.length} matches
                </span>
              )}
            </div>
            <div className="overflow-y-auto py-2 px-1 flex-1">
              {searchResults ? (
                searchResults.length === 0 ? (
                  <div className="px-4 py-6 text-sm text-slate-500 text-center">
                    No sauces match.
                  </div>
                ) : (
                  searchResults.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => onSelect(n.id)}
                      className={`w-full text-left flex items-center gap-2 px-3 py-1.5 rounded transition-colors ${
                        selectedId === n.id
                          ? "bg-amber-100/70 ring-1 ring-amber-400"
                          : "hover:bg-slate-50"
                      }`}
                    >
                      <span>{FAMILY_ICONS[n.baseFamily]}</span>
                      <OriginBadge origin={n.origin} />
                      <span className="text-sm text-slate-700">{n.name}</span>
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
                    forestVersion={forestVersion}
                  />
                ))
              ) : (
                <div className="px-4 py-6 text-sm text-slate-500 text-center">
                  No sauces in this family.
                </div>
              )}
            </div>
          </div>

          {/* Detail pane */}
          <div className="max-h-[680px] overflow-y-auto">
            <DetailPane
              selectedId={selectedId}
              onSelect={onSelect}
              forestVersion={forestVersion}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
