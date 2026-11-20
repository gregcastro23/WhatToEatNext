import * as THREE from "three";

/**
 * Studio softbox lighting & procedural PMREM environment adapted from
 * Pentacles `vessel-studio-lighting.ts`. Gives marbled lipids, wet muscle,
 * and bone landmarks realistic specular sheen with zero external HDR downloads.
 *
 * @file src/lib/butcher/stage/butcherStudioLighting.ts
 */

export function createButcherStudioLights(): THREE.Group {
  const lights = new THREE.Group();
  lights.name = "ButcherStudioLights";
  lights.add(new THREE.HemisphereLight(0xf3f7ff, 0x3a2a20, 1.15));

  const specs: ReadonlyArray<readonly [number, number, readonly [number, number, number]]> = [
    [0xfff1dc, 2.9, [-2.5, 4.8, 3.8]],
    [0xb8dbff, 1.55, [3.2, 2.8, -2.4]],
    [0xffc7a6, 0.55, [-2.8, 0.8, -2.0]],
  ];

  for (const [color, intensity, position] of specs) {
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(position[0], position[1], position[2]);
    lights.add(light);
  }
  return lights;
}

export function createButcherStudioEnvironment(
  renderer: THREE.WebGLRenderer,
): THREE.WebGLRenderTarget | undefined {
  const studio = new THREE.Scene();
  studio.background = new THREE.Color(0x465263);
  const geometry = new THREE.PlaneGeometry(1, 1);
  const materials: THREE.MeshBasicMaterial[] = [];

  const panel = (
    color: number,
    position: readonly [number, number, number],
    size: readonly [number, number],
  ): void => {
    const material = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide });
    materials.push(material);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(position[0], position[1], position[2]);
    mesh.scale.set(size[0], size[1], 1);
    mesh.lookAt(0, 0, 0);
    studio.add(mesh);
  };

  panel(0xffebd1, [-3, 3, 4], [4, 5]);
  panel(0xc8e0ff, [4, 1, 1], [2, 5]);
  panel(0xffffff, [0, 5, -2], [3, 3]);

  const generator = new THREE.PMREMGenerator(renderer);
  try {
    return generator.fromScene(studio, 0.04, 0.1, 20, { size: 64 });
  } catch {
    return undefined;
  } finally {
    generator.dispose();
    geometry.dispose();
    for (const material of materials) {
      material.dispose();
    }
  }
}
