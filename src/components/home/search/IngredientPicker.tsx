"use client";

/**
 * Typed ingredients as chips. Names are suggested by the site's own search
 * (the omnibar index), and anything typed can be added as it is.
 */
import { Plus, X } from "lucide-react";
import { useState } from "react";
import { useOmniSearch } from "@/components/nav/omnibar/useOmniSearch";
import { PANTRY_MAX_INGREDIENTS } from "@/lib/validation/pantrySearchSchemas";
import styles from "./homeSearch.module.css";
import type { JSX } from "react";

const SUGGESTIONS = 6;
const FIELD_LIMIT = 80;

export function addUnique(list: readonly string[], value: string, max: number): string[] {
  const name = value.trim().replace(/\s+/g, " ").slice(0, FIELD_LIMIT);
  const present = list.some((item) => item.toLowerCase() === name.toLowerCase());
  return name === "" || present || list.length >= max ? [...list] : [...list, name];
}

function Suggested({ draft, chosen, onPick }: { draft: string; chosen: readonly string[]; onPick: (name: string) => void }): JSX.Element | null {
  const { data } = useOmniSearch(draft.trim().length >= 2 ? draft : "");
  if (draft.trim().length < 2 || data === null) return null;
  const names = [...(data.hero ? [data.hero.name] : []), ...data.ingredients.map((item) => item.name)]
    .filter((name) => !chosen.some((item) => item.toLowerCase() === name.toLowerCase()))
    .slice(0, SUGGESTIONS);
  if (names.length === 0) return null;
  return (
    <div className={styles.suggestions} role="group" aria-label="Matching ingredients">
      {names.map((name) => (
        <button key={name} type="button" className={styles.chipButton} onClick={() => onPick(name)}>
          <Plus aria-hidden="true" size={12} />
          {name}
        </button>
      ))}
    </div>
  );
}

export function Chips({ items, onRemove, label }: { items: readonly string[]; onRemove: (item: string) => void; label: string }): JSX.Element | null {
  if (items.length === 0) return null;
  return (
    <ul className={styles.selected} aria-label={label}>
      {items.map((item) => (
        <li key={item}>
          <button type="button" className={`${styles.chipButton} ${styles.chipOn}`} onClick={() => onRemove(item)} aria-label={`Remove ${item}`}>
            {item}
            <X aria-hidden="true" size={12} />
          </button>
        </li>
      ))}
    </ul>
  );
}

export interface IngredientPickerProps {
  chosen: readonly string[];
  onChange: (chosen: string[]) => void;
}

export function IngredientPicker({ chosen, onChange }: IngredientPickerProps): JSX.Element {
  const [draft, setDraft] = useState("");
  const add = (names: readonly string[]): void => {
    onChange(names.reduce<string[]>((list, name) => addUnique(list, name, PANTRY_MAX_INGREDIENTS), [...chosen]));
    setDraft("");
  };
  const full = chosen.length >= PANTRY_MAX_INGREDIENTS;
  return (
    <div className={styles.form}>
      <label htmlFor="home-pantry-input" className={styles.label}>
        Ingredients you have
      </label>
      <div className={styles.controls}>
        <input
          id="home-pantry-input"
          className={styles.input}
          style={{ flex: "1 1 220px", paddingLeft: 12 }}
          autoComplete="off"
          disabled={full}
          placeholder={full ? `${PANTRY_MAX_INGREDIENTS} is the limit` : "e.g. eggplant, tahini, lemon"}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key !== "Enter") return;
            event.preventDefault();
            add(draft.split(","));
          }}
        />
        <button type="button" className={styles.secondary} disabled={draft.trim() === "" || full} onClick={() => add(draft.split(","))}>
          Add
        </button>
      </div>
      <Suggested draft={draft} chosen={chosen} onPick={(name) => add([name])} />
      <Chips items={chosen} label="Chosen ingredients" onRemove={(item) => onChange(chosen.filter((other) => other !== item))} />
    </div>
  );
}
