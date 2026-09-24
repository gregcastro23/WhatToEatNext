/**
 * Styled 404 for a slug no ingredient card owns. The page calls notFound(),
 * so this renders with a real HTTP 404.
 */
import Link from "next/link";
import type { JSX } from "react";

export default function IngredientNotFound(): JSX.Element {
  return (
    <div style={{ minHeight: "calc(100vh - 70px)", background: "var(--bg)", padding: 20 }}>
      <div
        style={{
          padding: 28,
          border: "1px dashed color-mix(in oklch, var(--accent), transparent 60%)",
          borderRadius: 10,
          maxWidth: 640,
          margin: "40px auto",
        }}
      >
        <div className="t-tag" style={{ color: "var(--accent)" }}>
          INGREDIENT NOT FOUND
        </div>
        <p style={{ color: "var(--fg-dim)", marginTop: 8, fontSize: 13 }}>
          No ingredient card has this address. Browse{" "}
          <Link href="/ingredients" style={{ color: "var(--accent)" }}>
            all ingredients
          </Link>{" "}
          or return to the{" "}
          <Link href="/" style={{ color: "var(--accent)" }}>
            kitchen dashboard
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
