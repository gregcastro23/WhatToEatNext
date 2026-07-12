"use client";

import { LabelXS } from "@/components/tables/ui";
import { useDiscoverPeople } from "./hooks";
import { PersonCard } from "./PersonCard";
import type { JSX } from "react";

/**
 * "Kindred alchemists" rail (tables-design-spec.md §3.6) — horizontal
 * snap-scroll of compatibility-ranked PersonCards. Hidden for anon viewers and
 * when there is nothing to show (the People tab carries the signed-out CTA).
 */
export function KindredRail(): JSX.Element | null {
  const { people, loading, needsAuth } = useDiscoverPeople({ sort: "match", kind: "all", limit: 10 });

  if (needsAuth) return null;
  if (!loading && people.length === 0) return null;

  return (
    <section aria-label="Kindred alchemists" className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-alchm-violet animate-pulse shadow-[0_0_8px_rgba(181,126,224,0.8)]" aria-hidden />
        <LabelXS className="text-alchm-fg-warm">Kindred alchemists</LabelXS>
      </div>
      <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {loading && people.length === 0
          ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-64 w-60 shrink-0 animate-pulse rounded-2xl bg-white/[0.03]" />
            ))
          : people.map((p) => (
              <div key={p.id} className="snap-start">
                <PersonCard person={p} />
              </div>
            ))}
      </div>
    </section>
  );
}

export default KindredRail;
