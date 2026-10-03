"use client";

/**
 * One hero action, as an option in the results listbox. Cook with this is a
 * link (the builder reads `?ingredients=`), and so is the pantry once the
 * card is in it; Add to pantry and Show pairings act in place.
 */
import Link from "next/link";
import { Glyph } from "@/components/ui/alchm/Glyph";
import type { ActionRow } from "./omnibarTypes";
import type { JSX } from "react";

export interface ActionChipProps {
  row: ActionRow;
  id: string;
  selected: boolean;
  onHover: () => void;
  /** A link chip was followed: record it and close. */
  onPicked: () => void;
  /** A button chip was pressed: run the action. */
  onRun: () => void;
}

export function OmnibarActionChip({ row, id, selected, onHover, onPicked, onRun }: ActionChipProps): JSX.Element {
  const shared = {
    id,
    role: "option",
    "aria-selected": selected,
    tabIndex: -1,
    className: "omni-chip",
    "data-action": row.action,
    "data-pressed": row.pressed,
    onMouseMove: selected ? undefined : onHover,
  };
  const content = (
    <>
      <Glyph name={row.icon} size={12} stroke={1.4} />
      <span>{row.label}</span>
    </>
  );
  const navigates = row.action === "cook" || (row.action === "pantry" && row.pressed);
  return navigates ? (
    <Link {...shared} href={row.href} prefetch={false} onClick={onPicked}>
      {content}
    </Link>
  ) : (
    <button {...shared} type="button" onClick={onRun}>
      {content}
    </button>
  );
}
