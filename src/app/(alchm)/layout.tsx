import { AgentsFeedThread } from "@/components/home/AgentsFeedThread";
import CosmicVoidBackground from "@/components/ui/alchm/CosmicVoidBackground";
import type { ReactNode } from "react";

/**
 * Route group layout for the Modern Alchemist redesign.
 *
 * The sticky RedesignedHeader is now mounted by the root layout
 * (src/app/layout.tsx) on every route, so this group no longer needs
 * its own LabHeader. We keep the `.alchm-root .lab` wrapper to activate
 * the design-system tokens (--bg-elev, --el-fire, etc.) and the
 * obsidian backdrop for everything inside this group.
 *
 * The dynamic rendering directive is scoped to this group because every
 * route here depends on per-request providers (Chakra, User, Alchemical).
 * Marketing/static routes (terms, privacy, login, etc.) outside this group
 * can still be cached at the segment level by Next.js / the CDN.
 */
export const dynamic = "force-dynamic";

// Cap the server function at 30s instead of inheriting the Vercel default 60s.
// Every page in this group is either a 'use client' shell (no server-side
// awaits) or wraps a single DB read that we already cap at 8s. 30s is more
// than 3x the worst legitimate case, so any longer hang is a bug worth
// surfacing fast — and a 30s failure is much better UX than 60s.
export const maxDuration = 30;

export default function AlchmLayout({ children }: { children: ReactNode }) {
  return (
    <div data-alchm-route="true" className="alchm-root lab">
      <CosmicVoidBackground intensity="low" />
      {children}
      <AgentsFeedThread />
    </div>
  );
}
