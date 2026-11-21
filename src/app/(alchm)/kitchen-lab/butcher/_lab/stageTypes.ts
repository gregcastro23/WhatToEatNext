import type {
  CameraFramingId,
  ColorOverlayMode,
  SpeciesId,
} from "@/lib/butcher/types";

/**
 * Shared callback and state props contract between the lazy 3D WebGL stage
 * (`ButcherStageCanvas`) and the headless 2D SVG anatomical fallback (`ButcherSvgStage`).
 *
 * @file src/app/(alchm)/kitchen-lab/butcher/_lab/stageTypes.ts
 */

export interface ButcherStageProps {
  readonly speciesId: SpeciesId;
  readonly selectedCutId: string;
  readonly hoveredCutId: string | null;
  readonly targetCutId: string | null;
  readonly explodeFactor: number;
  readonly colorMode: ColorOverlayMode;
  readonly framing: CameraFramingId;
  readonly showSlicePlane: boolean;
  /** X-ray: show procedural skeletal landmarks and dim the muscle meshes. */
  readonly showBoneLandmarks: boolean;
  readonly sliceAngleDeg: number;
  readonly onSelectCut: (cutId: string) => void;
  readonly onHoverCut: (cutId: string | null) => void;
  readonly onSliceAngleChange: (angleDeg: number) => void;
}
