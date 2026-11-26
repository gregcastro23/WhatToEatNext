"use client";

/**
 * One dish found by the cuisine search: every version (held-back ones expand in
 * place, since they have no page) and the closest dishes from other cuisines,
 * each with the ingredients they share.
 */
import Link from "next/link";
import { useId, useState } from "react";
import type { CrossCuisineMatch, RecipeGroup, RecipeVersion } from "@/lib/validation/recipeSearchSchemas";
import styles from "./homeSearch.module.css";
import type { JSX } from "react";

function VersionTags({ version }: { version: RecipeVersion }): JSX.Element {
  return (
    <span className={styles.tags}>
      {version.cuisine !== null && <span className={styles.tag}>{version.cuisine}</span>}
      {version.labels.map((label) => (
        <span key={label} className={styles.tag}>
          {label}
        </span>
      ))}
      {version.totalMinutes !== null && <span className={styles.meta}>{version.totalMinutes} min</span>}
    </span>
  );
}

function OnFileDetail({ id, onFile }: { id: string; onFile: NonNullable<RecipeVersion["onFile"]> }): JSX.Element {
  return (
    <div id={id} className={styles.detail}>
      {onFile.description !== null && <p>{onFile.description}</p>}
      <div className={styles.subhead}>Ingredients</div>
      <ul>
        {onFile.ingredients.map((line, at) => (
          <li key={`${at}-${line}`}>{line}</li>
        ))}
      </ul>
      {onFile.steps.length > 0 ? (
        <>
          <div className={styles.subhead}>Method</div>
          <ol>
            {onFile.steps.map((step, at) => (
              <li key={`${at}-${step.slice(0, 40)}`}>{step.replace(/^step\s*\d+\s*[:.]\s*/i, "")}</li>
            ))}
          </ol>
        </>
      ) : (
        <p>No written method is on file for this version.</p>
      )}
    </div>
  );
}

function VersionRow({ version }: { version: RecipeVersion }): JSX.Element {
  const [open, setOpen] = useState(false);
  const detailId = useId();
  return (
    <li className={styles.row}>
      <div className={styles.rowMain}>
        {version.href === null ? (
          <span className={styles.rowName}>{version.name}</span>
        ) : (
          <Link href={version.href} prefetch={false} className={styles.rowName}>
            {version.name}
          </Link>
        )}
        <VersionTags version={version} />
        {version.onFile !== null && (
          <button type="button" className={styles.toggle} aria-expanded={open} aria-controls={detailId} onClick={() => setOpen(!open)}>
            {open ? "Hide recipe" : `Show ${version.onFile.meal} version`}
          </button>
        )}
      </div>
      {open && version.onFile !== null && <OnFileDetail id={detailId} onFile={version.onFile} />}
    </li>
  );
}

function CrossCuisine({ matches }: { matches: readonly CrossCuisineMatch[] }): JSX.Element {
  return (
    <>
      <h4 className={styles.subhead}>Similar dishes in other cuisines</h4>
      <ul className={styles.rows}>
        {matches.map((match) => (
          <li key={match.id} className={styles.row}>
            <div className={styles.rowMain}>
              <Link href={match.href} prefetch={false} className={styles.rowName}>
                {match.name}
              </Link>
              <span className={styles.tag}>{match.cuisine}</span>
            </div>
            <span className={styles.meta}>Shares {match.shared.join(", ")}</span>
          </li>
        ))}
      </ul>
    </>
  );
}

export function RecipeGroupCard({ group }: { group: RecipeGroup }): JSX.Element {
  const count = group.versions.length;
  return (
    <article className={styles.card}>
      <header className={styles.cardHead}>
        <h3 className={styles.cardTitle}>{group.title}</h3>
        <span className={styles.meta}>
          {count === 1 ? "1 version" : `${count} versions`}
          {group.matchNote === null ? "" : ` · ${group.matchNote}`}
        </span>
      </header>
      <ul className={styles.rows}>
        {group.versions.map((version, at) => (
          <VersionRow key={version.id ?? `on-file-${at}`} version={version} />
        ))}
      </ul>
      {group.crossCuisine.length > 0 && <CrossCuisine matches={group.crossCuisine} />}
    </article>
  );
}
