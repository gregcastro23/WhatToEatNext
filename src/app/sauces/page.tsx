import Link from "next/link";
import { SauceFocusCard } from "@/components/sauces/SauceFocusCard";
import { resolveServerSauceFocus } from "@/lib/sauces/resolveServerSauceFocus";
import SaucesClient from "./SaucesClient";
import type { Metadata } from "next";
import type { JSX } from "react";

const TITLE = "Cosmic Sauce Recommender";
const DESCRIPTION =
  "Discover alchemically balanced sauce pairings with nutritional data, batch scaling, and meal planner integration.";

interface SaucesPageProps {
  /** `?focus=<sauce key|id>` opens one sauce above the recommender; `?cuisine=<name>` preselects a tradition. */
  searchParams: Promise<{ focus?: string | string[]; cuisine?: string | string[] }>;
}

export async function generateMetadata({ searchParams }: SaucesPageProps): Promise<Metadata> {
  const focused = resolveServerSauceFocus((await searchParams).focus);
  return {
    title: focused ? `${focused.sauce.name} · Sauces` : TITLE,
    description: focused?.sauce.description ?? DESCRIPTION,
    // One canonical page: a focused sauce is a view of /sauces, not a page of its own.
    alternates: { canonical: "/sauces" },
  };
}

export default async function SaucesPage({ searchParams }: SaucesPageProps): Promise<JSX.Element> {
  const params = await searchParams;
  const focused = resolveServerSauceFocus(params.focus);
  const rawCuisine = Array.isArray(params.cuisine) ? params.cuisine[0] : params.cuisine;
  const explicitCuisine = typeof rawCuisine === "string" && rawCuisine.trim().length > 0 ? rawCuisine.trim() : undefined;
  const initialCuisine = explicitCuisine ?? focused?.cuisine;
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

          <div className="mt-4">
            <Link
              href={initialCuisine ? `/kitchen-lab/sauces?cuisine=${encodeURIComponent(initialCuisine)}` : "/kitchen-lab/sauces"}
              prefetch={false}
              className="inline-flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-3.5 py-2 text-xs font-mono text-emerald-200 hover:border-emerald-300/60 hover:bg-emerald-400/15 transition-colors focus-visible:outline-2 focus-visible:outline-emerald-400 focus-visible:outline-offset-2"
            >
              <span>🧪</span>
              <span>Open Emulsion & Reduction Physics in Kitchen Lab →</span>
            </Link>
          </div>
        </header>

        {focused ? <SauceFocusCard sauce={focused.sauce} /> : null}

        <SaucesClient {...(initialCuisine ? { initialCuisine } : {})} />
      </div>
    </div>
  );
}
