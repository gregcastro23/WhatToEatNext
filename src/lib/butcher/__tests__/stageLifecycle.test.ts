/**
 * @jest-environment jsdom
 *
 * WebGL lifecycle, PMREM disposal, pixelRatio cap, and context-loss/recovery
 * regression tests for `mountButcherWebGLStage` & `attachWebGLContextLifecycle`.
 */
import * as THREE from "three";
import { SPECIES_LIST } from "@/data/butcher/cutsCatalogue";
import { BUTCHER_CAMERA_FRAMINGS } from "@/lib/butcher/stage/cameraFramings";
import { sharedButcherGeometryStats } from "@/lib/butcher/stage/sharedButcherGeometry";
import {
  mountButcherWebGLStage,
  type StageMutableRefs,
} from "@/app/(alchm)/kitchen-lab/butcher/_lab/stageLoop";

const mockSetPixelRatio = jest.fn();
const mockSetClearColor = jest.fn();
const mockSetSize = jest.fn();
const mockRender = jest.fn();
const mockRendererDispose = jest.fn();
const mockForceContextLoss = jest.fn();
const mockEnvDispose = jest.fn();
const mockCreateEnv = jest.fn(() => ({
  texture: new THREE.Texture(),
  dispose: mockEnvDispose,
}));

jest.mock("three", () => {
  const actual = jest.requireActual<typeof import("three")>("three");
  return {
    ...actual,
    WebGLRenderer: jest.fn(() => ({
      setPixelRatio: mockSetPixelRatio,
      setClearColor: mockSetClearColor,
      setSize: mockSetSize,
      render: mockRender,
      dispose: mockRendererDispose,
      forceContextLoss: mockForceContextLoss,
      outputColorSpace: actual.SRGBColorSpace,
      toneMapping: actual.ACESFilmicToneMapping,
      toneMappingExposure: 1,
    })),
  };
});

jest.mock("@/lib/butcher/stage/butcherStudioLighting", () => {
  const actual = jest.requireActual<typeof import("@/lib/butcher/stage/butcherStudioLighting")>(
    "@/lib/butcher/stage/butcherStudioLighting",
  );
  return {
    ...actual,
    createButcherStudioEnvironment: () => mockCreateEnv(),
  };
});

function createMutableStageRefs(speciesId: (typeof SPECIES_LIST)[number]["id"]): StageMutableRefs {
  const base = BUTCHER_CAMERA_FRAMINGS["whole-carcass"];
  return {
    rigRef: { current: null },
    sceneRef: { current: null },
    cameraRef: { current: null },
    propsRef: {
      current: {
        speciesId,
        selectedCutId: "ribeye",
        hoveredCutId: null,
        targetCutId: null,
        explodeFactor: 0.25,
        colorMode: "anatomical",
        framing: "whole-carcass",
        showSlicePlane: false,
        sliceAngleDeg: 45,
        onSelectCut: jest.fn(),
        onHoverCut: jest.fn(),
        onSliceAngleChange: jest.fn(),
      },
    },
    pausedRef: { current: false },
    dragStateRef: {
      current: { active: false, startX: 0, startY: 0, lastX: 0, lastY: 0, movedPx: 0, slicingDrag: false },
    },
    camFromPos: { current: new THREE.Vector3(...base.pos) },
    camToPos: { current: new THREE.Vector3(...base.pos) },
    camCurrPos: { current: new THREE.Vector3(...base.pos) },
    camFromLook: { current: new THREE.Vector3(...base.lookAt) },
    camToLook: { current: new THREE.Vector3(...base.lookAt) },
    camCurrLook: { current: new THREE.Vector3(...base.lookAt) },
    camFromFov: { current: base.fov },
    camToFov: { current: base.fov },
    camTransElapsed: { current: 0.48 },
    orbitYawRef: { current: 0 },
    orbitPitchRef: { current: 0.08 },
    pointerXRef: { current: 0 },
    pointerYRef: { current: 0 },
  };
}

describe("WebGL context lifecycle, DPR cap, and zero-leak tab unmounts", () => {
  const originalRaf = globalThis.requestAnimationFrame;
  const originalCaf = globalThis.cancelAnimationFrame;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    Object.defineProperty(window, "devicePixelRatio", { configurable: true, value: 3 });
    globalThis.requestAnimationFrame = (cb: FrameRequestCallback): number =>
      Number(setTimeout(() => cb(Date.now()), 16));
    globalThis.cancelAnimationFrame = (id: number): void => {
      clearTimeout(id);
    };
  });

  afterEach(() => {
    jest.useRealTimers();
    globalThis.requestAnimationFrame = originalRaf;
    globalThis.cancelAnimationFrame = originalCaf;
  });

  it("caps pixelRatio at 2, handles unrecovered webglcontextlost with SVG fallback, and cleans up on unmount", () => {
    const canvas = document.createElement("canvas");
    const wrap = document.createElement("div");
    const refs = createMutableStageRefs("beef");
    const onFallbackSvg = jest.fn();

    const unmount = mountButcherWebGLStage(canvas, wrap, refs, onFallbackSvg);
    expect(onFallbackSvg).not.toHaveBeenCalled();
    expect(refs.sceneRef.current).not.toBeNull();
    expect(refs.rigRef.current).not.toBeNull();
    expect(mockSetPixelRatio).toHaveBeenCalledWith(2);
    expect(mockCreateEnv).toHaveBeenCalledTimes(1);

    const lostEvent = new Event("webglcontextlost", { cancelable: true });
    canvas.dispatchEvent(lostEvent);
    expect(lostEvent.defaultPrevented).toBe(true);
    expect(onFallbackSvg).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1850);
    expect(onFallbackSvg).toHaveBeenCalledTimes(1);

    unmount();
    expect(mockEnvDispose).toHaveBeenCalledTimes(1);
    expect(mockRendererDispose).toHaveBeenCalledTimes(1);
    expect(mockForceContextLoss).toHaveBeenCalledTimes(1);
    expect(sharedButcherGeometryStats()).toEqual({ geometries: 0, leases: 0 });
  });

  it("recovers environment on webglcontextrestored and avoids leaks across 10 mount/unmount switches", () => {
    const canvas = document.createElement("canvas");
    const wrap = document.createElement("div");
    const refs = createMutableStageRefs("finfish");
    const onFallbackSvg = jest.fn();

    const unmount = mountButcherWebGLStage(canvas, wrap, refs, onFallbackSvg);
    const lostEvent = new Event("webglcontextlost", { cancelable: true });
    canvas.dispatchEvent(lostEvent);
    canvas.dispatchEvent(new Event("webglcontextrestored"));
    jest.advanceTimersByTime(2000);

    expect(onFallbackSvg).not.toHaveBeenCalled();
    expect(mockEnvDispose).toHaveBeenCalledTimes(1);
    expect(mockCreateEnv).toHaveBeenCalledTimes(2);
    unmount();

    // Simulate 10 repeated tab/species mount-unmount switches across all 5 species
    for (let i = 0; i < 10; i += 1) {
      const species = SPECIES_LIST[i % SPECIES_LIST.length];
      if (!species) continue;
      const cycleRefs = createMutableStageRefs(species.id);
      const cleanup = mountButcherWebGLStage(canvas, wrap, cycleRefs, jest.fn());
      cleanup();
    }

    expect(mockRendererDispose).toHaveBeenCalledTimes(11);
    expect(mockForceContextLoss).toHaveBeenCalledTimes(11);
    expect(sharedButcherGeometryStats()).toEqual({ geometries: 0, leases: 0 });
  });
});
