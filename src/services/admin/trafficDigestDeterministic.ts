/**
 * Deterministic rule-based narrative builder for /admin Daily Traffic & Friction
 * Digest. Used directly for quiet/offline telemetry windows and as the automatic
 * fallback when OpenAI synthesis is unconfigured or unavailable.
 *
 * @file src/services/admin/trafficDigestDeterministic.ts
 */

import type {
  DigestAction,
  DigestFinding,
  DigestNarrative,
  DigestSeverity,
  TrafficDigestFacts,
} from "@/services/admin/trafficDigestTypes";

function stripControlChars(input: string): string {
  let out = "";
  for (let i = 0; i < input.length; i += 1) {
    const code = input.charCodeAt(i);
    out += code >= 32 && code !== 127 ? (input[i] ?? "") : " ";
  }
  return out;
}

/** Normalize untrusted user feedback strings before rendering or prompting. */
export function sanitizeUntrustedFeedbackNote(raw: string): string {
  return stripControlChars(raw).replace(/\s+/g, " ").trim().slice(0, 240);
}

function formatPct(fraction: number): string {
  return `${Math.round(fraction * 100)}%`;
}

function computeSeverity(facts: TrafficDigestFacts): DigestSeverity {
  const { frictionSummary, liveSources, openLowRatingCount, openFeedbackCount } = facts;
  if (
    frictionSummary.errorBurstTriggered ||
    frictionSummary.rageClicks >= 3 ||
    frictionSummary.deadClicks >= 5 ||
    openLowRatingCount > 0 ||
    (facts.frustrationRatePct !== null && facts.frustrationRatePct >= 0.25)
  ) {
    return "action_needed";
  }
  if (
    liveSources < facts.totalSources ||
    frictionSummary.rageClicks > 0 ||
    frictionSummary.deadClicks > 0 ||
    frictionSummary.errorSessions60m > 0 ||
    openFeedbackCount > 0 ||
    frictionSummary.topZeroResultQuery !== null
  ) {
    return "watch";
  }
  return "healthy";
}

function buildTrafficFinding(facts: TrafficDigestFacts): DigestFinding | null {
  if (facts.liveSources === 0) return null;
  const [top] = facts.topRoutes;
  const deltaText =
    facts.pageviewsDeltaPct !== null
      ? `${facts.pageviewsDeltaPct >= 0 ? "+" : ""}${facts.pageviewsDeltaPct}% vs prior ${facts.range}`
      : `across ${facts.totals.sessions} session(s)`;
  const routeText = top
    ? `Top route ${top.path} (${top.views} views, ${formatPct(top.bounceRatePct)} bounce).`
    : "No route transitions recorded in window.";
  return {
    category: "traffic",
    title: `${facts.totals.pageviews} human pageviews (${deltaText})`,
    detail: routeText,
    severity: "info",
    actionHref: "/admin/traffic",
  };
}

function buildFrictionFinding(facts: TrafficDigestFacts): DigestFinding | null {
  const { rageClicks, deadClicks, quickBacks, slowCwvHits, errorSessions60m, errorBurstTriggered, topErrorTag } =
    facts.frictionSummary;
  const [topSignal] = facts.frictionSignals;
  if (rageClicks + deadClicks + quickBacks + slowCwvHits === 0 && errorSessions60m === 0) {
    return null;
  }
  const critical = errorBurstTriggered || rageClicks >= 3 || deadClicks >= 5;
  const parts: string[] = [];
  if (rageClicks > 0) parts.push(`${rageClicks} rage click(s)`);
  if (deadClicks > 0) parts.push(`${deadClicks} dead click(s)`);
  if (quickBacks > 0) parts.push(`${quickBacks} quick back(s)`);
  if (slowCwvHits > 0) parts.push(`${slowCwvHits} slow CWV hit(s)`);
  if (errorSessions60m > 0) parts.push(`${errorSessions60m} error session(s) in 60m (${topErrorTag ?? "error:*"})`);
  return {
    category: "friction",
    title: critical ? "Active UX friction & error hotspot" : "Minor UX friction signals detected",
    detail: `${parts.join(", ")}.${topSignal ? ` Hotspot: ${topSignal.topPath}.` : ""}`,
    severity: critical ? "critical" : "warn",
    actionHref:
      errorSessions60m > 0 && rageClicks + deadClicks === 0
        ? "/admin/traffic?preset=error"
        : "/admin/traffic?preset=friction",
  };
}

