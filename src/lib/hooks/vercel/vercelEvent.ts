/**
 * Vercel account-webhook verification and parsing.
 *
 * Signature (Vercel docs, "Securing webhooks"): `x-vercel-signature` is the
 * hex HMAC-SHA1 of the raw request body under the secret shown once when the
 * webhook is created. There is no timestamp in the scheme, so replay is
 * stopped by webhook_events' UNIQUE(source, event_id) instead.
 *
 * Envelope: { id, type, createdAt, payload, region }. Deployment events carry
 * payload.deployment.{id,url,name,meta}, payload.target ("production" |
 * "staging" | null), payload.project.id and payload.links.deployment.
 *
 * Event names: the webhook is subscribed to `deployment.succeeded`, not
 * `deployment.ready`. Vercel's legacy-name table maps the old
 * `deployment-ready` (the build finished and is serving) to
 * `deployment.succeeded`; today's `deployment.ready` is the old
 * `deployment-prepared`, fired before blocking Checks run. With no Checks
 * registered on this project, `succeeded` follows the build directly.
 *
 * @file src/lib/hooks/vercel/vercelEvent.ts
 */

import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import type { HookEvent } from "@/lib/hooks/types";

/** Constant-time check of `x-vercel-signature` against the raw body. */
export function verifyVercelSignature(rawBody: string, signature: string | null, secret: string | undefined): boolean {
  if (!secret || !signature || !/^[0-9a-f]{40}$/i.test(signature)) return false;
  const expected = createHmac("sha1", secret).update(rawBody, "utf8").digest();
  return timingSafeEqual(Buffer.from(signature, "hex"), expected);
}

/**
 * The events the account webhook is subscribed to (registered 2026-09-23:
 * account_hook_zr8IInqORZw0P2Faezx9FRZr, project prj_FkAq08tNvdiV7rawfC49MezqzZQE).
 * deploymentHandlers.ts registers exactly one handler per entry.
 */
export const VercelDeploymentEventTypeSchema = z.enum([
  "deployment.created",
  "deployment.succeeded",
  "deployment.error",
  "deployment.canceled",
]);

export type VercelDeploymentEventType = z.infer<typeof VercelDeploymentEventTypeSchema>;

export const VERCEL_SUBSCRIBED_EVENTS: readonly VercelDeploymentEventType[] = VercelDeploymentEventTypeSchema.options;

const DeploymentSchema = z.object({
  id: z.string(),
  url: z.string().optional(),
  name: z.string().optional(),
  meta: z.record(z.string(), z.unknown()).optional(),
});

export const VercelDeploymentPayloadSchema = z.object({
  deployment: DeploymentSchema.optional(),
  target: z.string().nullable().optional(),
  project: z.object({ id: z.string() }).optional(),
  links: z.object({ deployment: z.string().optional(), project: z.string().optional() }).optional(),
});

export type VercelDeploymentPayload = z.infer<typeof VercelDeploymentPayloadSchema>;

export const VercelEnvelopeSchema = z.object({
  id: z.string().min(1),
  type: z.string().min(1),
  createdAt: z.number(),
  payload: z.unknown(),
  region: z.string().nullable().optional(),
});

function metaString(meta: Record<string, unknown> | undefined, key: string): string | null {
  const value = meta?.[key];
  return typeof value === "string" ? value : null;
}

/** The PII-free facts worth keeping: which deployment, which commit, which target. */
function summarize(type: string, payload: VercelDeploymentPayload): Record<string, unknown> {
  const { deployment, target = null, project, links } = payload;
  const commitMessage = metaString(deployment?.meta, "githubCommitMessage");
  return {
    type,
    deploymentId: deployment?.id ?? null,
    url: deployment?.url ?? null,
    target,
    projectId: project?.id ?? null,
    inspectUrl: links?.deployment ?? null,
    commitSha: metaString(deployment?.meta, "githubCommitSha"),
    commitRef: metaString(deployment?.meta, "githubCommitRef"),
    commitTitle: commitMessage ? (commitMessage.split("\n")[0] ?? "").slice(0, 200) : null,
  };
}

/** Parse a verified body into a HookEvent; null when it is not a Vercel envelope. */
export function toVercelHookEvent(rawBody: string): HookEvent<VercelDeploymentPayload> | null {
  let json: unknown;
  try {
    json = JSON.parse(rawBody);
  } catch {
    return null;
  }
  const envelope = VercelEnvelopeSchema.safeParse(json);
  if (!envelope.success) return null;
  const parsed = VercelDeploymentPayloadSchema.safeParse(envelope.data.payload);
  const data: VercelDeploymentPayload = parsed.success ? parsed.data : {};
  return {
    source: "vercel",
    id: envelope.data.id,
    type: envelope.data.type,
    subjectId: data.deployment?.id ?? null,
    occurredAt: new Date(envelope.data.createdAt),
    summary: summarize(envelope.data.type, data),
    data,
  };
}
