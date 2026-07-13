"use client";

/**
 * "TABLE ENERGY" panel: collapsed = CompositeRadialBadge + ElementBars from
 * the stored snapshot; expanded = the existing CompositeEnergyVisualizer
 * (dark theme). The UI never computes — it renders
 * `tables.composite_snapshot` verbatim; the host's Recompute button hits
 * the recovery endpoint.
 */

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { CompositeEnergyVisualizer } from "@/components/commensal/CompositeEnergyVisualizer";
import {
  CompositeRadialBadge,
  ElementBars,
  GlassPanel,
  LabelXS,
} from "@/components/tables/ui";
import type { CompositeSnapshot } from "@/types/table";
import type { JSX } from "react";

export interface TableCompositePanelProps {
  tableId: string;
  snapshot: CompositeSnapshot | null | undefined;
  compositeUpdatedAt?: string | null;
  isHost: boolean;
  onChanged?: () => void;
  className?: string;
}

export function TableCompositePanel({
  tableId,
  snapshot,
  compositeUpdatedAt,
  isHost,
  onChanged,
  className = "",
}: TableCompositePanelProps): JSX.Element {
  const [expanded, setExpanded] = useState(false);
  const [recomputing, setRecomputing] = useState(false);

  const recompute = async () => {
    setRecomputing(true);
    try {
      const res = await fetch(`/api/tables/${tableId}/recompute`, {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) onChanged?.();
    } catch {
      /* failure-tolerant by design — the stale snapshot stays visible */
    } finally {
      setRecomputing(false);
    }
  };

  return (
    <GlassPanel className={`p-5 ${className}`}>
      <div className="flex items-center justify-between gap-3">
        <LabelXS className="text-alchm-fg-dim">Table Energy</LabelXS>
        {isHost && (
          <button
            type="button"
            onClick={() => void recompute()}
            disabled={recomputing}
            className="text-[10px] font-mono uppercase tracking-wide text-alchm-fg-mute hover:text-alchm-fg disabled:opacity-40"
          >
            {recomputing ? "Reading the cosmos…" : "Recompute"}
          </button>
        )}
      </div>

      {!snapshot ? (
        <p className="mt-3 text-sm text-alchm-fg-dim">
          Waiting for more guests to reveal the full elemental profile.
        </p>
      ) : (
        <>
          <div className="mt-4 flex items-center gap-5">
            <CompositeRadialBadge
              values={snapshot.compositeChart.elementalBalance}
              size={64}
            />
            <div className="min-w-0 flex-1">
              <ElementBars values={snapshot.compositeChart.elementalBalance} />
            </div>
          </div>

          {snapshot.truncated && (
            <p className="mt-3 text-[11px] text-alchm-fg-mute">
              A large table — the reading blends the first {snapshot.memberCount} charts.
            </p>
          )}

          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            aria-expanded={expanded}
            className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg border border-white/5 py-1.5 text-xs text-alchm-fg-dim transition-colors hover:text-alchm-fg"
          >
            {expanded ? "Show less" : "Full reading"}
            <ChevronDown
              size={14}
              className={`transition-transform ${expanded ? "rotate-180" : ""}`}
              aria-hidden
            />
          </button>

          {expanded && (
            <div className="mt-4">
              <CompositeEnergyVisualizer composite={snapshot.compositeChart} theme="dark" />
            </div>
          )}

          {compositeUpdatedAt && (
            <p className="mt-3 text-right text-[10px] font-mono text-alchm-fg-mute">
              read {new Date(compositeUpdatedAt).toLocaleString()}
            </p>
          )}
        </>
      )}
    </GlassPanel>
  );
}

export default TableCompositePanel;
