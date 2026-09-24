"use client";

/**
 * The header's search (omnibar Phase 3, #870): an inline input on desktop and
 * a search icon on mobile. This file is all that loads with every page (D3);
 * results, the fetch and the sheet arrive in a lazy chunk on first use and
 * are prefetched on hover or focus.
 *
 * ⌘K (Ctrl+K off macOS) and the `alchm:palette:open` event focus the input,
 * or open the sheet below the desktop breakpoint. Until the chunk has
 * loaded, Enter still works: it goes to the full results page.
 */
import { track } from "@vercel/analytics";
import dynamic from "next/dynamic";
import { usePathname, useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type FocusEvent,
  type JSX,
  type KeyboardEvent,
  type MutableRefObject,
  type RefObject,
} from "react";
import { Glyph } from "@/components/ui/alchm/Glyph";
import { loadDropdown, loadSheet } from "./omnibarChunks";
import { optionId, searchHref } from "./omnibarTypes";
import type { OmnibarDropdownProps } from "./OmnibarDropdown";
import type { OmnibarSheetProps } from "./OmnibarSheet";
import type { OmnibarKeyHandler } from "./useOmnibarController";

const OmnibarDropdown = dynamic<OmnibarDropdownProps>(() => loadDropdown().then((m) => m.OmnibarDropdown), { ssr: false });
const OmnibarSheet = dynamic<OmnibarSheetProps>(() => loadSheet().then((m) => m.OmnibarSheet), { ssr: false });

/** Must match the `min-width` in SHELL_CSS: the input shows at and above it. */
const DESKTOP_QUERY = "(min-width: 768px)";

const SHELL_CSS = `
/*
 * Sized like the search button it replaces, so the header is no wider at any
 * width: the input's percentage width lets the field shrink from its natural
 * ~200px to min-width when squeezed. Between 900 and 1539 the header's pill
 * nav gets whatever width the right-hand group leaves it, so there the ⌘K hint
 * gives up its room: the field is 177px instead of 208px.
 */
.omni-inline {
  position: relative; display: none; align-items: center; gap: 8px;
  flex: 0 1 auto; min-width: 132px; max-width: 208px; padding: 0 8px 0 12px; height: 34px;
  background: rgba(255,255,255,0.025); border: 1px solid var(--line); border-radius: 8px; color: var(--fg-mute);
}
.omni-inline:focus-within { border-color: color-mix(in oklch, var(--accent), transparent 50%); background: rgba(255,255,255,0.04); }
.omni-inline input {
  flex: 1 1 0; width: 100%; min-width: 0; height: 100%; background: transparent; border: none; outline: none;
  color: var(--fg); font-size: 12px; font-family: var(--f-body); text-overflow: ellipsis;
}
.omni-inline input::placeholder { color: var(--fg-mute); }
.omni-inline kbd {
  font-family: var(--f-mono); font-size: 9px; color: var(--fg-faint);
  padding: 2px 6px; border: 1px solid var(--line); border-radius: 4px;
}
.omni-icon {
  display: inline-flex; align-items: center; justify-content: center; width: 36px; height: 36px;
  border-radius: 8px; background: rgba(255,255,255,0.025); border: 1px solid var(--line);
  color: var(--fg-mute); cursor: pointer;
}
@media (min-width: 768px) {
  .omni-inline { display: inline-flex; }
  .omni-icon { display: none; }
}
@media (min-width: 900px) and (max-width: 1539px) {
  .omni-inline kbd { display: none; }
}
`;

function ignore(): undefined {
  return undefined;
}

function prefetchDropdown(): void {
  loadDropdown().catch(ignore);
}

function prefetchSheet(): void {
  loadSheet().catch(ignore);
}

/** ⌘K / Ctrl+K and the palette event, for the half of the shell the viewport shows. */
function useOpenShortcut(onOpen: () => void, desktop: boolean): void {
  useEffect(() => {
    const matches = (): boolean => window.matchMedia(DESKTOP_QUERY).matches === desktop;
    const open = (): void => {
      if (!matches()) return;
      track("command_palette_open");
      onOpen();
    };
    const onKey = (event: globalThis.KeyboardEvent): void => {
      const mac = navigator.userAgent.includes("Mac");
      if (!(mac ? event.metaKey : event.ctrlKey) || event.key.toLowerCase() !== "k" || !matches()) return;
      event.preventDefault();
      open();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("alchm:palette:open", open);
    return (): void => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("alchm:palette:open", open);
    };
  }, [onOpen, desktop]);
}