function buildExperimentFinding(facts: TrafficDigestFacts): DigestFinding | null {
  const exp = facts.experiment;
  if (!exp || exp.variants.length === 0) return null;
  const totalSessions = exp.variants.reduce((acc, v) => acc + v.sessions, 0);
  const liftText =
    exp.liftVsControlPct !== null
      ? `${exp.liftVsControlPct >= 0 ? "+" : ""}${exp.liftVsControlPct}% lift vs control`
      : "single-arm observation";
  const conf = exp.confidenceLabel ?? "Insufficient Data";
  return {
    category: "experiment",
    title: `${exp.experimentKey}: ${exp.leaderVariant ?? "control"} (${conf})`,
    detail: `${liftText} across ${totalSessions} session(s) and ${exp.variants.length} arm(s).`,
    severity: conf === "Statistically Significant (95%+)" ? "info" : "warn",
    actionHref: "/admin/traffic",
  };
}

function buildFeedbackAndSearchFindings(facts: TrafficDigestFacts): DigestFinding[] {
  const out: DigestFinding[] = [];
  if (facts.openFeedbackCount > 0) {
    const [latest] = facts.openFeedback;
    const snippet = latest ? sanitizeUntrustedFeedbackNote(latest.note) : "";
    out.push({
      category: "feedback",
      title: `${facts.openFeedbackCount} open feedback item(s) (${facts.openLowRatingCount} ≤3★)`,
      detail: latest ? `Latest on ${latest.path}: "${snippet}"` : "Open items awaiting triage.",
      severity: facts.openLowRatingCount > 0 ? "critical" : "warn",
      actionHref: "/admin/traffic?preset=feedback",
    });
  }
  const zeroSearch = facts.frictionSummary.topZeroResultQuery;
  if (zeroSearch) {
    out.push({
      category: "friction",
      title: `Zero-result search spike: "${zeroSearch.slug}"`,
      detail: `${zeroSearch.sessions} visitor session(s) received zero results in 24h.`,
      severity: zeroSearch.sessions >= 3 ? "warn" : "info",
      actionHref: `/admin/traffic?interaction=${encodeURIComponent(`search:zero_results:${zeroSearch.slug}`)}&view=views`,
    });
  }
  return out;
}

function buildActionList(facts: TrafficDigestFacts): DigestAction[] {
  const actions: DigestAction[] = [];
  const { rageClicks, deadClicks, errorSessions60m, topErrorTag, topZeroResultQuery } = facts.frictionSummary;
  if (facts.liveSources < facts.totalSources) {
    actions.push({
      priority: facts.liveSources === 0 ? "P0" : "P1",
      action: "Inspect degraded traffic readers",
      rationale: `${facts.totalSources - facts.liveSources} telemetry source(s) failed (${facts.degradedSources.join(", ")}).`,
      targetPath: "/admin/traffic",
    });
  }
  if (errorSessions60m > 0 || rageClicks + deadClicks > 0) {
    actions.push({
      priority: errorSessions60m >= 3 || rageClicks >= 3 ? "P0" : "P1",
      action: "Triage frustrated & error sessions",
      rationale: topErrorTag
        ? `Investigate ${topErrorTag} and UI clicks across ${facts.frictionSignals[0]?.topPath ?? "key routes"}.`
        : "Review recorded rage/dead clicks and slow interactions in Visitor Journeys.",
      targetPath: errorSessions60m > 0 ? "/admin/traffic?preset=error" : "/admin/traffic?preset=friction",
    });
  }
  if (facts.openFeedbackCount > 0) {
    actions.push({
      priority: facts.openLowRatingCount > 0 ? "P0" : "P1",
      action: `Review ${facts.openFeedbackCount} open feedback note(s)`,
      rationale: facts.openLowRatingCount > 0 ? `${facts.openLowRatingCount} low-rating submission(s) need follow-up.` : "Close out resolved items from the open feedback queue.",
      targetPath: "/admin/traffic?preset=feedback",
    });
  }
  if (topZeroResultQuery) {
    actions.push({
      priority: "P2",
      action: `Resolve "${topZeroResultQuery.slug}" search gap`,
      rationale: "Link the unfulfilled query to a canonical slug or draft a cosmic recipe.",
      targetPath: "/admin",
    });
  }
  if (actions.length === 0) {
    actions.push({
      priority: "P2",
      action: "Monitor fast_start_cta sample collection",
      rationale: "No blockers detected; keep tracking visitor activation toward 20+ sessions per arm.",
      targetPath: "/admin/traffic",
    });
  }
  return actions.slice(0, 4);
}

