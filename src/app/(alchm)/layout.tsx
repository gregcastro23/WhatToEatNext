import { LabHeader } from "@/components/nav/LabHeader";
import type { ReactNode } from "react";

/**
 * Route group layout for the Modern Alchemist redesign.
 *
 * Mounts the new sticky LabHeader and hides the legacy header rendered by the
 * root layout (without modifying that file). The `:has()` selector below
 * scopes the hide to routes inside this group only — the legacy header still
 * shows on every other route.
 */
export default function AlchmLayout({ children }: { children: ReactNode }) {
  return (
    <div data-alchm-route="true" className="alchm-root lab">
      <style>{`
        body:has([data-alchm-route]) header:not([data-alchm-header]) { display: none !important; }
        body:has([data-alchm-route]) footer { display: none !important; }
        body:has([data-alchm-route]) { background: #07060B; }
      `}</style>
      <LabHeader />
      {children}
    </div>
  );
}
