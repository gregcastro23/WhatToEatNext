import * as THREE from "three";
import {
  createButcherStudioEnvironment,
  createButcherStudioLights,
} from "@/lib/butcher/stage/butcherStudioLighting";
import {
  BUTCHER_CAMERA_FRAMINGS,
  armillaryEaseOut,
} from "@/lib/butcher/stage/cameraFramings";
import {
  applyCarcassColorMode,
  createCarcassRig,
  disposeCarcassRig,
  pickButcherCut,
  setCarcassExplodeFactor,
  updateSlicingPlane,
} from "@/lib/butcher/stage/carcassAvatar3d";
import type { ButcherStageProps } from "./stageTypes";

/**
 * Imperative Three.js WebGL initialization, camera RAF loop, resize, and picking
 * helpers for `ButcherStageCanvas`.
 *
 * @file src/app/(alchm)/kitchen-lab/butcher/_lab/stageLoop.ts
 */

export interface DragState {
  active: boolean;
  startX: number;
  startY: number;
  lastX: number;
  lastY: number;
  movedPx: number;
  slicingDrag: boolean;
}

export interface StageMutableRefs {
  readonly rigRef: { current: THREE.Group | null };
  readonly sceneRef: { current: THREE.Scene | null };
  readonly cameraRef: { current: THREE.PerspectiveCamera | null };
  readonly propsRef: { current: ButcherStageProps };
  readonly pausedRef: { current: boolean };
  readonly dragStateRef: { current: DragState };
  readonly camFromPos: { current: THREE.Vector3 };
  readonly camToPos: { current: THREE.Vector3 };
  readonly camCurrPos: { current: THREE.Vector3 };
  readonly camFromLook: { current: THREE.Vector3 };
  readonly camToLook: { current: THREE.Vector3 };
  readonly camCurrLook: { current: THREE.Vector3 };
  readonly camFromFov: { current: number };
  readonly camToFov: { current: number };
  readonly camTransElapsed: { current: number };
  readonly orbitYawRef: { current: number };
  readonly orbitPitchRef: { current: number };
  readonly pointerXRef: { current: number };
  readonly pointerYRef: { current: number };
}

export function syncCarcassRigOverlay(
  rig: THREE.Group,
  props: Pick<
    ButcherStageProps,
    | "explodeFactor"
    | "colorMode"
    | "selectedCutId"
    | "hoveredCutId"
    | "targetCutId"
    | "showSlicePlane"
    | "sliceAngleDeg"
  >,
): void {
  setCarcassExplodeFactor(rig, props.explodeFactor);
  applyCarcassColorMode(rig, {
    mode: props.colorMode,
    selectedCutId: props.selectedCutId,
    hoveredCutId: props.hoveredCutId,
    targetCutId: props.targetCutId,
  });
  updateSlicingPlane(rig, {
    visible: props.showSlicePlane,
    cutId: props.selectedCutId,
    angleDeg: props.sliceAngleDeg,
  });
}

export function stepStageCamera(
  camera: THREE.PerspectiveCamera,
  refs: StageMutableRefs,
  dt: number,
): void {
  if (!refs.pausedRef.current && !refs.dragStateRef.current.active) {
    refs.orbitYawRef.current += dt * 0.12;
  }
  if (refs.camTransElapsed.current < 0.48) {
    refs.camTransElapsed.current = Math.min(0.48, refs.camTransElapsed.current + dt);
  }
  const progress = armillaryEaseOut(refs.camTransElapsed.current / 0.48);
  refs.camCurrPos.current.lerpVectors(refs.camFromPos.current, refs.camToPos.current, progress);
  refs.camCurrLook.current.lerpVectors(refs.camFromLook.current, refs.camToLook.current, progress);

  const nextFov = THREE.MathUtils.lerp(refs.camFromFov.current, refs.camToFov.current, progress);
  if (Math.abs(camera.fov - nextFov) > 0.02) {
    camera.fov = nextFov;
    camera.updateProjectionMatrix();
  }

  const radius = Math.hypot(
    refs.camCurrPos.current.x - refs.camCurrLook.current.x,
    refs.camCurrPos.current.z - refs.camCurrLook.current.z,
  );
  const totalYaw = refs.orbitYawRef.current + refs.pointerXRef.current * 0.1;
  const totalPitch = refs.orbitPitchRef.current - refs.pointerYRef.current * 0.06;

  camera.position.set(
    refs.camCurrLook.current.x + Math.sin(totalYaw) * radius,
    refs.camCurrPos.current.y + totalPitch * 1.4,
    refs.camCurrLook.current.z + Math.cos(totalYaw) * radius,
  );
  camera.lookAt(refs.camCurrLook.current);
}