/** Deterministic synthesis used when AI is unavailable, skipped, or quiet. */
export function buildDeterministicDigestNarrative(facts: TrafficDigestFacts): DigestNarrative {
  const severity = computeSeverity(facts);
  if (facts.liveSources === 0) {
    return {
      headline: "Traffic & friction telemetry temporarily unavailable",
      severity: "watch",
      executiveSummary: "All first-party traffic readers failed to respond cleanly; metrics are withheld rather than shown as zero.",
      topFindings: [{ category: "traffic", title: "Telemetry readers unavailable", detail: `Failed readers: ${facts.degradedSources.join(", ")}.`, severity: "warn", actionHref: "/admin/traffic" }],
      recommendedActions: buildActionList(facts),
    };
  }
  if (facts.totals.pageviews === 0 && facts.openFeedbackCount === 0 && facts.frictionSummary.errorSessions60m === 0) {
    return {
      headline: `Quiet ${facts.range} window — zero human traffic or friction alerts`,
      severity,
      executiveSummary: `No human pageviews, UX friction tags, or open feedback entries recorded in the ${facts.range} window.`,
      topFindings: [{ category: "traffic", title: `0 human pageviews (${facts.range})`, detail: "All bots excluded; share links with ?ref= to inspect guided sessions.", severity: "info", actionHref: "/admin/traffic" }],
      recommendedActions: buildActionList(facts),
    };
  }
  const findings = [
    buildTrafficFinding(facts),
    buildFrictionFinding(facts),
    buildExperimentFinding(facts),
    ...buildFeedbackAndSearchFindings(facts),
  ]
    .filter((f): f is DigestFinding => f !== null)
    .slice(0, 5);
  const headline =
    severity === "action_needed"
      ? `Attention needed (${facts.range}): active friction or low-rating feedback`
      : severity === "watch"
        ? `Watch items in ${facts.range} traffic (${facts.totals.sessions} sessions)`
        : `Healthy ${facts.range} traffic across ${facts.totals.sessions} human sessions`;
  const [topRoute] = facts.topRoutes;
  const executiveSummary = [
    `${facts.totals.pageviews} pageviews across ${facts.totals.visitors} visitor(s)`,
    topRoute ? `led by ${topRoute.path} (${topRoute.views} views)` : null,
    facts.frictionSummary.rageClicks + facts.frictionSummary.deadClicks > 0
      ? `${facts.frictionSummary.rageClicks} rage / ${facts.frictionSummary.deadClicks} dead clicks`
      : "no rage/dead clicks",
    facts.openFeedbackCount > 0 ? `${facts.openFeedbackCount} open feedback item(s)` : null,
  ]
    .filter((x): x is string => x !== null)
    .join("; ")
    .concat(".");
  return { headline, severity, executiveSummary, topFindings: findings, recommendedActions: buildActionList(facts) };
}
