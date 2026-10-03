import { redirect } from "next/navigation";

/**
 * Consolidated into /admin/agents in Phase 44 Target 3.
 * Redirect legacy /admin/asol bookmark/link directly to /admin/agents.
 */
export default function AsolHealthRedirectPage(): never {
  redirect("/admin/agents");
}
