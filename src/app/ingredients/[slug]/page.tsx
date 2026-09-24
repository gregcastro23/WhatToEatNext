/**
 * /ingredients/[slug]: the ingredient dossier (omnibar Phase 2.5b, #870).
 *
 * Server-rendered, outside the (alchm) group: that group's loading.tsx wraps
 * its pages in Suspense, which turns notFound/permanentRedirect into HTTP 200s
 * (httpStatusBoundaries.test). Here the status is real: the canonical slug is
 * 200, any other spelling of a card is a 308 to its slug, anything else 404.
 */
import { notFound, permanentRedirect } from "next/navigation";
import { cache, type JSX } from "react";
import { IngredientDossierView } from "@/components/ingredients/dossier/IngredientDossierView";
import {
  dossierJsonLd,
  dossierSummary,
  getIngredientDossier,
  resolveDossierTarget,
  type IngredientDossier,
} from "@/lib/ingredients/dossier";
import { titleCase } from "@/lib/ingredients/dossierView";
import { getIngredientCatalog } from "@/lib/ingredients/ingredientCatalog";
import { ingredientHref } from "@/lib/ingredients/ingredientSlug";
import type { Metadata } from "next";

// The card is static data; "used in" follows the live recipe catalog. Hourly
// ISR, like recipe pages.
export const revalidate = 3600;

interface DossierPageProps {
  params: Promise<{ slug: string }>;
}

/** Deduped per request, so metadata and the page render one dossier. */
const loadDossier = cache(async (slug: string): Promise<IngredientDossier | null> => {
  const entry = getIngredientCatalog().bySlug.get(slug);
  return entry ? getIngredientDossier(entry) : null;
});

export async function generateMetadata({ params }: DossierPageProps): Promise<Metadata> {
  const { slug } = await params;
  const target = resolveDossierTarget(slug);
  const dossier = target.kind === "dossier" ? await loadDossier(target.entry.slug) : null;
  if (!dossier) return { title: "Ingredient not found", robots: { index: false } };
  const title = `${titleCase(dossier.card.name)} · Ingredient`;
  const description = dossierSummary(dossier);
  const url = ingredientHref(dossier.slug);
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "article",
      ...(dossier.card.imageUrl === null ? {} : { images: [dossier.card.imageUrl] }),
    },
  };
}

export default async function IngredientDossierPage({ params }: DossierPageProps): Promise<JSX.Element> {
  const { slug } = await params;
  const target = resolveDossierTarget(slug);
  if (target.kind === "missing") notFound();
  if (target.kind === "redirect") permanentRedirect(ingredientHref(target.slug));
  const dossier = await loadDossier(target.entry.slug);
  if (!dossier) notFound();
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: dossierJsonLd(dossier) }} />
      <IngredientDossierView dossier={dossier} />
    </>
  );
}
