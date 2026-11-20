import { getCutById } from "@/data/butcher/cutsCatalogue";
import type {
  AnatomicalCut,
  ButcherOrderScore,
  ButcherOrderSubmission,
  ButcherOrderTicket,
  ButcherOrderTier,
  Vec3Tuple,
} from "@/lib/butcher/types";
import { ORDER_TICKETS } from "./butcherTickets";
import { evaluateGrainSlice, strategyLabel } from "./meatPhysics";

export {
  BUTCHER_PROGRESS_STORAGE_KEY,
  defaultButcherProgress,
  readButcherProgress,
  recordButcherResult,
} from "./butcherProgress";
export { ORDER_TICKETS } from "./butcherTickets";

/**
 * "The Butcher's Block" interactive order & carve game engine.
 *
 * @file src/lib/butcher/science/butcherGame.ts
 */

export function getTicketsForTier(tier: ButcherOrderTier): readonly ButcherOrderTicket[] {
  return ORDER_TICKETS.filter((t) => t.tier === tier);
}

export function getTicketForTier(
  tier: ButcherOrderTier,
  index: number,
): ButcherOrderTicket {
  const pool = getTicketsForTier(tier);
  const safeIdx = ((index % pool.length) + pool.length) % pool.length;
  const ticket = pool[safeIdx] ?? ORDER_TICKETS[0];
  if (!ticket) {
    throw new Error("ORDER_TICKETS cannot be empty");
  }
  return ticket;
}

/**
 * Constructs a unit knife normal vector at the requested slice angle $\theta \in [0^\circ, 90^\circ]$
 * relative to a cut's grain unit vector $\hat{g}$, so $\arcsin(|\hat{n} \cdot \hat{g}|) = \theta$.
 */
export function knifeNormalAtAngle(
  angleDeg: number,
  grainVector: Vec3Tuple,
): Vec3Tuple {
  const len = Math.hypot(grainVector[0], grainVector[1], grainVector[2]);
  const gx = len > 1e-8 ? grainVector[0] / len : 1;
  const gy = len > 1e-8 ? grainVector[1] / len : 0;
  const gz = len > 1e-8 ? grainVector[2] / len : 0;

  // Pick a reference vector not collinear with g to form orthogonal basis u
  const ref: Vec3Tuple = Math.abs(gx) < 0.85 ? [1, 0, 0] : [0, 1, 0];
  // Cross product g x ref -> perp1
  let px = gy * ref[2] - gz * ref[1];
  let py = gz * ref[0] - gx * ref[2];
  let pz = gx * ref[1] - gy * ref[0];
  const pLen = Math.hypot(px, py, pz) || 1;
  px /= pLen;
  py /= pLen;
  pz /= pLen;

  const rad = (Math.min(90, Math.max(0, angleDeg)) * Math.PI) / 180;
  const sinT = Math.sin(rad);
  const cosT = Math.cos(rad);
  return [
    gx * sinT + px * cosT,
    gy * sinT + py * cosT,
    gz * sinT + pz * cosT,
  ];
}

function satisfiesPhysicsConstraint(
  cut: AnatomicalCut,
  ticket: ButcherOrderTicket,
): { matches: boolean; reason: string | null } {
  const c = ticket.physicsConstraint;
  if (!c) {
    return {
      matches: cut.id === ticket.expectedCutId,
      reason: cut.id === ticket.expectedCutId ? null : `Ticket requested ${getCutById(ticket.expectedCutId)?.name ?? ticket.expectedCutId}.`,
    };
  }
  if (c.speciesId && cut.speciesId !== c.speciesId) {
    return { matches: false, reason: `Requires ${c.speciesId} species.` };
  }
  if (c.minCollagenG !== undefined && cut.proximate.collagenG < c.minCollagenG) {
    return {
      matches: false,
      reason: `${cut.name} has ${cut.proximate.collagenG.toFixed(2)} g collagen/100g (needs ≥${c.minCollagenG.toFixed(1)} g).`,
    };
  }
  if (c.maxCollagenG !== undefined && cut.proximate.collagenG > c.maxCollagenG) {
    return {
      matches: false,
      reason: `${cut.name} has ${cut.proximate.collagenG.toFixed(2)} g collagen/100g (needs ≤${c.maxCollagenG.toFixed(1)} g).`,
    };
  }
  if (c.minFatG !== undefined && cut.proximate.fatG < c.minFatG) {
    return {
      matches: false,
      reason: `${cut.name} has ${cut.proximate.fatG.toFixed(1)} g fat/100g (needs ≥${c.minFatG.toFixed(1)} g).`,
    };
  }
  return { matches: true, reason: null };
}

function gradeForScore(score: number): "S" | "A" | "B" | "C" | "D" {
  if (score >= 95) return "S";
  if (score >= 85) return "A";
  if (score >= 75) return "B";
  if (score >= 60) return "C";
  return "D";
}

