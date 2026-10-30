"use client";

/**
 * The crucible's live elemental quad-spectrum: a legend and a stacked bar.
 * Each segment is an ARIA meter (0–100, `aria-valuenow` = its share), so a
 * screen reader hears every element's share, including a zero.
 *
 * @file src/components/recipe-builder/crucible/ElementalBalanceGauge.tsx
 */

import React from "react";
import type { ClassicalElement } from "@/utils/astrology/signElement";
import { CRUCIBLE_ELEMENTS, type ElementalBalance } from "./elementalBalance";

const ELEMENT_STYLE: Record<ClassicalElement, { icon: string; text: string; bar: string }> = {
  Fire: { icon: "🔥", text: "text-orange-400", bar: "bg-orange-500" },
  Water: { icon: "💧", text: "text-sky-400", bar: "bg-sky-400" },
  Earth: { icon: "🌍", text: "text-emerald-400", bar: "bg-emerald-400" },
  Air: { icon: "💨", text: "text-indigo-400", bar: "bg-indigo-400" },
};

export function describeBalance(balance: ElementalBalance): string {
  const parts = CRUCIBLE_ELEMENTS.map((el) => `${el} ${balance.shares[el]}%`).join(", ");
  const noun = balance.indexedCount === 1 ? "ingredient" : "ingredients";
  return `Crucible elemental balance across ${balance.indexedCount} indexed ${noun}: ${parts}`;
}

export default function ElementalBalanceGauge({
  balance,
}: {
  balance: ElementalBalance;
}): React.JSX.Element {
  return (
    <div
      role="group"
      aria-label={describeBalance(balance)}
      className="mt-4 p-3.5 rounded-xl bg-white/[0.03] border border-white/5"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5 text-xs" aria-hidden>
        <span className="t-label text-[10px] text-white/60">
          Crucible Elemental Balance ({balance.indexedCount} indexed ingredients)
        </span>
        <div className="flex items-center gap-2 t-mono text-[11px]">
          {CRUCIBLE_ELEMENTS.map((el) => (
            <span key={el} className={ELEMENT_STYLE[el].text}>
              {ELEMENT_STYLE[el].icon} {balance.shares[el]}%
            </span>
          ))}
        </div>
      </div>
      <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden flex">
        {CRUCIBLE_ELEMENTS.map((el) => (
          <div
            key={el}
            role="meter"
            aria-label={el}
            aria-valuenow={balance.shares[el]}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuetext={`${balance.shares[el]}%`}
            title={`${el}: ${balance.shares[el]}%`}
            className={`h-full transition-all ${ELEMENT_STYLE[el].bar}`}
            style={{ width: `${balance.shares[el]}%` }}
          />
        ))}
      </div>
    </div>
  );
}
