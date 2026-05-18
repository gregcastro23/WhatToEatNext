/**
 * /profile/security — account & sessions management.
 *
 * Cross-subdomain JWT visualization, session log with revoke,
 * linked providers, agent-sync status, and the danger zone.
 *
 * @file src/app/profile/security/page.tsx
 */

import { AccountSessions } from "@/components/auth/AuthFollowups";

export const dynamic = "force-dynamic";

export default function ProfileSecurityPage() {
  return <AccountSessions />;
}
