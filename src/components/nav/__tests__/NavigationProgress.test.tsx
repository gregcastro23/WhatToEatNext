/**
 * @jest-environment jsdom
 *
 * NavigationProgress — the Suspense-free navigation indicator that replaced
 * the root loading.tsx (which made every notFound()/redirect() an HTTP 200).
 */

import { act, fireEvent, render, screen } from "@testing-library/react";
import { NavigationProgress } from "../NavigationProgress";

let mockPathname = "/recipes";
jest.mock("next/navigation", () => ({
  usePathname: (): string => mockPathname,
}));

/** An anchor that behaves like next/link: it cancels the native navigation. */
function renderWithLink(href: string, cancel: boolean): ReturnType<typeof render> {
  return render(
    <>
      <NavigationProgress />
      <a
        href={href}
        onClick={(e) => {
          if (cancel) e.preventDefault();
        }}
      >
        go
      </a>
    </>,
  );
}

describe("NavigationProgress", () => {
  beforeEach(() => {
    mockPathname = "/recipes";
  });

  it("shows while a client-side navigation to another path is in flight", () => {
    renderWithLink("/cuisines/thai", true);
    fireEvent.click(screen.getByText("go"));
    expect(screen.getByRole("progressbar")).toBeTruthy();
  });

  it("clears once the pathname changes", () => {
    const view = renderWithLink("/cuisines/thai", true);
    fireEvent.click(screen.getByText("go"));
    mockPathname = "/cuisines/thai";
    view.rerender(
      <>
        <NavigationProgress />
        <a href="/cuisines/thai">go</a>
      </>,
    );
    expect(screen.queryByRole("progressbar")).toBeNull();
  });

  it("stays hidden for a plain anchor the browser navigates itself", () => {
    renderWithLink("/cuisines/thai", false);
    fireEvent.click(screen.getByText("go"), { cancelable: true });
    expect(screen.queryByRole("progressbar")).toBeNull();
  });

  it("stays hidden for a link to the current path", () => {
    renderWithLink("/recipes", true);
    fireEvent.click(screen.getByText("go"));
    expect(screen.queryByRole("progressbar")).toBeNull();
  });

  it("gives up after the safety timeout if the navigation never lands", () => {
    jest.useFakeTimers();
    try {
      renderWithLink("/cuisines/thai", true);
      fireEvent.click(screen.getByText("go"));
      act(() => {
        jest.advanceTimersByTime(10_000);
      });
      expect(screen.queryByRole("progressbar")).toBeNull();
    } finally {
      jest.useRealTimers();
    }
  });
});
