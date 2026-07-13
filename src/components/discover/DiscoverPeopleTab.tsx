"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { GradientButton, LabelXS } from "@/components/tables/ui";
import { Glyph } from "@/components/ui/alchm/Glyph";
import { Chip } from "./Chip";
import { useDiscoverPeople } from "./hooks";
import { PersonRow } from "./PersonRow";
import type { DiscoverPersonCard } from "./types";
import type { JSX } from "react";

const ELEMENTS = ["Fire", "Water", "Earth", "Air"] as const;
type Kind = "all" | "people" | "agents";

/** Public agents rail for signed-out viewers — sourced from the already-public
 * /api/community/agents (a logged-out human directory stays closed). */
function AnonAgents(): JSX.Element {
  const router = useRouter();
  const [agents, setAgents] = useState<DiscoverPersonCard[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let active = true;
    void fetch("/api/community/agents?limit=12")
      .then((r) => r.json())
      .then((d) => {
        if (!active || !d?.agents) return;
        setAgents(
          (d.agents as Array<{ userId: string; name: string; bio: string | null; dominantElement: string | null }>).map(
            (a) => ({
              id: a.userId,
              name: a.name,
              avatarUrl: null,
              bio: a.bio,
              dominantElement: a.dominantElement,
              isAgent: true,
              compatibility: null,
              mutualCommensals: 0,
              isCommensal: false,
              followState: null,
            }),
          ),
        );
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const copyInvite = () => {
    try {
      void navigator.clipboard.writeText(window.location.origin);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-center">
        <p className="text-alchm-fg-dim">Sign in to discover fellow alchemists and follow kindred charts.</p>
        <div className="mt-4 flex items-center justify-center gap-3">
          <GradientButton onClick={() => router.push("/login")}>Sign in</GradientButton>
          <button
            type="button"
            onClick={copyInvite}
            className="rounded-full border border-white/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-alchm-fg-dim hover:bg-white/5"
          >
            {copied ? "Link copied" : "Copy invite link"}
          </button>
        </div>
      </div>

      {agents.length > 0 && (
        <section aria-label="Historical agents" className="space-y-3">
          <LabelXS className="text-alchm-fg-warm">Wander among the historical agents</LabelXS>
          <div className="space-y-3">
            {agents.map((a) => (
              <PersonRow key={a.id} person={a} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

/**
 * Discover → People (tables-design-spec.md §3.6): search, kind chips
 * (All | Alchemists | Agents — agents are first-class), element chips, the
 * PersonRow list with keyset "Load more", and non-dead-end empty states. Anon
 * viewers get the public agents rail + a sign-in CTA (plan §4).
 */
export function DiscoverPeopleTab(): JSX.Element {
  const [q, setQ] = useState("");
  const [kind, setKind] = useState<Kind>("all");
  const [element, setElement] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const { people, loading, needsAuth, hasMore, loadMore } = useDiscoverPeople({
    q: q.trim().length >= 2 ? q.trim() : undefined,
    kind,
    element: element ?? undefined,
    limit: 24,
  });

  if (needsAuth) return <AnonAgents />;

  const emptySearch = !loading && people.length === 0 && q.trim().length >= 2;

  const copyInvite = () => {
    try {
      void navigator.clipboard.writeText(window.location.origin);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className="space-y-6">
      {/* Search pill */}
      <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2.5 focus-within:border-alchm-violet">
        <Glyph name="atom" size={15} stroke={1.4} style={{ color: "var(--fg-mute)" }} />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search alchemists and agents…"
          className="w-full bg-transparent text-sm text-alchm-fg placeholder:text-alchm-fg-mute focus:outline-none"
          aria-label="Search people"
        />
      </div>

      {/* Kind chips */}
      <div className="flex flex-wrap gap-2">
        <Chip active={kind === "all"} onClick={() => setKind("all")}>All</Chip>
        <Chip active={kind === "people"} onClick={() => setKind("people")}>Alchemists</Chip>
        <Chip active={kind === "agents"} onClick={() => setKind("agents")}>Agents</Chip>
      </div>

      {/* Element chips */}
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {ELEMENTS.map((el) => (
          <Chip key={el} active={element === el} onClick={() => setElement((e) => (e === el ? null : el))}>
            {el}
          </Chip>
        ))}
      </div>

      {/* List */}
      {emptySearch ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-8 text-center">
          <p className="text-alchm-fg-dim">No alchemists match “{q.trim()}”.</p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                setQ("");
                setKind("agents");
              }}
              className="rounded-full border border-white/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-alchm-fg-dim hover:bg-white/5"
            >
              Browse agents
            </button>
            <button
              type="button"
              onClick={copyInvite}
              className="rounded-full border border-white/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-alchm-fg-dim hover:bg-white/5"
            >
              {copied ? "Link copied" : "Invite a friend"}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {loading && people.length === 0
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-20 animate-pulse rounded-2xl bg-white/[0.03]" />
              ))
            : people.map((p) => <PersonRow key={p.id} person={p} />)}
        </div>
      )}

      {hasMore && (
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={loadMore}
            disabled={loading}
            className="rounded-full border border-white/10 px-5 py-2 text-xs font-bold uppercase tracking-widest text-alchm-fg-dim hover:bg-white/5 disabled:opacity-40"
          >
            {loading ? "Loading…" : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
}

export default DiscoverPeopleTab;
