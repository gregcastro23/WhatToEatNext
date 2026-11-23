/**
 * Is this pathname an operator surface (`/admin` or anything under it)?
 *
 * Next.js routing is case-sensitive, so `/ADMIN` is a 404, not the admin area.
 * But a compare that is also case-sensitive recorded those 404 hits as ordinary
 * page views, and `/ADMIN` leaked into Top Pages and Route Pathfinder. Both the
 * browser tracker and the server classifier decide with this one function.
 * `/administrator-guide` is NOT an operator path: only `/admin` itself and
 * `/admin/...` match.
 *
 * Client-safe on purpose: no imports. `pageViewClassify.ts` pulls in node
 * `createHash`, so the browser tracker cannot import that file.
 *
 * @file src/lib/analytics/operatorPath.ts
 */

export function isOperatorPath(pathname: string): boolean {
  const path = pathname.toLowerCase();
  return path === "/admin" || path.startsWith("/admin/");
}
