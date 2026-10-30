"use client";
import { useRef } from "react";
import { ingredientGroup } from "@/lib/quiz/dishLexicon";
import { REACTIONS } from "./engine/dynamic";
import styles from "./quiz.module.css";
import type { QuizChoice, QuizQuestion } from "./engine/types";

export interface FormatProps {
  question: QuizQuestion;
  choices: readonly QuizChoice[];
  selected: readonly string[];
  onSelect: (choiceId: string) => void;
}

const ARROWS = new Set(["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp", "Home", "End"]);

function rovingIndex(key: string, index: number, count: number): number {
  if (key === "Home") return 0;
  if (key === "End") return count - 1;
  const step = key === "ArrowLeft" || key === "ArrowUp" ? -1 : 1;
  return (index + step + count) % count;
}

/** Radio-group arrow keys: move focus and selection together. */
function useRoving(
  choices: readonly QuizChoice[],
  onSelect: (id: string) => void,
): { ref: React.RefObject<HTMLDivElement | null>; onKeyDown: (event: React.KeyboardEvent, index: number) => void } {
  const ref = useRef<HTMLDivElement>(null);
  const onKeyDown = (event: React.KeyboardEvent, index: number): void => {
    if (!ARROWS.has(event.key)) return;
    event.preventDefault();
    event.stopPropagation();
    const next = rovingIndex(event.key, index, choices.length);
    const choice = choices[next];
    if (!choice) return;
    onSelect(choice.id);
    ref.current?.querySelectorAll<HTMLButtonElement>("button[data-quiz-option]")[next]?.focus({ preventScroll: true });
  };
  return { ref, onKeyDown };
}

export function ChoiceGrid({ question, choices, selected, onSelect }: FormatProps): React.JSX.Element {
  const multiple = question.format === "multi";
  const { ref, onKeyDown } = useRoving(choices, onSelect);
  const selectedIndex = choices.findIndex((choice) => selected.includes(choice.id));
  return (
    <div ref={ref} className={styles.options} role={multiple ? "group" : "radiogroup"} aria-labelledby="quiz-question-heading">
      {choices.map((choice, index) => (
        <button
          key={choice.id}
          type="button"
          role={multiple ? "checkbox" : "radio"}
          aria-checked={selected.includes(choice.id)}
          data-quiz-option={choice.id}
          data-neutral={choice.neutral === true ? true : undefined}
          tabIndex={multiple || index === Math.max(0, selectedIndex) ? 0 : -1}
          className={styles.option}
          onClick={() => onSelect(choice.id)}
          onKeyDown={multiple ? undefined : (event): void => onKeyDown(event, index)}
        >
          <span className={styles.optionEmoji} aria-hidden="true">
            {selected.includes(choice.id) ? "✓" : (choice.emoji ?? index + 1)}
          </span>
          <span className={styles.optionCopy}>
            <strong>{choice.label}</strong>
            {choice.sub && <small>{choice.sub}</small>}
          </span>
          {index < 9 && (
            <span className={styles.optionKey} aria-hidden="true">
              {index + 1}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

export function VersusTiles({ question, choices, selected, onSelect }: FormatProps): React.JSX.Element {
  const tiles = choices.filter((choice) => !choice.neutral);
  const extra = choices.filter((choice) => choice.neutral);
  return (
    <div className={styles.versus} role="radiogroup" aria-labelledby="quiz-question-heading">
      <div className={styles.versusTiles} data-duel={question.format === "duel" || undefined}>
        {tiles.map((choice, index) => (
          <button key={choice.id} type="button" role="radio" aria-checked={selected.includes(choice.id)} data-quiz-option={choice.id} className={styles.versusTile} onClick={() => onSelect(choice.id)}>
            <span className={styles.versusEmoji} aria-hidden="true">
              {choice.emoji}
            </span>
            <strong>{choice.label}</strong>
            {choice.sub && <small>{choice.sub}</small>}
            <span className={styles.optionKey} aria-hidden="true">
              {index + 1}
            </span>
          </button>
        ))}
        <span className={styles.versusOr} aria-hidden="true">
          or
        </span>
      </div>
      {extra.map((choice) => (
        <button key={choice.id} type="button" role="radio" aria-checked={selected.includes(choice.id)} data-quiz-option={choice.id} className={styles.torn} onClick={() => onSelect(choice.id)}>
          {choice.label}
        </button>
      ))}
    </div>
  );
}

export function SliderQuestion({ choices, selected, onSelect }: FormatProps): React.JSX.Element {
  const index = choices.findIndex((choice) => selected.includes(choice.id));
  const active = choices[index];
  return (
    <div className={styles.slider}>
      <p className={styles.sliderValue} aria-live="polite">
        {active ? active.label : "Slide or tap a label to answer"}
      </p>
      <input
        type="range"
        min={0}
        max={choices.length - 1}
        step={1}
        value={index === -1 ? Math.floor((choices.length - 1) / 2) : index}
        aria-labelledby="quiz-question-heading"
        aria-valuetext={active?.label ?? "Not answered"}
        data-unset={index === -1 || undefined}
        onChange={(event) => {
          const choice = choices[Number(event.target.value)];
          if (choice) onSelect(choice.id);
        }}
      />
      <div className={styles.sliderStops}>
        {choices.map((choice) => (
          <button key={choice.id} type="button" aria-pressed={selected.includes(choice.id)} onClick={() => onSelect(choice.id)}>
            {choice.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function RapidFire({ choices, selected, onSelect }: FormatProps): React.JSX.Element {
  const items = [...new Set(choices.map((choice) => choice.item).filter((item) => item !== undefined))];
  return (
    <div className={styles.rapid}>
      {items.map((item) => {
        const group = ingredientGroup(item);
        return (
          <div key={item} className={styles.rapidRow} role="radiogroup" aria-label={group?.label ?? item}>
            <span className={styles.rapidItem}>
              <span aria-hidden="true">{group?.emoji}</span> {group?.label ?? item}
            </span>
            <span className={styles.rapidReactions}>
              {REACTIONS.map(({ suffix, emoji, label }) => {
                const id = `${item}:${suffix}`;
                return (
                  <button key={id} type="button" role="radio" aria-checked={selected.includes(id)} aria-label={`${group?.label ?? item}: ${label}`} title={label} onClick={() => onSelect(id)}>
                    <span aria-hidden="true">{emoji}</span>
                  </button>
                );
              })}
            </span>
          </div>
        );
      })}
    </div>
  );
}
