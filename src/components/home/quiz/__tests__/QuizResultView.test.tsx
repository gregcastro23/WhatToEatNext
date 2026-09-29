import React from "react";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { installFetchMock } from "@/__tests__/helpers/fetchMock";
import { QuizResultView } from "../QuizResultView";
import { DEFAULT_QUIZ_CONTEXT, initialQuizState } from "../quizMachine";
import { scoreQuiz } from "../quizScoring";
import {
  parseGeneratedQuizRecipe,
  validateGeneratedConstraints,
  type QuizCosmicRecipe,
} from "../quizIntegrations";

const mockAddRecipe = jest.fn(() => 7);
const mockOpenCart = jest.fn();
const mockSeed = jest.fn();
const mockPush = jest.fn();
const mockQueue = jest.fn();
jest.mock("next/navigation", () => ({ useRouter: () => ({ push: mockPush }) }));
jest.mock("@/contexts/GroceryCartContext", () => ({
  useGroceryCart: () => ({ addRecipe: mockAddRecipe, open: mockOpenCart }),
}));
jest.mock("@/contexts/RecipeBuilderContext", () => ({
  useRecipeBuilder: () => ({ seedFromQuiz: mockSeed, isReady: true }),
}));
jest.mock("@/contexts/RecipeQueueContext", () => ({
  useRecipeQueue: () => ({ addToQueue: mockQueue, isInQueue: () => false }),
}));
const context = DEFAULT_QUIZ_CONTEXT;
const reading = scoreQuiz(
  {
    ...initialQuizState,
    answers: {
      hunger: ["light"],
      heat: ["raw"],
      flavor: ["bright"],
      shape: ["fast"],
    },
  },
  context,
);

const generatedRecipe: QuizCosmicRecipe = {
  id: "cosmic-test",
  title: "Herby white bean bowl",
  short_description: "A test dish.",
  category: "Dinner",
  cuisine: "Fusion",
  difficulty: "beginner",
  yields: 1,
  total_time: 15,
  alignment_score: {
    overall: 90,
    ingredients_fit: 90,
    diet_fit: 100,
    time_fit: 90,
    astro_fit: 80,
  },
  alignment_notes: ["aligned"],
  tags: {
    diet: ["omnivore"],
    cuisine: ["Fusion"],
    meal_type: "Dinner",
    flavor_profile: ["savory"],
    cooking_methods: ["saute"],
    elements: ["fire"],
    planets: ["Mars"],
  },
  ingredients: [
    {
      name: "cooked white beans",
      quantity: "150",
      unit: "g",
      optional: false,
      substitutions: [],
    },
  ],
  steps: [
    {
      step_number: 1,
      instruction: "Toss the cooked beans with herbs and serve.",
      time_minutes: 5,
      cooking_method: "mix",
      tips: [],
    },
  ],
  elementalBalance: { fire: 25, earth: 40, water: 15, air: 20 },
  nutrition: { calories: 400, protein: 20, carbohydrates: 30, fat: 12 },
  finishing_and_serving: {
    garnish_and_plating: "plate it",
    doneness_cues: "golden",
    serving_suggestions: "hot",
  },
  leftovers_and_storage: {
    can_store: true,
    storage_instructions: "fridge",
    storage_lifespan_days: 3,
  },
  astro_explanation: { summary: "Mars day.", correspondences: ["fire"] },
};

beforeEach(() => {
  jest.clearAllMocks();
  sessionStorage.clear();
});

it("uses measured offline ingredients and seeds the builder without generating automatically", () => {
  const fetcher = installFetchMock(jest.fn());
  render(<QuizResultView reading={reading} context={context} />);
  expect(fetcher).not.toHaveBeenCalled();
  fireEvent.click(
    screen.getByRole("button", { name: "Shop these ingredients" }),
  );
  fireEvent.click(screen.getByRole("button", { name: "Open grocery cart" }));
  expect(mockAddRecipe).toHaveBeenCalledTimes(1);
  expect(mockAddRecipe).toHaveBeenCalledWith(
    expect.objectContaining({
      baseServings: 1,
      ingredients: expect.arrayContaining([
        expect.objectContaining({ name: "cooked rice", amount: 90, unit: "g" }),
      ]),
    }),
    1,
  );
  fireEvent.click(
    screen.getByRole("button", { name: /Refine in recipe builder/ }),
  );
  expect(mockSeed).toHaveBeenCalledWith(
    expect.objectContaining({
      quizBrief: expect.stringContaining("Answers:"),
      maxPrepTimeMinutes: 20,
    }),
  );
  expect(mockPush).toHaveBeenCalledWith("/recipe-builder");
});

it("keeps generation alive on equivalent context refreshes and shops the returned recipe", async () => {
  let finish: (value: unknown) => void = () => {
    throw new Error("Request has not started");
  };
  const pending = new Promise((resolve) => {
    finish = resolve;
  });
  const fetcher = installFetchMock(jest.fn(() => pending));
  const { rerender } = render(
    <QuizResultView reading={reading} context={context} />,
  );
  fireEvent.click(
    screen.getByRole("button", { name: /Create a recipe with AI/ }),
  );
  expect(fetcher).toHaveBeenCalledTimes(1);
  rerender(
    <QuizResultView reading={{ ...reading }} context={{ ...context }} />,
  );
  expect(
    screen.getByRole("button", { name: /Creating your recipe/ }),
  ).toBeDisabled();
  await act(async () => {
    finish({ ok: true, status: 200, json: async () => generatedRecipe });
    await pending;
  });
  expect(
    await screen.findByRole("heading", { name: generatedRecipe.title }),
  ).toBeTruthy();
  fireEvent.click(
    screen.getByRole("button", { name: "Shop these ingredients" }),
  );
  expect(mockAddRecipe).toHaveBeenCalledWith(
    expect.objectContaining({
      name: generatedRecipe.title,
      ingredients: [{ name: "cooked white beans", amount: 150, unit: "g" }],
    }),
    1,
  );
});

it("rejects malformed generated content and leaves the original meal available", async () => {
  installFetchMock(
    jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ ...generatedRecipe, title: " " }),
    }),
  );
  render(<QuizResultView reading={reading} context={context} />);
  fireEvent.click(
    screen.getByRole("button", { name: /Create a recipe with AI/ }),
  );
  await waitFor(() =>
    expect(screen.getByRole("alert")).toHaveTextContent(/missing usable/),
  );
  expect(screen.getByRole("heading", { name: reading.meal.name })).toBeTruthy();
});

it("rejects obvious equipment and dietary conflicts as well as unusable quantities", () => {
  expect(() =>
    parseGeneratedQuizRecipe({ ...generatedRecipe, yields: 1.5 }),
  ).toThrow();
  expect(() =>
    parseGeneratedQuizRecipe({
      ...generatedRecipe,
      ingredients: [
        { ...generatedRecipe.ingredients[0], quantity: "to taste" },
      ],
    }),
  ).toThrow();
  expect(() =>
    validateGeneratedConstraints(generatedRecipe, {
      ...reading,
      preferences: { ...reading.preferences, equipment: ["none"] },
    }),
  ).toThrow(/equipment/);
  expect(() =>
    validateGeneratedConstraints(
      {
        ...generatedRecipe,
        ingredients: [
          {
            name: "peanuts",
            quantity: "1",
            unit: "g",
            optional: false,
            substitutions: [],
          },
        ],
      },
      {
        ...reading,
        preferences: { ...reading.preferences, excludedAllergens: ["peanuts"] },
      },
    ),
  ).toThrow(/peanuts/);
});
