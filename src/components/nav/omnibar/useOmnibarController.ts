"use client";

/**
 * The omnibar's behaviour, shared by the desktop dropdown and the mobile
 * sheet: results for the query, the active row, and what each key does.
 *
 * Keys (plan §6): ↑/↓ walk every row, hero included; ↵ opens the active row,
 * or, with none active, applies Smart Enter; ⌘/Ctrl+↵ opens in a new tab.
 * Esc belongs to the host: the dropdown closes, the sheet dismisses.
 */
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState, type KeyboardEvent } from "react";
import { buildOmnibarModel, smartEnterTarget, type EnterTarget, type OmnibarModel } from "./omnibarModel";
import { loadRecent, pushRecent } from "./recentPicks";
import { fetchOmnibar, searchKey, useOmniSearch } from "./useOmniSearch";
import type { LinkRow, OmnibarRow, SearchStatus } from "./omnibarTypes";

export type OmnibarKeyHandler = (event: KeyboardEvent<HTMLInputElement>) => boolean;

export interface OmnibarController {
  model: OmnibarModel;
  rows: OmnibarRow[];
  status: SearchStatus;
  /** -1 = none: ↵ then means Smart Enter. */
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  enter: EnterTarget | null;
  /** True when the key was the omnibar's; the caller then stops. */
  onKeyDown: OmnibarKeyHandler;
  /** A row was chosen by pointer; the link itself navigates. */
  onPicked: (row: OmnibarRow) => void;
}

type Go = (href: string, newTab: boolean) => void;

function step(index: number, delta: 1 | -1, count: number): number {
  if (count === 0) return -1;
  if (index < 0) return delta === 1 ? 0 : count - 1;
  return (index + delta + count) % count;
}

function useGo(onDone: () => void): Go {
  const router = useRouter();
  return useCallback(
    (href: string, newTab: boolean) => {
      onDone();
      if (newTab) window.open(href, "_blank", "noopener");
      else router.push(href);
    },
    [onDone, router],
  );
}

/** Decided on this query's own results, fetched now if the debounce has not fired. */
function useSmartEnter(query: string, exactNav: LinkRow | null, go: Go): (newTab: boolean) => Promise<void> {
  return useCallback(
    async (newTab: boolean) => {
      const key = searchKey(query);
      if (!key) return;
      const response = exactNav ? null : await fetchOmnibar(key).catch(() => null);
      go(smartEnterTarget(query, exactNav, response).href, newTab);
    },
    [exactNav, go, query],
  );
}

interface KeyDeps {
  rows: OmnibarRow[];
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  go: Go;
  smartEnter: (newTab: boolean) => Promise<void>;
}

function handleKey(event: KeyboardEvent<HTMLInputElement>, deps: KeyDeps): boolean {
  if (event.nativeEvent.isComposing) return false;
  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
    event.preventDefault();
    deps.setActiveIndex(step(deps.activeIndex, event.key === "ArrowDown" ? 1 : -1, deps.rows.length));
    return true;
  }
  if (event.key !== "Enter") return false;
  event.preventDefault();
  const newTab = event.metaKey || event.ctrlKey;
  const row = deps.rows[deps.activeIndex];
  if (!row) {
    deps.smartEnter(newTab).catch(() => undefined);
    return true;
  }
  pushRecent(row);
  deps.go(row.href, newTab || (row.type === "link" && row.external));
  return true;
}

/** The active row by id, so results arriving under the pointer never move the selection to another row. */
interface Active {
  query: string;
  id: string | null;
}

export function useOmnibarController(query: string, onDone: () => void): OmnibarController {
  const { status, data } = useOmniSearch(query);
  const [recent] = useState(loadRecent);
  const model = useMemo(() => buildOmnibarModel({ query, response: data, status, recent }), [query, data, status, recent]);
  const rows = useMemo(() => model.sections.flatMap((section) => section.rows), [model]);
  const [active, setActive] = useState<Active>({ query, id: null });
  // A new query starts with no row active, so ↵ is Smart Enter again.
  const activeIndex = active.query === query ? rows.findIndex((row) => row.id === active.id) : -1;
  const setActiveIndex = useCallback((index: number) => setActive({ query, id: rows[index]?.id ?? null }), [query, rows]);
  const go = useGo(onDone);
  const smartEnter = useSmartEnter(query, model.exactNav, go);
  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>): boolean => handleKey(event, { rows, activeIndex, setActiveIndex, go, smartEnter }),
    [activeIndex, go, rows, setActiveIndex, smartEnter],
  );
  const onPicked = useCallback(
    (row: OmnibarRow) => {
      pushRecent(row);
      onDone();
    },
    [onDone],
  );
  const enter = searchKey(query) ? smartEnterTarget(query, model.exactNav, status === "ready" ? data : null) : null;
  return { model, rows, status, activeIndex, setActiveIndex, enter, onKeyDown, onPicked };
}
