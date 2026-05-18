"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { AgentsFeedThread } from "@/components/home/AgentsFeedThread";
import { AmazonFreshPromotion } from "@/components/home/AmazonFreshPromotion";
import type { JSX } from "react";

const DynamicCuisineRecommender = dynamic(
  () => import("@/components/home/DynamicCuisineRecommender"),
  { loading: () => <SectionLoader label="Loading cuisine recommender…" /> },
);

const EnhancedSauceRecommender = dynamic(
  () => import("@/components/recommendations/EnhancedSauceRecommender"),
  { loading: () => <SectionLoader label="Loading sauce recommender…" /> },
);

const EnhancedIngredientRecommender = dynamic(
  () => import("@/components/recommendations/EnhancedIngredientRecommender"),
  { loading: () => <SectionLoader label="Loading ingredient recommender…" /> },
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
  return (
    <>
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
          .alchm-home-cookmethods :is(h1, h2, h3, h4) { color: var(--fg); }
          .alchm-ingredient-scroll {
            max-height: 70vh;
            overflow-y: auto;
            margin: 0 -22px -20px;
            padding: 0 22px 20px;
            scrollbar-width: thin;
            scrollbar-color: color-mix(in oklch, var(--accent), transparent 70%) transparent;
          }
        `}</style>

        {/* 1 · PROMO — Cosmic Token Economy */}
        <AmazonFreshPromotion />

        {/* 2 · CUISINE RECOMMENDER */}
        <HomeSection
          tag="TIER III · CUISINE"
          title="Tonight's cuisine, tuned to the sky"
          cta={{ label: "All cuisines", href: "/cuisines" }}
        >
          <DynamicCuisineRecommender />
        </HomeSection>

        {/* 3 · SAUCE RECOMMENDER */}
        <HomeSection
          tag="TIER III · SAUCE"
          title="Sauces in phase with the current hour"
          cta={{ label: "Sauce library", href: "/sauces" }}
        >
          <EnhancedSauceRecommender />
        </HomeSection>

        {/* 4 · INGREDIENT RECOMMENDER (lite — full component, 70vh scroll) */}
        <HomeSection
          tag="TIER I · INGREDIENTS"
          title="Ingredients aligned with the live sky"
          cta={{ label: "Open my pantry", href: "/pantry" }}
        >
          <p
            style={{
              fontSize: 12,
              color: "var(--fg-dim)",
              margin: "0 0 12px",
              lineHeight: 1.5,
            }}
          >
            Tap{" "}
            <span
              className="alchm-chip"
              style={{ fontSize: 10, padding: "2px 8px" }}
            >
              Pantry
            </span>{" "}
            on any card to track it in your kitchen.
          </p>
          <div className="alchm-ingredient-scroll">
            <EnhancedIngredientRecommender />
          </div>
        </HomeSection>

        {/* 5 · COOKING METHODS RECOMMENDER */}
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
      <AgentsFeedThread />
    </>
  );
}
