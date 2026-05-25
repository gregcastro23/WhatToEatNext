"use client";

import Image from "next/image";
import { useState } from "react";
import { CompatibilityRing } from "./CompatibilityRing";
import type { JSX } from "react";

export type IngredientElement = "fire" | "water" | "earth" | "air";

export interface IngredientCardData {
  id: string;
  name: string;
  /** Category label, e.g. "PROTEIN" */
  category: string;
  /** One of fire/water/earth/air */
  element: IngredientElement;
  /** 0-1 score */
  match: number;
  /** Spirit/Essence/Matter/Substance values 0-1 */
  properties: { spirit: number; essence: number; matter: number; substance: number };
  /** Planet glyph ☉ ☽ ☿ ♀ ♂ ♃ ♄ */
  planet: string;
  /** Hue 0-360 for the card backdrop tint */
  hue: number;
  /** Optional resolved image URL — when present, overlays the gradient backdrop. */
  imageUrl?: string;
}

export interface IngredientCardProps {
  ing: IngredientCardData;
  onClick?: (id: string) => void;
}

const PROP_LABELS: Array<[string, keyof IngredientCardData["properties"]]> = [
  ["SPI", "spirit"],
  ["ESS", "essence"],
  ["MAT", "matter"],
  ["SUB", "substance"],
];

export function IngredientCard({ ing, onClick }: IngredientCardProps): JSX.Element {
  const [imgFailed, setImgFailed] = useState(false);
  const showImage = Boolean(ing.imageUrl) && !imgFailed;
  return (
    <button
      type="button"
      onClick={() => onClick?.(ing.id)}
      className="alchm-panel"
      style={{
        padding: 0,
        overflow: "hidden",
        position: "relative",
        textAlign: "left",
        cursor: onClick ? "pointer" : "default",
        background: "linear-gradient(180deg, rgba(255,255,255,0.025), rgba(255,255,255,0.005))",
        border: "1px solid var(--line)",
        borderRadius: "var(--radius)",
        width: "100%",
      }}
    >
      <div
        style={{
          position: "relative",
          aspectRatio: "5/3",
          background: `
            radial-gradient(circle at 60% 40%, oklch(0.5 0.14 ${ing.hue} / 0.6), transparent 60%),
            repeating-linear-gradient(45deg, rgba(255,255,255,0.025) 0 1px, transparent 1px 8px),
            linear-gradient(180deg, #1A1525, #0E0B16)
          `,
          borderBottom: "1px solid var(--line)",
        }}
      >
        {showImage && ing.imageUrl && (
          <Image
            src={ing.imageUrl}
            alt={ing.name}
            fill
            sizes="(min-width: 1100px) 25vw, (min-width: 600px) 50vw, 100vw"
            loading="lazy"
            onError={() => setImgFailed(true)}
            style={{ objectFit: "cover", opacity: 0.78 }}
          />
        )}
        {showImage && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(180deg, transparent 35%, rgba(8, 8, 14, 0.55) 100%)",
              pointerEvents: "none",
            }}
          />
        )}
        <div style={{ position: "absolute", top: 8, left: 10, display: "flex", alignItems: "center", gap: 6 }}>
          <span className={`el-dot el-${ing.element}`} />
          <span className="t-tag" style={{ fontSize: 8 }}>
            {ing.category}
          </span>
        </div>
        <div
          style={{
            position: "absolute",
            top: 8,
            right: 10,
            fontFamily: "JetBrains Mono",
            fontSize: 14,
            color: "var(--accent-2)",
          }}
        >
          {ing.planet}
        </div>
        <div style={{ position: "absolute", bottom: 8, right: 10 }}>
          <CompatibilityRing value={ing.match} size={48} label="" />
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 8,
            left: 10,
            fontFamily: "JetBrains Mono",
            fontSize: 9,
            color: "var(--fg-faint)",
            letterSpacing: "0.14em",
          }}
        >
          ID · {ing.id.toUpperCase()}
        </div>
      </div>
      <div style={{ padding: "12px 14px" }}>
        <div className="t-display" style={{ fontSize: 19, color: "var(--fg)", lineHeight: 1.1 }}>
          {ing.name}
        </div>
        <div style={{ marginTop: 8, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
          {PROP_LABELS.map(([k, prop]) => (
            <div
              key={k}
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontFamily: "JetBrains Mono",
                fontSize: 9,
                color: "var(--fg-mute)",
              }}
            >
              <span>{k}</span>
              <span style={{ color: "var(--fg)" }}>{ing.properties[prop].toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>
    </button>
  );
}

export default IngredientCard;
