/**
 * /search?q= — the full results page the omnibar's Smart Enter and "see all"
 * open (omnibar Phase 3, #870). Server-rendered and strictly noindex (owner
 * decision, round 1): internal search results are unbounded thin content, so
 * crawlers may follow the links but never index a results page.
 */
import { SearchResultsView } from "@/components/search/SearchResultsView";
import { pageQuery, searchForPage } from "@/lib/search/searchPage";
import type { Metadata } from "next";
import type { JSX } from "react";

interface SearchPageProps {
  searchParams: Promise<{ q?: string | string[] }>;
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const query = pageQuery((await searchParams).q);
  return {
    title: query ? `“${query}” · Search` : "Search",
    description: "Search Alchm Kitchen's ingredients, recipes, cuisines, cooking methods and sauces.",
    alternates: { canonical: "/search" },
    robots: { index: false, follow: true, googleBot: { index: false, follow: true } },
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps): Promise<JSX.Element> {
  const query = pageQuery((await searchParams).q);
  const result = query ? await searchForPage(query, new Date()) : null;
  return <SearchResultsView query={query} result={result} />;
}
