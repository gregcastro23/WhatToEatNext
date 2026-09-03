export function appUrl(): string {
  const nextPublic = process.env.NEXT_PUBLIC_APP_URL;
  const authUrl = process.env.AUTH_URL;
  const vercelUrl = process.env.VERCEL_URL;

  const configured =
    nextPublic && nextPublic.length > 0
      ? nextPublic
      : authUrl && authUrl.length > 0
        ? authUrl
        : vercelUrl && vercelUrl.length > 0
          ? vercelUrl
          : "https://alchm.kitchen";

  return configured.startsWith("http") ? configured : `https://${configured}`;
}
