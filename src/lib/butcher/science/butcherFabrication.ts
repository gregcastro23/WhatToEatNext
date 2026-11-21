import { getCutById } from "@/data/butcher/cutsCatalogue";
import { orderYieldTelemetry } from "@/data/butcher/fabricationYields";
import type {
  ButcherOrderScore,
  ButcherOrderSubmission,
  ButcherOrderTicket,
  FabricationPick,
  FabricationStep,
  FabricationStepScore,
  OrderYieldTelemetry,
} from "@/lib/butcher/types";
import { knifeNormalAtAngle } from "./knifeGeometry";
import { evaluateGrainSlice } from "./meatPhysics";

/**
 * Master-tier fabrication orders: break one sub-primal into several retail
 * cuts. Each pull is scored on cut identity, knife angle against that cut's
 * grain, and portion mass; the order passes only when every pull is the
 * requested cut and the mean step score clears 75.
 *
 * @file src/lib/butcher/science/butcherFabrication.ts
 */

const STEP_WEIGHTS = { cut: 0.4, grain: 0.3, mass: 0.3 } as const;

function stepCutAccuracy(step: FabricationStep, pick: FabricationPick | undefined): number {
  if (!pick) return 0;
  if (pick.selectedCutId === step.expectedCutId) return 100;
  const expected = getCutById(step.expectedCutId);
  const selected = getCutById(pick.selectedCutId);
  if (!expected || expected.speciesId !== selected?.speciesId) return 0;
  return expected.primalId === selected.primalId ? 45 : 15;
}

export function scoreFabricationStep(step: FabricationStep, pick: FabricationPick | undefined): FabricationStepScore {
  const cutAccuracyScore = stepCutAccuracy(step, pick);
  const cut = pick ? getCutById(pick.selectedCutId) : null;
  if (!pick || !cut) {
    return {
      label: step.label, expectedCutId: step.expectedCutId, selectedCutId: pick?.selectedCutId ?? null,
      cutAccuracyScore, grainAngleScore: 0, portionPrecisionScore: 0, stepScore: 0,
    };
  }
  const grain = evaluateGrainSlice(cut, knifeNormalAtAngle(pick.sliceAngleDeg, cut.grainVector), pick.portionMassG, step.targetMassG);
  const stepScore = cutAccuracyScore * STEP_WEIGHTS.cut + grain.grainAngleScore * STEP_WEIGHTS.grain + grain.portionPrecisionScore * STEP_WEIGHTS.mass;
  return {
    label: step.label, expectedCutId: step.expectedCutId, selectedCutId: pick.selectedCutId,
    cutAccuracyScore, grainAngleScore: grain.grainAngleScore, portionPrecisionScore: grain.portionPrecisionScore,
    stepScore: Number(stepScore.toFixed(1)),
  };
}

function gradeForScore(score: number): ButcherOrderScore["grade"] {
  if (score >= 95) return "S";
  if (score >= 85) return "A";
  if (score >= 75) return "B";
  if (score >= 60) return "C";
  return "D";
}

function mean(values: readonly number[]): number {
  return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
}

function stepFeedback(step: FabricationStep, score: FabricationStepScore, pick: FabricationPick | undefined): string {
  if (!pick) return `${step.label}: not pulled yet.`;
  const name = getCutById(pick.selectedCutId)?.name ?? pick.selectedCutId;
  const verdict = score.cutAccuracyScore === 100 ? "correct cut" : `expected ${getCutById(step.expectedCutId)?.name ?? step.expectedCutId}`;
  return `${step.label}: ${name} (${verdict}) · ${pick.portionMassG} g vs ${step.targetMassG} g · grain ${score.grainAngleScore}%.`;
}

export function scoreFabricationOrder(ticket: ButcherOrderTicket, submission: ButcherOrderSubmission): ButcherOrderScore {
  const steps = ticket.fabricationSteps ?? [];
  const picks = submission.fabricationPicks ?? [];
  const stepScores = steps.map((step, i) => scoreFabricationStep(step, picks[i]));
  const totalScore = Number(Math.min(100, Math.max(0, mean(stepScores.map((s) => s.stepScore)))).toFixed(1));
  const allCorrect = stepScores.length > 0 && stepScores.every((s) => s.cutAccuracyScore === 100);
  const yields = picks
    .slice(0, steps.length)
    .map((pick) => orderYieldTelemetry(pick.selectedCutId, pick.portionMassG))
    .filter((y): y is OrderYieldTelemetry => y !== null);
  return {
    cutAccuracyScore: Number(mean(stepScores.map((s) => s.cutAccuracyScore)).toFixed(1)),
    grainAngleScore: Number(mean(stepScores.map((s) => s.grainAngleScore)).toFixed(1)),
    portionPrecisionScore: Number(mean(stepScores.map((s) => s.portionPrecisionScore)).toFixed(1)),
    thermalPairingScore: 0,
    totalScore,
    grade: gradeForScore(totalScore),
    passed: allCorrect && totalScore >= 75,
    feedback: steps.map((step, i) => stepFeedback(step, stepScores[i] ?? scoreFabricationStep(step, undefined), picks[i])),
    stepScores,
    yields,
  };
}
