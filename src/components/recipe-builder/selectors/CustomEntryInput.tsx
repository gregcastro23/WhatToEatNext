"use client";

/**
 * Free-text entry for a preference the chip list lacks (a custom allergy,
 * cuisine, or cooking method). Enter or the Add button submits; blanks and
 * entries already present are ignored.
 *
 * @file src/components/recipe-builder/selectors/CustomEntryInput.tsx
 */

import React, { useState } from "react";
import { FOCUS_RING } from "../focusRing";

export type EntryTone = "red" | "purple" | "amber";

const INPUT_TONE: Record<EntryTone, string> = {
  red: "focus:border-red-400/60 focus:ring-1 focus:ring-red-400/20",
  purple: "focus:border-purple-400/60 focus:ring-1 focus:ring-purple-400/20",
  amber: "focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/20",
};

const BUTTON_TONE: Record<EntryTone, string> = {
  red: "bg-red-500/20 text-red-300 border-red-500/30 hover:bg-red-500/30",
  purple: "bg-purple-500/20 text-purple-300 border-purple-500/30 hover:bg-purple-500/30",
  amber: "bg-amber-500/20 text-amber-300 border-amber-500/30 hover:bg-amber-500/30",
};

interface CustomEntryInputProps {
  /** Accessible name for the text field. */
  label: string;
  placeholder: string;
  tone: EntryTone;
  existing: readonly string[];
  onAdd: (value: string) => void;
}

export function CustomEntryInput({
  label,
  placeholder,
  tone,
  existing,
  onAdd,
}: CustomEntryInputProps): React.JSX.Element {
  const [value, setValue] = useState("");
  const trimmed = value.trim();

  const submit = (): void => {
    if (!trimmed || existing.includes(trimmed)) return;
    onAdd(trimmed);
    setValue("");
  };

  return (
    <div className="flex gap-2">
      <input
        type="text"
        aria-label={label}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") submit();
        }}
        placeholder={placeholder}
        className={`flex-1 px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder-white/40 outline-none ${INPUT_TONE[tone]}`}
      />
      <button
        type="button"
        onClick={submit}
        disabled={!trimmed}
        className={`px-4 py-2 rounded-xl text-xs font-medium border disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer ${FOCUS_RING} ${BUTTON_TONE[tone]}`}
      >
        Add
      </button>
    </div>
  );
}
