import AlchmKitchenHome from "./HomePageClient";
import type { Metadata } from "next";
import type { JSX } from "react";

/**
 * The homepage's own canonical. It lives on this server page, not the
 * (alchm) group layout, because every route in the group would inherit a
 * layout's canonical and name the homepage as theirs.
 */
export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function HomePage(): JSX.Element {
  return <AlchmKitchenHome />;
}
