import type { ReactNode } from "react";

/**
 * Route group layout for the Modern Alchemist redesign.
 *
 * The sticky RedesignedHeader is now mounted by the root layout
 * (src/app/layout.tsx) on every route, so this group no longer needs
 * its own LabHeader. We keep the `.alchm-root .lab` wrapper to activate
 * the design-system tokens (--bg-elev, --el-fire, etc.) and the
 * obsidian backdrop for everything inside this group.
 */
export default function AlchmLayout({ children }: { children: ReactNode }) {
  return (
    <div data-alchm-route="true" className="alchm-root lab">
      {children}
    </div>
  );
}
