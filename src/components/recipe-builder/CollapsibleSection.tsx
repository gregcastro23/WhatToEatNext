"use client";

/**
 * A glass disclosure section for the recipe builder's preference groups. The
 * trigger is a real button with `aria-expanded`/`aria-controls`, and the
 * header shows how many selections inside are active.
 *
 * @file src/components/recipe-builder/CollapsibleSection.tsx
 */

import { ChevronDown } from "lucide-react";
import React, { useId, useState } from "react";
import { FOCUS_RING } from "./focusRing";

export type SectionTone = "purple" | "teal" | "amber";

const BADGE_TONE: Record<SectionTone, string> = {
  purple: "bg-purple-500/20 border-purple-500/30 text-purple-300",
  teal: "bg-teal-500/20 border-teal-500/30 text-teal-300",
  amber: "bg-amber-500/20 border-amber-500/30 text-amber-300",
};

interface CollapsibleSectionProps {
  title: string;
  icon?: React.ReactNode;
  tone: SectionTone;
  /** Active selections inside; a badge shows when above zero. */
  activeCount: number;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export default function CollapsibleSection({
  title,
  icon,
  tone,
  activeCount,
  defaultOpen = false,
  children,
}: CollapsibleSectionProps): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const panelId = useId();

  return (
    <div className="glass-card-premium rounded-2xl border border-white/10 hover:border-white/15 overflow-hidden transition-all duration-300">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className={`w-full flex items-center justify-between px-4 sm:px-5 py-3.5 bg-white/[0.02] hover:bg-white/[0.05] transition-colors text-left cursor-pointer ${FOCUS_RING} focus-visible:ring-inset`}
      >
        <div className="flex items-center gap-2.5">
          {icon}
          <span className="t-display text-base sm:text-lg font-medium text-white tracking-wide">
            {title}
          </span>
          {activeCount > 0 && (
            <span className={`t-mono text-[10px] px-2 py-0.5 rounded-full border ${BADGE_TONE[tone]}`}>
              {activeCount} active
            </span>
          )}
        </div>
        <ChevronDown
          className={`w-4 h-4 text-white/50 transition-transform duration-300 ${
            isOpen ? "rotate-180 text-purple-400" : ""
          }`}
          aria-hidden
        />
      </button>
      {isOpen && (
        <div
          id={panelId}
          className="p-4 sm:p-5 pt-3 space-y-5 border-t border-white/5 animate-in fade-in duration-200"
        >
          {children}
        </div>
      )}
    </div>
  );
}
