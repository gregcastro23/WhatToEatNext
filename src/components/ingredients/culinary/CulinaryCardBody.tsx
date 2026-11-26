"use client";

/**
 * The culinary card's contents: what the catalog records, the cited guides
 * (one per cut for meats), the recipes that use it, and what is not written yet.
 */
import Link from "next/link";
import { useState } from "react";
import { GuideView } from "@/components/cooking/guide/GuideView";
import styles from "@/components/home/search/homeSearch.module.css";
import type { FoodGuide } from "@/lib/cooking/foodGuides/schema";
import { bestMethod } from "@/lib/cooking/methodSearch/pickMethod";
import type { CardSection, CulinaryCard } from "@/lib/validation/culinaryCardSchemas";
import type { JSX } from "react";

function Facts({ card }: { card: CulinaryCard }): JSX.Element {
  const facts = [
    card.category.replace(/_/g, " "),
    ...(card.origin.length > 0 ? [`from ${card.origin.join(", ")}`] : []),
    ...(card.seasons.length > 0 ? [`in season: ${card.seasons.join(", ")}`] : []),
  ];
  return (
    <div className={styles.tags}>
      {[...facts, ...card.qualities].map((fact) => (
        <span key={fact} className={styles.tag}>
          {fact}
        </span>
      ))}
    </div>
  );
}

function Sections({ sections }: { sections: readonly CardSection[] }): JSX.Element {
  return (
    <>
      {sections.map((section) => (
        <section key={section.id}>
          <h3 className={styles.subhead}>{section.title}</h3>
          <ul className={styles.list}>
            {section.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}

function Guides({ guides }: { guides: readonly FoodGuide[] }): JSX.Element | null {
  const [chosen, setChosen] = useState(0);
  const guide = guides[chosen] ?? guides[0];
  const method = guide ? bestMethod(guide) : undefined;
  if (!guide || !method) return null;
  return (
    <section>
      <h3 className={styles.subhead}>How to buy, store and cook it</h3>
      {guides.length > 1 && (
        <div className={styles.methodTabs} role="group" aria-label="Choose a cut">
          {guides.map((option, at) => (
            <button
              key={option.id}
              type="button"
              aria-pressed={at === chosen}
              className={at === chosen ? `${styles.chipButton} ${styles.chipOn}` : styles.chipButton}
              onClick={() => setChosen(at)}
            >
              {option.name}
            </button>
          ))}
        </div>
      )}
      <GuideView key={guide.id} guide={guide} initialMethod={method.id} />
    </section>
  );
}

function Recipes({ card }: { card: CulinaryCard }): JSX.Element | null {
  if (card.recipeCount === 0) return null;
  return (
    <section>
      <h3 className={styles.subhead}>
        Used in {card.recipeCount} {card.recipeCount === 1 ? "recipe" : "recipes"}
      </h3>
      <ul className={styles.rows}>
        {card.recipes.map((recipe) => (
          <li key={recipe.href} className={styles.row}>
            <div className={styles.rowMain}>
              <Link href={recipe.href} className={styles.rowName} prefetch={false}>
                {recipe.name}
              </Link>
              {recipe.cuisine !== null && <span className={styles.tag}>{recipe.cuisine}</span>}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function CulinaryCardBody({ card }: { card: CulinaryCard }): JSX.Element {
  return (
    <div className={styles.results}>
      <Facts card={card} />
      {card.description !== null && <p className={styles.status}>{card.description}</p>}
      <Guides guides={card.guides} />
      <Sections sections={card.sections} />
      {card.missing.length > 0 && <p className={styles.note}>Not documented yet: {card.missing.join(", ")}.</p>}
      <Recipes card={card} />
      <Link href={card.href} className={styles.footerLink} prefetch={false}>
        Open the ingredient page →
      </Link>
    </div>
  );
}
