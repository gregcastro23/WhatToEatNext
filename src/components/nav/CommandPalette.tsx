"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, type JSX } from "react";
import { Glyph, type GlyphName } from "@/components/ui/alchm/Glyph";
import { getAllNavRoutes, type FlatNavEntry } from "@/config/navigation";

interface PaletteItem {
  id: string;
  icon: GlyphName;
  label: string;
  hint: string;
  href?: string;
  external?: boolean;
  /** When set, invoking the item dispatches a custom event instead of navigating. */
  action?: string;
}

interface PaletteGroup {
  title: string;
  items: PaletteItem[];
}

const RECENT_KEY = "alchm:palette:recent";

const QUICK_ACTIONS: PaletteItem[] = [
  { id: "action:compose", icon: "flask", label: "Compose tonight's menu", hint: "RECIPE BUILDER · ENTER", href: "/recipe-builder" },
  { id: "action:pantry", icon: "mortar", label: "Open the pantry", hint: "PANTRY · ENTER", href: "/pantry" },
  { id: "action:commensal", icon: "ring", label: "Plan a commensal gathering", hint: "COMMENSAL · ENTER", href: "/commensal" },
  { id: "action:upgrade", icon: "diamond", label: "Upgrade to Alchemist", hint: "PREMIUM · ENTER", href: "/premium" },
  { id: "action:security", icon: "atom", label: "Account & sessions", hint: "SECURITY · ENTER", href: "/profile/security" },
];

function routeToItem(r: FlatNavEntry): PaletteItem {
  return {
    id: r.key,
    icon: r.glyph,
    label: r.label,
    hint: r.hint.toUpperCase(),
    href: r.path,
    external: r.external,
  };
}

function loadRecent(): PaletteItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.slice(0, 5).filter(
      (x: unknown): x is PaletteItem =>
        !!x && typeof x === "object" && typeof (x as PaletteItem).id === "string",
    );
  } catch {
    return [];
  }
}

function pushRecent(item: PaletteItem): void {
  if (typeof window === "undefined") return;
  try {
    const current = loadRecent().filter((x) => x.id !== item.id);
    current.unshift(item);
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(current.slice(0, 8)));
  } catch {
    /* swallow */
  }
}

/**
 * ⌘K command palette. Replaces the inline search affordance with a single
 * surface that indexes routes, quick actions, and recent picks.
 *
 * Open/close is controlled via three signals (in order of priority):
 *   1. Window event "alchm:palette:open"
 *   2. Keyboard shortcut: Cmd/Ctrl + K
 *   3. Programmatic state (controlled prop)
 */
