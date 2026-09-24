"use client";

/**
 * Desktop results, dropped below the header's search input (owner decision,
 * round 2). Lazy-loaded on first focus (D3). The input stays in the header
 * shell, so this registers its key handler there and reports the active
 * row for the input's aria-activedescendant.
 */
import { useEffect, type JSX, type MutableRefObject } from "react";
import { OmnibarResults } from "./OmnibarResults";
import { OMNIBAR_RESULTS_CSS } from "./omnibarStyles";
import { useOmnibarController, type OmnibarKeyHandler } from "./useOmnibarController";

export interface OmnibarDropdownProps {
  query: string;
  listboxId: string;
  /** A row or Smart Enter navigated: close, clear, blur. */
  onDone: () => void;
  keyHandlerRef: MutableRefObject<OmnibarKeyHandler | null>;
  onActiveIndexChange: (index: number) => void;
}

export function OmnibarDropdown({
  query,
  listboxId,
  onDone,
  keyHandlerRef,
  onActiveIndexChange,
}: OmnibarDropdownProps): JSX.Element {
  const controller = useOmnibarController(query, onDone);
  const { onKeyDown, activeIndex } = controller;

  useEffect(() => {
    keyHandlerRef.current = onKeyDown;
    return (): void => {
      keyHandlerRef.current = null;
    };
  }, [keyHandlerRef, onKeyDown]);

  useEffect(() => {
    onActiveIndexChange(activeIndex);
  }, [activeIndex, onActiveIndexChange]);

  useEffect(() => (): void => onActiveIndexChange(-1), [onActiveIndexChange]);

  return (
    <div className="omni-dropdown">
      <style>{OMNIBAR_RESULTS_CSS}</style>
      <OmnibarResults controller={controller} listboxId={listboxId} keepInputFocus />
    </div>
  );
}
