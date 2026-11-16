"use client";

import { useState, type JSX } from "react";

export interface DraftNumberInputProps {
  id?: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  digits: number;
  className?: string;
  onCommit: (value: number) => void;
}

/**
 * A number field that keeps what you are TYPING separate from the committed
 * value. A controlled input that validated every keystroke could never reach
 * "230" — its first keystroke, "2", is below a 100 °C minimum — and "0.5"
 * would collapse to "0" at the decimal point. Here the draft is free text
 * while focused; only a finite in-range number is committed, and leaving the
 * field drops any draft that never became one.
 */
export function DraftNumberInput({ id, label, value, min, max, step, digits, className, onCommit }: DraftNumberInputProps): JSX.Element {
  const [draft, setDraft] = useState<string | null>(null);
  const commitIfValid = (text: string): void => {
    const next = Number(text);
    if (text.trim() !== "" && Number.isFinite(next) && next >= min && next <= max) onCommit(next);
  };
  return (
    <input
      id={id}
      aria-label={label}
      className={className ?? "bl-input bl-num w-20 text-right"}
      type="number"
      inputMode="decimal"
      min={min}
      max={max}
      step={step}
      value={draft ?? String(Number(value.toFixed(digits)))}
      onFocus={() => setDraft(String(Number(value.toFixed(digits))))}
      onChange={(e) => {
        setDraft(e.target.value);
        commitIfValid(e.target.value);
      }}
      onBlur={() => setDraft(null)}
    />
  );
}