function createWebGLSession(
  canvas: HTMLCanvasElement,
  refs: StageMutableRefs,
): {
  readonly renderer: THREE.WebGLRenderer;
  readonly scene: THREE.Scene;
  readonly camera: THREE.PerspectiveCamera;
  readonly envTarget: THREE.WebGLRenderTarget | undefined;
} {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  const scene = new THREE.Scene();
  scene.add(createButcherStudioLights());
  const envTarget = createButcherStudioEnvironment(renderer);
  if (envTarget) scene.environment = envTarget.texture;

  const framing = BUTCHER_CAMERA_FRAMINGS[refs.propsRef.current.framing];
  const camera = new THREE.PerspectiveCamera(framing.fov, 1.6, 0.1, 40);
  camera.position.set(framing.pos[0], framing.pos[1], framing.pos[2]);
  camera.lookAt(framing.lookAt[0], framing.lookAt[1], framing.lookAt[2]);

  const rig = createCarcassRig(refs.propsRef.current.speciesId);
  syncCarcassRigOverlay(rig, refs.propsRef.current);
  scene.add(rig);

  refs.sceneRef.current = scene;
  refs.cameraRef.current = camera;
  refs.rigRef.current = rig;
  return { renderer, scene, camera, envTarget };
}

function attachResizeAndLoop(
  wrap: HTMLDivElement,
  session: ReturnType<typeof createWebGLSession>,
  refs: StageMutableRefs,
  isDisposed: () => boolean,
  setRafId: (id: number) => void,
): ResizeObserver | null {
  const handleResize = (): void => {
    const rect = wrap.getBoundingClientRect();
    const width = Math.max(240, Math.floor(rect.width || 600));
    const height = Math.max(260, Math.floor(rect.height || 360));
    session.camera.aspect = width / height;
    session.camera.updateProjectionMatrix();
    session.renderer.setSize(width, height, false);
  };
  handleResize();

  const observer = typeof ResizeObserver === "function" ? new ResizeObserver(handleResize) : null;
  observer?.observe(wrap);

  let lastTs = performance.now();
  const tick = (ts: number): void => {
    if (isDisposed() || !refs.sceneRef.current || !refs.cameraRef.current) return;
    const dt = Math.min(0.05, Math.max(0.001, (ts - lastTs) / 1000));
    lastTs = ts;
    stepStageCamera(refs.cameraRef.current, refs, dt);
    session.renderer.render(refs.sceneRef.current, refs.cameraRef.current);
    setRafId(requestAnimationFrame(tick));
  };
  setRafId(requestAnimationFrame(tick));
  return observer;
}

export function mountButcherWebGLStage(
  canvas: HTMLCanvasElement,
  wrap: HTMLDivElement,
  refs: StageMutableRefs,
  onFallbackSvg: () => void,
): () => void {
  let disposed = false;
  let rafId: number | null = null;
  let resizeObserver: ResizeObserver | null = null;
  let renderer: THREE.WebGLRenderer | null = null;
  let envTarget: THREE.WebGLRenderTarget | undefined;

  try {
    const session = createWebGLSession(canvas, refs);
    ({ renderer, envTarget } = session);
    resizeObserver = attachResizeAndLoop(wrap, session, refs, () => disposed, (id) => {
      rafId = id;
    });
  } catch {
    onFallbackSvg();
  }

  return (): void => {
    disposed = true;
    if (rafId !== null) cancelAnimationFrame(rafId);
    resizeObserver?.disconnect();
    if (refs.rigRef.current) {
      disposeCarcassRig(refs.rigRef.current);
      refs.rigRef.current = null;
    }
    envTarget?.dispose();
    renderer?.dispose();
    refs.sceneRef.current = null;
    refs.cameraRef.current = null;
  };
}

export function pickCutAtClientPoint(
  target: {
    readonly canvas: HTMLCanvasElement | null;
    readonly camera: THREE.PerspectiveCamera | null;
    readonly rig: THREE.Group | null;
    readonly ndcVec: THREE.Vector2;
    readonly raycaster: THREE.Raycaster;
  },
  clientX: number,
  clientY: number,
): string | null {
  if (!target.canvas || !target.camera || !target.rig) return null;
  const rect = target.canvas.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return null;
  target.ndcVec.set(
    ((clientX - rect.left) / rect.width) * 2 - 1,
    -((clientY - rect.top) / rect.height) * 2 + 1,
  );
  target.raycaster.setFromCamera(target.ndcVec, target.camera);
  return pickButcherCut(target.raycaster, target.rig)?.cutId ?? null;
}
