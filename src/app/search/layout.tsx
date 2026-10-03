import { AlchmRouteFrame } from "@/components/layout/AlchmRouteFrame";
import type { JSX, ReactNode } from "react";

export default function SearchLayout({ children }: { children: ReactNode }): JSX.Element {
  return <AlchmRouteFrame>{children}</AlchmRouteFrame>;
}
