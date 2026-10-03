import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import React, { type ReactNode } from "react";
import type { Recipe } from "@/types/recipe";
import { QuizBar } from "../QuizBar";
import { QuizProvider } from "../QuizProvider";
import { QuizStage } from "../QuizStage";
import { DEFAULT_QUIZ_CONTEXT } from "../types";
import { syntheticCatalog } from "./helpers/quizFixtures";

const recipeFixture: Recipe = {
  id: "dish-0",
  name: "dish-0",
  ingredients: [{ name: "rice", amount: 200, unit: "g" }],
  instructions: ["Cook the rice."],
  numberOfServings: 2,
  elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
};

const mockAddRecipe = jest.fn(() => 1);
const mockOpenCart = jest.fn();
const mockLoadRecipe = jest.fn(() => Promise.resolve(recipeFixture));

jest.mock("../quizCatalogClient", () => ({
  loadQuizCatalog: () => Promise.resolve(syntheticCatalog(40)),
  loadQuizDishRecipe: () => mockLoadRecipe(),
}));
jest.mock("../engine/sky", () => ({ computeSky: () => null }));
jest.mock("next/navigation", () => ({ useRouter: () => ({ push: jest.fn() }) }));
jest.mock("@/contexts/GroceryCartContext", () => ({
  useGroceryCart: () => ({ addRecipe: mockAddRecipe, open: mockOpenCart }),
}));
jest.mock("@/contexts/RecipeBuilderContext", () => ({
  useRecipeBuilder: () => ({ seedFromQuiz: jest.fn(), isReady: true }),
}));
jest.mock("@/contexts/RecipeQueueContext", () => ({
  RecipeQueueProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
  useRecipeQueue: () => ({ addToQueue: jest.fn(), isInQueue: () => false }),
}));
jest.mock("framer-motion", () => ({
  AnimatePresence: ({ children }: { children: ReactNode }) => <>{children}</>,
  motion: { div: ({ children }: { children: ReactNode }) => <div>{children}</div> },
  useReducedMotion: () => true,
}));

beforeEach(() => {
  localStorage.clear();
  jest.clearAllMocks();
});

function openQuiz(): HTMLElement {
  render(
    <QuizProvider context={DEFAULT_QUIZ_CONTEXT}>
      <QuizBar />
      <QuizStage />
    </QuizProvider>,
  );
  fireEvent.click(screen.getByRole("button", { name: /What are you actually hungry for/ }));
  return screen.getByRole("dialog", { name: "What are you hungry for?" });
}

async function answerCurrent(stage: HTMLElement): Promise<void> {
  await screen.findByRole("heading", { level: 3 });
  fireEvent.keyDown(stage, { key: "1" });
  fireEvent.keyDown(stage, { key: "Enter" });
}

it("runs a five-question quiz to a real dish and shops it", async () => {
  const stage = openQuiz();
  expect(within(stage).getByRole("heading", { name: /Tell me what you're hungry for/ })).toBeTruthy();
  fireEvent.click(within(stage).getByRole("button", { name: /Speed round/ }));
  fireEvent.click(within(stage).getByRole("button", { name: "Start · 5 questions ✦" }));
  for (let step = 0; step < 5; step += 1) {
    await waitFor(() => expect(within(stage).getByText(`Question ${step + 1} of 5`)).toBeTruthy());
    await answerCurrent(stage);
  }
  const heading = await within(stage).findByText("Your dish, right now");
  expect(heading).toBeTruthy();
  const link = within(stage).getByRole("link", { name: /Open the full recipe/ });
  expect(link.getAttribute("href")).toMatch(/^\/recipes\/dish-\d+$/);
  await act(async () => {
    fireEvent.click(within(stage).getByRole("button", { name: /Shop the ingredients/ }));
    await Promise.resolve();
  });
  await waitFor(() => expect(mockAddRecipe).toHaveBeenCalledWith(expect.objectContaining({ baseServings: 2 }), 2));
  fireEvent.keyDown(stage, { key: "Escape" });
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(screen.getByRole("button", { name: /Tonight: dish-/ })).toBeTruthy();
});

it("reveals early, offers five more, and goes back to setup from the first question", async () => {
  const stage = openQuiz();
  fireEvent.click(within(stage).getByRole("button", { name: /Start · 10 questions/ }));
  await answerCurrent(stage);
  expect(within(stage).queryByRole("button", { name: /Reveal now/ })).toBeNull();
  await answerCurrent(stage);
  await waitFor(() => expect(within(stage).getByText("Question 3 of 10")).toBeTruthy());
  fireEvent.click(within(stage).getByRole("button", { name: /Reveal now/ }));
  expect(await within(stage).findByText("Your dish, right now")).toBeTruthy();
  fireEvent.click(within(stage).getByRole("button", { name: /Ask me 5 more/ }));
  // Resumes at the question "Reveal now" left unanswered, now out of 2 + 5.
  await waitFor(() => expect(within(stage).getByText("Question 3 of 7")).toBeTruthy());
  for (let step = 0; step < 3; step += 1) fireEvent.keyDown(stage, { key: "Backspace" });
  expect(within(stage).getByRole("heading", { name: /Tell me what you're hungry for/ })).toBeTruthy();
});
