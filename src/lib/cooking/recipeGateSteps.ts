/**
 * Step Feasibility and Thermal Safety Validation for Culinary Gate
 *
 * @file src/lib/cooking/recipeGateSteps.ts
 */

import { evaluateStepTemperature } from "@/data/cooking/foodSafety";
import { METHOD_PHYSICS } from "@/data/cooking/methodPhysics";
import type { CosmicRecipe } from "@/data/featuredRecipe";
import {
  findStepProteinTarget,
  parseStepTemperature,
} from "./recipeGateHelpers";

export interface StepGateFinding {
  code: string;
  message: string;
  path?: string;
  severity: "blocking" | "advisory";
}

interface StepThermalContext {
  isCoolingOrChilling: boolean;
  isInternalDoneness: boolean;
  isSugarOrCandy: boolean;
}

function detectStepContext(
  instructionLower: string,
  rawMethod: string,
  ingredients: CosmicRecipe["ingredients"],
): StepThermalContext {
  const isCoolingOrChilling =
    instructionLower.includes("chill") ||
    instructionLower.includes("refrigerat") ||
    instructionLower.includes("ice bath") ||
    instructionLower.includes("cool down") ||
    instructionLower.includes("cool to") ||
    instructionLower.includes("freezer");

  const isInternalDoneness =
    instructionLower.includes("internal") ||
    instructionLower.includes("thermometer") ||
    instructionLower.includes("center reaches") ||
    instructionLower.includes("probe reads") ||
    instructionLower.includes("thickest part");

  const isSugarOrCandy =
    rawMethod === "candy" ||
    rawMethod === "caramelize" ||
    ingredients.some((i) => {
      const n = i.name.toLowerCase();
      return (
        n.includes("sugar") ||
        n.includes("syrup") ||
        n.includes("honey") ||
        n.includes("caramel") ||
        n.includes("molasses")
      );
    });

  return { isCoolingOrChilling, isInternalDoneness, isSugarOrCandy };
}

export function validateSingleStep(
  step: CosmicRecipe["steps"][number],
  idx: number,
  ingredients: CosmicRecipe["ingredients"],
  blockingFindings: StepGateFinding[],
  advisoryFindings: StepGateFinding[],
): void {
  const rawMethod = step.cooking_method.trim().toLowerCase().replace(/[\s-]+/g, "_");
  const physicsProfile = METHOD_PHYSICS[rawMethod];

  if (!physicsProfile && rawMethod !== "no_cook" && rawMethod !== "mix" && rawMethod !== "prep") {
    advisoryFindings.push({
      code: "UNKNOWN_COOKING_METHOD",
      message: `Cooking method "${step.cooking_method}" in step ${step.step_number} is not formally profiled in the physics registry.`,
      path: `steps.${idx}.cooking_method`,
      severity: "advisory",
    });
  }

  const parsedTempF = parseStepTemperature(step.instruction);
  const instructionLower = step.instruction.toLowerCase();
  const proteinTarget = findStepProteinTarget(instructionLower, ingredients);
  const context = detectStepContext(instructionLower, rawMethod, ingredients);

  const safetyVerdict = evaluateStepTemperature(
    rawMethod,
    parsedTempF,
    proteinTarget,
    context,
  );

  if (!safetyVerdict.safe) {
    blockingFindings.push({
      code: "UNSAFE_TEMPERATURE",
      message: `Step ${step.step_number}: ${safetyVerdict.reason}`,
      path: `steps.${idx}.instruction`,
      severity: "blocking",
    });
  }

  if (step.time_minutes < 0) {
    blockingFindings.push({
      code: "IMPLAUSIBLE_STEP_TIME",
      message: `Step ${step.step_number} has impossible negative time duration (${step.time_minutes} minutes).`,
      path: `steps.${idx}.time_minutes`,
      severity: "blocking",
    });
  }
}
