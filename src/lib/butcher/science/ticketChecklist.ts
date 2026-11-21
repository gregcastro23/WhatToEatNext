import { getCutById, getSpeciesSpec } from "@/data/butcher/cutsCatalogue";
import type { AnatomicalCut, ButcherOrderTicket, CookingStrategy } from "@/lib/butcher/types";
import { strategyLabel } from "./meatPhysics";

/**
 * A ticket's requirements as a checklist, evaluated live against the cut on
 * the block, so a cook sees what passes before submitting.
 *
 * The cut checks use the same comparisons as `satisfiesPhysicsConstraint` in
 * butcherGame.ts (a test holds them equal for every ticket and cut), so the
 * checklist can never promise a pass the scorer would refuse.
 *
 * @file src/lib/butcher/science/ticketChecklist.ts
 */

export interface TicketCheck {
  readonly id: "cut" | "species" | "min-collagen" | "max-collagen" | "min-fat" | "method";
  /** The requirement, e.g. "Collagen ≥ 2.2 g". */
  readonly label: string;
  /** What the current selection has, e.g. "0.85 g". */
  readonly actual: string;
  readonly met: boolean;
}

export function ticketCutChecks(ticket: ButcherOrderTicket, cut: AnatomicalCut): readonly TicketCheck[] {
  const c = ticket.physicsConstraint;
  if (!c) {
    const expected = getCutById(ticket.expectedCutId)?.name ?? ticket.expectedCutId;
    return [{ id: "cut", label: `Cut: ${expected}`, actual: cut.name, met: cut.id === ticket.expectedCutId }];
  }
  const { collagenG, fatG } = cut.proximate;
  const checks: TicketCheck[] = [];
  if (c.speciesId) {
    checks.push({ id: "species", label: `Species: ${getSpeciesSpec(c.speciesId).name}`, actual: getSpeciesSpec(cut.speciesId).name, met: cut.speciesId === c.speciesId });
  }
  if (c.minCollagenG !== undefined) {
    checks.push({ id: "min-collagen", label: `Collagen ≥ ${c.minCollagenG.toFixed(1)} g`, actual: `${collagenG.toFixed(2)} g`, met: collagenG >= c.minCollagenG });
  }
  if (c.maxCollagenG !== undefined) {
    checks.push({ id: "max-collagen", label: `Collagen ≤ ${c.maxCollagenG.toFixed(1)} g`, actual: `${collagenG.toFixed(2)} g`, met: collagenG <= c.maxCollagenG });
  }
  if (c.minFatG !== undefined) {
    checks.push({ id: "min-fat", label: `Fat ≥ ${c.minFatG.toFixed(1)} g`, actual: `${fatG.toFixed(1)} g`, met: fatG >= c.minFatG });
  }
  return checks;
}

/**
 * Master single-cut tickets score thermal pairing, which needs the selected
 * method to equal the ticket's `targetMethod` (butcherGame.ts).
 */
export function ticketMethodCheck(ticket: ButcherOrderTicket, method: CookingStrategy): TicketCheck {
  return { id: "method", label: `Method: ${strategyLabel(ticket.targetMethod)}`, actual: strategyLabel(method), met: method === ticket.targetMethod };
}
