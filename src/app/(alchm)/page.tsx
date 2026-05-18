"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useState, type JSX } from "react";
import { AmazonFreshPromotion } from "@/components/home/AmazonFreshPromotion";
import {
  IngredientCard,
  type IngredientCardData,
} from "@/components/ui/alchm";

const DynamicCuisineRecommender = dynamic(
  () => import("@/components/home/DynamicCuisineRecommender"),
  { loading: () => <SectionLoader label="Loading cuisine recommender…" /> },
);

const EnhancedCookingMethodRecommender = dynamic(
  () =>
    import("@/components/recommendations/EnhancedCookingMethodRecommender"),
  { loading: () => <SectionLoader label="Loading cooking methods…" /> },
);

function SectionLoader({ label }: { label: string }): JSX.Element {
  return (
    <div
      className="t-mono"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 20px",
        color: "var(--fg-mute)",
        fontSize: 11,
        letterSpacing: "0.16em",
        textTransform: "uppercase",
      }}
    >
      {label}
    </div>
  );
}

/* ─── Recommended ingredients (lite) ─────────────────────────────────────── */

const PLANET_GLYPH_LOOKUP: Record<string, string> = {
  Sun: "☉",
  Moon: "☽",
  Mercury: "☿",
  Venus: "♀",
  Mars: "♂",
  Jupiter: "♃",
  Saturn: "♄",
  Uranus: "♅",
  Neptune: "♆",
  Pluto: "♇",
};

interface RecommendedIngredientPayload {
  id: string;
  name: string;
  category: string;
  elemental_affinity: "fire" | "water" | "earth" | "air";
  planet: string;
  hue: number;
  match_score: number;
  thermo: { spirit: number; essence: number; matter: number; substance: number };
}

function useRecommendedIngredients(limit = 8): IngredientCardData[] | null {
  const [items, setItems] = useState<IngredientCardData[] | null>(null);
  useEffect(() => {
    let cancelled = false;
    fetch(`/api/recommendations/ingredients?limit=${limit}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (cancelled || !j) return;
        const list: RecommendedIngredientPayload[] = Array.isArray(j.ingredients)
          ? j.ingredients
          : [];
        setItems(
          list.map((it) => ({
            id: it.id,
            name: it.name,
            category: (it.category ?? "other").toUpperCase(),
            element: it.elemental_affinity,
            match: it.match_score,
            properties: it.thermo,
            planet: PLANET_GLYPH_LOOKUP[it.planet] ?? "☉",
            hue: it.hue,
          })),
        );
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      });
    return () => {
      cancelled = true;
    };
  }, [limit]);
  return items;
}

/* ─── Section wrapper ─────────────────────────────────────────────────────── */

function HomeSection({
  tag,
  title,
  children,
  cta,
}: {
  tag: string;
  title: string;
  children: React.ReactNode;
  cta?: { label: string; href: string };
}): JSX.Element {
  return (
    <section
      className="alchm-panel"
      style={{
        padding: "20px 22px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          gap: 16,
          flexWrap: "wrap",
          marginBottom: 16,
        }}
      >
        <div>
          <div
            className="t-tag"
            style={{ color: "var(--accent-2)", marginBottom: 4 }}
          >
            {tag}
          </div>
          <h2
            className="t-display"
            style={{ fontSize: 22, margin: 0, color: "var(--fg)" }}
          >
            {title}
          </h2>
        </div>
        {cta && (
          <Link
            href={cta.href}
            className="t-mono"
            style={{
              fontSize: 10,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--accent)",
              textDecoration: "none",
              border: "1px solid color-mix(in oklch, var(--accent), transparent 60%)",
              borderRadius: 6,
              padding: "6px 12px",
            }}
          >
            {cta.label} →
          </Link>
        )}
      </header>
      {children}
    </section>
  );
}

/* ─── Page ────────────────────────────────────────────────────────────────── */

export default function AlchmKitchenHome(): JSX.Element {
  const recommended = useRecommendedIngredients(8);

  return (
    <main
      style={{
        maxWidth: 1100,
        margin: "0 auto",
        padding: "20px 16px 48px",
        display: "flex",
        flexDirection: "column",
        gap: 22,
      }}
    >
      <style>{`
        .alchm-recs-grid {
          display: grid;
          gap: 14px;
          grid-template-columns: repeat(1, 1fr);
        }
        @media (min-width: 600px) { .alchm-recs-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (min-width: 1000px) { .alchm-recs-grid { grid-template-columns: repeat(4, 1fr); } }
        .alchm-home-cookmethods :is(h1, h2, h3, h4) { color: var(--fg); }
      `}</style>

      {/* 1 · PROMO — Cosmic Token Economy */}
      <AmazonFreshPromotion />

      {/* 2 · CUISINE + SAUCE RECOMMENDER */}
      <HomeSection
        tag="TIER III · CUISINE & SAUCE"
        title="Tonight's cuisine, tuned to the sky"
        cta={{ label: "All cuisines", href: "/cuisines" }}
      >
        <DynamicCuisineRecommender />
      </HomeSection>

      {/* 3 · INGREDIENT RECOMMENDER (lite) */}
      <HomeSection
        tag="TIER I · INGREDIENTS"
        title="Eight ingredients ranked against the live sky"
        cta={{ label: "Full recommender", href: "/ingredients" }}
      >
        {recommended === null ? (
          <SectionLoader label="Hydrating top 8 ingredients…" />
        ) : recommended.length === 0 ? (
          <SectionLoader label="No matches available right now" />
        ) : (
          <div className="alchm-recs-grid">
            {recommended.map((card) => (
              <IngredientCard key={card.id} ing={card} />
            ))}
          </div>
        )}
      </HomeSection>

      {/* 4 · COOKING METHODS RECOMMENDER */}
      <HomeSection
        tag="TIER II · COOKING METHODS"
        title="Methods aligned with the current transit"
        cta={{ label: "Methods library", href: "/cooking-methods" }}
      >
        <div className="alchm-home-cookmethods">
          <EnhancedCookingMethodRecommender />
        </div>
      </HomeSection>

      {/* Footer hint to the Lab */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          padding: "20px 0",
        }}
      >
        <Link
          href="/lab"
          className="t-mono"
          style={{
            fontSize: 10,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--fg-mute)",
            textDecoration: "none",
            padding: "8px 16px",
            border: "1px dashed color-mix(in oklch, var(--accent), transparent 60%)",
            borderRadius: 999,
          }}
        >
          Open the Laboratory →
        </Link>
      </div>
    </main>
  );
}
