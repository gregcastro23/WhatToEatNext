export interface CustomerInfo {
  name: string;
  phone?: string;
  email?: string;
}

export function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function record(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

export function normalizeCustomerInfo(
  value: unknown,
  fallback: { name?: string | null; email?: string | null },
): CustomerInfo {
  const raw = record(value);
  return {
    name: text(raw?.name) || fallback.name || fallback.email || "Guest",
    phone: text(raw?.phone) || undefined,
    email: text(raw?.email) || fallback.email || undefined,
  };
}
