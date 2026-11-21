"use client";

import { SPECIES_LIST, getCutsForSpecies } from "@/data/butcher/cutsCatalogue";
import { isFabricationTicket, knifeNormalAtAngle } from "@/lib/butcher/science/butcherGame";
import { evaluateGrainSlice, strategyLabel } from "@/lib/butcher/science/meatPhysics";
import type {
  AnatomicalCut,
  ButcherOrderTicket,
  ButcherOrderTier,
  ButcherProgressStats,
  CookingStrategy,
  GrainSliceEvaluation,
  SpeciesId,
} from "@/lib/butcher/types";
import { FabricationStepsCard, MasteryBadges, SliceCueChip } from "./BlockExtras";
import { LazyButcherStage } from "./LazyButcherStage";
import { OrderScorecard } from "./OrderScorecard";
import type { ButcherLabState } from "./useButcherLab";
import type { JSX } from "react";

/**
 * Tab 2 — `"Butcher's Block"` Interactive Order & Carve Game.
 *
 * @file src/app/(alchm)/kitchen-lab/butcher/_lab/ButchersBlockPanel.tsx
 */

const TIERS: ReadonlyArray<{ readonly id: ButcherOrderTier; readonly label: string }> = [
  { id: "apprentice", label: "Apprentice (Identify)" },
  { id: "journeyman", label: "Journeyman (Grain & Trim)" },
  { id: "master", label: "Master Butcher (Physics)" },
];

const STRATEGIES: readonly CookingStrategy[] = [
  "high-heat-sear",
  "reverse-sear",
  "low-and-slow-smoke",
  "collagen-braise",
  "sous-vide",
  "poach-confit",
];

/** The mass target of the pull in progress (fabrication tickets) or of the ticket itself. */
function currentTargetMassG(ticket: ButcherOrderTicket, pulled: number): number {
  return ticket.fabricationSteps?.[pulled]?.targetMassG ?? ticket.targetMassG;
}

function ActiveTicketCard({ ticket }: { readonly ticket: ButcherOrderTicket }): JSX.Element {
  return (
    <div className="rounded-lg border border-amber-400/30 bg-amber-500/10 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="bt-label text-amber-200">Active Order Ticket · {ticket.tier.toUpperCase()}</span>
        <span className="bt-num text-xs text-amber-100">
          Target Portion: {ticket.targetMassG} g · Grain Plane: {ticket.targetAngleDeg}°
        </span>
      </div>
      <h2 className="mt-1 text-lg text-white">{ticket.title}</h2>
      <p className="text-sm text-white/80">{ticket.prompt}</p>
    </div>
  );
}

interface BlockTicketHeaderProps {
  readonly gameTier: ButcherOrderTier;
  readonly progress: ButcherProgressStats;
  readonly ticket: ButcherOrderTicket;
  readonly speciesId: SpeciesId;
  readonly onSetTier: (tier: ButcherOrderTier) => void;
  readonly onSelectSpecies: (speciesId: SpeciesId) => void;
}

function BlockTicketHeader(p: BlockTicketHeaderProps): JSX.Element {
  return (
    <div className="bt-card space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Game difficulty tier">
          {TIERS.map((tier) => (
            <button key={tier.id} type="button" className="bt-btn" aria-pressed={p.gameTier === tier.id} onClick={() => p.onSetTier(tier.id)}>
              {tier.label}
            </button>
          ))}
        </div>
        <div className="bt-num flex items-center gap-3 text-xs text-white/75">
          <span>Completed: {p.progress.completedOrders}</span>
          <span>Streak: {p.progress.currentStreak}</span>
          <span>Best: {p.progress.bestScore}%</span>
        </div>
      </div>
      <MasteryBadges progress={p.progress} />
      <ActiveTicketCard ticket={p.ticket} />
      <div className="flex flex-wrap items-center gap-2">
        <span className="bt-label">Carcass Species:</span>
        {SPECIES_LIST.map((sp) => (
          <button key={sp.id} type="button" className="bt-btn" aria-pressed={p.speciesId === sp.id} onClick={() => p.onSelectSpecies(sp.id)}>
            {sp.name}
          </button>
        ))}
      </div>
    </div>
  );
}

