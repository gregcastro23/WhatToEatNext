"use client";

/**
 * The methods section's search: "baking bacon" → the cited way to cook it, with
 * the other tested methods one tap away; without a guide, an honest general
 * answer and the nearest guides.
 */
import Link from "next/link";
import { useState } from "react";
import { GuideView } from "@/components/cooking/guide/GuideView";
import {
  MethodSearchResponseSchema,
  type GeneralMethod,
  type MethodAnswer,
  type MethodSearchResponse,
  type MethodSuggestion,
} from "@/lib/validation/methodSearchSchemas";
import styles from "./homeSearch.module.css";
import { SectionSearchForm } from "./SectionSearchForm";
import { createSearchResource, useSearchResource, type ResourceState } from "./useSearchResource";
import type { JSX } from "react";

const MIN_QUERY = 3;
const EXAMPLES = ["baking bacon", "chicken thighs", "air fry salmon", "brown rice"] as const;

const resource = createSearchResource((value: unknown) => MethodSearchResponseSchema.parse(value));

export function methodSearchUrl(query: string): string | null {
  const q = query.trim().replace(/\s+/g, " ").toLowerCase();
  return q.length < MIN_QUERY ? null : `/api/search/methods?q=${encodeURIComponent(q)}`;
}

type Pick = (query: string) => void;

function Suggestions({ items, onPick }: { items: readonly MethodSuggestion[]; onPick: Pick }): JSX.Element | null {
  if (items.length === 0) return null;
  return (
    <div className={styles.suggestions}>
      {items.map((item) => (
        <button key={item.query} type="button" className={styles.chipButton} onClick={() => onPick(item.query)}>
          {item.label}
        </button>
      ))}
    </div>
  );
}

function GeneralList({ title, items }: { title: string; items: readonly string[] }): JSX.Element | null {
  if (items.length === 0) return null;
  return (
    <>
      <h4 className={styles.subhead}>{title}</h4>
      <ul className={styles.list}>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </>
  );
}

function GeneralMethodCard({ method }: { method: GeneralMethod }): JSX.Element {
  return (
    <article className={styles.card}>
      <header className={styles.cardHead}>
        <h3 className={styles.cardTitle}>{method.name}</h3>
        <span className={styles.meta}>General to this method, not tested for your food</span>
      </header>
      <p className={styles.status}>{method.description}</p>
      <GeneralList title="Equipment" items={method.equipment} />
      <GeneralList title="Tips" items={method.tips} />
      <GeneralList title="Common mistakes" items={method.mistakes} />
      <Link href={method.href} className={styles.footerLink} prefetch={false}>
        Full {method.name.toLowerCase()} profile →
      </Link>
    </article>
  );
}

function GeneralAnswer({ answer, onPick }: { answer: Extract<MethodAnswer, { kind: "general" }>; onPick: Pick }): JSX.Element {
  return (
    <>
      <p className={styles.note}>{answer.note}</p>
      <Suggestions items={answer.suggestions} onPick={onPick} />
      {answer.links.length > 0 && (
        <ul className={styles.rows}>
          {answer.links.map((link) => (
            <li key={link.href} className={styles.row}>
              <div className={styles.rowMain}>
                <Link href={link.href} className={styles.rowName} prefetch={false}>
                  {link.name}
                </Link>
                {link.detail !== null && <span className={styles.tag}>{link.detail}</span>}
              </div>
            </li>
          ))}
        </ul>
      )}
      {answer.method !== null && <GeneralMethodCard method={answer.method} />}
    </>
  );
}

function Answer({ answer, onPick }: { answer: MethodAnswer; onPick: Pick }): JSX.Element {
  if (answer.kind === "guide") {
    return (
      <>
        {answer.note !== null && <p className={styles.note}>{answer.note}</p>}
        <GuideView key={`${answer.guide.id}-${answer.selected}`} guide={answer.guide} initialMethod={answer.selected} />
      </>
    );
  }
  if (answer.kind === "choose") {
    return (
      <>
        <p className={styles.status}>{answer.note}</p>
        <Suggestions items={answer.choices} onPick={onPick} />
      </>
    );
  }
  return <GeneralAnswer answer={answer} onPick={onPick} />;
}

function Results({ state, onPick }: { state: ResourceState<MethodSearchResponse>; onPick: Pick }): JSX.Element | null {
  const { status, data } = state;
  if (status === "idle") return null;
  if (status === "error") return <p className={styles.status}>Cooking guides are unavailable right now. Try again in a moment.</p>;
  if (data === null) return <p className={styles.status}>Looking up how to cook it…</p>;
  return (
    <div className={styles.results} aria-busy={status === "loading"}>
      <Answer answer={data.answer} onPick={onPick} />
    </div>
  );
}

export function MethodGuideSearch(): JSX.Element {
  const [query, setQuery] = useState("");
  const state = useSearchResource(resource, methodSearchUrl(query));
  return (
    <div className={styles.root}>
      <SectionSearchForm
        id="home-method-search"
        label="How should I cook it?"
        placeholder="e.g. baking bacon, or salmon"
        value={query}
        onChange={setQuery}
        onSubmit={setQuery}
        examples={EXAMPLES}
      />
      <div aria-live="polite">
        <Results state={state} onPick={setQuery} />
      </div>
    </div>
  );
}
