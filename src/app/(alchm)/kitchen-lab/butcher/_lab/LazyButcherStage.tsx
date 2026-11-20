"use client";

import dynamic from "next/dynamic";
import type { ButcherStageProps } from "./stageTypes";
import type { JSX } from "react";

/**
 * Dynamic isolation boundary (`ssr: false`) for Three.js so `three` is strictly
 * bundled into `/kitchen-lab/butcher` and adds 0 B to shared layout chunks or
 * any budgeted route.
 *
 * @file src/app/(alchm)/kitchen-lab/butcher/_lab/LazyButcherStage.tsx
 */

const DynamicButcherStageCanvas = dynamic<ButcherStageProps>(
  () => import("./ButcherStageCanvas").then((m) => m.ButcherStageCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="bt-stage-frame flex h-[280px] items-center justify-center text-xs text-white/50 sm:h-[360px]">
        Loading Butcher Stage…
      </div>
    ),
  },
);

export function LazyButcherStage(props: ButcherStageProps): JSX.Element {
  return <DynamicButcherStageCanvas {...props} />;
}
