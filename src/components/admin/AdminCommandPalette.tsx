"use client";

/**
 * Global ⌘K Admin Jump Palette — keyboard launcher across /admin consoles,
 * Share-Link (?ref=) cohorts, Visitor #ids, routes, and interaction tags.
 *
 * @file src/components/admin/AdminCommandPalette.tsx
 */

import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

const TOGGLE_PALETTE_EVENT = "alchm:toggle-command-palette";
export const TRAFFIC_NAV_EVENT = "alchm:traffic-nav";

interface PaletteItem {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  badge: string;
  keywords?: string;
}

function staticItem(
  id: string,
  title: string,
  subtitle: string,
  href: string,
  badge: string,
  keywords: string,
): PaletteItem {
  return { id, title, subtitle, href, badge, keywords };
}

const STATIC_ITEMS: readonly PaletteItem[] = [
  staticItem("preset-open-feedback", "Open Feedback Triage", "View sessions with unresolved contextual feedback notes", "/admin/traffic?preset=open_feedback", "Preset", "feedback triage notes resolve open_feedback preset:open_feedback"),
  staticItem("preset-frustrated", "Frustrated Sessions (Rage / Dead Click / Quick Back)", "Sessions with rage clicks, dead clicks, quick backs, or slow CWV", "/admin/traffic?preset=frustrated", "Preset", "friction rage dead quick_back slow_inp slow_lcp frustrated preset:frustrated"),
  staticItem("preset-error", "Hit Error Sessions", "Sessions encountering client runtime errors or API 5xx responses", "/admin/traffic?preset=error", "Preset", "error api_500 runtime crash bug"),
  staticItem("preset-live", "Live Visitors Now (90s)", "Human sessions sending active-tab heartbeats right now", "/admin/traffic?preset=live", "Live", "live active now realtime"),
  staticItem("view-every-site-view", "Every Site View Ledger", "Chronological table of every individual page view, step & action", "/admin/traffic?view=views", "Views", "raw views ledger every site view step entry exit"),
  staticItem("console-traffic", "Traffic & Visitor Journeys", "Full telemetry, funnels, pathfinder matrix, and interaction tally", "/admin/traffic", "Console", "traffic journeys funnel pathfinder stickiness"),
  staticItem("console-overview", "Admin Overview", "Pulse strip, Live Activity stream, and System Status", "/admin", "Console", "overview pulse home"),
  staticItem("console-users", "Users Console", "Registered users directory and per-user timelines", "/admin/users", "Console", "users accounts timeline email"),
  staticItem("console-growth", "Growth Console", "Signups, cohorts, and search gaps", "/admin/growth", "Console", "growth signups cohorts"),
  staticItem("console-revenue", "Revenue Console", "Stripe subscriptions, charges, and payouts", "/admin/revenue", "Console", "revenue stripe money subscriptions"),
  staticItem("console-code-health", "Code Health", "Typecheck, lint, test gates, and build telemetry", "/admin/code-health", "Console", "code health build ci tests"),
];

