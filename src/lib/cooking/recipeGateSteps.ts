/**
 * Step Feasibility and Thermal Safety Validation for Culinary Gate
 *
 * @file src/lib/cooking/recipeGateSteps.ts
 */

import { evaluateStepTemperature } from "@/data/cooking/foodSafety";
import { METHOD_PHYSICS } from "@/data/cooking/methodPhysics";
import {
  findStepProteinTargets,
  parseStepTemperatures,
} from "./recipeGateHelpers";
import type {
  RecipeContentIngredient,
  RecipeContentStep,
} from "./recipeGateTypes";

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
  ingredients: RecipeContentIngredient[],
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
  if (
    !physicsProfile &&
    rawMethod !== "no_cook" &&
    rawMethod !== "mix" &&
    rawMethod !== "prep"
  ) {
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
  ingredients: RecipeContentIngredient[],
  blockingFindings: StepGateFinding[],
  advisoryFindings: StepGateFinding[],
): void {
  const parsedTemps = parseStepTemperatures(instruction);
  const instructionLower = instruction.toLowerCase();
  const baseContext = detectStepContext(
    instructionLower,
    rawMethod,
    ingredients,
  );

  for (const parsed of parsedTemps) {
    let proteinTargets = findStepProteinTargets(parsed.clause, ingredients, {
      fallbackToRecipeProteins: rawMethod === "sous_vide",
    });
    if (proteinTargets.length === 0) {
      proteinTargets = findStepProteinTargets(
        parsed.precedingClause,
        ingredients,
      );
    }
    const isInternal =
      parsed.isInternalDoneness ||
      (rawMethod === "sous_vide" && !parsed.isCoolingOrChilling);

    const stepContext = {
      isInternalDoneness: isInternal,
      isCoolingOrChilling: parsed.isCoolingOrChilling,
      isSugarOrCandy: baseContext.isSugarOrCandy,
      isOven: parsed.isOven,
      isPressure: parsed.isPressure,
      isLiquid: parsed.isLiquid,
    };

    const safetyVerdict = evaluateStepTemperature(
      rawMethod,
      parsed.temperatureF,
      proteinTargets,
      stepContext,
    );

    if (safetyVerdict.unevaluated) {
      advisoryFindings.push({
        code: "UNEVALUATED_THERMAL_PROCESS",
        message: `Step ${stepNumber}: ${safetyVerdict.reason}`,
        path: `steps.${idx}.instruction`,
        severity: "advisory",
      });
    }

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
  step: RecipeContentStep,
  idx: number,
  ingredients: RecipeContentIngredient[],
  blockingFindings: StepGateFinding[],
  advisoryFindings: StepGateFinding[],
): void {
  const stepNumber = step.step_number ?? idx + 1;
  const rawMethod =
    step.cooking_method
      ?.trim()
      .toLowerCase()
      .replace(/[\s-]+/g, "_") ?? "";
  if (step.cooking_method !== undefined) {
    checkCookingMethodProfile(
      rawMethod,
      step.cooking_method,
      stepNumber,
      idx,
      advisoryFindings,
    );
  }
  checkStepThermalSafety(
    rawMethod,
    stepNumber,
    idx,
    step.instruction,
    ingredients,
    blockingFindings,
    advisoryFindings,
  );

  if (step.time_minutes !== undefined && step.time_minutes < 0) {
    blockingFindings.push({
      code: "IMPLAUSIBLE_STEP_TIME",
      message: `Step ${stepNumber} has impossible negative time duration (${step.time_minutes} minutes).`,
      path: `steps.${idx}.time_minutes`,
      severity: "blocking",
    });
  }
}
