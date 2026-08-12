/**
 * The one predicate that decides whether an agent row is classifiable.
 *
 * ── Why this file exists ────────────────────────────────────────────────────
 *
 * `scripts/checkAgentMonicaDrift.ts` fails the build when an agent's name does
 * not parse as a placement AND its chart is unusable — the `notAPlacementNoChart`
 * bucket, budget 0. That gate went red on 2026-08-09 for a single row (`Chiron`,
 * name unparseable, `natal_positions = []`) and stayed red for two days.
 *
 * Deleting the row cleared the gate but left the class bug: `ensureAgent` could
 * still construct exactly that row. This predicate is what makes it
 * unconstructible, and it is deliberately expressed as a call to the SAME two
 * functions the gate uses rather than a re-implementation of their rules —
 * a second copy would drift, and the first symptom of the drift would be the
 * writer accepting a row the gate rejects.
 *
 * ⚠️ Do NOT substitute `agentMonicaWithMethod` for `parseAgentPlacement` here.
 * They are different predicates: `agentMonicaWithMethod` catches
 * `UnknownMoonPhaseError` and returns null for a name that IS a well-formed
 * placement whose phase cannot be classified. The gate counts such a name as a
 * placement, so guarding on the resolver would refuse rows the gate accepts.
 */

import { parseAgentPlacement } from "@/utils/agentMonicaResolver";
import { fullChartMonica } from "@/utils/fullChartMonica";

/**
 * True when the row satisfies the drift gate: its name parses as a placement,
 * OR it carries a chart usable enough to yield a finite full-chart monica.
 *
 * `rawNatalPositions` is the raw JSONB as pg returns it — the same `unknown`
 * the gate passes to `fullChartMonica`.
 */
export function agentIsClassifiable(
  name: string | null | undefined,
  rawNatalPositions: unknown,
): boolean {
  if (name && parseAgentPlacement(name) !== null) return true;
  return fullChartMonica(rawNatalPositions) !== null;
}

/**
 * Thrown when provisioning would create an agent the drift gate rejects.
 *
 * Typed so callers can tell a POLICY refusal from an infrastructure failure.
 * That distinction is load-bearing: `/api/feed` returned 500 for any
 * `ensureAgent` throw, and a stream of 500s on a chart-less agent would read as
 * an outage and trip the sustained-incident alerting added in #746 — announcing
 * a platform problem when the actual answer is "this agent needs a chart".
 */
export class AgentChartRequiredError extends Error {
  readonly agentEmail: string;
  readonly agentName: string;

  constructor(agentEmail: string, agentName: string) {
    super(
      `Refusing to provision "${agentName}" (${agentEmail}): its name does not ` +
        `parse as a placement and it carries no usable natal chart. Such a row ` +
        `fails checkAgentMonicaDrift (notAPlacementNoChart, budget 0). Give the ` +
        `agent a placement-shaped name, or write a real computed chart first — ` +
        `do not fabricate one.`,
    );
    this.name = "AgentChartRequiredError";
    this.agentEmail = agentEmail;
    this.agentName = agentName;
  }
}
