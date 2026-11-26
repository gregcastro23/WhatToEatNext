"use client";

/** Numbered citations: every statement links to the source list below it. */
import styles from "@/components/home/search/homeSearch.module.css";
import type { GuideClaim, GuideSource } from "@/lib/cooking/foodGuides/schema";
import type { JSX } from "react";

export interface CitationKey {
  /** Unique per rendered guide, so two guides never share an anchor. */
  prefix: string;
  numbers: ReadonlyMap<string, number>;
}

export function citationKey(prefix: string, sources: readonly GuideSource[]): CitationKey {
  return { prefix, numbers: new Map(sources.map((source, at) => [source.id, at + 1])) };
}

export function Cite({ ids, cites }: { ids: readonly string[]; cites: CitationKey }): JSX.Element {
  return (
    <>
      {ids.flatMap((id) => {
        const number = cites.numbers.get(id);
        if (number === undefined) return [];
        return [
          <a key={id} className={styles.cite} href={`#${cites.prefix}-${id}`} aria-label={`Source ${number}`}>
            [{number}]
          </a>,
        ];
      })}
    </>
  );
}

export function ClaimList({ claims, cites, ordered = false }: { claims: readonly GuideClaim[]; cites: CitationKey; ordered?: boolean }): JSX.Element {
  const Tag = ordered ? "ol" : "ul";
  return (
    <Tag className={styles.list}>
      {claims.map((claim) => (
        <li key={claim.text}>
          {claim.text}
          <Cite ids={claim.sources} cites={cites} />
        </li>
      ))}
    </Tag>
  );
}

export function SourceList({ sources, cites }: { sources: readonly GuideSource[]; cites: CitationKey }): JSX.Element {
  return (
    <>
      <h4 className={styles.subhead}>Sources</h4>
      <ol className={styles.sources}>
        {sources.map((source) => (
          <li key={source.id} id={`${cites.prefix}-${source.id}`}>
            <a href={source.url} target="_blank" rel="noopener noreferrer">
              {source.publisher}: {source.title}
            </a>{" "}
            (read {source.retrieved})
          </li>
        ))}
      </ol>
    </>
  );
}
