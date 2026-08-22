import { LabShell } from "@/components/lab/LabShell";
import type { ReactNode, JSX } from "react";

/**
 * Celestial Lab chrome.
 *
 * ⚠️ This layout must NOT gate anything. Auth for the two private leaves
 * (`/celestial-lab/standing-chart`, `/celestial-lab/current-chart`) is enforced
 * per-leaf in src/middleware.ts plus each page's own `auth()` call. Adding a
 * check here would also cover `/celestial-lab/mechanics`, which is the new home
 * of the deliberately-public planetary surface — and a signed-in developer
 * would never see it break.
 *
 * See src/config/__tests__/middleware.matcher.test.ts, which pins both
 * directions of that boundary.
 */
export default function CelestialLabLayout({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  return (
    <LabShell lab="celestialLab" accent="text-violet-200">
      {children}
    </LabShell>
  );
}