function MasterThermalControls({
  gameMethod,
  gameCoreTempC,
  onMethodChange,
  onTempChange,
}: {
  readonly gameMethod: CookingStrategy;
  readonly gameCoreTempC: number;
  readonly onMethodChange: (method: CookingStrategy) => void;
  readonly onTempChange: (tempC: number) => void;
}): JSX.Element {
  return (
    <div className="space-y-2">
      <div>
        <label htmlFor="bt-game-method" className="bt-label block">Cooking Strategy</label>
        <select
          id="bt-game-method"
          className="bt-input mt-1 w-full"
          value={gameMethod}
          onChange={(e) => {
            const matched = STRATEGIES.find((s) => s === e.target.value);
            if (matched) onMethodChange(matched);
          }}
        >
          {STRATEGIES.map((st) => (
            <option key={st} value={st}>{strategyLabel(st)}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="bt-game-temp" className="bt-label block">Target Core Temp ({gameCoreTempC} °C)</label>
        <input id="bt-game-temp" type="range" min={45} max={96} step={1} value={gameCoreTempC} onChange={(e) => onTempChange(Number(e.target.value))} className="bt-range mt-1" />
      </div>
    </div>
  );
}

function BlockCarveControls({
  lab,
  cuts,
  ticket,
  liveSliceEval,
  onSelectCut,
}: {
  readonly lab: ButcherLabState;
  readonly cuts: readonly AnatomicalCut[];
  readonly ticket: ButcherOrderTicket;
  readonly liveSliceEval: GrainSliceEvaluation;
  readonly onSelectCut: (speciesId: SpeciesId, cutId: string) => void;
}): JSX.Element {
  const targetMassG = currentTargetMassG(ticket, lab.fabricationPicks.length);
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <label htmlFor="bt-game-cut-select" className="bt-label block">Selected Cut on Block</label>
        <select id="bt-game-cut-select" className="bt-input mt-1 w-full" value={lab.cut.id} onChange={(e) => onSelectCut(lab.speciesId, e.target.value)}>
          {cuts.map((c) => (
            <option key={c.id} value={c.id}>{c.primalName} — {c.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="bt-game-mass-range" className="bt-label block">
          Portion Trim Mass ({lab.portionMassG} g vs {targetMassG} g)
        </label>
        <input id="bt-game-mass-range" type="range" min={60} max={1500} step={5} value={lab.portionMassG} onChange={(e) => lab.setPortionMassG(Number(e.target.value))} className="bt-range mt-2" />
      </div>
      <div>
        <label htmlFor="bt-game-angle-range" className="bt-label block">
          Knife Plane vs Muscle Grain ({lab.sliceAngleDeg}°) — {liveSliceEval.verdict}
        </label>
        <input id="bt-game-angle-range" type="range" min={0} max={90} step={1} value={lab.sliceAngleDeg} onChange={(e) => lab.setSliceAngleDeg(Number(e.target.value))} className="bt-range mt-2" />
        <p className="bt-num mt-1 flex flex-wrap items-center gap-2 text-xs text-white/60">
          <SliceCueChip angleDeg={lab.sliceAngleDeg} />
          Effective Fiber: {liveSliceEval.effectiveFiberLengthMm} mm · Shear: {liveSliceEval.shearForceMultiplier}×
        </p>
      </div>
      {lab.gameTier === "master" && !isFabricationTicket(ticket) ? (
        <MasterThermalControls gameMethod={lab.gameMethod} gameCoreTempC={lab.gameCoreTempC} onMethodChange={lab.setGameMethod} onTempChange={lab.setGameCoreTempC} />
      ) : null}
    </div>
  );
}

function BlockOrderActions({ lab }: { readonly lab: ButcherLabState }): JSX.Element {
  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" className="bt-btn is-primary" onClick={() => lab.submitGameOrder()}>
          Execute Cut &amp; Fulfill Order
        </button>
        <button type="button" className="bt-btn" onClick={() => lab.nextGameOrder()}>
          Next Order Ticket →
        </button>
      </div>
      <div role="status" aria-live="polite" aria-atomic="true">
        {lab.lastScore ? <OrderScorecard score={lab.lastScore} gameTier={lab.gameTier} /> : null}
      </div>
    </>
  );
}

export function ButchersBlockPanel({
  lab,
  onSelectSpecies,
  onSelectCut,
}: {
  readonly lab: ButcherLabState;
  readonly onSelectSpecies: (speciesId: SpeciesId) => void;
  readonly onSelectCut: (speciesId: SpeciesId, cutId: string) => void;
}): JSX.Element {
  const ticket = lab.activeTicket;
  const cuts = getCutsForSpecies(lab.speciesId);
  const knifeNormal = knifeNormalAtAngle(lab.sliceAngleDeg, lab.cut.grainVector);
  const liveSliceEval = evaluateGrainSlice(lab.cut, knifeNormal, lab.portionMassG, currentTargetMassG(ticket, lab.fabricationPicks.length));

  return (
    <div className="space-y-4">
      <BlockTicketHeader gameTier={lab.gameTier} progress={lab.progress} ticket={ticket} speciesId={lab.speciesId} onSetTier={lab.setGameTier} onSelectSpecies={onSelectSpecies} />
      <LazyButcherStage
        speciesId={lab.speciesId}
        selectedCutId={lab.cut.id}
        hoveredCutId={lab.hoveredCutId}
        targetCutId={lab.gameTier === "apprentice" ? ticket.expectedCutId : null}
        explodeFactor={0.35}
        colorMode={lab.gameTier === "master" ? "collagen" : "anatomical"}
        framing="butcher-block-slice"
        showSlicePlane
        showBoneLandmarks={false}
        sliceAngleDeg={lab.sliceAngleDeg}
        onSelectCut={(nextCutId) => onSelectCut(lab.speciesId, nextCutId)}
        onHoverCut={lab.setHoveredCutId}
        onSliceAngleChange={lab.setSliceAngleDeg}
      />
      <div className="bt-card space-y-4">
        <BlockCarveControls lab={lab} cuts={cuts} ticket={ticket} liveSliceEval={liveSliceEval} onSelectCut={onSelectCut} />
        {isFabricationTicket(ticket) ? (
          <FabricationStepsCard ticket={ticket} picks={lab.fabricationPicks} currentCutName={lab.cut.name} onPull={lab.pullFabricationStep} onUndo={lab.undoFabricationStep} />
        ) : null}
        <BlockOrderActions lab={lab} />
      </div>
    </div>
  );
}
