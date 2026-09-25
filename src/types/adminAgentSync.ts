/**
 * Wire types for POST /api/admin/agent-sync (push agentic accounts to the
 * agents backend).
 *
 * @file src/types/adminAgentSync.ts
 */

/** One agent's outcome. `status` is absent when the request never got a reply. */
export interface AgentSyncResult {
  agentId: string;
  email: string;
  ok: boolean;
  status?: number;
  error?: string;
}

/** A completed batch. Failures are `{ success: false, error }`. */
export interface AgentSyncBatchResponse {
  success: true;
  synced: number;
  failed: number;
  results: AgentSyncResult[];
  note?: string;
}
