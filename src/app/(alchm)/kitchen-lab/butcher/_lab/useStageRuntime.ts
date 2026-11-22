"use client";

import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type KeyboardEvent,
  type PointerEvent,
  type RefObject,
  type SetStateAction,
} from "react";
import * as THREE from "three";
import { BUTCHER_CAMERA_FRAMINGS } from "@/lib/butcher/stage/cameraFramings";
import { createCarcassRig, disposeCarcassRig, getCutWorldPosition } from "@/lib/butcher/stage/carcassAvatar3d";
import {
  type DragState,
  type StageMutableRefs,
  mountButcherWebGLStage,
  pickCutAtClientPoint,
  syncCarcassRigOverlay,
} from "./stageLoop";
import type { ButcherStageProps } from "./stageTypes";

/**
 * React hook owning WebGL capability probing, camera refs, lifecycle effects,
 * and pointer orbit/knife-slicing interactions for `ButcherStageCanvas`.
 *
 * @file src/app/(alchm)/kitchen-lab/butcher/_lab/useStageRuntime.ts
 */

export interface StagePointerHandlers {
  readonly onPointerDown: (e: PointerEvent<HTMLCanvasElement>) => void;
  readonly onPointerMove: (e: PointerEvent<HTMLCanvasElement>) => void;
  readonly onPointerUp: (e: PointerEvent<HTMLCanvasElement>) => void;
  readonly onPointerLeave: () => void;
  readonly onKeyDown: (e: KeyboardEvent<HTMLCanvasElement>) => void;
}

export interface ButcherStageRuntime {
  readonly webglSupported: boolean;
  readonly forceSvg: boolean;
  readonly setForceSvg: Dispatch<SetStateAction<boolean>>;
  readonly motionPaused: boolean;
  readonly setMotionPaused: Dispatch<SetStateAction<boolean>>;
  readonly wrapRef: RefObject<HTMLDivElement | null>;
  readonly canvasRef: RefObject<HTMLCanvasElement | null>;
  readonly pointerHandlers: StagePointerHandlers;
}

export function canCreateWebGL(): boolean {
  if (typeof window === "undefined" || typeof document === "undefined") return false;
  if (typeof navigator !== "undefined" && /jsdom/i.test(navigator.userAgent)) return false;
  try {
    const probe = document.createElement("canvas");
    const gl =
      probe.getContext("webgl2", { alpha: true, antialias: true }) ??
      probe.getContext("webgl", { alpha: true, antialias: true });
    return gl !== null;
  } catch {
    return false;
  }
}

function initialReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

const INITIAL_DRAG: DragState = {
  active: false,
  startX: 0,
  startY: 0,
  lastX: 0,
  lastY: 0,
  movedPx: 0,
  slicingDrag: false,
};

interface StageRefsBundle extends StageMutableRefs {
  readonly wrapRef: RefObject<HTMLDivElement | null>;
  readonly canvasRef: RefObject<HTMLCanvasElement | null>;
}

function useStageCameraRefs(props: ButcherStageProps, motionPaused: boolean): StageRefsBundle {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rigRef = useRef<THREE.Group | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;
  const pausedRef = useRef(motionPaused);
  pausedRef.current = motionPaused;

  const base = BUTCHER_CAMERA_FRAMINGS["whole-carcass"];
  const camFromPos = useRef(new THREE.Vector3(...base.pos));
  const camToPos = useRef(new THREE.Vector3(...base.pos));
  const camCurrPos = useRef(new THREE.Vector3(...base.pos));
  const camFromLook = useRef(new THREE.Vector3(...base.lookAt));
  const camToLook = useRef(new THREE.Vector3(...base.lookAt));
  const camCurrLook = useRef(new THREE.Vector3(...base.lookAt));
  const camFromFov = useRef<number>(base.fov);
  const camToFov = useRef<number>(base.fov);
  const camTransElapsed = useRef<number>(0.48);
  const orbitYawRef = useRef<number>(0);
  const orbitPitchRef = useRef<number>(0.08);
  const pointerXRef = useRef<number>(0);
  const pointerYRef = useRef<number>(0);
  const dragStateRef = useRef<DragState>({ ...INITIAL_DRAG });

  return {
    wrapRef, canvasRef, rigRef, sceneRef, cameraRef, propsRef, pausedRef,
    camFromPos, camToPos, camCurrPos, camFromLook, camToLook, camCurrLook,
    camFromFov, camToFov, camTransElapsed, orbitYawRef, orbitPitchRef,
    pointerXRef, pointerYRef, dragStateRef,
  };
}

function handleActiveDragMove(
  e: PointerEvent<HTMLCanvasElement>,
  props: ButcherStageProps,
  refs: StageRefsBundle,
): void {
  const drag = refs.dragStateRef.current;
  const dx = e.clientX - drag.lastX;
  const dy = e.clientY - drag.lastY;
  drag.lastX = e.clientX;
  drag.lastY = e.clientY;
  drag.movedPx += Math.hypot(dx, dy);
  if (drag.slicingDrag) {
    props.onSliceAngleChange(Math.min(90, Math.max(0, Math.round(props.sliceAngleDeg + dx * 0.4))));
    return;
  }
  refs.orbitYawRef.current += dx * 0.008;
  refs.orbitPitchRef.current = Math.min(0.65, Math.max(-0.35, refs.orbitPitchRef.current + dy * 0.005));
}

