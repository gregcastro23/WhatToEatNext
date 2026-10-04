/**
 * Live In-Memory Telemetry for the Cosmic Recipe Verification Pipeline.
 *
 * Tracks per-request attempts, local deterministic repairs, retries,
 * gate findings by code/class, and refunds. Provides real-time metrics
 * to the Admin Agents Pane (/admin/agents) and system status monitoring.
 *
 * @file src/lib/cooking/recipePipelineTelemetry.ts
 */

export interface RecipePipelineEvent {
  timestamp: number;
  attempts: number;
  repaired: boolean;
  retried: boolean;
  refunded: boolean;
  finalFailure: boolean;
  gateFindings: string[];
}

export interface RecipePipelineStats {
  attempts: number;
  repairs: number;
  retries: number;
  refunds: number;
  finalFailures: number;
  findingsByClass: Record<string, number>;
  live: boolean;
}

// In-memory ring buffer (last 1,000 events)
const MAX_EVENTS = 1_000;
const events: RecipePipelineEvent[] = [];

/**
 * Record a recipe pipeline completion or failure event.
 */
export function recordRecipePipelineEvent(event: Omit<RecipePipelineEvent, "timestamp">): void {
  events.push({
    ...event,
    timestamp: Date.now(),
  });
  if (events.length > MAX_EVENTS) {
    events.shift();
  }
}

/**
 * Get aggregated recipe pipeline metrics over the trailing 24 hours.
 */
export function getRecipePipelineTelemetryStats(): RecipePipelineStats {
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  const recent = events.filter((e) => e.timestamp >= cutoff);

  let attempts = 0;
  let repairs = 0;
  let retries = 0;
  let refunds = 0;
  let finalFailures = 0;
  const findingsByClass: Record<string, number> = {};

  for (const ev of recent) {
    attempts += ev.attempts;
    if (ev.repaired) repairs++;
    if (ev.retried) retries++;
    if (ev.refunded) refunds++;
    if (ev.finalFailure) finalFailures++;
    for (const code of ev.gateFindings) {
      findingsByClass[code] = (findingsByClass[code] ?? 0) + 1;
    }
  }

  return {
    attempts,
    repairs,
    retries,
    refunds,
    finalFailures,
    findingsByClass,
    live: true,
  };
}

/**
 * Reset telemetry state (used in unit/integration tests).
 */
export function resetRecipePipelineTelemetry(): void {
  events.length = 0;
}
