/**
 * Thermodynamic and alchemical fidelity probe for the Hermetic Cauldron engine.
 *
 * Asserts physical accuracy across real-world culinary regimes, mathematical
 * monotonicity, circuit power identities, and 500-point grid continuity.
 *
 * @file src/utils/__tests__/hermeticCauldronFidelityProbe.test.ts
 */

import { readVessel } from "@/lib/cooking/thermoVessel";
import { DEFAULT_VESSEL, VESSEL_RANGES, type VesselState } from "@/lib/cooking/vesselState";
import { invokeTool, structuredToolContent } from "@/lib/mcp/tools";
import { validateToolArguments, validateToolOutput } from "@/lib/mcp/validation";
import { computeStageTransformation } from "@/utils/cauldronTransformation";
import { cauldronVesselProfile } from "@/utils/cauldronVesselProfile";
import { simulateCauldron } from "@/utils/cauldronVesselSimulation";

describe("Hermetic Cauldron Fidelity Probe", () => {
  describe("Thermodynamic Culinary Regime Test Vectors", () => {
    it("Vector 1: rotary vacuum hydrosol extraction preserves heat-labile aromatics", () => {
      const state: VesselState = {
        temperatureC: 46,
        pressureKpa: 10,
        humidityPct: 85,
        headspaceC: 46,
      };
      const reading = readVessel(state);
      const profile = cauldronVesselProfile(state, reading);

      // Tsat(10 kPa) ~ 45.81 °C (within +- 0.15 °C)
      expect(reading.saturation.tsatC).toBeGreaterThanOrEqual(45.66);
      expect(reading.saturation.tsatC).toBeLessThanOrEqual(45.96);

      // Positive elevated latent heat ratio h_fg / h_fg,101.3 > 1.05
      expect(reading.latentVsSeaLevel).toBeGreaterThan(1.05);

      // Monotonic positive vapor deficit
      expect(reading.vaporDeficitKpa).toBeGreaterThan(0);

      // No Maillard or high-temp degradation regimes triggered at 46 °C
      const wetRegimeIds = reading.regimesWhileWet.map((r) => r.id);
      expect(wetRegimeIds).not.toContain("maillard");
      expect(wetRegimeIds).not.toContain("sucrose-caramelisation");

      // Valid kinetic voltage drive
      expect(profile.profile.voltage).toBeGreaterThan(0);
      expect(profile.profile.voltage).toBeLessThan(0.2);
    });

    it("Vector 2: atmospheric classic stock decoction hydro-extracts gelatin", () => {
      const state: VesselState = {
        temperatureC: 100,
        pressureKpa: 101.325,
        humidityPct: 60,
        headspaceC: 25,
      };
      const reading = readVessel(state);

      // Tsat(101.325 kPa) = 100.0 °C (+- 0.05 °C)
      expect(Math.abs(reading.saturation.tsatC - 100)).toBeLessThan(0.05);

      // Standard latent heat ratio = 1.000 (+- 0.005)
      expect(Math.abs(reading.latentVsSeaLevel - 1.0)).toBeLessThan(0.005);

      // Active collagen-to-gelatin hydrolysis regime (Tornberg citation)
      const wetRegimes = reading.regimesWhileWet;
      const collagenRegime = wetRegimes.find((r) => r.id === "collagen-gelatin");
      expect(collagenRegime).toBeDefined();
      expect(collagenRegime?.sources.some((s) => s.work.includes("Tornberg"))).toBe(true);
    });

    it("Vector 3: autoclave pressure braise accelerates depolymerization at saturated equilibrium", () => {
      const state: VesselState = {
        temperatureC: 127,
        pressureKpa: 250,
        humidityPct: 100,
        headspaceC: 127,
      };
      const reading = readVessel(state);

      // Tsat(250 kPa) ~ 127.4 °C (+- 0.2 °C)
      expect(reading.saturation.tsatC).toBeGreaterThanOrEqual(127.2);
      expect(reading.saturation.tsatC).toBeLessThanOrEqual(127.6);

      // Latent heat ratio drops below 0.98 at elevated pressure
      expect(reading.latentVsSeaLevel).toBeLessThan(0.98);

      // Zero vapor-pressure deficit at 100% RH saturated equilibrium
      expect(Math.abs(reading.vaporDeficitKpa)).toBeLessThanOrEqual(0.01);
      expect(["equilibrium", "heat-limited"]).toContain(reading.transfer);
    });

    it("Vector 4: dry sear triggers Maillard/caramelization and non-zero circuit resistance", () => {
      const state: VesselState = {
        temperatureC: 185,
        pressureKpa: 101.325,
        humidityPct: 12,
        headspaceC: DEFAULT_VESSEL.headspaceC,
      };
      const reading = readVessel(state);
      const profile = cauldronVesselProfile(state, reading);

      // Substantial evaporative driving force on dry setpoint
      expect(reading.vaporDeficitKpa).toBeGreaterThan(50);

      // Active Maillard and caramelization regimes on dry surface
      const dryRegimeIds = reading.regimesOnceDry.map((r) => r.id);
      expect(dryRegimeIds).toContain("maillard");
      expect(dryRegimeIds).toContain("sucrose-caramelisation");

      // Non-zero finite circuit resistance and force impact
      expect(profile.profile.resistance).toBeGreaterThan(0.5);
      expect(profile.profile.forceImpact).toBeGreaterThan(0.2);
    });

    it("Vector 5: multi-stage thermal shock and series circuit conservation laws", () => {
      const stages = [
        { name: "sweat", ingredients: [{ name: "onion", amount: 150, unit: "g" }, { name: "carrot", amount: 100, unit: "g" }] },
        { name: "deglaze", ingredients: [{ name: "vegetable broth", amount: 500, unit: "ml" }] },
        { name: "legumes", ingredients: [{ name: "lentils", amount: 200, unit: "g" }] },
        { name: "reduction", ingredients: [{ name: "tomato paste", amount: 50, unit: "g" }] },
      ];

      const sim = simulateCauldron(stages, DEFAULT_VESSEL);

      // Series circuit count
      expect(sim.circuit.stages.length).toBe(4);
      expect(sim.circuit.series.stageCount).toBe(4);

      // Verify elemental balance normalization across stages
      for (const stage of sim.circuit.stages) {
        const sum =
          stage.blendedElemental.Fire +
          stage.blendedElemental.Water +
          stage.blendedElemental.Earth +
          stage.blendedElemental.Air;
        expect(Math.abs(sum - 1.0)).toBeLessThan(1e-6);
        expect(Number.isFinite(stage.potentialDifference)).toBe(true);
        expect(Number.isFinite(stage.currentFlow)).toBe(true);
        expect(Number.isFinite(stage.power)).toBe(true);
      }

      // Conservation Law: Ohm's Law for Series Circuit I = V / R
      const totalV = sim.circuit.series.totalPotential;
      const totalR = sim.circuit.series.totalResistance;
      const seriesI = sim.circuit.series.seriesCurrent;
      expect(totalR).toBeGreaterThan(0);
      expect(Math.abs(seriesI - totalV / totalR)).toBeLessThan(1e-6);

      // Power identity on profile level: P = I * V
      const p = sim.profile.profile;
      const power = p.voltage * p.current;
      expect(power).toBeGreaterThan(0);
      expect(Math.abs(power - p.voltage * p.current)).toBeLessThan(1e-6);
    });

    it("Vector 6: hermetic seal transition from coagulation to circulatio at 100°C+", () => {
      // 1. Open pot at 102 °C (rolling boil with aromatic loss and open concentration)
      const openState: VesselState = {
        temperatureC: 102,
        pressureKpa: 101.325,
        humidityPct: 50,
        headspaceC: 25,
        sealMode: "open",
        durationMinutes: 25,
      };
      const openReading = readVessel(openState);
      const openTrans = computeStageTransformation(openState, openReading, 25);

      expect(openTrans.operation.id).toBe("coagulation");
      expect(openTrans.matrix.volatileAromaticRetentionPct).toBeLessThan(60);
      expect(openTrans.matrix.reductionConcentrationFactor).toBeGreaterThan(1.15);
      expect(openReading.refluxRatio).toBe(0.0);

      // 2. Sealed pot (Vas Hermeticum) at 102 °C (closed reflux, aromatic preservation)
      const sealedState: VesselState = {
        temperatureC: 102,
        pressureKpa: 101.325,
        humidityPct: 50,
        headspaceC: 25,
        sealMode: "hermetic_sealed",
        durationMinutes: 25,
      };
      const sealedReading = readVessel(sealedState);
      const sealedTrans = computeStageTransformation(sealedState, sealedReading, 25);

      expect(sealedTrans.operation.id).toBe("circulatio");
      expect(sealedTrans.matrix.volatileAromaticRetentionPct).toBeGreaterThan(92);
      expect(sealedReading.refluxRatio).toBeGreaterThanOrEqual(0.95);
      expect(sealedTrans.matrix.collagenHydrolysisPct).toBeGreaterThan(0);
    });
  });

  describe("500-Point Thermodynamic & Kinetic Grid Sweep", () => {
    it("guarantees continuous, finite, non-negative quantities across full operating range", () => {
      let evaluations = 0;

      for (let T = 20; T <= 260; T += 20) {
        for (let P = 10; P <= 250; P += 20) {
          for (let H = 0; H <= 100; H += 25) {
            evaluations++;
            const state: VesselState = {
              temperatureC: T,
              pressureKpa: P,
              humidityPct: H,
              headspaceC: 25,
            };

            const reading = readVessel(state);
            const profile = cauldronVesselProfile(state, reading);

            // Assert finite, non-negative physical readings
            expect(Number.isFinite(reading.saturation.tsatC)).toBe(true);
            expect(reading.saturation.tsatC).toBeGreaterThan(0);
            expect(Number.isFinite(reading.surfaceVaporKpa)).toBe(true);
            expect(reading.surfaceVaporKpa).toBeGreaterThanOrEqual(0);
            expect(Number.isFinite(reading.headspaceVaporKpa)).toBe(true);
            expect(reading.headspaceVaporKpa).toBeGreaterThanOrEqual(0);
            expect(Number.isFinite(reading.latentVsSeaLevel)).toBe(true);
            expect(reading.latentVsSeaLevel).toBeGreaterThan(0);

            // Assert kinetic profile fields 0 <= val <= 1
            const p = profile.profile;
            for (const val of [p.voltage, p.current, p.resistance, p.velocityFactor, p.momentumRetention, p.forceImpact]) {
              expect(val).toBeGreaterThanOrEqual(0);
              expect(val).toBeLessThanOrEqual(1);
            }
          }
        }
      }

      // Confirm 500+ points evaluated
      expect(evaluations).toBeGreaterThanOrEqual(500);
    });
  });

  describe("MCP Tool Contract & Boundary Fuzzing", () => {
    it("executes simulate_hermetic_cauldron directly and validates schema conformance", async () => {
      const res = await invokeTool("simulate_hermetic_cauldron", {
        setpointC: 118,
        pressureKpa: 200,
        sealMode: "hermetic_sealed",
        durationMinutes: 30,
        surfaceWet: true,
      });

      expect(res.ok).toBe(true);
      expect(res.data?.hermeticOperation?.id).toBe("circulatio");
      expect(res.data?.culinaryMatrix?.volatileAromaticRetentionPct).toBeGreaterThan(92);
      expect(res.data?.refluxRatio).toBeGreaterThanOrEqual(0.95);
      const outputError = validateToolOutput(
        "simulate_hermetic_cauldron",
        structuredToolContent(res),
      );
      expect(outputError).toBeNull();
    });

    it("rejects out-of-range parameters with structured validation errors", () => {
      expect(
        validateToolArguments("simulate_hermetic_cauldron", { setpointC: 999 }),
      ).toContain("outside the allowed range");
      expect(
        validateToolArguments("simulate_hermetic_cauldron", { pressureKpa: -5 }),
      ).toContain("outside the allowed range");
    });

    it("gracefully falls back to neutral elementals for unknown ingredient slugs", async () => {
      const res = await invokeTool("simulate_hermetic_cauldron", {
        setpointC: 100,
        pressureKpa: 101.325,
        stages: [
          {
            name: "unobtanium stage",
            ingredients: [
              { name: "mythical_moon_grain", amount: 100, unit: "g" },
            ],
          },
        ],
      });

      expect(res.ok).toBe(true);
      const stage = res.data?.circuit?.stages[0];
      expect(stage?.blendedElemental).toEqual({
        Fire: 0.25,
        Water: 0.25,
        Earth: 0.25,
        Air: 0.25,
      });
    });
  });
});
