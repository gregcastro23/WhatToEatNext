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
  const rawName = text(raw?.name);
  const rawEmail = text(raw?.email);
  const rawPhone = text(raw?.phone);
  const fallbackName = fallback.name?.trim();
  const fallbackEmail = fallback.email?.trim();

  const name =
    rawName && rawName.length > 0
      ? rawName
      : fallbackName && fallbackName.length > 0
        ? fallbackName
        : fallbackEmail && fallbackEmail.length > 0
          ? fallbackEmail
          : "Guest";

  const email =
    rawEmail && rawEmail.length > 0
      ? rawEmail
      : fallbackEmail && fallbackEmail.length > 0
        ? fallbackEmail
        : undefined;

  const phone = rawPhone && rawPhone.length > 0 ? rawPhone : undefined;

  return { name, phone, email };
}
