/**
 * Alchemical Pantry — ingredient discovery & Amazon sourcing.
 *
 * Server component: it imports the full ingredient catalog on the server,
 * projects it down to the fields the UI actually uses (see
 * `getSlimIngredients`), and hands that slim array to the client island. This
 * keeps the static prerender (and SEO) while keeping the 2.6 MB catalog out of
 * the client JS bundle — the data now rides in the RSC/HTML payload as props
 * instead of being imported into a `"use client"` module.
 */

import { getSlimIngredients } from "@/lib/ingredients/slimIngredients";
import { IngredientsExplorer } from "./IngredientsExplorer";

export default function IngredientsPage() {
  return <IngredientsExplorer ingredients={getSlimIngredients()} />;
}
