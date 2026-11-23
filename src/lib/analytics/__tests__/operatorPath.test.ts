/**
 * @file src/lib/analytics/__tests__/operatorPath.test.ts
 *
 * `isOperatorPath` decides whether a pathname is the admin area, for the browser
 * tracker and the server classifier alike. It was a case-sensitive compare, so
 * `/ADMIN` (a 404, since Next routing is case-sensitive) was recorded as an
 * ordinary page view and surfaced in Top Pages and Route Pathfinder.
 */
import { isOperatorPath } from "@/lib/analytics/operatorPath";

describe("isOperatorPath", () => {
  it.each(["/admin", "/admin/traffic", "/admin/chat-reports/42"])("matches %s", (path) => {
    expect(isOperatorPath(path)).toBe(true);
  });

  it.each(["/ADMIN", "/Admin", "/Admin/traffic", "/ADMIN/TRAFFIC", "/aDmIn/x"])(
    "matches the other casing %s",
    (path) => {
      expect(isOperatorPath(path)).toBe(true);
    },
  );

  it.each(["/", "/recipes", "/administrator-guide", "/Administrator-Guide", "/adminx", "/x/admin"])(
    "does not match %s (a control: unchanged behaviour)",
    (path) => {
      expect(isOperatorPath(path)).toBe(false);
    },
  );
});
