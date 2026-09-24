"use client";

/**
 * The dossier's hero row: identity (image, name, description, chips), the
 * live sky match, and recipe usage. Markup and styles carried over from the
 * (alchm) dossier page.
 */
import Image from "next/image";
import { CompatibilityRing, ElementalMeter } from "@/components/ui/alchm";
import { useAlchemicalSafe } from "@/contexts/AlchemicalContext/hooks";
import { dominantElement, type DossierCard } from "@/lib/ingredients/dossierView";
import { skyMatch, toElementalValues } from "./dossierCharts";
import type { CSSProperties, JSX } from "react";

const PANEL: CSSProperties = { padding: "22px 24px", display: "flex", flexDirection: "column" };
const MUTED_MONO: CSSProperties = { fontSize: 9, color: "var(--fg-mute)" };

function HeroImage({ src, alt }: { src: string; alt: string }): JSX.Element {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: "16 / 9",
        background: "linear-gradient(135deg, color-mix(in oklch, var(--accent), transparent 80%), var(--bg))",
      }}
    >
      <Image src={src} alt={alt} fill sizes="(max-width: 760px) 100vw, 50vw" style={{ objectFit: "cover" }} priority />
    </div>
  );
}

function IdentityChips({ card }: { card: DossierCard }): JSX.Element {
  const dom = dominantElement(card.elemental);
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
      {dom && (
        <span className="alchm-chip" style={{ borderColor: `color-mix(in oklch, var(--el-${dom.key}), transparent 50%)` }}>
          <span className={`el-dot el-${dom.key}`} />
          {dom.key.toUpperCase()} · {(dom.value * 100).toFixed(0)}%
        </span>
      )}
      {card.qualities.slice(0, 4).map((quality) => (
        <span key={quality} className="alchm-chip">
          {quality}
        </span>
      ))}
    </div>
  );
}

export function IdentityPanel({ card }: { card: DossierCard }): JSX.Element {
  const tag = `${card.category.toUpperCase()}${card.subcategory ? ` · ${card.subcategory.toUpperCase()}` : ""}`;
  return (
    <div className="alchm-panel" style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
      {card.imageUrl !== null && <HeroImage src={card.imageUrl} alt={card.name} />}
      <div style={{ padding: "22px 24px" }}>
        <div className="t-tag" style={{ color: "var(--accent)" }}>
          {tag}
        </div>
        <h1
          className="t-display"
          style={{ fontSize: 44, lineHeight: 1.05, margin: "10px 0 6px", color: "var(--fg)", textTransform: "capitalize" }}
        >
          {card.name}
        </h1>
        {card.description !== null && (
          <p style={{ color: "var(--fg-dim)", fontSize: 13, lineHeight: 1.55, margin: "8px 0 16px", maxWidth: 520 }}>
            {card.description}
          </p>
        )}
        <IdentityChips card={card} />
      </div>
    </div>
  );
}

export function SkyMatchPanel({ card }: { card: DossierCard }): JSX.Element {
  const alch = useAlchemicalSafe();
  const hour = alch?.planetaryHour ?? null;
  const { hourElement, score } = skyMatch(card.elemental, hour);
  const meter = toElementalValues(card.elemental);
  return (
    <div className="alchm-panel" style={{ ...PANEL, gap: 12, alignItems: "stretch" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span className="t-tag">SKY MATCH</span>
        <span className="t-mono" style={MUTED_MONO}>
          {hour?.toUpperCase() ?? "—"} HOUR
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <CompatibilityRing value={score} size={120} />
        <div>
          <div className="t-display" style={{ fontSize: 32, color: "var(--fg)" }}>
            {(score * 100).toFixed(0)}
            <span style={{ fontSize: 14, color: "var(--fg-mute)" }}>%</span>
          </div>
          <div className="t-mono" style={{ ...MUTED_MONO, marginTop: 4 }}>
            vs. {hourElement.toUpperCase()} TRANSIT
          </div>
          <div className="t-mono" style={{ ...MUTED_MONO, marginTop: 4 }}>
            RULER · {(card.planetaryRuler ?? "—").toUpperCase()}
          </div>
        </div>
      </div>
      {meter && (
        <>
          <div className="alchm-rule" />
          <ElementalMeter values={meter} />
        </>
      )}
    </div>
  );
}

function ChipList({ label, items }: { label: string; items: readonly string[] }): JSX.Element | null {
  if (items.length === 0) return null;
  return (
    <>
      <div className="alchm-rule" />
      <div>
        <div className="t-tag" style={{ marginBottom: 8 }}>
          {label}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {items.slice(0, 4).map((item) => (
            <span key={item} className="alchm-chip">
              {item}
            </span>
          ))}
        </div>
      </div>
    </>
  );
}

export function UsagePanel({ card, recipeCount }: { card: DossierCard; recipeCount: number }): JSX.Element {
  return (
    <div className="alchm-panel" style={{ ...PANEL, gap: 18 }}>
      <div>
        <div className="t-tag">RECIPE INDEX</div>
        <div className="t-display" style={{ fontSize: 34, color: "var(--fg)", marginTop: 6 }}>
          {recipeCount.toString().padStart(3, "0")}
        </div>
        <div className="t-mono" style={MUTED_MONO}>
          RECIPES REFERENCE THIS INGREDIENT
        </div>
      </div>
      <div className="alchm-rule" />
      <div>
        <div className="t-tag" style={{ marginBottom: 8 }}>
          ORIGIN
        </div>
        <div style={{ fontSize: 12, color: "var(--fg-dim)" }}>{card.origin.length > 0 ? card.origin.join(" · ") : "—"}</div>
      </div>
      <ChipList label="HEALTH SIGNALS" items={card.healthBenefits} />
    </div>
  );
}
