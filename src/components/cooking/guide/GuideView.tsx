"use client";

/**
 * A food guide: choose a method (the recommended one is marked), then safety,
 * storage and buying notes, and the sources behind every line.
 */
import { useId, useState } from "react";
import styles from "@/components/home/search/homeSearch.module.css";
import type { FoodGuide, GuideClaim, GuideMethodId } from "@/lib/cooking/foodGuides/schema";
import { citationKey, ClaimList, SourceList, type CitationKey } from "./citations";
import { MethodPanel } from "./MethodPanel";
import type { JSX } from "react";

function MethodChoices({ guide, selected, onSelect }: { guide: FoodGuide; selected: GuideMethodId; onSelect: (id: GuideMethodId) => void }): JSX.Element {
  return (
    <div className={styles.methodTabs} role="group" aria-label={`Ways to cook ${guide.name.toLowerCase()}`}>
      {guide.methods.map((method) => (
        <button
          key={method.id}
          type="button"
          aria-pressed={method.id === selected}
          className={method.id === selected ? `${styles.chipButton} ${styles.chipOn}` : styles.chipButton}
          onClick={() => onSelect(method.id)}
        >
          {method.best ? "★ " : ""}
          {method.label}
        </button>
      ))}
    </div>
  );
}

function Section({ title, claims, cites, open = false }: { title: string; claims: readonly GuideClaim[]; cites: CitationKey; open?: boolean }): JSX.Element | null {
  if (claims.length === 0) return null;
  return (
    <details className={styles.detail} open={open}>
      <summary className={styles.subhead}>{title}</summary>
      <ClaimList claims={claims} cites={cites} />
    </details>
  );
}

export interface GuideViewProps {
  guide: FoodGuide;
  initialMethod: GuideMethodId;
}

export function GuideView({ guide, initialMethod }: GuideViewProps): JSX.Element {
  const [selected, setSelected] = useState(initialMethod);
  const cites = citationKey(useId().replace(/:/g, ""), guide.sources);
  const method = guide.methods.find((candidate) => candidate.id === selected) ?? guide.methods[0];
  return (
    <article className={styles.card}>
      <header className={styles.cardHead}>
        <h3 className={styles.cardTitle}>{guide.name}</h3>
        <span className={styles.meta}>{guide.methods.length} tested methods</span>
      </header>
      <ClaimList claims={[guide.summary]} cites={cites} />
      <MethodChoices guide={guide} selected={selected} onSelect={setSelected} />
      {method && <MethodPanel method={method} cites={cites} />}
      <Section title="Food safety" claims={guide.safety} cites={cites} open />
      <Section title="Storing" claims={guide.storage} cites={cites} />
      <Section title="Preparing" claims={guide.preparation} cites={cites} />
      <Section title="Buying" claims={guide.selection} cites={cites} />
      <SourceList sources={guide.sources} cites={cites} />
    </article>
  );
}
