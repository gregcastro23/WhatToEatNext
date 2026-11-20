import * as THREE from "three";

export { colorHexForOverlay } from "./overlayLegend";

/**
 * Fresnel rim shader injection, selective shadow policy, and overlay palette
 * mapping for `/kitchen-lab/butcher` 3D anatomical meshes.
 *
 * @file src/lib/butcher/stage/carcassMaterials.ts
 */

interface FresnelRimState {
  readonly colorUniform: THREE.IUniform<THREE.Color>;
  readonly powerUniform: THREE.IUniform<number>;
  readonly intensityUniform: THREE.IUniform<number>;
}

const fresnelRimMap = new WeakMap<THREE.MeshStandardMaterial, FresnelRimState>();

const NON_SHADOW_PREFIXES: readonly string[] = [
  "GrainLines_",
  "SlicingPlane",
  "ButcherSlicingPlane",
];

export function attachFresnelRim(
  material: THREE.MeshStandardMaterial,
  rimColor: THREE.Color | string = "#fbbf24",
  power = 2.6,
  intensity = 0.45,
): THREE.MeshStandardMaterial {
  const color = rimColor instanceof THREE.Color ? rimColor.clone() : new THREE.Color(rimColor);
  const state: FresnelRimState = {
    colorUniform: { value: color },
    powerUniform: { value: power },
    intensityUniform: { value: intensity },
  };
  fresnelRimMap.set(material, state);
  material.customProgramCacheKey = (): string => "butcher-fresnel-rim";
  material.onBeforeCompile = (shader): void => {
    shader.uniforms.uFresnelRimColor = state.colorUniform;
    shader.uniforms.uFresnelPower = state.powerUniform;
    shader.uniforms.uFresnelIntensity = state.intensityUniform;
    shader.fragmentShader =
      `uniform vec3 uFresnelRimColor;\nuniform float uFresnelPower;\nuniform float uFresnelIntensity;\n${shader.fragmentShader}`;
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <dithering_fragment>",
      `#include <dithering_fragment>
       float fRim = pow(1.0 - clamp(dot(normalize(normal), normalize(vViewPosition)), 0.0, 1.0), uFresnelPower);
       gl_FragColor.rgb += uFresnelRimColor * (fRim * uFresnelIntensity);`,
    );
  };
  return material;
}

export function setButcherRimUniforms(
  root: THREE.Object3D,
  opts: { color?: THREE.Color | string; power?: number; intensity?: number },
): void {
  const nextColor =
    opts.color !== undefined
      ? opts.color instanceof THREE.Color
        ? opts.color
        : new THREE.Color(opts.color)
      : null;

  root.traverse((node) => {
    if (!(node instanceof THREE.Mesh)) return;
    const mats: readonly unknown[] = Array.isArray(node.material) ? node.material : [node.material];
    for (const mat of mats) {
      if (!(mat instanceof THREE.MeshStandardMaterial)) continue;
      const state = fresnelRimMap.get(mat);
      if (!state) continue;
      if (nextColor) state.colorUniform.value.copy(nextColor);
      if (typeof opts.power === "number" && Number.isFinite(opts.power)) {
        state.powerUniform.value = opts.power;
      }
      if (typeof opts.intensity === "number" && Number.isFinite(opts.intensity)) {
        state.intensityUniform.value = opts.intensity;
      }
    }
  });
}

export function applyButcherShadowPolicy(root: THREE.Object3D): void {
  root.traverse((node) => {
    if (NON_SHADOW_PREFIXES.some((prefix) => node.name.startsWith(prefix))) {
      node.castShadow = false;
      node.receiveShadow = false;
      return;
    }
    if (node instanceof THREE.Mesh) {
      const mats: readonly unknown[] = Array.isArray(node.material) ? node.material : [node.material];
      const isOpaque = mats.every(
        (m) => m instanceof THREE.Material && !m.transparent && m.blending === THREE.NormalBlending,
      );
      node.castShadow = isOpaque;
      node.receiveShadow = isOpaque;
    }
  });
}

export function applyCutVisualHighlight(
  mesh: THREE.Mesh,
  material: THREE.MeshStandardMaterial,
  grainMaterial: THREE.LineBasicMaterial,
  highlight: "selected" | "hovered" | "target" | "default",
): void {
  if (highlight === "selected") {
    material.emissive.set("#f59e0b");
    material.emissiveIntensity = 0.28;
    grainMaterial.opacity = 0.95;
    grainMaterial.color.set("#fef08a");
    setButcherRimUniforms(mesh, { color: "#fbbf24", power: 2.1, intensity: 0.92 });
    return;
  }
  if (highlight === "hovered") {
    material.emissive.set("#38bdf8");
    material.emissiveIntensity = 0.2;
    grainMaterial.opacity = 0.78;
    grainMaterial.color.set("#bae6fd");
    setButcherRimUniforms(mesh, { color: "#38bdf8", power: 2.3, intensity: 0.78 });
    return;
  }
  if (highlight === "target") {
    material.emissive.set("#10b981");
    material.emissiveIntensity = 0.18;
    grainMaterial.opacity = 0.65;
    grainMaterial.color.set("#a7f3d0");
    setButcherRimUniforms(mesh, { color: "#34d399", power: 2.4, intensity: 0.65 });
    return;
  }
  material.emissive.set("#000000");
  material.emissiveIntensity = 0;
  grainMaterial.opacity = 0.35;
  grainMaterial.color.set("#fde68a");
  setButcherRimUniforms(mesh, { color: "#f59e0b", power: 2.8, intensity: 0.18 });
}
