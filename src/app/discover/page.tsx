"use client";

import { useEffect, useState, type JSX } from "react";
import { DiscoverPeopleTab } from "@/components/discover/DiscoverPeopleTab";
import { DiscoverTablesTab } from "@/components/discover/DiscoverTablesTab";
import { PantryDiscover } from "@/components/discover/PantryDiscover";
import { Glyph } from "@/components/ui/alchm/Glyph";

/**
 * Discover — the tables + people + pantry matchmaking surface
 * (docs/plans/pr6-discovery-mobile-plan.md §4, design-spec §3.6).
 *
 * A segmented [Tables | People | Pantry] shell driven by `?tab=` (default
 * `tables`). The original pantry launchpad is preserved verbatim under
 * [Pantry] (and `/discover?tab=pantry`); all existing deep links are untouched.
 *
 * @file src/app/discover/page.tsx
 */

type Tab = "tables" | "people" | "pantry";
const TABS: ReadonlyArray<{ id: Tab; label: string }> = [
  { id: "tables", label: "Tables" },
  { id: "people", label: "People" },
  { id: "pantry", label: "Pantry" },
];

function readInitialTab(): Tab {
  if (typeof window === "undefined") return "tables";
  const t = new URLSearchParams(window.location.search).get("tab");
  return t === "people" || t === "pantry" ? t : "tables";
}

export default function DiscoverPage(): JSX.Element {
  const [tab, setTab] = useState<Tab>("tables");

  // Read the initial tab from the URL after mount (avoids the useSearchParams
  // Suspense requirement) and keep the URL in sync on change.
  useEffect(() => {
    setTab(readInitialTab());
  }, []);

  const selectTab = (next: Tab) => {
    setTab(next);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (next === "tables") url.searchParams.delete("tab");
      else url.searchParams.set("tab", next);
      window.history.replaceState(null, "", url.toString());
    }
  };

  return (
    <div className="lab discover-root" style={{ minHeight: "calc(100vh - 64px)" }}>
      <div className="mx-auto max-w-6xl px-5 pt-11 md:pt-16">
        {/* Tables/People-specific hero — hidden on the Pantry tab, which
            renders its own original "Browse the cosmic pantry" header inside
            PantryDiscover (PR 6 adversarial-review finding 5: the pantry copy
            must survive the tabbed shell, not get replaced by this one). */}
        {tab !== "pantry" && (
          <>
            <span className="t-tag mb-4 inline-flex items-center gap-2" style={{ color: "var(--accent)" }}>
              <Glyph name="atom" size={14} stroke={1.4} />
              DISCOVER
            </span>
            <h1
              className="text-alchm-fg"
              style={{
                fontFamily: "var(--f-display)",
                fontWeight: 500,
                letterSpacing: "-0.01em",
                fontSize: "clamp(30px, 5vw, 46px)",
                lineHeight: 1.04,
                margin: 0,
              }}
            >
              Find your table
            </h1>
          </>
        )}

        {/* Segmented control */}
        <div
          role="tablist"
          aria-label="Discover sections"
          className="mt-6 inline-flex rounded-full border border-white/10 bg-white/[0.03] p-1"
        >
          {TABS.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                role="tab"
                aria-selected={active}
                onClick={() => selectTab(t.id)}
                className={`rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest transition-colors ${
                  active ? "bg-white/10 text-alchm-fg shadow-inner" : "text-alchm-fg-mute hover:text-alchm-fg-dim"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {tab === "pantry" ? (
        <div className="mt-6">
          <PantryDiscover />
        </div>
      ) : (
        <div className="mx-auto max-w-6xl px-5 pb-28 pt-6">
          {tab === "tables" ? (
            <DiscoverTablesTab onSwitchToPeople={() => selectTab("people")} />
          ) : (
            <DiscoverPeopleTab />
          )}
        </div>
      )}
    </div>
  );
}
