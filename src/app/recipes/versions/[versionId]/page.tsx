import { notFound } from "next/navigation";
import { z } from "zod";
import { SavedAdaptationView } from "@/components/recipes/SavedAdaptationView";
import {
  adaptationPublication,
  loadSavedAdaptation,
} from "@/lib/recipes/savedAdaptationPersistence";
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
  return (
    <SavedAdaptationView
      version={version}
      publication={await adaptationPublication(versionId)}
    />
  );
}
