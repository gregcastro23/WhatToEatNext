"use client";

import dynamic from "next/dynamic";

function SaucePanelSkeleton({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8">
      <div className="h-5 w-48 rounded-full bg-white/10 animate-pulse" />
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <div className="h-24 rounded-xl bg-white/5 animate-pulse" />
        <div className="h-24 rounded-xl bg-white/5 animate-pulse" />
        <div className="h-24 rounded-xl bg-white/5 animate-pulse" />
      </div>
      <p className="mt-4 text-sm text-white/40">{label}</p>
    </div>
  );
}

const EnhancedSauceRecommender = dynamic(
  () => import("@/components/recommendations/EnhancedSauceRecommender"),
  {
    ssr: false,
    loading: () => <SaucePanelSkeleton label="Loading sauce recommender..." />,
  },
);

const SauceLineageTree = dynamic(
  () => import("@/components/recommendations/SauceLineageTree"),
  {
    ssr: false,
    loading: () => <SaucePanelSkeleton label="Loading sauce lineage map..." />,
  },
);

export default function SaucesClient() {
  return (
    <>
      <section>
        <EnhancedSauceRecommender />
      </section>

      <section>
        <SauceLineageTree />
      </section>
    </>
  );
}
