/**
 * The error cell of the route heatmap on `/admin/dashboard`.
 *
 * It showed `errors5xx + errors4xx`, so a route whose every non-2xx is an expected
 * `402 insufficient_funds` or `409 already_applied` (the agent economy routes)
 * read as a failing route. MEASURED 2026-11-23: all 5,346 non-2xx of
 * `/api/economy/sync-debit` over 7 days were 402. The cell now counts server
 * errors only; client responses stay visible in the tooltip, and the cell is
 * tinted whenever there are any, so a 401 or 404 storm is not hidden.
 *
 * @file src/app/admin/_dashboard/routeErrorCell.ts
 */

export interface RouteErrorCell {
  /** The number shown: server (5xx) errors. */
  text: string;
  title: string;
  /** CSS variable for the cell: red for any 5xx, amber for client responses only, muted for neither. */
  color: string;
}

export function routeErrorCell(errors5xx: number, errors4xx: number): RouteErrorCell {
  return {
    text: String(errors5xx),
    title:
      `${errors5xx} 5xx (server errors) · ${errors4xx} 4xx (client responses; ` +
      "402 insufficient_funds and 409 already_applied are expected outcomes, not failures)",
    color: errors5xx > 0 ? "var(--el-fire)" : errors4xx > 0 ? "var(--accent-2)" : "var(--fg-mute)",
  };
}
