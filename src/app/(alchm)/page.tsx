"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FeaturedRecipe } from "@/components/home/FeaturedRecipe";
import { LiveHero } from "@/components/home/LiveHero";
import type { JSX } from "react";

const NATAL_DISMISSED_KEY = "alchm:natal:dismissed";

function NatalPromptBanner(): JSX.Element | null {
  const params = useSearchParams();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (params?.get("prompt") !== "natal") return;
    try {
      if (window.localStorage.getItem(NATAL_DISMISSED_KEY) === "1") return;
    } catch {
      /* localStorage unavailable */
    }
    setVisible(true);
  }, [params]);

  if (!visible) return null;

  const dismiss = () => {
    setVisible(false);
    try {
      window.localStorage.setItem(NATAL_DISMISSED_KEY, "1");
    } catch {
      /* ignore */
    }
  };

  return (
    <div
      className="border border-alchm-copper/30 bg-alchm-copper/5 text-alchm-copper/80 rounded px-4 py-2"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
      }}
    >
      <Link
        href="/onboarding"
        style={{
          flex: 1,
          fontSize: 13,
          textDecoration: "none",
          color: "inherit",
        }}
      >
        Complete your natal chart to unlock personalized cosmic recommendations
        →
      </Link>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss"
        style={{
          background: "transparent",
          border: "none",
          cursor: "pointer",
          color: "inherit",
          fontSize: 16,
          lineHeight: 1,
          padding: "0 4px",
          opacity: 0.6,
          flexShrink: 0,
        }}
      >
        ×
      </button>
    </div>
  );
}

const DynamicBestMatchExplorer = dynamic(
  () =>
    import("@/components/RestaurantDiscovery/BestMatchExplorer").then(
      (mod) => mod.BestMatchExplorer,
    ),
  { loading: () => <SectionLoader label="Loading nearby restaurants…" /> },
);

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
  () => import("@/components/recommendations/EnhancedCookingMethodRecommender"),
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
              border:
                "1px solid color-mix(in oklch, var(--accent), transparent 60%)",
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
  const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null);
  const [prepTab, setPrepTab] = useState<"sauces" | "methods">("sauces");

  return (
    <>
      {/* The root layout already provides the main landmark. */}
      <div
        className="alchm-home-shell"
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "20px 16px 48px",
          display: "flex",
          flexDirection: "column",
          gap: 22,
          position: "relative",
        }}
      >
        <style>{`
          @media (max-width: 640px) {
            .alchm-home-shell { padding-inline: 12px !important; }
          }
          .alchm-home-cookmethods :is(h1, h2, h3, h4) { color: var(--fg); }
        `}</style>

        {/* The consolidated hero: masthead + "Who's eating tonight?" +
            capability preview grid + meal-crafting quiz, one surface. */}
        <LiveHero />

        {/* Natal chart soft-prompt banner (shown after skip) */}
        <NatalPromptBanner />

        {/* 1 · CUISINE RECOMMENDER */}
        <HomeSection
          tag="CUISINE · LIVE RECOMMENDATION"
          title="Tonight's cuisine, tuned to the sky"
          cta={{ label: "All cuisines", href: "/cuisines" }}
        >
          <DynamicCuisineRecommender
            selectedCuisine={selectedCuisine}
            onSelectCuisine={(c) => setSelectedCuisine(c === selectedCuisine ? null : c)}
          />
        </HomeSection>

        {/* FEATURED BLOCKCHAIN RECIPE SHOWCASE */}
        <HomeSection
          tag="LEDGER · BLOCKCHAIN SHOWCASE"
          title="Featured Recipe of the Month"
        >
          <FeaturedRecipe />
        </HomeSection>

        {/* 2 · INGREDIENT RECOMMENDER */}
        <HomeSection
          tag="INGREDIENTS · LIVE SKY"
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
          <EnhancedIngredientRecommender compact maxItems={6} />
        </HomeSection>

        {/* 3 · CELESTIAL PREP (COMBINED SAUCE + METHODS RECOMMENDER) */}
        <HomeSection
          tag="PREPARATION · CELESTIAL PREP"
          title="Celestial Prep: Sauces & Methods"
        >
          <div
            style={{
              display: "flex",
              gap: 8,
              borderBottom: "1px solid var(--line-hi)",
              marginBottom: 16,
              paddingBottom: 8,
            }}
          >
            <button
              type="button"
              onClick={() => setPrepTab("sauces")}
              className="t-mono"
              style={{
                fontSize: 10,
                fontWeight: "bold",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                padding: "6px 12px",
                borderRadius: 6,
                border: "1px solid",
                background: prepTab === "sauces" ? "rgba(255,255,255,0.06)" : "transparent",
                borderColor: prepTab === "sauces" ? "var(--accent)" : "transparent",
                color: prepTab === "sauces" ? "var(--accent)" : "var(--fg-mute)",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              Sauces
            </button>
            <button
              type="button"
              onClick={() => setPrepTab("methods")}
              className="t-mono"
              style={{
                fontSize: 10,
                fontWeight: "bold",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                padding: "6px 12px",
                borderRadius: 6,
                border: "1px solid",
                background: prepTab === "methods" ? "rgba(255,255,255,0.06)" : "transparent",
                borderColor: prepTab === "methods" ? "var(--accent)" : "transparent",
                color: prepTab === "methods" ? "var(--accent)" : "var(--fg-mute)",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              Cooking Methods
            </button>
          </div>

          {prepTab === "sauces" ? (
            <EnhancedSauceRecommender />
          ) : (
            <div className="alchm-home-cookmethods">
              <EnhancedCookingMethodRecommender />
            </div>
          )}
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
              border:
                "1px dashed color-mix(in oklch, var(--accent), transparent 60%)",
              borderRadius: 999,
            }}
          >
            Open the Laboratory →
          </Link>
        </div>

        {/* Restaurant Discovery Slide-out Drawer */}
        <div
          style={{
            position: "fixed",
            top: 0,
            right: 0,
            height: "100%",
            width: "100%",
            maxWidth: 460,
            backgroundColor: "#0E0C16",
            borderLeft: "1px solid rgba(255,255,255,0.08)",
            zIndex: 100,
            boxShadow: "-10px 0 30px rgba(0,0,0,0.5)",
            transform: selectedCuisine ? "translateX(0)" : "translateX(100%)",
            transition: "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Drawer Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "20px 24px",
              borderBottom: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <div>
              <div
                className="t-tag"
                style={{ color: "var(--accent-2)", fontSize: 9, letterSpacing: "0.15em", marginBottom: 2 }}
              >
                CUISINE DISCOVERY
              </div>
              <h2
                className="t-display"
                style={{ fontSize: 20, margin: 0, color: "var(--fg)" }}
              >
                {selectedCuisine ? `${selectedCuisine} Matches` : "Discovery"}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setSelectedCuisine(null)}
              aria-label="Close drawer"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "50%",
                width: 32,
                height: 32,
                cursor: "pointer",
                color: "var(--fg-dim)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
                transition: "all 0.2s",
              }}
            >
              ✕
            </button>
          </div>

          {/* Drawer Content */}
          <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
            {selectedCuisine && (
              <DynamicBestMatchExplorer
                initialCuisine={selectedCuisine}
                showHeader={false}
              />
            )}
          </div>
        </div>

        {/* Drawer Backdrop Overlay */}
        {selectedCuisine && (
          <div
            onClick={() => setSelectedCuisine(null)}
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.6)",
              backdropFilter: "blur(4px)",
              zIndex: 99,
              transition: "opacity 0.3s ease-out",
            }}
          />
        )}
      </div>
    </>
  );
}
