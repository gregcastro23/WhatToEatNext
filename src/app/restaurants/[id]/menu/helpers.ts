export function appUrl(): string {
  const configured =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.AUTH_URL ||
    process.env.VERCEL_URL ||
    "https://alchm.kitchen";

  return configured.startsWith("http") ? configured : `https://${configured}`;
}