function buildDynamicPaletteItems(trimmed: string): PaletteItem[] {
  if (!trimmed) return [];
  const dynamic: PaletteItem[] = [];
  if (trimmed.startsWith("#") || /^[0-9a-f]{6,24}$/i.test(trimmed)) {
    const clean = trimmed.replace(/^#/, "");
    if (clean) {
      dynamic.push({ id: "dyn-visitor", title: `Inspect Visitor #${clean}`, subtitle: "Filter /admin/traffic journeys & views by visitor or session ID", href: `/admin/traffic?q=${encodeURIComponent(clean)}`, badge: "Visitor" });
    }
  }
  if (trimmed.includes("@")) {
    dynamic.push(
      { id: "dyn-email-traffic", title: `Filter Traffic by "${trimmed}"`, subtitle: "Inspect sessions matching this email in /admin/traffic", href: `/admin/traffic?q=${encodeURIComponent(trimmed)}`, badge: "Traffic" },
      { id: "dyn-email-users", title: `Search Users for "${trimmed}"`, subtitle: "Jump to /admin/users directory filter", href: `/admin/users?q=${encodeURIComponent(trimmed)}`, badge: "Users" },
    );
  }
  if (/^(\??ref:|\?ref=)/i.test(trimmed)) {
    const tag = trimmed.replace(/^(\??ref:|\?ref=)/i, "").trim();
    if (tag) dynamic.push({ id: "dyn-ref", title: `Filter Share-Link Cohort ref:${tag}`, subtitle: "Inspect campaign & reviewer sessions in /admin/traffic", href: `/admin/traffic?ref=${encodeURIComponent(tag)}`, badge: "?ref=" });
  }
  if (trimmed.startsWith("/")) {
    dynamic.push(
      { id: "dyn-route-views", title: `Inspect Route Views for ${trimmed}`, subtitle: "Open Every Site View ledger filtered by this route path", href: `/admin/traffic?q=${encodeURIComponent(trimmed)}&view=views`, badge: "Views" },
      { id: "dyn-route-friction", title: `Inspect Frustrated Sessions on ${trimmed}`, subtitle: "Filter sessions with rage/dead clicks or slow CWV on this route", href: `/admin/traffic?q=${encodeURIComponent(trimmed)}&preset=frustrated`, badge: "Friction" },
    );
  }
  if (/^(\??preset:|\?preset=)/i.test(trimmed)) {
    const preset = trimmed.replace(/^(\??preset:|\?preset=)/i, "").trim().toLowerCase();
    if (preset) dynamic.push({ id: "dyn-preset", title: `Activate Diagnostic Preset "${preset}"`, subtitle: "Open /admin/traffic with this diagnostic preset active", href: `/admin/traffic?preset=${encodeURIComponent(preset)}`, badge: "Preset" });
  }
  if (trimmed.includes(":") && !/^\??(ref|preset):/i.test(trimmed)) {
    dynamic.push({ id: "dyn-interaction", title: `Filter Views by Interaction ${trimmed}`, subtitle: "Show every view & session matching this interaction tag", href: `/admin/traffic?interaction=${encodeURIComponent(trimmed)}&view=views`, badge: "Tag" });
  }
  return dynamic;
}

export function buildCommandPaletteItems(query: string): PaletteItem[] {
  const trimmed = query.trim();
  const dynamic = buildDynamicPaletteItems(trimmed);
  const q = trimmed.toLowerCase();
  const staticMatches = STATIC_ITEMS.filter((item) => {
    if (!q) return true;
    return (
      item.title.toLowerCase().includes(q) ||
      item.subtitle.toLowerCase().includes(q) ||
      item.href.toLowerCase().includes(q) ||
      (item.keywords?.toLowerCase().includes(q) ?? false)
    );
  });
  return [...dynamic, ...staticMatches];
}

export function AdminCommandPaletteTrigger({
  className = "",
}: {
  className?: string;
}): React.JSX.Element {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new CustomEvent(TOGGLE_PALETTE_EVENT))}
      aria-label="Open admin command palette (⌘K)"
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-gray-600 bg-gray-700/80 hover:bg-gray-700 text-gray-200 text-xs font-medium transition-colors ${className}`}
    >
      <span>🔍 Jump</span>
      <kbd className="font-mono text-[10px] px-1 py-0.5 rounded bg-gray-800 text-gray-300 border border-gray-600">
        ⌘K
      </kbd>
    </button>
  );
}

function usePaletteShortcuts(
  open: boolean,
  setOpen: React.Dispatch<React.SetStateAction<boolean>>,
): void {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent): void => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      } else if (open && e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
      }
    };
    const onToggleEvent = (): void => setOpen((prev) => !prev);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener(TOGGLE_PALETTE_EVENT, onToggleEvent);
    return (): void => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener(TOGGLE_PALETTE_EVENT, onToggleEvent);
    };
  }, [open, setOpen]);
}

export default function AdminCommandPalette({
  hideTrigger = false,
}: {
  hideTrigger?: boolean;
}): React.JSX.Element {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const items = useMemo(() => buildCommandPaletteItems(query), [query]);

  useEffect(() => { setActiveIndex(0); }, [query]);
  useEffect(() => { if (open) window.setTimeout(() => inputRef.current?.focus(), 0); }, [open]);
  usePaletteShortcuts(open, setOpen);

  const navigateTo = useCallback(
    (href: string) => {
      setOpen(false);
      setQuery("");
      window.dispatchEvent(new CustomEvent<string>(TRAFFIC_NAV_EVENT, { detail: href }));
      router.push(href);
    },
    [router],
  );

  const onInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (items.length > 0 ? (prev + 1) % items.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (items.length > 0 ? (prev - 1 + items.length) % items.length : 0));
    } else if (e.key === "Enter" && items[activeIndex]) {
      e.preventDefault();
      navigateTo(items[activeIndex].href);
    }
  };

  return (
    <>
      {!hideTrigger && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open admin command palette (⌘K)"
          className="inline-flex items-center justify-between gap-2 w-full px-3 py-1.5 rounded-lg border border-gray-600 bg-gray-900/70 hover:bg-gray-700 text-gray-200 text-xs font-medium transition-colors"
        >
          <span>⌘K Jump</span>
          <span className="font-mono text-[10px] text-gray-400">#id · ref: · /route</span>
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
          <button
            type="button"
            aria-label="Close command palette"
            onClick={() => setOpen(false)}
            className="fixed inset-0 bg-black/50 cursor-default"
          />
          <div
            className="relative z-10 w-full max-w-xl rounded-xl border border-gray-200 bg-white shadow-2xl overflow-hidden text-gray-900"
            role="dialog"
            aria-modal="true"
            aria-label="Admin Jump Command Palette"
          >
            <div className="flex items-center border-b border-gray-200 px-3 py-2.5 gap-2">
              <span className="text-gray-400 text-sm">⌘K</span>
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onInputKeyDown}
                placeholder="Jump to #visitor, @email, ref:tag, /route, interaction:tag, or console…"
                aria-label="Command palette search"
                className="flex-1 text-sm text-gray-900 placeholder-gray-400 focus:outline-none bg-transparent"
              />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-[11px] font-mono text-gray-500 hover:text-gray-800 px-1.5 py-0.5 rounded border border-gray-200"
              >
                ESC
              </button>
            </div>

            <ul className="max-h-80 overflow-y-auto divide-y divide-gray-100">
              {items.length === 0 ? (
                <li className="px-4 py-6 text-center text-xs text-gray-500">
                  No matching presets or consoles.
                </li>
              ) : (
                items.map((item, idx) => {
                  const selected = idx === activeIndex;
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => navigateTo(item.href)}
                        onMouseEnter={() => setActiveIndex(idx)}
                        className={`w-full text-left px-4 py-2.5 flex items-center justify-between gap-3 transition-colors ${
                          selected ? "bg-indigo-50" : "hover:bg-gray-50"
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-gray-900 truncate">
                            {item.title}
                          </div>
                          <div className="text-[11px] text-gray-500 truncate">
                            {item.subtitle}
                          </div>
                        </div>
                        <span className="shrink-0 px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-mono text-[10px] font-semibold">
                          {item.badge}
                        </span>
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
