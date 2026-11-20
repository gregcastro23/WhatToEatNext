import { createButcherStudioEnvironment } from "@/lib/butcher/stage/butcherStudioLighting";
import type * as THREE from "three";

/**
 * WebGL context loss/recovery handlers and deterministic GPU teardown helpers
 * so tab switching never exhausts browser WebGL context limits.
 *
 * @file src/app/(alchm)/kitchen-lab/butcher/_lab/stageContext.ts
 */

export interface ContextLifecycleTarget {
  readonly canvas: HTMLCanvasElement;
  readonly renderer: THREE.WebGLRenderer;
  readonly scene: THREE.Scene;
  readonly getEnvTarget: () => THREE.WebGLRenderTarget | undefined;
  readonly setEnvTarget: (next: THREE.WebGLRenderTarget | undefined) => void;
  readonly isDisposed: () => boolean;
  readonly onPauseRaf: () => void;
  readonly onResumeLoop: () => void;
  readonly onFallbackSvg: () => void;
}

export function attachWebGLContextLifecycle(target: ContextLifecycleTarget): () => void {
  let lostTimer: ReturnType<typeof setTimeout> | null = null;

  const handleContextLost = (event: Event): void => {
    event.preventDefault();
    target.onPauseRaf();
    if (lostTimer !== null) clearTimeout(lostTimer);
    lostTimer = setTimeout(() => {
      if (!target.isDisposed()) target.onFallbackSvg();
    }, 1800);
  };

  const handleContextRestored = (): void => {
    if (lostTimer !== null) {
      clearTimeout(lostTimer);
      lostTimer = null;
    }
    if (target.isDisposed()) return;
    target.getEnvTarget()?.dispose();
    target.scene.environment = null;
    const restoredEnv = createButcherStudioEnvironment(target.renderer);
    if (restoredEnv) target.scene.environment = restoredEnv.texture;
    target.setEnvTarget(restoredEnv);
    target.onResumeLoop();
  };

  target.canvas.addEventListener("webglcontextlost", handleContextLost);
  target.canvas.addEventListener("webglcontextrestored", handleContextRestored);

  return (): void => {
    if (lostTimer !== null) clearTimeout(lostTimer);
    target.canvas.removeEventListener("webglcontextlost", handleContextLost);
    target.canvas.removeEventListener("webglcontextrestored", handleContextRestored);
  };
}

export function releaseRendererContext(renderer: THREE.WebGLRenderer): void {
  renderer.dispose();
  try {
    renderer.forceContextLoss();
  } catch {
    // Some headless or mock renderers do not expose loseContext extension.
  }
}
