"use client";

/** Which equipment the cook has: common pieces to toggle, plus any other. */
import { useState } from "react";
import { MAX_EQUIPMENT } from "@/lib/cooking/cosmicEquipment";
import { COMMON_EQUIPMENT } from "@/lib/cooking/equipmentOptions";
import styles from "./homeSearch.module.css";
import { addUnique } from "./IngredientPicker";
import type { JSX } from "react";

export interface EquipmentPickerProps {
  chosen: readonly string[];
  onChange: (chosen: string[]) => void;
}

export function EquipmentPicker({ chosen, onChange }: EquipmentPickerProps): JSX.Element {
  const [other, setOther] = useState("");
  const options = [...COMMON_EQUIPMENT, ...chosen.filter((item) => !COMMON_EQUIPMENT.includes(item))];
  const toggle = (item: string): void => {
    onChange(chosen.includes(item) ? chosen.filter((entry) => entry !== item) : addUnique(chosen, item, MAX_EQUIPMENT));
  };
  const addOther = (): void => {
    onChange(addUnique(chosen, other, MAX_EQUIPMENT));
    setOther("");
  };
  return (
    <details className={styles.form}>
      <summary className={styles.label}>
        Equipment you have {chosen.length > 0 ? `(${chosen.length})` : "(optional)"}
      </summary>
      <div className={styles.suggestions} style={{ marginTop: 8 }}>
        {options.map((item) => (
          <button
            key={item}
            type="button"
            aria-pressed={chosen.includes(item)}
            className={chosen.includes(item) ? `${styles.chipButton} ${styles.chipOn}` : styles.chipButton}
            onClick={() => toggle(item)}
          >
            {item}
          </button>
        ))}
      </div>
      <div className={styles.controls} style={{ marginTop: 8 }}>
        <input
          className={styles.input}
          style={{ flex: "1 1 180px", paddingLeft: 12 }}
          aria-label="Other equipment"
          placeholder="Something else, e.g. tagine"
          maxLength={60}
          value={other}
          onChange={(event) => setOther(event.target.value)}
          onKeyDown={(event) => {
            if (event.key !== "Enter") return;
            event.preventDefault();
            addOther();
          }}
        />
        <button type="button" className={styles.secondary} disabled={other.trim() === ""} onClick={addOther}>
          Add
        </button>
      </div>
    </details>
  );
}
