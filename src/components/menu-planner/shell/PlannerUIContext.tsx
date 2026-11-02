"use client";

/**
 * PlannerUIContext — the single source of truth for the planner shell's
 * UI state (which rail tab is open, which drawer/modal is showing, Week vs
 * Day view, snack-row visibility, click-to-place mode and the undo toast).
 *
 * Replaces the ~18 independent `useState` toggles that used to live in the
 * planner page. Domain state (meals, prefs, budget) stays in
 * MenuPlannerContext; this context only describes *presentation*.
 *
 * @file src/components/menu-planner/shell/PlannerUIContext.tsx
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from "react";
import type { DayOfWeek } from "@/types/menuPlanner";
import type { Recipe } from "@/types/recipe";

export type RailTab = "recipes" | "queue" | "pantry" | "ideas";
export type SettingsTab = "taste" | "budget" | "guests" | "cosmic";
export type PlannerModal =
  | "grocery"
  | "nutrition"
  | "share"
  | "template"
  | "harmony"
  | null;
export type PlannerView = "week" | "day";

export interface UndoToastState {
  id: number;
  message: string;
  onUndo?: () => void;
}

interface PlannerUIState {
  railOpen: boolean;
  railTab: RailTab;
  settingsOpen: boolean;
  settingsTab: SettingsTab;
  modal: PlannerModal;
  view: PlannerView;
  focusDay: DayOfWeek | null;
  showSnacks: boolean;
  placingRecipe: Recipe | null;
  detailRecipe: Recipe | null;
  undoToast: UndoToastState | null;
}

type Action =
  | { type: "openRail"; tab?: RailTab }
  | { type: "closeRail" }
  | { type: "toggleRail" }
  | { type: "openSettings"; tab?: SettingsTab }
  | { type: "closeSettings" }
  | { type: "setSettingsTab"; tab: SettingsTab }
  | { type: "openModal"; modal: Exclude<PlannerModal, null> }
  | { type: "closeModal" }
  | { type: "setView"; view: PlannerView; day?: DayOfWeek | null }
  | { type: "setFocusDay"; day: DayOfWeek | null }
  | { type: "setShowSnacks"; value: boolean }
  | { type: "startPlacing"; recipe: Recipe }
  | { type: "stopPlacing" }
  | { type: "showDetail"; recipe: Recipe | null }
  | { type: "toast"; toast: UndoToastState | null };

function reducer(state: PlannerUIState, action: Action): PlannerUIState {
  switch (action.type) {
    case "openRail":
      return { ...state, railOpen: true, railTab: action.tab ?? state.railTab };
    case "closeRail":
      return { ...state, railOpen: false };
    case "toggleRail":
      return { ...state, railOpen: !state.railOpen };
    case "openSettings":
      return {
        ...state,
        settingsOpen: true,
        settingsTab: action.tab ?? state.settingsTab,
      };
    case "closeSettings":
      return { ...state, settingsOpen: false };
    case "setSettingsTab":
      return { ...state, settingsTab: action.tab };
    case "openModal":
      return { ...state, modal: action.modal };
    case "closeModal":
      return { ...state, modal: null };
    case "setView":
      return {
        ...state,
        view: action.view,
        focusDay: action.day !== undefined ? action.day : state.focusDay,
      };
    case "setFocusDay":
      return { ...state, focusDay: action.day };
    case "setShowSnacks":
      return { ...state, showSnacks: action.value };
    case "startPlacing":
      return { ...state, placingRecipe: action.recipe, detailRecipe: null };
    case "stopPlacing":
      return { ...state, placingRecipe: null };
    case "showDetail":
      return { ...state, detailRecipe: action.recipe };
    case "toast":
      return { ...state, undoToast: action.toast };
    default:
      return state;
  }
}

const SNACKS_KEY = "planner:showSnacks";
const RAIL_KEY = "planner:railOpen";

const INITIAL_STATE: PlannerUIState = {
  railOpen: false,
  railTab: "recipes",
  settingsOpen: false,
  settingsTab: "taste",
  modal: null,
  view: "week",
  focusDay: null,
  showSnacks: false,
  placingRecipe: null,
  detailRecipe: null,
  undoToast: null,
};

interface PlannerUIContextValue {
  state: PlannerUIState;
  openRail: (tab?: RailTab) => void;
  closeRail: () => void;
  toggleRail: () => void;
  openSettings: (tab?: SettingsTab) => void;
  closeSettings: () => void;
  setSettingsTab: (tab: SettingsTab) => void;
  openModal: (modal: Exclude<PlannerModal, null>) => void;
  closeModal: () => void;
  setView: (view: PlannerView, day?: DayOfWeek | null) => void;
  setFocusDay: (day: DayOfWeek | null) => void;
  setShowSnacks: (value: boolean) => void;
  startPlacing: (recipe: Recipe) => void;
  stopPlacing: () => void;
  showDetail: (recipe: Recipe | null) => void;
  /** Show a transient toast, optionally with an Undo action. */
  notify: (message: string, onUndo?: () => void) => void;
  dismissToast: () => void;
}

