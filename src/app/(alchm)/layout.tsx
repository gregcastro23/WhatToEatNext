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

export default function AlchmLayout({ children }: { children: ReactNode }) {
  return (
    <div data-alchm-route="true" className="alchm-root lab">
      {children}
    </div>
  );
}
