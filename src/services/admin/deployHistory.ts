/**
 * Deploy history for the Dashboard ✦ "Deploys" panel, from GitHub.
 *
 * Deployed lambdas have no .git directory, so the panel used to show one
 * entry (the running commit, from Vercel's build env) or "no source". master
 * auto-deploys, so the latest commits on master ARE the deploy history; the
 * running one is marked. Falls back to the Vercel-env entry when GitHub
 * cannot be read.
 *
 * @file src/services/admin/deployHistory.ts
 */

import { recentCommits } from "@/services/admin/codeHealthGithub";
import { getDeployHistory, type DeployHistoryEntry } from "@/services/dashboardPanelsService";

function age(iso: string, now: number): string {
  const s = Math.max(0, Math.round((now - new Date(iso).getTime()) / 1000));
  if (s < 3600) return `${Math.max(1, Math.floor(s / 60))}m ago`;
  if (s < 86_400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86_400)}d ago`;
}

export async function getDeployHistoryLive(): Promise<{ entries: DeployHistoryEntry[]; live: boolean }> {
  const res = await recentCommits();
  if (res.state.status !== "live" || res.commits.length === 0) return getDeployHistory();
  const deployed = process.env.VERCEL_GIT_COMMIT_SHA;
  const now = Date.now();
  return {
    live: true,
    entries: res.commits.slice(0, 8).map((c) => ({
      sha: c.sha.slice(0, 7),
      author: c.author,
      age: c.date ? age(c.date, now) : "unknown",
      message: deployed === c.sha ? `● ${c.title} (running)` : c.title,
    })),
  };
}
