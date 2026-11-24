/** @jest-environment jsdom */

/**
 * The quiz opens in place, in a slot right after its bar, and hands focus back to
 * the bar when it closes. The stage itself is faked: QuizFlow.test drives the real one.
 */
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QuizBar } from "../QuizBar";
import { QuizProvider } from "../QuizProvider";
import { QuizSurface } from "../QuizSurface";
import { DEFAULT_QUIZ_CONTEXT } from "../types";

jest.mock("../QuizStage", () => ({
  QuizStage: () => <section role="dialog" aria-label="What are you hungry for?" />,
}));

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  jest.restoreAllMocks();
});

function rect(top: number, height: number): DOMRect {
  return { x: 0, y: top, top, bottom: top + height, left: 0, right: 0, width: 0, height, toJSON: () => ({}) };
}

/** jsdom has no layout: place the bar at 300px and the stage slot under it. */
function layOut(stageHeight: number): void {
  jest
    .spyOn(HTMLElement.prototype, "getBoundingClientRect")
    .mockImplementation(function (this: HTMLElement): DOMRect {
      return this.id === "meal-quiz-trigger" ? rect(300, 76) : rect(392, stageHeight);
    });
}

function renderQuiz(): HTMLElement {
  render(
    <QuizProvider context={DEFAULT_QUIZ_CONTEXT}>
      <QuizBar />
      <QuizSurface />
      <h1>Know what to eat next.</h1>
    </QuizProvider>,
  );
  return screen.getByRole("button", { name: /What are you actually hungry for/ });
}

it("renders nothing until the quiz is opened", () => {
  renderQuiz();
  expect(screen.queryByRole("dialog")).toBeNull();
});

it("opens directly under the bar, ahead of the rest of the hero", async () => {
  const bar = renderQuiz();
  await waitFor(() => expect(bar).toBeEnabled());
  fireEvent.click(bar);
  const stage = await screen.findByRole("dialog", { name: "What are you hungry for?" });
  const headline = screen.getByRole("heading", { level: 1 });
  expect(bar.compareDocumentPosition(stage) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  expect(stage.compareDocumentPosition(headline) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
});

it("scrolls the bar up under the header when the opened stage would run off the screen", async () => {
  layOut(600); // ends at 992px; jsdom's window is 768px tall
  const scrollTo = jest.spyOn(window, "scrollTo").mockImplementation(() => undefined);
  const bar = renderQuiz();
  await waitFor(() => expect(bar).toBeEnabled());
  fireEvent.click(bar);
  await screen.findByRole("dialog");
  expect(scrollTo).toHaveBeenCalledTimes(1);
  expect(scrollTo).toHaveBeenCalledWith({ top: 300 - 12 }); // no site header here
});

it("leaves the page where it is when the opened stage fits", async () => {
  layOut(200); // ends at 592px, above even a phone's tab bar
  const scrollTo = jest.spyOn(window, "scrollTo").mockImplementation(() => undefined);
  const bar = renderQuiz();
  await waitFor(() => expect(bar).toBeEnabled());
  fireEvent.click(bar);
  await screen.findByRole("dialog");
  expect(scrollTo).not.toHaveBeenCalled();
});

it("gives focus back to the bar when it closes", async () => {
  const bar = renderQuiz();
  await waitFor(() => expect(bar).toBeEnabled());
  fireEvent.click(bar);
  await screen.findByRole("dialog");
  bar.blur();
  fireEvent.click(screen.getByRole("button", { name: /Close/ }));
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  expect(document.activeElement).toBe(bar);
});
