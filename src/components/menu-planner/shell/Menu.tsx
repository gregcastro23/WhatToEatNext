"use client";

/**
 * Menu — a tiny, dependency-free dropdown menu primitive for the planner
 * shell (split-button options, overflow ⋯, day-header actions).
 *
 * - Closes on outside click, Escape, or after an item is chosen.
 * - Arrow-key navigation between items; focus returns to the trigger.
 * - `role="menu"` / `role="menuitem"` semantics.
 *
 * @file src/components/menu-planner/shell/Menu.tsx
 */

import React, { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export interface MenuItem {
  key: string;
  label: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  onSelect: () => void;
  disabled?: boolean;
  tone?: "default" | "danger";
  /** Renders a divider above this item. */
  separated?: boolean;
}

interface MenuProps {
  /** Render-prop for the trigger; spread `triggerProps` onto a <button>. */
  trigger: (triggerProps: {
    ref: React.Ref<HTMLButtonElement>;
    onClick: () => void;
    "aria-haspopup": "menu";
    "aria-expanded": boolean;
    "aria-controls": string;
  }) => React.ReactNode;
  items: MenuItem[];
  align?: "start" | "end";
  /** Accessible name for the menu list. */
  label: string;
  className?: string;
}

export default function Menu({
  trigger,
  items,
  align = "end",
  label,
  className = "",
}: MenuProps): React.ReactElement {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listId = useId();
  const listRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<React.CSSProperties>({});

  useLayoutEffect(() => {
    if (!open) return;
    const update = () => {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const width = Math.min(280, window.innerWidth - 16);
      const left = Math.max(8, Math.min(align === "end" ? rect.right - width : rect.left, window.innerWidth - width - 8));
      const below = window.innerHeight - rect.bottom - 16;
      const above = rect.top - 16;
      setPosition({ position: "fixed", width, left, ...(below >= 250 || below >= above ? { top: rect.bottom + 8, maxHeight: Math.max(100, below) } : { bottom: window.innerHeight - rect.top + 8, maxHeight: Math.max(100, above) }) });
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => { window.removeEventListener("resize", update); window.removeEventListener("scroll", update, true); };
  }, [open, align]);

  const close = useCallback((refocus = true) => {
    setOpen(false);
    if (refocus) triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e: MouseEvent): void => {
      const targetNode = e.target instanceof Node ? e.target : null;
      if (
        targetNode &&
        !rootRef.current?.contains(targetNode) &&
        !listRef.current?.contains(targetNode)
      ) {
        close(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    // Focus the first enabled item when opening.
    const first = listRef.current?.querySelector<HTMLButtonElement>(
      '[role="menuitem"]:not([disabled])',
    );
    first?.focus();
    return () => document.removeEventListener("mousedown", onDown);
  }, [open, close]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>): void => {
    if (e.key === "Escape") {
      e.stopPropagation();
      close();
      return;
    }
    if (e.key === "Tab") { close(); return; }
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    e.stopPropagation();
    const nodes = Array.from(
      listRef.current?.querySelectorAll<HTMLButtonElement>(
        '[role="menuitem"]:not([disabled])',
      ) ?? [],
    );
    if (nodes.length === 0) return;
    const active =
      document.activeElement instanceof HTMLButtonElement
        ? document.activeElement
        : null;
    const idx = active ? nodes.indexOf(active) : -1;
    const next =
      e.key === "ArrowDown"
        ? nodes[(idx + 1) % nodes.length]
        : nodes[(idx - 1 + nodes.length) % nodes.length];
    next?.focus();
  };

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions -- keyboard handling for the composite menu widget
    <div ref={rootRef} className={`relative ${className}`} onKeyDown={onKeyDown}>
      {trigger({
        ref: triggerRef,
        onClick: () => setOpen((o) => !o),
        "aria-haspopup": "menu",
        "aria-expanded": open,
        "aria-controls": listId,
      })}
      {open && createPortal(
        <div
          ref={listRef}
          style={position}
          onKeyDown={onKeyDown}
          id={listId}
          role="menu"
          tabIndex={-1}
          aria-label={label}
          className="lab z-[60] overflow-y-auto rounded-xl border border-muted bg-surface-container-high p-1.5 shadow-2xl"
        >
          {items.map((item) => (
            <React.Fragment key={item.key}>
              {item.separated && (
                <div role="separator" className="my-1 h-px bg-on-surface/10" />
              )}
              <button
                type="button"
                role="menuitem"
                disabled={item.disabled}
                onClick={() => {
                  close();
                  item.onSelect();
                }}
                className={`w-full flex items-start gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus-visible:bg-on-surface/10 hover:bg-on-surface/5 ${
                  item.tone === "danger" ? "text-error" : "text-on-surface"
                }`}
              >
                {item.icon && (
                  <span className="mt-0.5 shrink-0 text-on-surface-variant [&>svg]:h-4 [&>svg]:w-4">
                    {item.icon}
                  </span>
                )}
                <span className="min-w-0">
                  <span className="block font-medium">{item.label}</span>
                  {item.description && (
                    <span className="block text-xs text-on-surface-variant">
                      {item.description}
                    </span>
                  )}
                </span>
              </button>
            </React.Fragment>
          ))}
        </div>, document.body
      )}
    </div>
  );
}
