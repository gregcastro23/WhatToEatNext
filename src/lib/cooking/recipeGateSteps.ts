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
  parseStepTemperatures,
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
    /\b(chill|chilled|chilling|cooling|cool\s+down|cool\s+to|refrigerat\w*|ice\s+bath|freeze|freezer)\b/i.test(
      instructionLower,
    );

  const isInternalDoneness =
    rawMethod === "sous_vide" ||
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

function checkCookingMethodProfile(
  rawMethod: string,
  cookingMethod: string,
  stepNumber: number,
  idx: number,
  advisoryFindings: StepGateFinding[],
): void {
  const physicsProfile = METHOD_PHYSICS[rawMethod];
  if (!physicsProfile && rawMethod !== "no_cook" && rawMethod !== "mix" && rawMethod !== "prep") {
    advisoryFindings.push({
      code: "UNKNOWN_COOKING_METHOD",
      message: `Cooking method "${cookingMethod}" in step ${stepNumber} is not formally profiled in the physics registry.`,
      path: `steps.${idx}.cooking_method`,
      severity: "advisory",
    });
  }
}

function checkStepThermalSafety(
  rawMethod: string,
  stepNumber: number,
  idx: number,
  instruction: string,
  ingredients: CosmicRecipe["ingredients"],
  blockingFindings: StepGateFinding[],
): void {
  const parsedTemps = parseStepTemperatures(instruction);
  const instructionLower = instruction.toLowerCase();
  const proteinTarget = findStepProteinTarget(instructionLower, ingredients);
  const baseContext = detectStepContext(instructionLower, rawMethod, ingredients);

  for (const { temperatureF, isInternalDoneness } of parsedTemps) {
    const stepContext: StepThermalContext = {
      ...baseContext,
      isInternalDoneness: isInternalDoneness || baseContext.isInternalDoneness,
    };

    const safetyVerdict = evaluateStepTemperature(
      rawMethod,
      temperatureF,
      proteinTarget,
      stepContext,
    );

    if (!safetyVerdict.safe) {
      blockingFindings.push({
        code: "UNSAFE_TEMPERATURE",
        message: `Step ${stepNumber}: ${safetyVerdict.reason}`,
        path: `steps.${idx}.instruction`,
        severity: "blocking",
      });
      break;
    }
  }
}

export function validateSingleStep(
  step: CosmicRecipe["steps"][number],
  idx: number,
  ingredients: CosmicRecipe["ingredients"],
  blockingFindings: StepGateFinding[],
  advisoryFindings: StepGateFinding[],
): void {
  const rawMethod = step.cooking_method.trim().toLowerCase().replace(/[\s-]+/g, "_");
  checkCookingMethodProfile(rawMethod, step.cooking_method, step.step_number, idx, advisoryFindings);
  checkStepThermalSafety(rawMethod, step.step_number, idx, step.instruction, ingredients, blockingFindings);

  if (step.time_minutes < 0) {
    blockingFindings.push({
      code: "IMPLAUSIBLE_STEP_TIME",
      message: `Step ${step.step_number} has impossible negative time duration (${step.time_minutes} minutes).`,
      path: `steps.${idx}.time_minutes`,
      severity: "blocking",
    });
  }
}