interface InlineState {
  query: string;
  setQuery: (query: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  inputRef: RefObject<HTMLInputElement | null>;
  keyHandlerRef: MutableRefObject<OmnibarKeyHandler | null>;
  done: () => void;
  onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
}

function useInlineSearch(): InlineState {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const keyHandlerRef = useRef<OmnibarKeyHandler | null>(null);
  const focusInput = useCallback((): void => {
    inputRef.current?.focus();
    inputRef.current?.select();
    setOpen(true);
  }, []);
  useOpenShortcut(focusInput, true);
  // A navigation from anywhere (back button, a link on the page) closes the dropdown.
  useEffect(() => setOpen(false), [pathname]);
  const done = useCallback((): void => {
    setOpen(false);
    setQuery("");
    inputRef.current?.blur();
  }, []);
  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === "Escape") {
      event.preventDefault();
      if (open) setOpen(false);
      else setQuery("");
      return;
    }
    setOpen(true);
    if (keyHandlerRef.current?.(event) === true || event.key !== "Enter" || !query.trim()) return;
    event.preventDefault();
    router.push(searchHref(query));
    done();
  };
  return { query, setQuery, open, setOpen, inputRef, keyHandlerRef, done, onKeyDown };
}

function InlineSearch(): JSX.Element {
  const { query, setQuery, open, setOpen, inputRef, keyHandlerRef, done, onKeyDown } = useInlineSearch();
  const listboxId = `omnibar-${useId().replace(/[^\w-]/g, "")}`;
  const [activeIndex, setActiveIndex] = useState(-1);
  const wrapRef = useRef<HTMLDivElement>(null);
  // Rows never take focus (aria-activedescendant), so focus leaving the input leaves the omnibar.
  const onBlur = (event: FocusEvent<HTMLInputElement>): void => {
    const next = event.relatedTarget;
    if (!(next instanceof Node) || !wrapRef.current?.contains(next)) setOpen(false);
  };
  return (
    <div ref={wrapRef} className="omni-inline">
      <Glyph name="search" size={13} stroke={1.4} />
      <input
        ref={inputRef}
        type="text"
        role="combobox"
        aria-label="Search ingredients, recipes, cuisines"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        aria-autocomplete="list"
        aria-activedescendant={open && activeIndex >= 0 ? optionId(listboxId, activeIndex) : undefined}
        placeholder="Search ingredients, recipes, cuisines…"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onFocus={() => setOpen(true)}
        onBlur={onBlur}
        onPointerEnter={prefetchDropdown}
        onKeyDown={onKeyDown}
        autoComplete="off"
        spellCheck={false}
        enterKeyHint="search"
      />
      <kbd aria-hidden="true">⌘K</kbd>
      {open ? (
        <OmnibarDropdown query={query} listboxId={listboxId} onDone={done} keyHandlerRef={keyHandlerRef} onActiveIndexChange={setActiveIndex} />
      ) : null}
    </div>
  );
}

function MobileSearch(): JSX.Element {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const iconRef = useRef<HTMLButtonElement>(null);
  const show = useCallback((): void => setOpen(true), []);
  useOpenShortcut(show, false);
  useEffect(() => setOpen(false), [pathname]);
  const close = useCallback((): void => {
    setOpen(false);
    iconRef.current?.focus();
  }, []);
  return (
    <>
      <button
        ref={iconRef}
        type="button"
        className="omni-icon"
        aria-label="Search"
        aria-haspopup="dialog"
        onClick={show}
        onPointerEnter={prefetchSheet}
        onFocus={prefetchSheet}
      >
        <Glyph name="search" size={16} stroke={1.4} />
      </button>
      {open ? <OmnibarSheet initialQuery="" onClose={close} /> : null}
    </>
  );
}

export function OmnibarShell(): JSX.Element {
  return (
    <>
      <style>{SHELL_CSS}</style>
      <InlineSearch />
      <MobileSearch />
    </>
  );
}
