"use client";

/**
 * Mobile search: a full-screen sheet opened from the header's search icon
 * (owner decision, round 2). Modal, so focus is held inside it (the input
 * and Cancel; rows are reached with the arrow keys) and returned to the
 * icon by the host on close. The page behind does not scroll.
 */
import { useEffect, useRef, useState, type JSX, type KeyboardEvent, type RefObject } from "react";
import { createPortal } from "react-dom";
import { Glyph } from "@/components/ui/alchm/Glyph";
import { OmnibarResults } from "./OmnibarResults";
import { OMNIBAR_RESULTS_CSS } from "./omnibarStyles";
import { optionId } from "./omnibarTypes";
import { useOmnibarController } from "./useOmnibarController";

const LISTBOX_ID = "omnibar-sheet-results";

export interface OmnibarSheetProps {
  initialQuery: string;
  onClose: () => void;
}

/** Focus the input on open; the page behind stops scrolling until close. */
function useSheetLifecycle(inputRef: RefObject<HTMLInputElement | null>): void {
  useEffect(() => {
    inputRef.current?.focus();
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return (): void => {
      document.body.style.overflow = overflow;
    };
  }, [inputRef]);
}

interface SheetInputProps {
  inputRef: RefObject<HTMLInputElement | null>;
  query: string;
  activeIndex: number;
  onChange: (query: string) => void;
  onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
}

function SheetInput({ inputRef, query, activeIndex, onChange, onKeyDown }: SheetInputProps): JSX.Element {
  return (
    <input
      ref={inputRef}
      type="text"
      role="combobox"
      aria-label="Search ingredients, recipes, cuisines"
      aria-expanded="true"
      aria-controls={LISTBOX_ID}
      aria-autocomplete="list"
      aria-activedescendant={activeIndex >= 0 ? optionId(LISTBOX_ID, activeIndex) : undefined}
      placeholder="Search ingredients, recipes…"
      value={query}
      onChange={(event) => onChange(event.target.value)}
      onKeyDown={onKeyDown}
      autoComplete="off"
      autoCapitalize="none"
      autoCorrect="off"
      spellCheck={false}
      enterKeyHint="search"
    />
  );
}

export function OmnibarSheet({ initialQuery, onClose }: OmnibarSheetProps): JSX.Element {
  const [query, setQuery] = useState(initialQuery);
  const inputRef = useRef<HTMLInputElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const controller = useOmnibarController(query, onClose);
  useSheetLifecycle(inputRef);

  /** Esc dismisses; Tab moves between the only two stops, input and Cancel (the focus trap). */
  const onSheetKey = (event: KeyboardEvent<HTMLElement>): boolean => {
    if (event.key === "Escape") onClose();
    else if (event.key === "Tab") (event.currentTarget === inputRef.current ? cancelRef : inputRef).current?.focus();
    else return false;
    event.preventDefault();
    return true;
  };
  const onInputKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (!onSheetKey(event)) controller.onKeyDown(event);
  };
  const { activeIndex } = controller;
  return createPortal(
    <div className="omni-sheet" role="dialog" aria-modal="true" aria-label="Search">
      <style>{OMNIBAR_RESULTS_CSS}</style>
      <div className="omni-sheet-bar">
        <div className="omni-sheet-field">
          <Glyph name="search" size={16} stroke={1.4} />
          <SheetInput
            inputRef={inputRef}
            query={query}
            activeIndex={activeIndex}
            onChange={setQuery}
            onKeyDown={onInputKeyDown}
          />
        </div>
        <button ref={cancelRef} type="button" className="omni-sheet-cancel" onClick={onClose} onKeyDown={onSheetKey}>
          Cancel
        </button>
      </div>
      <OmnibarResults controller={controller} listboxId={LISTBOX_ID} keepInputFocus={false} />
    </div>,
    document.body,
  );
}
