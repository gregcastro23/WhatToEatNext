"use client";

/**
 * Sticky "trending now" strip: the current sky's top ingredients from
 * /api/recommendations/ingredients, each linking to its dossier slug.
 */
import Link from "next/link";
import { useEffect, useState, type CSSProperties, type JSX } from "react";
import { ingredientHref } from "@/lib/ingredients/ingredientSlug";
import { RecommendedIngredientsResponseSchema, type RecommendedIngredient } from "@/lib/schemas/dashboard";

const BAR_STYLE: CSSProperties = {
  position: "sticky",
  top: 56,
  zIndex: 10,
  borderBottom: "1px solid var(--line)",
  background: "color-mix(in oklch, var(--bg), transparent 25%)",
  backdropFilter: "blur(10px)",
};

const LABEL_STYLE: CSSProperties = {
  fontSize: 9,
  letterSpacing: "0.18em",
  color: "var(--accent)",
  paddingRight: 12,
  borderRight: "1px solid var(--line)",
  whiteSpace: "nowrap",
  flexShrink: 0,
};

function useTrendingIngredients(): RecommendedIngredient[] {
  const [items, setItems] = useState<RecommendedIngredient[]>([]);
  useEffect(() => {
    let cancelled = false;
    fetch("/api/recommendations/ingredients?limit=8", { cache: "no-store" })
      .then(async (res): Promise<unknown> => (res.ok ? res.json() : null))
      .then((body) => {
        const parsed = RecommendedIngredientsResponseSchema.safeParse(body);
        if (!cancelled) setItems(parsed.success ? parsed.data.ingredients : []);
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      });
    return (): void => {
      cancelled = true;
    };
  }, []);
  return items;
}

function TickerLink({ item, last }: { item: RecommendedIngredient; last: boolean }): JSX.Element {
  return (
    <Link
      href={ingredientHref(item.id)}
      className="t-mono"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "4px 14px",
        fontSize: 11,
        color: "var(--fg)",
        textDecoration: "none",
        borderRight: last ? "none" : "1px solid var(--line)",
        whiteSpace: "nowrap",
        flexShrink: 0,
      }}
    >
      <span className={`el-dot el-${item.elemental_affinity}`} />
      <span style={{ letterSpacing: "0.06em" }}>{item.name.toUpperCase()}</span>
      <span style={{ color: "var(--accent)", fontWeight: 600 }}>{(item.match_score * 100).toFixed(0)}</span>
    </Link>
  );
}

export function TrendingTicker(): JSX.Element {
  const items = useTrendingIngredients();
  return (
    <div style={BAR_STYLE}>
      <div style={{ display: "flex", alignItems: "center", padding: "8px 14px", overflowX: "auto", scrollbarWidth: "none" }}>
        <span className="t-mono" style={LABEL_STYLE}>
          TRENDING · NOW
        </span>
        {items.length === 0 ? (
          <span className="t-mono" style={{ fontSize: 10, color: "var(--fg-mute)", paddingLeft: 12, whiteSpace: "nowrap" }}>
            ticker awaiting <code>/api/recommendations/ingredients</code>
          </span>
        ) : (
          items.map((item, i) => <TickerLink key={item.id} item={item} last={i === items.length - 1} />)
        )}
      </div>
    </div>
  );
}