const PlannerUIContext = createContext<PlannerUIContextValue | null>(null);

export function PlannerUIProvider({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const toastSeq = useRef(0);

  // Restore persisted layout preferences after mount (SSR-safe).
  useEffect(() => {
    try {
      const snacks = window.localStorage.getItem(SNACKS_KEY);
      if (snacks !== null) {
        dispatch({ type: "setShowSnacks", value: snacks === "1" });
      }
      const rail = window.localStorage.getItem(RAIL_KEY);
      if (rail !== null) {
        if (rail === "1" && window.innerWidth >= 1024) dispatch({ type: "openRail" });
        else if (rail === "0") dispatch({ type: "closeRail" });
      } else if (window.innerWidth >= 1024) {
        dispatch({ type: "openRail" });
      }
    } catch {
      // Storage unavailable (private mode) — defaults are fine.
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(SNACKS_KEY, state.showSnacks ? "1" : "0");
      window.localStorage.setItem(RAIL_KEY, state.railOpen ? "1" : "0");
    } catch {
      // ignore
    }
  }, [state.showSnacks, state.railOpen]);

  // Esc cancels click-to-place mode.
  useEffect(() => {
    if (!state.placingRecipe) return undefined;
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") dispatch({ type: "stopPlacing" });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state.placingRecipe]);

  // Auto-dismiss the toast.
  useEffect(() => {
    if (!state.undoToast) return undefined;
    const { id } = state.undoToast;
    const timer = window.setTimeout(() => {
      if (toastSeq.current === id) dispatch({ type: "toast", toast: null });
    }, state.undoToast.onUndo ? 7000 : 3500);
    return () => window.clearTimeout(timer);
  }, [state.undoToast]);

  const notify = useCallback((message: string, onUndo?: () => void) => {
    toastSeq.current += 1;
    dispatch({
      type: "toast",
      toast: {
        id: toastSeq.current,
        message,
        ...(onUndo ? { onUndo } : {}),
      },
    });
  }, []);

  const value = useMemo<PlannerUIContextValue>(
    () => ({
      state,
      openRail: (tab) => dispatch({ type: "openRail", ...(tab ? { tab } : {}) }),
      closeRail: () => dispatch({ type: "closeRail" }),
      toggleRail: () => dispatch({ type: "toggleRail" }),
      openSettings: (tab) =>
        dispatch({ type: "openSettings", ...(tab ? { tab } : {}) }),
      closeSettings: () => dispatch({ type: "closeSettings" }),
      setSettingsTab: (tab) => dispatch({ type: "setSettingsTab", tab }),
      openModal: (modal) => dispatch({ type: "openModal", modal }),
      closeModal: () => dispatch({ type: "closeModal" }),
      setView: (view, day) =>
        dispatch({ type: "setView", view, ...(day !== undefined ? { day } : {}) }),
      setFocusDay: (day) => dispatch({ type: "setFocusDay", day }),
      setShowSnacks: (v) => dispatch({ type: "setShowSnacks", value: v }),
      startPlacing: (recipe) => {
        dispatch({ type: "startPlacing", recipe });
        if (window.innerWidth < 1024) dispatch({ type: "closeRail" });
      },
      stopPlacing: () => dispatch({ type: "stopPlacing" }),
      showDetail: (recipe) => {
        dispatch({ type: "showDetail", recipe });
        if (recipe && window.innerWidth < 1024) dispatch({ type: "closeRail" });
      },
      notify,
      dismissToast: () => dispatch({ type: "toast", toast: null }),
    }),
    [state, notify],
  );

  return (
    <PlannerUIContext.Provider value={value}>
      {children}
    </PlannerUIContext.Provider>
  );
}

export function usePlannerUI(): PlannerUIContextValue {
  const ctx = useContext(PlannerUIContext);
  if (!ctx) {
    throw new Error("usePlannerUI must be used inside <PlannerUIProvider>");
  }
  return ctx;
}
