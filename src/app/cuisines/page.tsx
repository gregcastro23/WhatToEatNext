import CuisinesPage from "./CuisinesPageClient";
import type { Metadata } from "next";
import type { JSX } from "react";

/**
 * On the page rather than cuisines/layout.tsx: /cuisines/[slug] would inherit
 * a layout's canonical wherever it sets none (an unknown slug).
 */
export const metadata: Metadata = {
  alternates: { canonical: "/cuisines" },
};

export default function CuisinesRoute(): JSX.Element {
  return <CuisinesPage />;
}
