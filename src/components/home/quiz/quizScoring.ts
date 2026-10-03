import { ELEMENT_ORDER } from "@/utils/guestPalate";
import { sanitizeAnswers } from "./quizMachine";
import {
  QUIZ_QUESTIONS,
  getActiveQuestions,
  getQuestionOptions,
  questionPrompt,
} from "./quizQuestions";
import type {
  DietaryStyle,
  ElementVector,
  ESMSVector,
  QuizAnswers,
  QuizContext,
  QuizIngredient,
  QuizReading,
  QuizState,
} from "./types";

const emptyElements = (): ElementVector => ({
  Fire: 0,
  Water: 0,
  Earth: 0,
  Air: 0,
});
const ESMS = ["Spirit", "Essence", "Matter", "Substance"] as const;
function dietaryStyle(value: string | undefined): DietaryStyle {
  return value === "vegan" || value === "vegetarian" || value === "pescatarian"
    ? value
    : "unrestricted";
}
export function scoreQuiz(state: QuizState, context: QuizContext): QuizReading {
  const questions = getActiveQuestions(
    state.mode,
    state.questionLimit,
    context,
    state.answers,
  );
  const answers: QuizAnswers = sanitizeAnswers(state.answers, context);
  const totals = emptyElements();
  const esmsTotals: ESMSVector = {
    Spirit: 0,
    Essence: 0,
    Matter: 0,
    Substance: 0,
  };
  const selectedOptions: Array<QuizReading["selectedOptions"][number]> = [];
  for (const question of questions) {
    const options = getQuestionOptions(question, context, state.answers).filter(
      (option) => state.answers[question.id]?.includes(option.id),
    );
    answers[question.id] = options.map((option) => option.id);
    for (const option of options) {
      for (const el of ELEMENT_ORDER)
        totals[el] += option.weights.elements[el] ?? 0;
      for (const key of ESMS)
        esmsTotals[key] += option.weights.esms?.[key] ?? 0;
      selectedOptions.push({
        questionId: question.id,
        question: questionPrompt(question, context, state.answers),
        optionId: option.id,
        label: option.label,
      });
    }
  }
  // Preserve the full draft for handoffs even when the user switches to Quick.
  for (const question of QUIZ_QUESTIONS.filter(
    (item) => !questions.includes(item),
  )) {
    for (const option of getQuestionOptions(question, context, answers).filter(
      (item) => answers[question.id]?.includes(item.id),
    )) {
      selectedOptions.push({
        questionId: question.id,
        question: questionPrompt(question, context, answers),
        optionId: option.id,
        label: option.label,
      });
    }
  }
  const bias = context.elementalBias;
  const biasSum = bias
    ? ELEMENT_ORDER.reduce(
        (sum, el) =>
          sum + Math.max(0, Number.isFinite(bias[el]) ? bias[el] : 0),
        0,
      )
    : 0;
  if (bias && biasSum > 0) {
    const weight =
      ELEMENT_ORDER.reduce((sum, el) => sum + totals[el], 0) * 0.25;
    for (const el of ELEMENT_ORDER)
      totals[el] +=
        (Math.max(0, Number.isFinite(bias[el]) ? bias[el] : 0) / biasSum) *
        weight;
  }
  const ranked = [...ELEMENT_ORDER].sort((a, b) => totals[b] - totals[a]);
  const sum = ELEMENT_ORDER.reduce((value, el) => value + totals[el], 0);
  const pct = emptyElements();
  for (const el of ELEMENT_ORDER)
    pct[el] = sum > 0 ? Math.floor((totals[el] / sum) * 100) : 25;
  const remainders = [...ELEMENT_ORDER].sort(
    (a, b) =>
      (sum > 0 ? (totals[b] / sum) * 100 - pct[b] : 0) -
      (sum > 0 ? (totals[a] / sum) * 100 - pct[a] : 0),
  );
  const remainder =
    100 - ELEMENT_ORDER.reduce((value, el) => value + pct[el], 0);
  for (let i = 0; i < remainder; i += 1) {
    const el = remainders[i];
    if (el) pct[el] += 1;
  }

  const diet = dietaryStyle(answers.diet?.[0]);
  const excludedAllergens = (answers.allergens ?? []).filter(
    (value) => value !== "none",
  );
  const selectedTime = answers.time?.[0];
  const availableMinutes =
    selectedTime === "15"
      ? 15
      : selectedTime === "30"
        ? 30
        : selectedTime === "60"
          ? 60
          : null;
  const maxMinutes =
    answers.shape?.[0] === "fast"
      ? Math.min(availableMinutes ?? 20, 20)
      : availableMinutes;
  const servingChoice = answers.servings?.[0];
  const servings =
    servingChoice === "1"
      ? 1
      : servingChoice === "2"
        ? 2
        : servingChoice === "4"
          ? 4
          : Math.max(1, Math.min(12, Math.round(context.tableSize || 2)));
  const equipment = answers.equipment ?? [];
  let method = answers.heat?.[0] ?? "sear";
  if (equipment.includes("none") || answers.weather?.[0] === "cooling")
    method = "raw";
  else if (
    equipment.length &&
    !equipment.includes("stovetop") &&
    method !== "raw"
  )
    method = equipment.includes("oven") ? "roast" : "raw";
  if (method === "roast" && equipment.length && !equipment.includes("oven"))
    method = equipment.includes("stovetop") ? "sear" : "raw";
  if (method === "roast" && maxMinutes !== null && maxMinutes < 30)
    method =
      equipment.includes("oven") && !equipment.includes("stovetop")
        ? "raw"
        : "sear";
  const protein = answers.protein?.[0] ?? "chickpeas";
  const proteinNames: Record<string, string> = {
    chickpeas: "cooked chickpeas, drained",
    tofu: "firm tofu",
    eggs: "hard-boiled eggs",
    fish: "cooked flaked salmon",
    chicken: "cooked chicken breast",
    vegetables: "cooked white beans, drained",
  };
  const proteinLabels: Record<string, string> = {
    chickpeas: "chickpea",
    tofu: "tofu",
    eggs: "egg",
    fish: "salmon",
    chicken: "chicken",
    vegetables: "white bean",
  };
  const flavor = answers.flavor?.[0] ?? "bright";
  const spice = answers.spice?.[0] ?? (flavor === "spicy" ? "medium" : "mild");
  const flavorName =
    flavor === "savory"
      ? method === "raw"
        ? "Lemon & mushroom"
        : "Garlic & mushroom"
      : flavor === "rounded"
        ? "Gentle lemon"
        : flavor === "spicy" && spice !== "mild"
          ? "Chili-lime"
          : "Lemon-herb";
  const style =
    method === "raw"
      ? "bowl"
      : method === "simmer"
        ? "soup"
        : method === "roast"
          ? "tray bake"
          : "skillet";
  const roots = answers.season?.[0] === "roots";
  const vegetables = roots ? "grated carrots" : "sliced zucchini";
  const ingredients: QuizIngredient[] = [
    {
      name: proteinNames[protein] ?? "cooked chickpeas, drained",
      amount: 150 * servings,
      unit: "g",
    },
    {
      name: "cooked rice",
      amount:
        (answers.matter?.[0] === "substantial"
          ? 180
          : answers.hunger?.[0] === "light"
            ? 90
            : 125) * servings,
      unit: "g",
    },
    { name: vegetables, amount: 150 * servings, unit: "g" },
    {
      name: "olive oil",
      amount: (answers.substance?.[0] === "rounded" ? 1.5 : 1) * servings,
      unit: "tbsp",
    },
    {
      name: flavor === "spicy" ? "lime juice" : "lemon juice",
      amount: servings * (answers.spirit?.[0] === "lively" ? 1.5 : 1),
      unit: "tbsp",
    },
    {
      name: "fresh parsley",
      amount: servings * (answers.essence?.[0] === "fragrant" ? 10 : 5),
      unit: "g",
    },
  ];
  if (flavor === "savory")
    ingredients.push({
      name: method === "raw" ? "roasted mushrooms, cooled" : "sliced mushrooms",
      amount: 75 * servings,
      unit: "g",
    });
  if (method !== "raw")
    ingredients.push({
      name: "minced garlic",
      amount: servings,
      unit: "clove",
    });
  if (spice !== "mild")
    ingredients.push({
      name: "chili flakes",
      amount: (spice === "hot" ? 0.5 : 0.125) * servings,
      unit: "tsp",
    });
  if (method === "simmer")
    ingredients.push({ name: "water", amount: 300 * servings, unit: "ml" });
  const finish = `Finish with ${flavor === "spicy" ? "lime" : "lemon"} juice and parsley${spice === "mild" ? "" : ", adding the chili flakes to taste"}. Divide between ${servings} ${servings === 1 ? "bowl" : "bowls"}.`;
  const prep = `Use the ready-cooked rice and protein listed in the ingredients. Wash and prepare the vegetables; cut the protein into bite-size pieces. The timing assumes the listed cooked ingredients are ready.`;
  const cook =
    method === "raw"
      ? "Use chilled cooked ingredients. Toss the rice, protein and vegetables with the olive oil; fold in cooled roasted mushrooms if using."
      : method === "simmer"
        ? "Warm the olive oil in a pot. Soften the vegetables and garlic for 4 minutes, including mushrooms if using. Add the water, cooked rice and protein. Simmer for 8–10 minutes until steaming throughout."
        : method === "roast"
          ? "Heat the oven to 220°C / 425°F. Toss the vegetables, garlic and protein with olive oil, including mushrooms if using. Roast on a tray for 18–22 minutes, stirring halfway. Add the cooked rice for the final 5 minutes and heat throughout."
          : "Heat the olive oil in a skillet. Cook the vegetables and garlic for 4–5 minutes, including mushrooms if using. Add the cooked rice and protein; toss for another 4–5 minutes until steaming throughout.";
  const actualMinutes =
    method === "raw"
      ? 10
      : method === "roast"
        ? 30
        : method === "simmer"
          ? 20
          : 15;
  // A 15-minute limit also converts a simmer to the tested quick skillet approach.
  const shortSimmer = method === "simmer" && maxMinutes === 15;
  const instructions = [
    prep,
    shortSimmer
      ? "Bring the water to a boil in a pot. Add finely grated vegetables, garlic, cooked rice and protein, including thinly sliced mushrooms if using. Simmer 8 minutes until steaming throughout, then stir in the olive oil."
      : cook,
    finish,
  ];
  return {
    totals,
    pct,
    dominant: ranked[0] ?? "Fire",
    secondary: ranked[1] ?? "Earth",
    esmsTotals,
    selectedOptions,
    preferences: {
      dietaryStyle: diet,
      excludedAllergens,
      cookingMethod: method,
      texture: answers.texture?.[0] ?? null,
      maxMinutes,
      equipment,
      proteinFocus: protein,
      servings,
      spiceLevel: spice,
    },
    meal: {
      name: `${flavorName} ${proteinLabels[protein] ?? "chickpea"} ${style}`,
      emoji: method === "simmer" ? "🍲" : "🥗",
      cuisine: "Mediterranean-inspired",
      cuisineSlug: "mediterranean",
      method:
        method === "raw"
          ? "Assembly"
          : method === "roast"
            ? "Roasting"
            : method === "simmer"
              ? "Simmering"
              : "Sautéing",
      blurb: `A ${flavorName.toLowerCase()} meal shaped around your appetite${maxMinutes ? ` and ${maxMinutes}-minute window` : ""}. Ready-cooked staples make the preparation practical.`,
      prepMinutes: shortSimmer ? 15 : actualMinutes,
      dietaryMatch:
        diet === "unrestricted" ? "Your selected ingredients" : diet,
      suggestedIngredients: ingredients,
      instructions,
    },
    tunedDescription: context.elementalBias
      ? `Your answers, with a gentle influence from your table of ${context.tableSize || 1}.`
      : "Your appetite, cooking pace and preferred flavors shape this meal. Go deeper to add dietary boundaries and finer preferences.",
  };
}
