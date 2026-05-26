/**
 * /profile/api-keys — mint, list, and revoke API keys for the MCP
 * server and other external integrations.
 *
 * Mirrors the /profile/security shape: server-component page that mounts
 * a single client panel; auth check and DB I/O happen inside the panel's
 * fetch calls so the cold-start budget on this segment stays small.
 *
 * @file src/app/(alchm)/profile/api-keys/page.tsx
 */

import { ApiKeysPanel } from "@/components/account/ApiKeysPanel";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "API Keys — alchm.kitchen",
  description:
    "Mint and manage API keys for Claude Desktop, Cursor, and other MCP clients.",
};

export default function ProfileApiKeysPage() {
  return <ApiKeysPanel />;
}
