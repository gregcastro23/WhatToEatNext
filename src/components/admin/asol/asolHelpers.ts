/**
 * Helper formatters for ASOL delivery health dashboard
 *
 * @file src/components/admin/asol/asolHelpers.ts
 */

export function formatRelative(iso: string | null): string {
  if (!iso) return "never";
  const ageMs = Date.now() - new Date(iso).getTime();
  if (ageMs < 0) return "just now";
  if (ageMs < 60_000) return `${Math.round(ageMs / 1000)}s ago`;
  if (ageMs < 3_600_000) return `${Math.round(ageMs / 60_000)}m ago`;
  if (ageMs < 86_400_000) return `${Math.round(ageMs / 3_600_000)}h ago`;
  return `${Math.round(ageMs / 86_400_000)}d ago`;
}

export function formatLatency(ms: number | null): string {
  if (ms === null || ms <= 0) return "—";
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

export function getStatusBadge(status: string): string {
  switch (status.toLowerCase()) {
    case "processed":
      return "bg-emerald-100 text-emerald-800 border-emerald-300";
    case "processing":
      return "bg-amber-100 text-amber-800 border-amber-300 animate-pulse";
    case "failed":
      return "bg-rose-100 text-rose-800 border-rose-300";
    case "duplicate":
      return "bg-blue-100 text-blue-800 border-blue-300";
    default:
      return "bg-gray-100 text-gray-800 border-gray-300";
  }
}
