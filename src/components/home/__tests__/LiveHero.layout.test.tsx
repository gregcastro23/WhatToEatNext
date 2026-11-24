/** @jest-environment jsdom */

/**
 * The hero's reading order: the quiz comes first, then the headline and mission,
 * then "On this page" chips that jump to the homepage's live sections.
 *
 * Faked: the quiz (a stand-in bar, so the test can find where it renders), the
 * session, the alchemical context, the elemental-bias hook, and every fetch (they
 * fail, which the hero shows as its static fallbacks).
 */
import { render, screen, within } from "@testing-library/react";
import { installFetchMock } from "../../../__tests__/helpers/fetchMock";
import { HOME_SECTION_ANCHORS } from "../homeSections";
import { LiveHero } from "../LiveHero";

jest.mock("next-auth/react", () => ({ useSession: () => ({ status: "unauthenticated", data: null }) }));
jest.mock("@/contexts/AlchemicalContext/hooks", () => ({ useAlchemicalSafe: () => null }));
jest.mock("@/hooks/useUserElementalBias", () => ({
  biasQueryParam: () => null,
  useUserElementalBias: () => ({
    hydrated: true,
    table: [],
    chartOn: false,
    chartSunGlyph: null,
    composite: null,
    bias: null,
    source: null,
    tableSize: 0,
  }),
}));
jest.mock("@/components/home/quiz/QuizBar", () => ({
  QuizBar: () => <button type="button">What are you actually hungry for?</button>,
}));
jest.mock("@/components/home/quiz/QuizSurface", () => ({ QuizSurface: () => null }));
jest.mock("@/components/home/quiz/QuizProvider", () => ({
  QuizProvider: ({ children }: { children: React.ReactNode }) => children,
}));

beforeEach(() => {
  // Reduced motion, so the hero skips its canvas (jsdom has no 2D context).
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({ matches: true, media: query }),
  });
  installFetchMock(jest.fn(() => Promise.reject(new Error("offline"))));
});

it("puts the quiz above the headline", () => {
  render(<LiveHero />);
  const quiz = screen.getByRole("button", { name: "What are you actually hungry for?" });
  const headline = screen.getByRole("heading", { level: 1, name: "Know what to eat next." });
  expect(quiz.compareDocumentPosition(headline) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
});

it("states the mission under the headline", () => {
  render(<LiveHero />);
  expect(screen.getByText(/Fresh, delicious food that's safe to eat/)).toBeInTheDocument();
});

it("links each live section from the 'On this page' chips", () => {
  render(<LiveHero />);
  const nav = screen.getByRole("navigation", { name: "On this page" });
  const hrefs = within(nav)
    .getAllByRole("link")
    .map((link) => link.getAttribute("href"));
  expect(hrefs).toEqual(HOME_SECTION_ANCHORS.map((anchor) => `#${anchor.id}`));
});
