/**
 * @file src/components/analytics/__tests__/PageViewTracker.operatorPath.test.tsx
 *
 * The browser tracker must not report the admin area. It compared the pathname
 * to `/admin` case-sensitively, so `/ADMIN` (a 404, since Next routing is
 * case-sensitive) was reported as an ordinary page view. The control renders a
 * normal path and expects a report, so "nothing was sent" cannot pass for lack
 * of a working tracker.
 */
import { render } from "@testing-library/react";
import React from "react";

const mockUsePathname = jest.fn<string | null, []>();

jest.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname(),
}));

import PageViewTracker from "@/components/analytics/PageViewTracker";

const mockFetch = jest.fn<Promise<{ ok: boolean }>, [string, RequestInit?]>();

beforeEach(() => {
  mockUsePathname.mockReset();
  mockFetch.mockReset();
  mockFetch.mockResolvedValue({ ok: true });
  Object.defineProperty(window, "fetch", { value: mockFetch, configurable: true, writable: true });
  Object.defineProperty(navigator, "sendBeacon", { value: undefined, configurable: true, writable: true });
  window.sessionStorage.clear();
});

/** How many page-view reports the tracker made for this pathname. */
function reportsFor(pathname: string): number {
  mockUsePathname.mockReturnValue(pathname);
  const view = render(<PageViewTracker />);
  view.unmount();
  return mockFetch.mock.calls.filter(([url]) => url === "/api/track/pageview").length;
}

describe("PageViewTracker and operator paths", () => {
  it("reports an ordinary page (a control: the tracker works in this harness)", () => {
    expect(reportsFor("/recipes")).toBeGreaterThan(0);
  });

  it.each(["/admin", "/admin/traffic", "/ADMIN", "/Admin", "/Admin/traffic"])(
    "reports nothing for %s",
    (pathname) => {
      expect(reportsFor(pathname)).toBe(0);
    },
  );

  it("still reports /administrator-guide, which is not the admin area (a control)", () => {
    expect(reportsFor("/administrator-guide")).toBeGreaterThan(0);
  });
});
