/**
 * The dossier's design-system frame: the `.alchm-root .lab` wrapper (tokens
 * such as --bg-elev and --el-fire) and the obsidian backdrop, as the (alchm)
 * group layout provides them. The dossier lives outside that group so its
 * status codes are real; it deliberately omits the group's force-dynamic.
 */
import { AgentsFeedThread } from "@/components/home/AgentsFeedThread";
import CosmicVoidBackground from "@/components/ui/alchm/CosmicVoidBackground";
import type { JSX, ReactNode } from "react";

export default function IngredientDossierLayout({ children }: { children: ReactNode }): JSX.Element {
  return (
    <div data-alchm-route="true" className="alchm-root lab">
      <CosmicVoidBackground intensity="low" />
      {children}
      <AgentsFeedThread />
    </div>
  );
}
