/**
 * Display formatting for the live admin pages. Pure.
 *
 * @file src/components/admin/live/format.ts
 */

/** Stripe's zero-decimal currencies: the amount is already in whole units. */
const ZERO_DECIMAL = new Set(["bif", "clp", "djf", "gnf", "jpy", "kmf", "krw", "mga", "pyg", "rwf", "ugx", "vnd", "vuv", "xaf", "xof", "xpf"]);

export function fmtInt(n: number): string {
  return Math.round(n).toLocaleString("en-US");
}

export function fmtPct(fraction: number, digits = 0): string {
  return `${(fraction * 100).toFixed(digits)}%`;
}

export function fmtMoney(minorUnits: number, currency: string): string {
  const code = currency.toLowerCase();
  const major = ZERO_DECIMAL.has(code) ? minorUnits : minorUnits / 100;
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: code.toUpperCase() }).format(major);
  } catch {
    return `${major.toFixed(2)} ${code.toUpperCase()}`;
  }
}

/** Several currencies side by side; an empty list is a measured zero. */
export function fmtMoneyList(list: ReadonlyArray<{ amount: number; currency: string }>, fallbackCurrency = "usd"): string {
  if (list.length === 0) return fmtMoney(0, fallbackCurrency);
  return list.map((m) => fmtMoney(m.amount, m.currency)).join(" + ");
}

export function fmtAgo(iso: string | null, now: number = Date.now()): string {
  if (!iso) return "never";
  const s = Math.max(0, Math.round((now - new Date(iso).getTime()) / 1000));
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86_400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86_400)}d ago`;
}

export function fmtDuration(ms: number | null): string {
  if (ms === null) return "—";
  const s = Math.round(ms / 1000);
  return s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${s % 60}s`;
}

export function shortSha(sha: string | null): string {
  return sha ? sha.slice(0, 7) : "—";
}

export function shortAddress(address: string | null): string {
  if (!address) return "—";
  return address.length > 14 ? `${address.slice(0, 6)}…${address.slice(-4)}` : address;
}

export function fmtDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/New_York",
  });
}

/** Signed change vs. a previous value, e.g. "+12%"; null when there is no base. */
export function fmtDelta(current: number, previous: number): string | null {
  if (previous === 0) return current === 0 ? "±0" : null;
  const change = (current - previous) / previous;
  return `${change >= 0 ? "+" : ""}${Math.round(change * 100)}%`;
}
