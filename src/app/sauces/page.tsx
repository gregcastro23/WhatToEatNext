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
    <div className="alchm-root lab min-h-screen text-white p-4 md:p-8 lg:p-12 relative overflow-hidden">
      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        <header className="mb-8">
          <div className="t-tag flex items-center gap-2 mb-3 text-violet-300 font-mono tracking-widest text-[11px]">
            <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse shadow-[0_0_8px_rgba(167,139,250,0.8)]" />
            <span>ALCHEMICAL EMULSIONS & PAIRINGS</span>
            <span className="text-white/30">·</span>
            <span className="text-amber-300/80">SACRED CUISINE ENGINE</span>
          </div>

          <h1 className="t-display text-4xl sm:text-5xl md:text-6xl font-medium tracking-tight text-white mb-4">
            Cosmic Sauce Recommender
          </h1>

          <p className="font-body text-sm sm:text-base text-white/60 max-w-3xl leading-relaxed">
            Find the perfect finish to complement, contrast, enhance, or balance your culinary creations
            using four-element vector matching, traditional mother sauce lineages, cosmic transits, and batch scaling.
          </p>
        </header>

        {sauce ? <SauceFocusCard sauce={sauce} /> : null}

        <SaucesClient />
      </div>
    </div>
  );
}
