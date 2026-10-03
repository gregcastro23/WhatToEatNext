/**
 * The dossier lives outside the (alchm) group so its status codes are real
 * (that group's loading.tsx turns redirects and 404s into 200s), and keeps
 * the group's frame.
 */
import { AlchmRouteFrame } from "@/components/layout/AlchmRouteFrame";
import type { JSX, ReactNode } from "react";

export default function IngredientDossierLayout({ children }: { children: ReactNode }): JSX.Element {
  return <AlchmRouteFrame>{children}</AlchmRouteFrame>;
}