export function CommandPalette(): JSX.Element | null {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [recent, setRecent] = useState<PaletteItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Global open/close events + keyboard shortcut
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toLowerCase().includes("mac");
      const cmd = isMac ? e.metaKey : e.ctrlKey;
      if (cmd && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
        return;
      }
      if (e.key === "Escape" && open) {
        e.preventDefault();
        setOpen(false);
      }
    };
    const onOpen = () => setOpen(true);
    const onClose = () => setOpen(false);
    window.addEventListener("keydown", onKey);
    window.addEventListener("alchm:palette:open", onOpen);
    window.addEventListener("alchm:palette:close", onClose);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("alchm:palette:open", onOpen);
      window.removeEventListener("alchm:palette:close", onClose);
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      setRecent(loadRecent());
      setQuery("");
      setSelectedIdx(0);
      // Defer focus so the modal mounts first
      const id = requestAnimationFrame(() => inputRef.current?.focus());
      return () => cancelAnimationFrame(id);
    }
  }, [open]);

  // Build groups from NAV_IA + recent + actions
  const groups: PaletteGroup[] = useMemo(() => {
    const routeItems = getAllNavRoutes().map(routeToItem);
    const q = query.trim().toLowerCase();

    const filter = (xs: PaletteItem[]) =>
      q
        ? xs.filter(
            (x) =>
              x.label.toLowerCase().includes(q) ||
              x.hint.toLowerCase().includes(q),
          )
        : xs;

    const groupList: PaletteGroup[] = [];

    if (recent.length > 0 && !q) {
      groupList.push({ title: "RECENT", items: recent.slice(0, 5) });
    }

    const filteredRoutes = filter(routeItems);
    if (filteredRoutes.length > 0) {
      groupList.push({ title: "ROUTES", items: filteredRoutes.slice(0, 12) });
    }

    const filteredActions = filter(QUICK_ACTIONS);
    if (filteredActions.length > 0) {
      groupList.push({ title: "ACTIONS", items: filteredActions });
    }

    return groupList;
  }, [query, recent]);

  const flatItems: PaletteItem[] = useMemo(
    () => groups.flatMap((g) => g.items),
    [groups],
  );

  // Keep selectedIdx in range
  useEffect(() => {
    if (selectedIdx >= flatItems.length) {
      setSelectedIdx(Math.max(0, flatItems.length - 1));
    }
  }, [flatItems.length, selectedIdx]);

  const runItem = useCallback(
    (item: PaletteItem, openInNewTab = false) => {
      pushRecent(item);
      setOpen(false);
      if (item.action) {
        window.dispatchEvent(new CustomEvent(item.action));
        return;
      }
      if (!item.href) return;
      if (item.external) {
        window.open(item.href, "_blank", "noopener");
        return;
      }
      if (openInNewTab) {
        window.open(item.href, "_blank", "noopener");
      } else {
        router.push(item.href);
      }
    },
    [router],
  );

  const onKey = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIdx((i) => Math.min(flatItems.length - 1, i + 1));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIdx((i) => Math.max(0, i - 1));
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        const item = flatItems[selectedIdx];
        if (item) runItem(item, e.metaKey || e.ctrlKey);
      }
    },
    [flatItems, selectedIdx, runItem],
  );

  if (!open) return null;

  let runningIndex = -1;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
      className="alchm-palette-root"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(7,6,11,0.7)",
        backdropFilter: "blur(8px)",
        display: "flex",
        justifyContent: "center",
        paddingTop: "min(110px, 12vh)",
      }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) setOpen(false);
      }}
      onKeyDown={onKey}
    >
      <div
        ref={containerRef}
        className="alchm-panel-glow"
        style={{
          width: "min(680px, calc(100% - 32px))",
          height: "fit-content",
          maxHeight: "min(560px, calc(100vh - 200px))",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(180deg, rgba(20,16,30,0.97), rgba(14,12,22,0.97))",
          overflow: "hidden",
          color: "var(--fg)",
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* input */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            padding: "18px 22px",
            borderBottom: "1px solid var(--line)",
          }}
        >
          <Glyph name="search" size={18} stroke={1.4} style={{ color: "var(--fg-mute)" }} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIdx(0);
            }}
            placeholder="Search · navigate · do"
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              color: "var(--fg)",
              fontSize: 18,
              fontFamily: "var(--f-body)",
            }}
            aria-label="Search the kitchen"
          />
          <kbd
            className="t-mono"
            style={{
              fontSize: 10,
              color: "var(--fg-mute)",
              padding: "3px 8px",
              border: "1px solid var(--line)",
              borderRadius: 4,
            }}
          >
            ESC
          </kbd>
        </div>

        {/* groups */}
        <div style={{ flex: 1, overflow: "auto", padding: "6px 0" }}>
          {flatItems.length === 0 ? (
            <div
              style={{
                padding: "30px 22px",
                textAlign: "center",
                color: "var(--fg-mute)",
                fontSize: 13,
              }}
            >
              No results for <span className="t-mono" style={{ color: "var(--fg-dim)" }}>{query}</span>
            </div>
          ) : (
            groups.map((g) => (
              <div key={g.title} style={{ padding: "6px 12px 10px" }}>
                <div
                  className="t-tag"
                  style={{ padding: "8px 10px 6px", fontSize: 9 }}
                >
                  {g.title}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  {g.items.map((item) => {
                    runningIndex += 1;
                    const idx = runningIndex;
                    const sel = idx === selectedIdx;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onMouseEnter={() => setSelectedIdx(idx)}
                        onClick={(e) => runItem(item, e.metaKey || e.ctrlKey)}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "28px 1fr auto",
                          gap: 12,
                          alignItems: "center",
                          padding: "10px 12px",
                          borderRadius: 8,
                          cursor: "pointer",
                          width: "100%",
                          textAlign: "left",
                          border: "none",
                          background: sel
                            ? "color-mix(in oklch, var(--accent), transparent 86%)"
                            : "transparent",
                          color: "inherit",
                        }}
                      >
                        <div
                          style={{
                            width: 26,
                            height: 26,
                            borderRadius: 6,
                            background: "rgba(255,255,255,0.04)",
                            border: "1px solid var(--line)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: sel ? "var(--accent)" : "var(--fg-mute)",
                          }}
                        >
                          <Glyph name={item.icon} size={12} stroke={1.4} />
                        </div>
                        <div>
                          <div style={{ fontSize: 13, color: sel ? "var(--fg)" : "var(--fg-dim)" }}>
                            {item.label}
                          </div>
                          <div
                            className="t-mono"
                            style={{
                              fontSize: 9,
                              color: "var(--fg-mute)",
                              letterSpacing: "0.12em",
                              marginTop: 2,
                            }}
                          >
                            {item.hint}
                          </div>
                        </div>
                        {sel && (
                          <Glyph name="arrow" size={12} stroke={1.4} style={{ color: "var(--accent)" }} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* footer hint bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "10px 22px",
            borderTop: "1px solid var(--line)",
            background: "rgba(255,255,255,0.015)",
          }}
        >
          <div
            className="t-mono"
            style={{
              fontSize: 9,
              color: "var(--fg-mute)",
              letterSpacing: "0.14em",
              display: "flex",
              gap: 18,
              flexWrap: "wrap",
            }}
          >
            <span>
              <kbd style={kbdStyle}>↑↓</kbd> NAVIGATE
            </span>
            <span>
              <kbd style={kbdStyle}>↵</kbd> OPEN
            </span>
            <span>
              <kbd style={kbdStyle}>⌘↵</kbd> NEW TAB
            </span>
          </div>
          <div
            className="t-mono"
            style={{
              fontSize: 9,
              color: "var(--fg-faint)",
              letterSpacing: "0.14em",
            }}
          >
            {flatItems.length} RESULTS
          </div>
        </div>
      </div>
    </div>
  );
}

const kbdStyle: React.CSSProperties = {
  fontFamily: "var(--f-mono)",
  fontSize: 9,
  padding: "1px 5px",
  border: "1px solid var(--line)",
  borderRadius: 3,
  marginRight: 4,
  color: "var(--fg-dim)",
};

export default CommandPalette;
