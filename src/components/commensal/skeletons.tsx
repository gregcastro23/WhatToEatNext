"use client";

import React from "react";

const PULSE = "animate-pulse";

const SK_THEME = {
  dark: {
    container: "glass-card-premium rounded-3xl p-6 md:p-7 border border-white/10",
    block: "bg-white/10",
    blockSoft: "bg-white/5",
    chartBg: "bg-white/5 border border-white/10",
  },
  light: {
    container: "bg-white border border-gray-200 rounded-2xl p-5 shadow-sm",
    block: "bg-gray-200",
    blockSoft: "bg-gray-100",
    chartBg: "bg-gray-100 border border-gray-200",
  },
};

export function CompositeEnergySkeleton({
  theme = "dark",
}: {
  theme?: "dark" | "light";
}) {
  const t = SK_THEME[theme];
  return (
    <div className={t.container}>
      <div className={`flex items-center justify-between mb-6 ${PULSE}`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full ${t.block}`} />
          <div className="space-y-2">
            <div className={`h-4 w-40 rounded ${t.block}`} />
            <div className={`h-3 w-56 rounded ${t.blockSoft}`} />
          </div>
        </div>
        <div className={`h-6 w-20 rounded-full ${t.block}`} />
      </div>
      <div className={`grid md:grid-cols-2 gap-6 items-center ${PULSE}`}>
        <div className="flex justify-center">
          <div className={`w-64 h-64 rounded-full ${t.chartBg}`} />
        </div>
        <div className="space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={`h-4 rounded-full ${t.blockSoft}`} />
          ))}
          <div className="flex gap-2 pt-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className={`h-6 w-20 rounded-full ${t.block}`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function MethodsSkeleton() {
  return (
    <div className={`glass-card-premium rounded-2xl p-5 border border-white/10 ${PULSE}`}>
      <div className="h-4 w-48 bg-white/10 rounded mb-4" />
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/5">
            <div className="flex justify-between mb-2">
              <div className="h-3 w-28 bg-white/10 rounded" />
              <div className="h-3 w-10 bg-white/10 rounded" />
            </div>
            <div className="h-1 bg-white/10 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function RecipeSkeleton() {
  return (
    <div className={`glass-card-premium rounded-3xl p-6 border border-white/10 ${PULSE}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="space-y-2">
          <div className="h-3 w-32 bg-white/10 rounded" />
          <div className="h-6 w-56 bg-white/10 rounded" />
        </div>
        <div className="h-6 w-20 bg-white/10 rounded-full" />
      </div>
      <div className="h-3 w-full bg-white/5 rounded mb-2" />
      <div className="h-3 w-2/3 bg-white/5 rounded mb-5" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-5">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl bg-white/5 border border-white/5 p-3 h-14" />
        ))}
      </div>
      <div className="space-y-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-3 bg-white/5 rounded" />
        ))}
      </div>
    </div>
  );
}

export function RestaurantSkeleton() {
  return (
    <div className={`glass-card-premium rounded-3xl p-6 border border-white/10 ${PULSE}`}>
      <div className="h-5 w-48 bg-white/10 rounded mb-4" />
      <div className="grid sm:grid-cols-2 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-2">
            <div className="h-4 w-3/4 bg-white/10 rounded" />
            <div className="h-3 w-full bg-white/5 rounded" />
            <div className="h-3 w-2/3 bg-white/5 rounded" />
            <div className="flex gap-2 pt-1">
              <div className="h-5 w-16 bg-white/10 rounded-full" />
              <div className="h-5 w-12 bg-white/10 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
