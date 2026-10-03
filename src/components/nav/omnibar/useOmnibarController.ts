"use client";

/**
 * The omnibar's behaviour, shared by the desktop dropdown and the mobile
 * sheet: results for the query, the active row, and what each key does.
 *
 * Keys (plan §6): ↑/↓ walk every row, hero included; ←/→ move along the
 * hero and its action chips; ↵ opens or runs the active row, or, with none
 * active, applies Smart Enter; ⌘/Ctrl+↵ opens in a new tab. Esc belongs to
 * the host: the dropdown closes, the sheet dismisses.
 */
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState, type KeyboardEvent } from "react";
import { buildOmnibarModel, smartEnterTarget, type EnterTarget, type OmnibarModel } from "./omnibarModel";
import { loadRecent, pushRecent } from "./recentPicks";
import { useHeroActions } from "./useHeroActions";
import { fetchOmnibar, searchKey, useOmniSearch } from "./useOmniSearch";
import type { ActionRow, LinkRow, OmnibarRow, SearchStatus } from "./omnibarTypes";

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
  /** Open a row, or run an action in place (a chip clicked as a button). */
  activate: (row: OmnibarRow, newTab: boolean) => void;
  /** What the last in-place action did ("Added Spinach to your pantry"). */
  notice: string | null;
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
  activate: (row: OmnibarRow, newTab: boolean) => void;
  smartEnter: (newTab: boolean) => Promise<void>;
}

/** ←/→ from the hero or a chip: the next chip, or back to the hero. Elsewhere they stay the caret's. */
function sideways(key: string, deps: KeyDeps): number | null {
  const row = deps.rows[deps.activeIndex];
  if (row?.type !== "hero" && row?.type !== "action") return null;
  const target = deps.activeIndex + (key === "ArrowRight" ? 1 : -1);
  const next = deps.rows[target];
  return next?.type === "action" || (key === "ArrowLeft" && next?.type === "hero") ? target : null;
}

function handleKey(event: KeyboardEvent<HTMLInputElement>, deps: KeyDeps): boolean {
  if (event.nativeEvent.isComposing) return false;
  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
    event.preventDefault();
    deps.setActiveIndex(step(deps.activeIndex, event.key === "ArrowDown" ? 1 : -1, deps.rows.length));
    return true;
  }
  if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
    const target = sideways(event.key, deps);
    if (target === null) return false;
    event.preventDefault();
    deps.setActiveIndex(target);
    return true;
  }
  if (event.key !== "Enter") return false;
  event.preventDefault();
  const newTab = event.metaKey || event.ctrlKey;
  const row = deps.rows[deps.activeIndex];
  if (row) deps.activate(row, newTab);
  else deps.smartEnter(newTab).catch(() => undefined);
  return true;
}

function useActivate(go: Go, runInPlace: (row: ActionRow) => boolean): (row: OmnibarRow, newTab: boolean) => void {
  return useCallback(
    (row: OmnibarRow, newTab: boolean) => {
      if (row.type === "action") {
        if (!runInPlace(row)) go(row.href, newTab);
        return;
      }
      pushRecent(row);
      go(row.href, newTab || (row.type === "link" && row.external));
    },
    [go, runInPlace],
  );
}

/** The active row by id, so results arriving under the pointer never move the selection to another row. */
interface Active {
  query: string;
  id: string | null;
}

export function useOmnibarController(query: string, onDone: () => void): OmnibarController {
  const { status, data } = useOmniSearch(query);
  const [recent] = useState(loadRecent);
  const heroActions = useHeroActions(query);
  const heroState = heroActions.state;
  const model = useMemo(
    () => buildOmnibarModel({ query, response: data, status, recent, heroState }),
    [query, data, status, recent, heroState],
  );
  const rows = useMemo(() => model.sections.flatMap((section) => section.rows), [model]);
  const [active, setActive] = useState<Active>({ query, id: null });
  // A new query starts with no row active, so ↵ is Smart Enter again.
  const activeIndex = active.query === query ? rows.findIndex((row) => row.id === active.id) : -1;
  const setActiveIndex = useCallback((index: number) => setActive({ query, id: rows[index]?.id ?? null }), [query, rows]);
  const go = useGo(onDone);
  const smartEnter = useSmartEnter(query, model.exactNav, go);
  const activate = useActivate(go, heroActions.runInPlace);
  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>): boolean => handleKey(event, { rows, activeIndex, setActiveIndex, activate, smartEnter }),
    [activate, activeIndex, rows, setActiveIndex, smartEnter],
  );
  const onPicked = useCallback(
    (row: OmnibarRow) => {
      if (row.type !== "action") pushRecent(row);
      onDone();
    },
    [onDone],
  );
  const enter = searchKey(query) ? smartEnterTarget(query, model.exactNav, status === "ready" ? data : null) : null;
  return { model, rows, status, activeIndex, setActiveIndex, enter, onKeyDown, onPicked, activate, notice: heroActions.notice };
}