function handleCanvasKeyDown(
  e: KeyboardEvent<HTMLCanvasElement>,
  props: ButcherStageProps,
  refs: StageRefsBundle,
): void {
  if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
    e.preventDefault();
    const dir = e.key === "ArrowLeft" ? -1 : 1;
    if (props.showSlicePlane && e.shiftKey) {
      props.onSliceAngleChange(Math.min(90, Math.max(0, props.sliceAngleDeg + dir * 5)));
      return;
    }
    refs.orbitYawRef.current += dir * 0.14;
    return;
  }
  if (e.key === "ArrowUp" || e.key === "ArrowDown") {
    e.preventDefault();
    const delta = e.key === "ArrowUp" ? 0.08 : -0.08;
    refs.orbitPitchRef.current = Math.min(0.65, Math.max(-0.35, refs.orbitPitchRef.current + delta));
  }
}

function useStagePointerHandlers(
  props: ButcherStageProps,
  refs: StageRefsBundle,
): StagePointerHandlers {
  const raycasterRef = useRef(new THREE.Raycaster());
  const ndcVecRef = useRef(new THREE.Vector2());
  const pick = (x: number, y: number): string | null =>
    pickCutAtClientPoint(
      { canvas: refs.canvasRef.current, camera: refs.cameraRef.current, rig: refs.rigRef.current, ndcVec: ndcVecRef.current, raycaster: raycasterRef.current },
      x,
      y,
    );

  return {
    onPointerDown: (e): void => {
      refs.dragStateRef.current = {
        active: true, startX: e.clientX, startY: e.clientY, lastX: e.clientX, lastY: e.clientY, movedPx: 0,
        slicingDrag: props.showSlicePlane && e.shiftKey,
      };
    },
    onPointerMove: (e): void => {
      const rect = e.currentTarget.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        refs.pointerXRef.current = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        refs.pointerYRef.current = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      }
      if (refs.dragStateRef.current.active) {
        handleActiveDragMove(e, props, refs);
        return;
      }
      const hovered = pick(e.clientX, e.clientY);
      if (hovered !== props.hoveredCutId) props.onHoverCut(hovered);
    },
    onPointerUp: (e): void => {
      const wasClick = refs.dragStateRef.current.active && refs.dragStateRef.current.movedPx < 6;
      refs.dragStateRef.current.active = false;
      if (!wasClick) return;
      const picked = pick(e.clientX, e.clientY);
      if (picked) props.onSelectCut(picked);
    },
    onPointerLeave: (): void => {
      refs.dragStateRef.current.active = false;
      refs.pointerXRef.current = 0;
      refs.pointerYRef.current = 0;
      if (props.hoveredCutId !== null) props.onHoverCut(null);
    },
    onKeyDown: (e): void => handleCanvasKeyDown(e, props, refs),
  };
}

function useStageRigSync(
  props: ButcherStageProps,
  refs: StageRefsBundle,
  forceSvg: boolean,
  webglSupported: boolean,
): void {
  useEffect(() => {
    const scene = refs.sceneRef.current;
    if (!scene || forceSvg || !webglSupported) return;
    if (refs.rigRef.current) {
      scene.remove(refs.rigRef.current);
      disposeCarcassRig(refs.rigRef.current);
      refs.rigRef.current = null;
    }
    const nextRig = createCarcassRig(props.speciesId);
    syncCarcassRigOverlay(nextRig, refs.propsRef.current);
    scene.add(nextRig);
    refs.rigRef.current = nextRig;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.speciesId, forceSvg, webglSupported]);

  useEffect(() => {
    if (refs.rigRef.current) syncCarcassRigOverlay(refs.rigRef.current, props);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.explodeFactor, props.colorMode, props.selectedCutId, props.hoveredCutId, props.targetCutId, props.showSlicePlane, props.sliceAngleDeg, props.showBoneLandmarks]);
}

export function useButcherStageRuntime(props: ButcherStageProps): ButcherStageRuntime {
  const [webglSupported] = useState<boolean>(canCreateWebGL);
  const [forceSvg, setForceSvg] = useState<boolean>(false);
  const [motionPaused, setMotionPaused] = useState<boolean>(initialReducedMotion);
  const refs = useStageCameraRefs(props, motionPaused);

  useEffect(() => {
    if (!webglSupported || forceSvg) return undefined;
    const canvas = refs.canvasRef.current;
    const wrap = refs.wrapRef.current;
    if (!canvas || !wrap) return undefined;
    return mountButcherWebGLStage(canvas, wrap, refs, () => setForceSvg(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [webglSupported, forceSvg]);

  useStageRigSync(props, refs, forceSvg, webglSupported);

  useEffect(() => {
    const spec = BUTCHER_CAMERA_FRAMINGS[props.framing];
    // Butcher Block carve: aim at the cut on the block so its knife plane and section ring stay in frame.
    const rig = refs.rigRef.current;
    const look = (props.framing === "butcher-block-slice" && rig ? getCutWorldPosition(rig, props.selectedCutId) : null) ?? spec.lookAt;
    refs.camFromPos.current.copy(refs.camCurrPos.current);
    refs.camFromLook.current.copy(refs.camCurrLook.current);
    refs.camFromFov.current = refs.cameraRef.current ? refs.cameraRef.current.fov : refs.camToFov.current;
    refs.camToPos.current.set(look[0] + spec.pos[0] - spec.lookAt[0], look[1] + spec.pos[1] - spec.lookAt[1], look[2] + spec.pos[2] - spec.lookAt[2]);
    refs.camToLook.current.set(look[0], look[1], look[2]);
    refs.camToFov.current = spec.fov;
    refs.camTransElapsed.current = motionPaused ? 0.48 : 0;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.framing, motionPaused, props.selectedCutId, props.speciesId]);

  const pointerHandlers = useStagePointerHandlers(props, refs);
  return {
    webglSupported, forceSvg, setForceSvg, motionPaused, setMotionPaused,
    wrapRef: refs.wrapRef, canvasRef: refs.canvasRef, pointerHandlers,
  };
}
