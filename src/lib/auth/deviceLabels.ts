/**
 * Device and location extraction for device session tracking.
 *
 * Extracts low-entropy client hints (Sec-CH-UA*) with User-Agent fallback,
 * and decodes Vercel geographic headers. Adheres to GDPR data minimization:
 * does NOT store raw IP addresses.
 *
 * @file src/lib/auth/deviceLabels.ts
 */

export interface ParsedDeviceMetadata {
  device: string;
  userAgent: string | null;
  locationCity: string | null;
  locationRegion: string | null;
  locationCountry: string | null;
}

type HeaderSource = Request | Headers | { headers: Headers };

function getHeader(source: HeaderSource, name: string): string | null {
  if ("headers" in source && typeof source.headers.get === "function") {
    return source.headers.get(name);
  }
  if (typeof (source as Headers).get === "function") {
    return (source as Headers).get(name);
  }
  return null;
}

function parsePlatform(hintsPlatform: string | null, ua: string): string | null {
  if (hintsPlatform) {
    const cleaned = hintsPlatform.replace(/^["']|["']$/g, "").trim();
    if (cleaned) {
      if (/macos/i.test(cleaned)) return "macOS";
      if (/windows/i.test(cleaned)) return "Windows";
      if (/android/i.test(cleaned)) return "Android";
      if (/ios/i.test(cleaned)) return "iOS";
      if (/linux/i.test(cleaned)) return "Linux";
      if (/chrome\s*os/i.test(cleaned)) return "ChromeOS";
      return cleaned.slice(0, 30);
    }
  }

  if (/iphone|ipad|ipod/i.test(ua)) return "iOS";
  if (/macintosh|mac os x/i.test(ua)) return "macOS";
  if (/windows/i.test(ua)) return "Windows";
  if (/android/i.test(ua)) return "Android";
  if (/cros/i.test(ua)) return "ChromeOS";
  if (/linux|x11/i.test(ua)) return "Linux";

  return null;
}

function parseBrowser(hintsUa: string | null, ua: string): string | null {
  if (hintsUa) {
    if (/edg/i.test(hintsUa)) return "Edge";
    if (/opera|opr/i.test(hintsUa)) return "Opera";
    if (/chrome|chromium/i.test(hintsUa)) return "Chrome";
    if (/firefox/i.test(hintsUa)) return "Firefox";
    if (/safari/i.test(hintsUa)) return "Safari";
  }

  if (/edg\/|edge\//i.test(ua)) return "Edge";
  if (/opr\/|opera/i.test(ua)) return "Opera";
  if (/chrome\/|crios\//i.test(ua)) return "Chrome";
  if (/firefox\/|fxios\//i.test(ua)) return "Firefox";
  if (/safari\//i.test(ua)) return "Safari";

  return null;
}

function parseLocation(source: HeaderSource): {
  locationCity: string | null;
  locationRegion: string | null;
  locationCountry: string | null;
} {
  const rawCity = getHeader(source, "x-vercel-ip-city");
  let locationCity: string | null = null;
  if (rawCity) {
    try {
      const decoded = decodeURIComponent(rawCity).trim();
      locationCity = decoded.length > 0 ? decoded.slice(0, 80) : null;
    } catch {
      locationCity = rawCity.trim().slice(0, 80) || null;
    }
  }

  const rawRegion = getHeader(source, "x-vercel-ip-country-region");
  const locationRegion = rawRegion && rawRegion.trim().length > 0
    ? rawRegion.trim().slice(0, 50)
    : null;

  const rawCountry = getHeader(source, "x-vercel-ip-country");
  const locationCountry = rawCountry && rawCountry.trim().length > 0
    ? rawCountry.trim().slice(0, 50)
    : null;

  return { locationCity, locationRegion, locationCountry };
}

/**
 * Parses coarse device label ("Browser on Platform") and location metadata
 * from incoming HTTP headers.
 */
export function extractDeviceMetadata(source: HeaderSource): ParsedDeviceMetadata {
  const ua = getHeader(source, "user-agent") ?? "";
  const secPlatform = getHeader(source, "sec-ch-ua-platform");
  const secUa = getHeader(source, "sec-ch-ua");

  const platform = parsePlatform(secPlatform, ua);
  const browser = parseBrowser(secUa, ua);

  let device = "Unknown device";
  if (browser && platform) {
    device = `${browser} on ${platform}`;
  } else if (platform) {
    device = `Browser on ${platform}`;
  } else if (browser) {
    device = browser;
  }

  const { locationCity, locationRegion, locationCountry } = parseLocation(source);
  const userAgent = ua.trim().length > 0 ? ua.slice(0, 255) : null;

  return {
    device: device.slice(0, 80),
    userAgent,
    locationCity,
    locationRegion,
    locationCountry,
  };
}
