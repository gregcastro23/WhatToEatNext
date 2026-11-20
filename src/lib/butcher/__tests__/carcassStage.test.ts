/**
 * @jest-environment node
 *
 * Tests for the Pentacles-derived 3D procedural carcass engine:
 *  - Cross-section lofting, muscle grain lines, bone landmarks, slicing plane
 *  - Shared geometry lease pool & 0-leak disposal across all 5 species
 *  - Explode-factor displacement & rest-pose restoration
 *  - Fresnel rim shader injection & in-place uniform updates
 *  - Raycast picking (`pickButcherCut`) across all 5 species
 */
import * as THREE from "three";
import { SPECIES_LIST, getCutsForSpecies } from "@/data/butcher/cutsCatalogue";
import {
  applyCarcassColorMode,
  attachFresnelRim,
  createCarcassRig,
  disposeCarcassRig,
  pickButcherCut,
  setButcherRimUniforms,
  setCarcassExplodeFactor,
  updateSlicingPlane,
} from "@/lib/butcher/stage/carcassAvatar3d";
import {
  createBoneLandmarkGeometry,
  createLoftedAnatomicalGeometry,
  createMuscleGrainGeometry,
  createSlicingPlaneGeometry,
} from "@/lib/butcher/stage/carcassLofting";
import type { ColorOverlayMode } from "@/lib/butcher/types";
import { sharedButcherGeometryStats } from "@/lib/butcher/stage/sharedButcherGeometry";

