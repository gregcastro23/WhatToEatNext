/**
 * What WTEN does with Vercel deployment events.
 *
 *   deployment.created   record only (the start of a build, for timing)
 *   deployment.succeeded production → run the synthetic probes against the
 *                        new deployment right away, instead of waiting up to
 *                        15 minutes for their next scheduled tick (see
 *                        vercelEvent.ts for why `succeeded`, not `ready`)
 *   deployment.error     production → operator alert, with the inspect link
 *                        and the known remedy for a stale build cache
 *   deployment.canceled  record only (a cancel is usually deliberate)
 *
 * Preview deployments are recorded and otherwise left alone — dependabot and
 * feature branches fail builds routinely, and paging on them would be noise.
 *
 * @file src/lib/hooks/vercel/deploymentHandlers.ts
 */

import { getCronBaseUrl } from "@/app/api/cron/_lib/cronAuth";
import { runAfterResponse } from "@/lib/hooks/runAfterResponse";
import type { HookEvent, HookHandler } from "@/lib/hooks/types";
import type { VercelDeploymentEventType, VercelDeploymentPayload } from "@/lib/hooks/vercel/vercelEvent";
import { dispatchAlert } from "@/services/alertService";
import {
  runAuthHandshakeProbe,
  runAuthSigninProbe,
  runMcpProbe,
  runOnboardingSkipProbe,
  runRecommendationsProbe,
  runStripeWebhookProbe,
  type ProbeResult,
} from "@/services/syntheticProbeService";

type DeployEvent = HookEvent<VercelDeploymentPayload>;

/** A handler for one of the subscribed deployment event types — no strays. */
interface DeploymentHandler extends HookHandler<VercelDeploymentPayload> {
  type: VercelDeploymentEventType;
}

/**
 * The probes worth running on every production deploy: each exercises a
 * user-facing path, none spends AI tokens. The cosmic-recipe probe is left
 * to its hourly schedule — it burns a generation and waits on PA.
 */
export const POST_DEPLOY_PROBES = [
  "onboarding-skip",
  "recommendations",
  "auth-handshake",
  "auth-signin",
  "stripe-webhook",
  "mcp",
];

function isProduction(event: DeployEvent): boolean {
  return event.data.target === "production";
}

function shortSha(event: DeployEvent): string {
  const sha = event.summary.commitSha;
  return typeof sha === "string" ? sha.slice(0, 7) : (event.data.deployment?.id ?? "unknown");
}

/** Every post-deploy probe, in parallel; each records its own result row. */
export async function runPostDeployProbes(): Promise<ProbeResult[]> {
  const baseUrl = getCronBaseUrl();
  const bearerToken = process.env.SYNTHETIC_PROBE_TOKEN ?? null;
  const settled = await Promise.allSettled([
    runOnboardingSkipProbe({ baseUrl, bearerToken }),
    runRecommendationsProbe({ baseUrl, bearerToken }),
    runAuthHandshakeProbe({ baseUrl, bearerToken }),
    runAuthSigninProbe({ baseUrl }),
    runStripeWebhookProbe({ baseUrl }),
    runMcpProbe(),
  ]);
  return settled.flatMap((s) => (s.status === "fulfilled" ? [s.value] : []));
}

function onSucceeded(event: DeployEvent): Promise<Record<string, unknown>> {
  if (!isProduction(event)) return Promise.resolve({ action: "none", reason: "not production" });
  runAfterResponse(`post-deploy probes ${shortSha(event)}`, runPostDeployProbes);
  return Promise.resolve({ action: "probes-scheduled", probes: POST_DEPLOY_PROBES });
}

async function onError(event: DeployEvent): Promise<Record<string, unknown>> {
  if (!isProduction(event)) return { action: "none", reason: "not production" };
  const inspect = event.data.links?.deployment ?? "the Vercel dashboard";
  const commit = typeof event.summary.commitTitle === "string" ? ` — ${event.summary.commitTitle}` : "";
  const alert = await dispatchAlert({
    component: "deploy",
    componentLabel: "Production deploy",
    previous: "OK",
    current: "DEGRADED",
    severity: "error",
    title: `Production deploy failed (${shortSha(event)})`,
    message:
      `Vercel reported deployment.error for ${event.data.deployment?.url ?? "a production deployment"}${commit}. ` +
      `The live site is still the previous deployment. Inspect: ${inspect}. ` +
      `If the build log shows "exit 137" / "Killed next build" or it hung at "Creating an optimized production build", ` +
      `redeploy with the build cache off (stale-cache OOM).`,
  });
  return { action: "alerted", alertId: alert.id };
}

function recordOnly(): Promise<Record<string, unknown>> {
  return Promise.resolve({ action: "recorded" });
}

export const DEPLOYMENT_HANDLERS: readonly DeploymentHandler[] = [
  { type: "deployment.created", handle: recordOnly },
  { type: "deployment.succeeded", handle: onSucceeded },
  { type: "deployment.error", handle: onError },
  { type: "deployment.canceled", handle: recordOnly },
];
