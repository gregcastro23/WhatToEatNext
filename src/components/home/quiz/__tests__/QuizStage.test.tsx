import React, { type ReactNode } from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { QuizBar } from "../QuizBar";
import { QuizProvider } from "../QuizProvider";
import { QuizStage } from "../QuizStage";
import { DEFAULT_QUIZ_CONTEXT } from "../quizMachine";
jest.mock("../quiz.module.css", () => ({}));
jest.mock("../QuizResultView", () => ({
  QuizResultView: () => (
    <h3 id="quiz-result-heading" tabIndex={-1}>
      Your crafted meal
    </h3>
  ),
}));
jest.mock("@/contexts/RecipeQueueContext", () => ({
  RecipeQueueProvider: ({ children }: { children: ReactNode }) => (
    <>{children}</>
  ),
}));
jest.mock("framer-motion", () => ({
  AnimatePresence: ({ children }: { children: ReactNode }) => <>{children}</>,
  motion: {
    div: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  },
  useReducedMotion: () => true,
}));
beforeEach(() => localStorage.clear());
function openQuiz() {
  render(
    <QuizProvider context={DEFAULT_QUIZ_CONTEXT}>
      <QuizBar />
      <QuizStage />
    </QuizProvider>,
  );
  fireEvent.click(screen.getByRole("button", { name: /Craft tonight/ }));
  return screen.getByRole("dialog", { name: "Craft your meal" });
}
it("completes Quick Craft entirely by keyboard and supports back/close", () => {
  const stage = openQuiz();
  const first = screen.getByRole("heading").textContent;
  fireEvent.keyDown(stage, { key: "1" });
  fireEvent.keyDown(stage, { key: "Enter" });
  expect(screen.getByRole("heading").textContent).not.toBe(first);
  fireEvent.keyDown(stage, { key: "Backspace" });
  expect(screen.getByRole("heading").textContent).toBe(first);
  for (let i = 0; i < 4; i += 1) {
    fireEvent.keyDown(stage, { key: "2" });
    fireEvent.keyDown(stage, { key: "Enter" });
  }
  expect(screen.getByText("Your crafted meal")).toBeTruthy();
  fireEvent.keyDown(stage, { key: "Escape" });
  expect(screen.queryByRole("dialog")).toBeNull();
});
it("preserves radio arrow navigation and ignores modified/repeated shortcuts", () => {
  const stage = openQuiz();
  fireEvent.keyDown(stage, { key: "1", ctrlKey: true });
  fireEvent.keyDown(stage, { key: "2", repeat: true });
  expect(screen.getByRole("button", { name: /Continue/ })).toBeDisabled();
  const choices = within(stage).getAllByRole("radio");
  const first = choices[0];
  if (!first) throw new Error("Missing choices");
  fireEvent.keyDown(first, { key: "ArrowRight" });
  expect(choices[1]).toHaveAttribute("aria-checked", "true");
  const title = screen.getByRole("heading").textContent;
  fireEvent.keyDown(first, { key: "Enter" });
  expect(screen.getByRole("heading").textContent).toBe(title);
});
it("opens saved legacy results without asking the four questions again", () => {
  localStorage.setItem(
    "alchm:firstmeal:v1",
    JSON.stringify({ answers: [0, 1, 2, 3] }),
  );
  render(
    <QuizProvider context={DEFAULT_QUIZ_CONTEXT}>
      <QuizBar />
      <QuizStage />
    </QuizProvider>,
  );
  fireEvent.click(screen.getByRole("button", { name: /View/ }));
  expect(screen.getByText("Your crafted meal")).toBeTruthy();
});
