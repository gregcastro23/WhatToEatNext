"use client";

import { getCutById } from "@/data/butcher/cutsCatalogue";
import type { ButcherOrderScore, ButcherOrderTier, OrderYieldTelemetry } from "@/lib/butcher/types";
import { ScoreMeter } from "./TicketChecklist";
import type { JSX } from "react";

/**
 * Butcher's Block scorecard: grade, component scores, per-pull fabrication
 * breakdown, and primal-to-retail yield economics (usable · trim fat · bone ·
 * other, and the as-purchased weight needed to net the portion).
 *
 * @file src/app/(alchm)/kitchen-lab/butcher/_lab/OrderScorecard.tsx
 */

function YieldRow({ y }: { readonly y: OrderYieldTelemetry }): JSX.Element {
  const name = getCutById(y.cutId)?.name ?? y.cutId;
  const isEstimate = y.basis === "MODEL ESTIMATE";
  return (
    <tr className="border-t border-white/10 align-top">
      <th scope="row" className="px-2 py-1.5 font-normal text-white/85">
        {name}
        <span className={`ml-1.5 rounded px-1 py-0.5 text-[10px] ${isEstimate ? "bg-amber-500/20 text-amber-200" : "bg-emerald-500/20 text-emerald-200"}`}>
          {isEstimate ? "estimate" : "USDA"}
        </span>
      </th>
      <td className="bt-num px-2 py-1.5 text-emerald-200">{y.usableYieldPct}%</td>
      <td className="bt-num px-2 py-1.5 text-white/75">{y.trimFatPct}%</td>
      <td className="bt-num px-2 py-1.5 text-white/75">{y.boneWastePct}%</td>
      <td className="bt-num px-2 py-1.5 text-white/75">{y.otherLossPct}%</td>
      <td className="bt-num px-2 py-1.5 text-amber-200">{y.asPurchasedG} g</td>
    </tr>
  );
}

function YieldTable({ yields }: { readonly yields: readonly OrderYieldTelemetry[] }): JSX.Element {
  return (
    <div className="mt-3 overflow-x-auto">
      <table className="w-full min-w-[420px] text-left text-xs" aria-label="Fabrication yield">
        <thead>
          <tr className="text-white/55">
            <th scope="col" className="px-2 py-1 font-medium">Yield</th>
            <th scope="col" className="px-2 py-1 font-medium">Usable</th>
            <th scope="col" className="px-2 py-1 font-medium">Trim fat</th>
            <th scope="col" className="px-2 py-1 font-medium">Bone</th>
            <th scope="col" className="px-2 py-1 font-medium">Other</th>
            <th scope="col" className="px-2 py-1 font-medium">Buy</th>
          </tr>
        </thead>
        <tbody>
          {yields.map((y) => <YieldRow key={y.cutId} y={y} />)}
        </tbody>
      </table>
      <ul className="mt-1.5 space-y-0.5 text-[10px] text-white/45">
        {yields.map((y) => (
          <li key={y.cutId}>{getCutById(y.cutId)?.name ?? y.cutId}: {y.fromSubprimal} — {y.source}</li>
        ))}
      </ul>
    </div>
  );
}

export function OrderScorecard({
  score,
  gameTier,
}: {
  readonly score: ButcherOrderScore;
  readonly gameTier: ButcherOrderTier;
}): JSX.Element {
  const isFabrication = score.stepScores.length > 0;
  return (
    <div className="bt-scorecard" data-passed={score.passed}>
      <div className="flex flex-wrap items-center justify-between gap-2" aria-hidden="true">
        <strong className="text-base text-white">
          Grade <span className="bt-num">{score.grade}</span> · <span className="bt-num">{score.totalScore}</span>/100
        </strong>
        <span className="bt-verdict">{score.passed ? "Fulfilled" : "Needs refinement"}</span>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <ScoreMeter label="Cut accuracy" pct={score.cutAccuracyScore} />
        <ScoreMeter label="Grain" pct={score.grainAngleScore} />
        <ScoreMeter label="Mass" pct={score.portionPrecisionScore} />
        {gameTier === "master" && !isFabrication ? <ScoreMeter label="Thermal pairing" pct={score.thermalPairingScore} /> : null}
      </div>
      <ul className="mt-2 space-y-1 text-xs text-white/75">
        {score.feedback.map((line) => (
          <li key={line}>• {line}</li>
        ))}
      </ul>
      {score.yields.length > 0 ? <YieldTable yields={score.yields} /> : null}
    </div>
  );
}
