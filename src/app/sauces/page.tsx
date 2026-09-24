import { SauceFocusCard } from "@/components/sauces/SauceFocusCard";
import { allSauces, type Sauce } from "@/data/sauces";
import { resolveSauceFocus } from "@/lib/sauces/sauceFocus";
import SaucesClient from "./SaucesClient";
import type { Metadata } from "next";
import type { JSX } from "react";

const TITLE = "Cosmic Sauce Recommender";
const DESCRIPTION =
  "Discover alchemically balanced sauce pairings with nutritional data, batch scaling, and meal planner integration.";

interface SaucesPageProps {
  /** `?focus=<sauce key>` opens one sauce above the recommender (omnibar Phase 4). */
  searchParams: Promise<{ focus?: string | string[] }>;
}

async function focusedSauce(searchParams: SaucesPageProps["searchParams"]): Promise<Sauce | undefined> {
  const key = resolveSauceFocus((await searchParams).focus, Object.keys(allSauces));
  return key === null ? undefined : allSauces[key];
}

export async function generateMetadata({ searchParams }: SaucesPageProps): Promise<Metadata> {
  const sauce = await focusedSauce(searchParams);
  return {
    title: sauce ? `${sauce.name} · Sauces` : TITLE,
    description: sauce?.description ?? DESCRIPTION,
    // One canonical page: a focused sauce is a view of /sauces, not a page of its own.
    alternates: { canonical: "/sauces" },
  };
}

export default async function SaucesPage({ searchParams }: SaucesPageProps): Promise<JSX.Element> {
  const sauce = await focusedSauce(searchParams);
  return (
    <div className="min-h-screen bg-[#08080e] text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{TITLE}</h1>
          <p className="text-white/60">
            Find the perfect sauce to complement, contrast, or balance your culinary creations using alchemical properties, nutritional analysis, and batch scaling.
          </p>
        </header>

        {sauce ? <SauceFocusCard sauce={sauce} /> : null}

        <SaucesClient />
      </div>
    </div>
  );
}
