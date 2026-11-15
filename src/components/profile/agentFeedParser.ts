/**
 * Wire parsers for the three activity feeds of GET /api/users/[userId]:
 * `agentInteractions`, `agentActions` and `agentArtifacts` (`AgentInteraction`,
 * `AgentAction`, `AgentArtifact`, src/lib/agents/fetchAgentProfile.ts:8-42).
 *
 * PRODUCER. There is NO in-repo producer to cite: the rows are JSON from an
 * external service (ASOL), which fetchAgentProfile.ts hands on with a `z.custom`
 * that only checks the body is an object. So optionality mirrors the DECLARED
 * types. What the lead route, src/app/api/users/[userId]/route.ts, does around
 * them: the external-agent path (229-278) writes all three as empty literals (248-250), and
 * the DB path (396-447) fills them from a `Promise.allSettled` and keeps `[]` when
 * the ASOL fetch fails. So `null` / `undefined` / `[]` are the normal answers.
 *
 * CONSUMER. src/app/(alchm)/profile/[userId]/AgentProfile.tsx renders each
 * artifact's id, title, summary and kind (569-582), reads only `actions.length`
 * (559), and never reads `interactions` (declared on its props at 62, unused).
 *
 * The feeds are ancillary, so nothing here throws. A row failing ANY required
 * field of its declared type is dropped and reported ONCE by index
 * (`agentInteractions[2]: not a valid row`); an optional field is kept only when
 * valid and otherwise omitted and reported by path. A feed that is not an array is
 * `[]` plus one report. Unlike a list endpoint, a feed whose every row is dropped
 * is `[]` plus its reports, not a failure. `kind` must match its union exactly.
 * `metadata` is an open `Record<string, unknown>` by its declared type, so its keys
 * are copied as they are; unknown keys of every other object are not.
 */

import { finite, pickText, rowsOf, scopeAt } from "@/components/profile/agentParsePrimitives";
import type { RecordParser, Scope } from "@/components/profile/agentParsePrimitives";
import type { AgentAction, AgentArtifact, AgentInteraction } from "@/lib/agents/fetchAgentProfile";
import { isJsonRecord } from "@/lib/api/json";

type Counterparty = AgentInteraction["counterparty"];

function interactionKind(value: unknown): AgentInteraction["kind"] | null {
  return value === "agent_to_agent" || value === "agent_to_user" ? value : null;
}

function artifactKind(value: unknown): AgentArtifact["kind"] | null {
  return value === "recipe" || value === "lab_entry" || value === "insight" ? value : null;
}

/** `name` is the only required field of a counterparty; `slug` and `userId` are optional. */
function parseCounterparty(value: unknown, at: Scope): Counterparty | null {
  if (!isJsonRecord(value)) return null;
  const { name } = value;
  if (typeof name !== "string") return null;
  return { name, ...pickText(value, ["slug", "userId"], at) };
}

function parseInteraction(row: Record<string, unknown>, at: Scope): AgentInteraction | null {
  const { id, topic, messagePreview, startedAt, lastTurnAt, chatThread } = row;
  const kind = interactionKind(row.kind);
  const counterparty = parseCounterparty(row.counterparty, scopeAt(at, "counterparty"));
  const messageCount = finite(row.messageCount);
  if (typeof id !== "string" || typeof topic !== "string" || typeof messagePreview !== "string") return null;
  if (typeof startedAt !== "string" || typeof lastTurnAt !== "string" || typeof chatThread !== "string") return null;
  if (kind === null || counterparty === null || messageCount === null) return null;
  return { id, kind, counterparty, topic, messagePreview, messageCount, startedAt, lastTurnAt, chatThread };
}

/** Both link fields are optional, but the `links` object itself is required. */
function parseLinks(value: unknown, at: Scope): AgentAction["links"] | null {
  if (!isJsonRecord(value)) return null;
  return pickText(value, ["chatThread", "recipe"], at);
}

function parseAction(row: Record<string, unknown>, at: Scope): AgentAction | null {
  const { id, type, createdAt, metadata } = row;
  const links = parseLinks(row.links, scopeAt(at, "links"));
  const meta = isJsonRecord(metadata) ? { ...metadata } : null;
  if (typeof id !== "string" || typeof type !== "string" || typeof createdAt !== "string") return null;
  if (meta === null || links === null) return null;
  return { id, type, createdAt, metadata: meta, links };
}

function parseArtifact(row: Record<string, unknown>, at: Scope): AgentArtifact | null {
  const { id, title, createdAt, summary } = row;
  const kind = artifactKind(row.kind);
  if (typeof id !== "string" || typeof title !== "string") return null;
  if (typeof createdAt !== "string" || typeof summary !== "string" || kind === null) return null;
  return { id, kind, title, createdAt, summary, ...pickText(row, ["alchmKitchenPath"], at) };
}

/** No feed is `[]` (`rowsOf` answers `undefined` itself); a feed that is not an array is `[]` plus a report. */
function parseFeed<T>(value: unknown, scope: Scope, parseRow: RecordParser<T>): T[] {
  if (value === null) return [];
  return rowsOf(value, scope, parseRow) ?? [];
}

export function parseAgentInteractions(value: unknown, issues: string[]): AgentInteraction[] {
  return parseFeed(value, { path: "agentInteractions", issues }, parseInteraction);
}

export function parseAgentActions(value: unknown, issues: string[]): AgentAction[] {
  return parseFeed(value, { path: "agentActions", issues }, parseAction);
}

export function parseAgentArtifacts(value: unknown, issues: string[]): AgentArtifact[] {
  return parseFeed(value, { path: "agentArtifacts", issues }, parseArtifact);
}
