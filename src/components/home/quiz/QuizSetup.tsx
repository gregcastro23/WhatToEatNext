"use client";
import { titleCase } from "./engine/phrases";
import { MAX_QUESTIONS, MIN_QUESTIONS } from "./engine/session";
import styles from "./quiz.module.css";
import { useQuiz } from "./QuizProvider";
import type { AllergenKey, DietKey, SkySnapshot } from "./engine/types";

const LENGTHS: ReadonlyArray<{ count: number; label: string; note: string }> = [
  { count: 5, label: "Speed round", note: "a strong guess" },
  { count: 10, label: "Classic", note: "usually nails it" },
  { count: 15, label: "Deep", note: "knows you well" },
  { count: 25, label: "Obsessive", note: "leaves no stone" },
];

const DIETS: ReadonlyArray<{ key: DietKey | null; label: string }> = [
  { key: null, label: "Everything" },
  { key: "vegetarian", label: "Vegetarian" },
  { key: "vegan", label: "Vegan" },
  { key: "pescatarian", label: "Pescatarian" },
];

const ALLERGENS: ReadonlyArray<{ key: AllergenKey; label: string }> = [
  { key: "gluten", label: "Gluten" },
  { key: "dairy", label: "Dairy" },
  { key: "eggs", label: "Eggs" },
  { key: "soy", label: "Soy" },
  { key: "peanuts", label: "Peanuts" },
  { key: "tree-nuts", label: "Tree nuts" },
  { key: "sesame", label: "Sesame" },
  { key: "fish", label: "Fish" },
  { key: "shellfish", label: "Shellfish" },
];

function skyLine(sky: SkySnapshot | null): string | null {
  if (!sky) return null;
  const parts = [`Moon in ${titleCase(sky.moon.sign)}`, sky.phase.name];
  if (sky.retrogrades.length) parts.push(`${sky.retrogrades.map(titleCase).join(" & ")} retrograde`);
  return parts.join(" · ");
}

function RulesPicker(): React.JSX.Element {
  const { state, setRules } = useQuiz();
  const { rules } = state;
  const toggle = (key: AllergenKey): void =>
    setRules({
      ...rules,
      allergens: rules.allergens.includes(key) ? rules.allergens.filter((value) => value !== key) : [...rules.allergens, key],
    });
  const count = (rules.diet ? 1 : 0) + rules.allergens.length;
  return (
    <details className={styles.rules} open={count > 0}>
      <summary>Dietary ground rules {count > 0 ? `(${count} set)` : "(optional)"}</summary>
      <div className={styles.chipRow} role="radiogroup" aria-label="Diet">
        {DIETS.map(({ key, label }) => (
          <button key={label} type="button" role="radio" aria-checked={rules.diet === key} className={styles.chip} onClick={() => setRules({ ...rules, diet: key })}>
            {label}
          </button>
        ))}
      </div>
      <div className={styles.chipRow} role="group" aria-label="Keep off the plate">
        {ALLERGENS.map(({ key, label }) => (
          <button key={key} type="button" role="checkbox" aria-checked={rules.allergens.includes(key)} className={styles.chip} onClick={() => toggle(key)}>
            No {label.toLowerCase()}
          </button>
        ))}
      </div>
      <p className={styles.fineprint}>
        We drop any dish whose ingredient list names these. We can&apos;t see inside packaged ingredients, so always check labels.
      </p>
    </details>
  );
}

export function QuizSetup({ sky, dishCount }: { sky: SkySnapshot | null; dishCount: number }): React.JSX.Element {
  const { state, setTarget } = useQuiz();
  const line = skyLine(sky);
  return (
    <section className={styles.setup} aria-labelledby="quiz-setup-heading">
      <h3 id="quiz-setup-heading" data-quiz-heading tabIndex={-1}>
        Tell me what you&apos;re hungry for.
      </h3>
      <p className={styles.lede}>
        Every answer narrows {dishCount > 0 ? `${dishCount} real recipes` : "our recipe catalog"} toward the one you actually want tonight.
        No two quizzes run the same way.
      </p>
      {line && (
        <p className={styles.skyLine}>
          <span aria-hidden="true">☽</span> Right now: {line}
        </p>
      )}
      <fieldset className={styles.lengths}>
        <legend>How many questions?</legend>
        <div className={styles.lengthChips}>
          {LENGTHS.map(({ count, label, note }) => (
            <button key={count} type="button" aria-pressed={state.target === count} className={styles.lengthChip} onClick={() => setTarget(count)}>
              <strong>{label}</strong>
              <span>
                {count} · {note}
              </span>
            </button>
          ))}
        </div>
        <label className={styles.lengthSlider}>
          <span>Or choose exactly: {state.target}</span>
          <input type="range" min={MIN_QUESTIONS} max={MAX_QUESTIONS} value={state.target} onChange={(event) => setTarget(Number(event.target.value))} />
        </label>
      </fieldset>
      <RulesPicker />
    </section>
  );
}
