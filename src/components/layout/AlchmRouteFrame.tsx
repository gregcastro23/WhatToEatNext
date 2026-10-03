/**
 * The design-system frame the (alchm) group layout provides: the
 * `.alchm-root .lab` wrapper (tokens such as --bg-elev and --el-fire), the
 * obsidian backdrop and the agents feed. For routes that live outside that
 * group so their status codes are real, without its force-dynamic.
 */
import { AgentsFeedThread } from "@/components/home/AgentsFeedThread";
import CosmicVoidBackground from "@/components/ui/alchm/CosmicVoidBackground";
import type { JSX, ReactNode } from "react";

export function AlchmRouteFrame({ children }: { children: ReactNode }): JSX.Element {
  return (
    <div data-alchm-route="true" className="alchm-root lab">
      <CosmicVoidBackground intensity="low" />
      {children}
      <AgentsFeedThread />
    </div>
  );
}
