"use client";

/**
 * The search field a homepage section leads with. Results are drawn below it in
 * normal flow: a section panel clips overflow and traps fixed positioning
 * (backdrop-filter), so a floating dropdown would be cut off.
 */
import { Search, X } from "lucide-react";
import styles from "./homeSearch.module.css";
import type { JSX } from "react";

export interface SectionSearchFormProps {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  /** Runs a search now, skipping the typing pause. */
  onSubmit: (value: string) => void;
  examples: readonly string[];
  maxLength?: number;
}

function Examples({ examples, onPick }: { examples: readonly string[]; onPick: (value: string) => void }): JSX.Element {
  return (
    <div className={styles.examples}>
      <span className={styles.examplesLabel}>Try</span>
      {examples.map((example) => (
        <button key={example} type="button" className={styles.example} onClick={() => onPick(example)}>
          {example}
        </button>
      ))}
    </div>
  );
}

export function SectionSearchForm(props: SectionSearchFormProps): JSX.Element {
  const { id, label, placeholder, value, onChange, onSubmit, examples, maxLength = 100 } = props;
  return (
    <form
      role="search"
      aria-label={label}
      className={styles.form}
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(value);
      }}
    >
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <div className={styles.field}>
        <Search aria-hidden="true" className={styles.fieldIcon} />
        <input
          id={id}
          type="search"
          enterKeyHint="search"
          autoComplete="off"
          className={styles.input}
          placeholder={placeholder}
          maxLength={maxLength}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        {value !== "" && (
          <button type="button" className={styles.clear} aria-label="Clear search" onClick={() => onChange("")}>
            <X aria-hidden="true" />
          </button>
        )}
      </div>
      {value.trim() === "" && <Examples examples={examples} onPick={(example) => { onChange(example); onSubmit(example); }} />}
    </form>
  );
}