function evaluateCutAccuracy(
  selectedCut: AnatomicalCut,
  ticket: ButcherOrderTicket,
  matches: boolean,
): number {
  if (matches) return 100;
  if (selectedCut.speciesId !== ticket.speciesId) return 0;
  const expectedCut = getCutById(ticket.expectedCutId);
  return expectedCut?.primalId === selectedCut.primalId ? 45 : 15;
}

function computeWeightedOrderScore(
  tier: ButcherOrderTier,
  cutAccuracyScore: number,
  grainAngleScore: number,
  portionPrecisionScore: number,
  thermalPairingScore: number,
): number {
  if (tier === "apprentice") {
    return cutAccuracyScore * 0.6 + portionPrecisionScore * 0.3 + grainAngleScore * 0.1;
  }
  if (tier === "journeyman") {
    return cutAccuracyScore * 0.35 + grainAngleScore * 0.4 + portionPrecisionScore * 0.25;
  }
  return (
    cutAccuracyScore * 0.3 +
    grainAngleScore * 0.25 +
    portionPrecisionScore * 0.15 +
    thermalPairingScore * 0.3
  );
}

function buildOrderFeedback(
  selectedCut: AnatomicalCut,
  ticket: ButcherOrderTicket,
  submission: ButcherOrderSubmission,
  constraintCheck: { matches: boolean; reason: string | null },
  coachingNote: string,
  portionPrecisionScore: number,
): string[] {
  const feedback: string[] = [];
  if (constraintCheck.matches) {
    feedback.push(`Cut selection verified: ${selectedCut.name} (${selectedCut.primalName}).`);
  } else if (constraintCheck.reason) {
    feedback.push(constraintCheck.reason);
  }
  feedback.push(coachingNote);
  feedback.push(
    `Portion mass: ${submission.portionMassG} g vs ${ticket.targetMassG} g target (${portionPrecisionScore}% precision).`,
  );
  if (ticket.tier === "master") {
    feedback.push(
      `Thermal pairing: ${strategyLabel(submission.selectedMethod)} to ${submission.selectedCoreTempC} °C (target ${strategyLabel(ticket.targetMethod)} @ ${ticket.targetCoreTempC} °C).`,
    );
  }
  return feedback;
}

function emptyOrderScore(): ButcherOrderScore {
  return {
    cutAccuracyScore: 0,
    grainAngleScore: 0,
    portionPrecisionScore: 0,
    thermalPairingScore: 0,
    totalScore: 0,
    grade: "D",
    passed: false,
    feedback: ["No valid cut selected."],
  };
}

function computeThermalPairingScore(
  selectedCut: AnatomicalCut,
  ticket: ButcherOrderTicket,
  submission: ButcherOrderSubmission,
): number {
  const methodMatches =
    selectedCut.optimalMethods.includes(submission.selectedMethod) ||
    submission.selectedMethod === ticket.targetMethod;
  const tempDiff = Math.abs(submission.selectedCoreTempC - ticket.targetCoreTempC);
  return Number(((methodMatches ? 60 : 15) + Math.max(0, 40 - tempDiff * 3.5)).toFixed(1));
}

export function scoreOrderFulfillment(
  ticket: ButcherOrderTicket,
  submission: ButcherOrderSubmission,
): ButcherOrderScore {
  const selectedCut = getCutById(submission.selectedCutId);
  if (!selectedCut) return emptyOrderScore();

  const constraintCheck = satisfiesPhysicsConstraint(selectedCut, ticket);
  const cutAccuracyScore = evaluateCutAccuracy(selectedCut, ticket, constraintCheck.matches);
  const knifeNormal = knifeNormalAtAngle(submission.sliceAngleDeg, selectedCut.grainVector);
  const grainEval = evaluateGrainSlice(
    selectedCut,
    knifeNormal,
    submission.portionMassG,
    ticket.targetMassG,
  );
  const thermalPairingScore = computeThermalPairingScore(selectedCut, ticket, submission);
  const weighted = computeWeightedOrderScore(
    ticket.tier,
    cutAccuracyScore,
    grainEval.grainAngleScore,
    grainEval.portionPrecisionScore,
    thermalPairingScore,
  );
  const totalScore = Number(Math.min(100, Math.max(0, weighted)).toFixed(1));

  return {
    cutAccuracyScore,
    grainAngleScore: grainEval.grainAngleScore,
    portionPrecisionScore: grainEval.portionPrecisionScore,
    thermalPairingScore,
    totalScore,
    grade: gradeForScore(totalScore),
    passed: totalScore >= 75 && cutAccuracyScore >= 75,
    feedback: buildOrderFeedback(
      selectedCut,
      ticket,
      submission,
      constraintCheck,
      grainEval.coachingNote,
      grainEval.portionPrecisionScore,
    ),
  };
}