describe("Pentacles-derived 3D carcass engine", () => {
  it("builds finite lofted, grain, bone, and slicing-plane geometries", () => {
    const loft = createLoftedAnatomicalGeometry([
      [-0.2, 0.12, 0.14, 0, 0],
      [0, 0.16, 0.18, 0, 0],
      [0.2, 0.12, 0.14, 0, 0],
    ]);
    const pos = loft.getAttribute("position");
    const norm = loft.getAttribute("normal");
    expect(pos).toBeDefined();
    expect(norm).toBeDefined();
    expect(pos.count).toBeGreaterThan(20);
    expect(loft.boundingSphere?.radius).toBeGreaterThan(0.1);

    const grain = createMuscleGrainGeometry(
      [
        [-0.2, 0.12, 0.14, 0, 0],
        [0.2, 0.12, 0.14, 0, 0],
      ],
      [1, 0, 0],
    );
    expect(grain.getAttribute("position").count).toBe(14);

    const bone = createBoneLandmarkGeometry();
    expect(bone.getAttribute("position").count).toBeGreaterThan(10);

    const plane = createSlicingPlaneGeometry();
    expect(plane.getAttribute("position").count).toBe(4);

    loft.dispose();
    grain.dispose();
    bone.dispose();
    plane.dispose();
  });

  it("leases shared geometries per species rig and releases all GPU buffers on dispose", () => {
    for (const species of SPECIES_LIST) {
      const rig = createCarcassRig(species.id);
      const activeStats = sharedButcherGeometryStats();
      expect(activeStats.geometries).toBeGreaterThan(0);
      expect(activeStats.leases).toBeGreaterThan(0);

      disposeCarcassRig(rig);
      const afterStats = sharedButcherGeometryStats();
      expect(afterStats).toEqual({ geometries: 0, leases: 0 });
    }
  });

  it("displaces primals and sub-primals with explodeFactor and restores rest coordinates at 0", () => {
    const rig = createCarcassRig("beef");
    const ribGroup = rig.getObjectByName("PrimalGroup_rib");
    expect(ribGroup).toBeDefined();
    const restY = ribGroup?.position.y ?? 0;

    setCarcassExplodeFactor(rig, 1.0);
    expect(ribGroup?.position.y).toBeGreaterThan(restY);

    setCarcassExplodeFactor(rig, 0.0);
    expect(ribGroup?.position.y).toBeCloseTo(restY, 6);

    disposeCarcassRig(rig);
  });

  it("injects Fresnel rim uniforms onBeforeCompile, updates them in-place, and toggles overlay/slicing state", () => {
    const rig = createCarcassRig("beef");
    const material = new THREE.MeshStandardMaterial({ color: "#bf3b3b" });
    attachFresnelRim(material, "#fbbf24", 2.5, 0.4);

    const shaderParams: THREE.WebGLProgramParametersWithUniforms = {
      shaderID: "standard",
      shaderName: "MeshStandardMaterial",
      vertexShader: "",
      fragmentShader: "void main() {\n#include <dithering_fragment>\n}",
      uniforms: {},
      defines: {},
      customVertexShaderID: "",
      customFragmentShaderID: "",
      instancing: false,
      instancingColor: false,
      instancingMorph: false,
      supportsVertexTextures: true,
      outputColorSpace: THREE.SRGBColorSpace,
      alphaTest: 0,
      map: false,
      matcap: false,
      envMap: false,
      envMapMode: THREE.CubeReflectionMapping,
      envMapCubeUVHeight: null,
      aoMap: false,
      lightMap: false,
      bumpMap: false,
      normalMap: false,
      normalMapObjectSpace: false,
      normalMapTangentSpace: false,
      displacementMap: false,
      emissiveMap: false,
      clearcoat: false,
      clearcoatMap: false,
      clearcoatRoughnessMap: false,
      clearcoatNormalMap: false,
      iridescence: false,
      iridescenceMap: false,
      iridescenceThicknessMap: false,
      anisotropy: false,
      anisotropyMap: false,
      sheen: false,
      sheenColorMap: false,
      sheenRoughnessMap: false,
      specularIntensityMap: false,
      specularColorMap: false,
      thicknessMap: false,
      transmission: false,
      transmissionMap: false,
      dispersion: false,
      roughnessMap: false,
      metalnessMap: false,
      gradientMap: false,
      alphaMap: false,
      alphaHash: false,
      combine: THREE.MultiplyOperation,
      vertexColors: false,
      vertexAlphas: false,
      vertexTangents: false,
      vertexUv1s: false,
      vertexUv2s: false,
      vertexUv3s: false,
      pointsUvs: false,
      fog: false,
      useFog: false,
      fogExp2: false,
      flatShading: false,
      sizeAttenuation: false,
      logarithmicDepthBuffer: false,
      reverseDepthBuffer: false,
      skinning: false,
      morphTargets: false,
      morphNormals: false,
      morphColors: false,
      morphTargetsCount: 0,
      morphTextureStride: 0,
      numDirLights: 0,
      numPointLights: 0,
      numSpotLights: 0,
      numSpotLightMaps: 0,
      numRectAreaLights: 0,
      numHemiLights: 0,
      numDirLightShadows: 0,
      numPointLightShadows: 0,
      numSpotLightShadows: 0,
      numClippingPlanes: 0,
      numClipIntersection: 0,
      dithering: false,
      shadowMapEnabled: false,
      shadowMapType: THREE.PCFShadowMap,
      toneMapping: THREE.NoToneMapping,
      useLegacyLights: false,
      decodeVideoTexture: false,
      decodeVideoTextureEmissive: false,
      opaque: true,
      alphaToCoverage: false,
      premultipliedAlpha: false,
      doubleSided: false,
      flipSided: false,
      depthPacking: 0,
      index0AttributeName: undefined,
      extensionClipCullDistance: false,
      extensionMultiDraw: false,
      rendererExtensionParallelShaderCompile: false,
      customProgramCacheKey: "butcher-fresnel-rim",
      isRawShaderMaterial: false,
      precision: "highp",
    };

    Reflect.apply(material.onBeforeCompile, material, [shaderParams]);
    expect(shaderParams.uniforms.uFresnelRimColor).toBeDefined();
    expect(shaderParams.fragmentShader).toContain("gl_FragColor.rgb +=");

    const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.1), material);
    setButcherRimUniforms(mesh, { color: "#34d399", intensity: 0.9, power: 2.0 });
    expect(shaderParams.uniforms.uFresnelIntensity?.value).toBe(0.9);
    mesh.geometry.dispose();
    material.dispose();

    const modes: readonly ColorOverlayMode[] = ["anatomical", "marbling", "collagen", "thermal"];
    for (const mode of modes) {
      applyCarcassColorMode(rig, {
        mode,
        selectedCutId: "ribeye",
        hoveredCutId: "ny-strip",
        targetCutId: "outside-skirt",
      });
    }

    updateSlicingPlane(rig, { visible: true, cutId: "outside-skirt", angleDeg: 90 });
    const sliceGroup = rig.getObjectByName("SlicingPlaneGroup");
    expect(sliceGroup?.visible).toBe(true);

    updateSlicingPlane(rig, { visible: false, cutId: "outside-skirt", angleDeg: 90 });
    expect(sliceGroup?.visible).toBe(false);

    disposeCarcassRig(rig);
  });

  it("picks the exact anatomical sub-primal cut via THREE.Raycaster across all 5 species", () => {
    const raycaster = new THREE.Raycaster();
    const origin = new THREE.Vector3();
    const direction = new THREE.Vector3(0, 0, -1);

    for (const species of SPECIES_LIST) {
      const rig = createCarcassRig(species.id);
      setCarcassExplodeFactor(rig, 0.5);
      rig.updateMatrixWorld(true);

      const cuts = getCutsForSpecies(species.id);
      const targetCut = cuts[0];
      expect(targetCut).toBeDefined();
      if (!targetCut) continue;

      const meshObj = rig.getObjectByName(`SubPrimalMesh_${targetCut.id}`);
      expect(meshObj).toBeInstanceOf(THREE.Mesh);
      if (!(meshObj instanceof THREE.Mesh)) continue;

      const worldCenter = new THREE.Vector3();
      meshObj.getWorldPosition(worldCenter);
      origin.set(worldCenter.x, worldCenter.y, worldCenter.z + 2.0);
      raycaster.set(origin, direction);

      const picked = pickButcherCut(raycaster, rig);
      expect(picked).not.toBeNull();
      expect(picked?.speciesId).toBe(species.id);
      expect(picked?.cutId).toBe(targetCut.id);
      expect(picked?.primalId).toBe(targetCut.primalId);

      disposeCarcassRig(rig);
    }
  });
});
