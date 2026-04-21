"use client";

import { useCallback, useEffect, useState } from "react";
import {
  addItem as addPantryItem,
  clearPantry as clearPantryItems,
  getPantry,
  getPantryStats,
  removeItem as removePantryItem,
  updateItem as updatePantryItem,
  type PantryItem,
  type PantryStats,
} from "@/utils/pantryManager";

const PANTRY_UPDATE_EVENT = "alchm:pantry:updated";

function emitPantryUpdate(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(PANTRY_UPDATE_EVENT));
}

export interface UsePantryResult {
  items: PantryItem[];
  stats: PantryStats;
  isLoaded: boolean;
  hasItem: (name: string) => boolean;
  addItem: (
    input: Omit<PantryItem, "id" | "addedDate"> & { addedDate?: Date },
  ) => PantryItem | null;
  removeItem: (id: string) => void;
  updateItem: (id: string, updates: Partial<Omit<PantryItem, "id">>) => void;
  clear: () => void;
  refresh: () => void;
}

const EMPTY_STATS: PantryStats = {
  totalItems: 0,
  expiringIn7Days: 0,
  expired: 0,
  categoryCounts: {},
};

export function usePantry(): UsePantryResult {
  const [items, setItems] = useState<PantryItem[]>([]);
  const [stats, setStats] = useState<PantryStats>(EMPTY_STATS);
  const [isLoaded, setIsLoaded] = useState(false);

  const refresh = useCallback(() => {
    if (typeof window === "undefined") return;
    setItems(getPantry());
    setStats(getPantryStats());
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    refresh();
    if (typeof window === "undefined") return;

    const onUpdate = () => refresh();
    const onStorage = (e: StorageEvent) => {
      if (e.key === "alchm_pantry") refresh();
    };

    window.addEventListener(PANTRY_UPDATE_EVENT, onUpdate);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(PANTRY_UPDATE_EVENT, onUpdate);
      window.removeEventListener("storage", onStorage);
    };
  }, [refresh]);

  const hasItem = useCallback(
    (name: string) =>
      items.some((item) => item.name.toLowerCase() === name.toLowerCase()),
    [items],
  );

  const addItem = useCallback<UsePantryResult["addItem"]>((input) => {
    if (typeof window === "undefined") return null;
    try {
      const added = addPantryItem(input);
      emitPantryUpdate();
      return added;
    } catch {
      return null;
    }
  }, []);

  const removeItem = useCallback((id: string) => {
    if (typeof window === "undefined") return;
    removePantryItem(id);
    emitPantryUpdate();
  }, []);

  const updateItem = useCallback<UsePantryResult["updateItem"]>((id, updates) => {
    if (typeof window === "undefined") return;
    updatePantryItem(id, updates);
    emitPantryUpdate();
  }, []);

  const clear = useCallback(() => {
    if (typeof window === "undefined") return;
    clearPantryItems();
    emitPantryUpdate();
  }, []);

  return {
    items,
    stats,
    isLoaded,
    hasItem,
    addItem,
    removeItem,
    updateItem,
    clear,
    refresh,
  };
}
