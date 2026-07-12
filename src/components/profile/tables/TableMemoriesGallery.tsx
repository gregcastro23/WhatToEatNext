"use client";

/**
 * TableMemoriesGallery — §3.5 HOSTED/ATTENDED memory gallery, fed by
 * GET /api/users/[userId]/tables. The section hides ITSELF entirely when the
 * route 404s (the PR 2-independent state — see
 * docs/plans/pr4-pr2-integration-followups.md). Card rows honor the frozen
 * identity in the memory payload: concealed guests arrive from the API as
 * "Anonymous Alchemist" + element only.
 */

import { useEffect, useState, type JSX } from "react";
import {
  AvatarRow,
  CompositeRadialBadge,
  GlassPanel,
  LabelXS,
  type AvatarPerson,
  type Element,
} from "@/components/tables/ui";

interface MemoryGuest {
  name: string;
  element?: Element;
  avatarUrl?: string | null;
}

export interface TableMemoryCard {
  id: string;
  title: string;
  closedAt: string;
  photoUrls: string[];
  composite?: {
    dominantElement?: Element;
    elementalBalance?: Partial<Record<Element, number>>;
  } | null;
  guests: MemoryGuest[];
}

type Scope = "hosted" | "attended";
type GalleryState =
  | { status: "loading" }
  | { status: "hidden" }
  | { status: "ready"; memories: TableMemoryCard[] };

export interface TableMemoriesGalleryProps {
  userId: string;
  className?: string;
}

export function TableMemoriesGallery({ userId, className = "" }: TableMemoriesGalleryProps): JSX.Element | null {
  const [scope, setScope] = useState<Scope>("hosted");
  const [state, setState] = useState<GalleryState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });
    void fetch(`/api/users/${encodeURIComponent(userId)}/tables?scope=${scope}`)
      .then(async (res) => {
        if (cancelled) return;
        if (res.status === 404) {
          // PR 2 absent (or memories disabled) — hide the whole section.
          setState({ status: "hidden" });
          return;
        }
        const json = (await res.json().catch(() => null)) as {
          success?: boolean;
          memories?: TableMemoryCard[];
        } | null;
        if (!json?.success) {
          setState({ status: "hidden" });
          return;
        }
        setState({ status: "ready", memories: json.memories ?? [] });
      })
      .catch(() => {
        if (!cancelled) setState({ status: "hidden" });
      });
    return () => {
      cancelled = true;
    };
  }, [userId, scope]);

  if (state.status === "hidden") return null;

  return (
    <GlassPanel className={`p-6 ${className}`}>
      <div className="flex items-center justify-between mb-5">
        <LabelXS as="h2" className="text-alchm-fg-dim">
          Table Memories
        </LabelXS>
        <div role="tablist" aria-label="Table memories scope" className="flex gap-4">
          {(["hosted", "attended"] as const).map((tab) => (
            <button
              key={tab}
              role="tab"
              aria-selected={scope === tab}
              onClick={() => setScope(tab)}
              className={`pb-1 border-b-2 transition-colors ${
                scope === tab
                  ? "border-alchm-copper text-alchm-copper-bright"
                  : "border-transparent text-alchm-fg-dim hover:text-white"
              }`}
            >
              <LabelXS>{tab.toUpperCase()}</LabelXS>
            </button>
          ))}
        </div>
      </div>

      {state.status === "loading" ? (
        <div className="h-24 rounded-xl bg-white/[0.02] border border-white/5 animate-pulse" />
      ) : state.memories.length === 0 ? (
        <p className="text-sm text-alchm-fg-dim italic py-6 text-center">
          No table memories yet — break bread to begin
        </p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {state.memories.map((memory) => (
            <div
              key={memory.id}
              className="rounded-xl border border-white/8 bg-white/[0.02] overflow-hidden"
            >
              {memory.photoUrls[0] && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={memory.photoUrls[0]}
                  alt={memory.title}
                  loading="lazy"
                  className="w-full h-28 object-cover border-b border-white/5"
                />
              )}
              <div className="p-4 flex items-start gap-3">
                <CompositeRadialBadge
                  variant="composite"
                  values={memory.composite?.elementalBalance ?? {}}
                  size={40}
                  ariaLabel={`${memory.title} composite`}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-white truncate">{memory.title}</p>
                  <LabelXS as="p" className="text-alchm-fg-dim mt-0.5">
                    {new Date(memory.closedAt).toLocaleDateString()}
                  </LabelXS>
                  <AvatarRow
                    className="mt-2"
                    size={22}
                    people={memory.guests.map(
                      (guest): AvatarPerson => ({
                        name: guest.name,
                        src: guest.avatarUrl ?? undefined,
                        element: guest.element,
                      }),
                    )}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </GlassPanel>
  );
}

export default TableMemoriesGallery;
