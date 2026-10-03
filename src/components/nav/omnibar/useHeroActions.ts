"use client";

/**
 * The hero's actions (plan §7 Phase 4): which cards are already in the local
 * pantry, which hero's pairings are showing, and the actions that act in
 * place. Cook with this, and Add to pantry once the card is there, navigate
 * like any row; the caller handles those.
 */
import { useCallback, useMemo, useState } from "react";
import { usePantry } from "@/hooks/usePantry";
import { titleCase } from "@/lib/ingredients/dossierView";
import type { HeroState } from "./omnibarHero";
import type { ActionRow } from "./omnibarTypes";

export interface HeroActions {
  state: HeroState;
  /** True when the action ran without leaving the omnibar. */
  runInPlace: (row: ActionRow) => boolean;
  /** What the last in-place action did, for the status line and screen readers. */
  notice: string | null;
}

interface Notice {
  query: string;
  text: string;
}

export function useHeroActions(query: string): HeroActions {
  const { items, addItem } = usePantry();
  const [pairingsFor, setPairingsFor] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const pantry = useMemo(() => new Set(items.map((item) => item.name.toLowerCase())), [items]);
  const state = useMemo<HeroState>(() => ({ pantry, pairingsFor }), [pantry, pairingsFor]);

  const runInPlace = useCallback(
    (row: ActionRow): boolean => {
      const { hero } = row;
      if (row.action === "pairings") {
        setPairingsFor((open) => (open === hero.key ? null : hero.key));
        return true;
      }
      if (row.action !== "pantry" || row.pressed) return false;
      // The ingredients page's convention for a card added from a list: one unit.
      const added = addItem({ name: hero.name, quantity: 1, unit: "unit", category: hero.category === "" ? "other" : hero.category });
      const name = titleCase(hero.name);
      setNotice({ query, text: added ? `Added ${name} to your pantry` : `Could not add ${name} to your pantry` });
      return true;
    },
    [addItem, query],
  );

  return { state, runInPlace, notice: notice?.query === query ? notice.text : null };
}
