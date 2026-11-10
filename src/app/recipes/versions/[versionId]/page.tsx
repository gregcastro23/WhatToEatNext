import { notFound } from "next/navigation";
import { z } from "zod";
import { SavedAdaptationView } from "@/components/recipes/SavedAdaptationView";
import {
  adaptationPublication,
  loadSavedAdaptation,
} from "@/lib/recipes/savedAdaptationPersistence";
import { recomputeSavedVersionReadings } from "@/utils/dietaryAdaptation";
import type { JSX } from "react";

export const dynamic = "force-dynamic";

export default async function SavedVersionPage({
  params,
}: {
  params: Promise<{ versionId: string }>;
}): Promise<JSX.Element> {
  const { versionId } = await params;
  if (!z.string().uuid().safeParse(versionId).success) notFound();
  const version = await loadSavedAdaptation(versionId);
  if (!version) notFound();
  const readings = recomputeSavedVersionReadings({
    ingredients: version.recipe.ingredients,
    ...(version.recipe.numberOfServings !== undefined
      ? { numberOfServings: version.recipe.numberOfServings }
      : {}),
    ...(version.recipe.servingSize !== undefined
      ? { servingSize: version.recipe.servingSize }
      : {}),
  });
  return (
    <SavedAdaptationView
      version={version}
      publication={await adaptationPublication(versionId)}
      readings={readings}
    />
  );
}
