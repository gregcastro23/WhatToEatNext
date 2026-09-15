import { extractDeviceMetadata } from "../deviceLabels";
import type { ParsedDeviceMetadata } from "../deviceLabels";

describe("deviceLabels", () => {
  it("extracts browser and platform from standard User-Agent", () => {
    const headers = new Headers({
      "user-agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
    });

    const result: ParsedDeviceMetadata = extractDeviceMetadata(headers);
    expect(result.device).toBe("Chrome on macOS");
    expect(result.userAgent).toContain("Macintosh");
    expect(result.locationCity).toBeNull();
    expect(result.locationRegion).toBeNull();
    expect(result.locationCountry).toBeNull();
  });

  it("extracts iPhone Safari from User-Agent", () => {
    const headers = new Headers({
      "user-agent":
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
    });

    const result: ParsedDeviceMetadata = extractDeviceMetadata(headers);
    expect(result.device).toBe("Safari on iOS");
  });

  it("prefers low-entropy client hints over User-Agent when available", () => {
    const headers = new Headers({
      "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      "sec-ch-ua-platform": '"macOS"',
      "sec-ch-ua": '"Chromium";v="128", "Not;A=Brand";v="24", "Google Chrome";v="128"',
    });

    const result: ParsedDeviceMetadata = extractDeviceMetadata(headers);
    expect(result.device).toBe("Chrome on macOS");
  });

  it("decodes URL-encoded Vercel geolocation headers", () => {
    const headers = new Headers({
      "user-agent": "Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/119.0",
      "x-vercel-ip-city": "San%20Francisco",
      "x-vercel-ip-country-region": "CA",
      "x-vercel-ip-country": "US",
    });

    const result: ParsedDeviceMetadata = extractDeviceMetadata(headers);
    expect(result.device).toBe("Firefox on Linux");
    expect(result.locationCity).toBe("San Francisco");
    expect(result.locationRegion).toBe("CA");
    expect(result.locationCountry).toBe("US");
  });

  it("handles unknown or empty headers gracefully", () => {
    const headers = new Headers({});
    const result: ParsedDeviceMetadata = extractDeviceMetadata(headers);
    expect(result.device).toBe("Unknown device");
    expect(result.userAgent).toBeNull();
    expect(result.locationCity).toBeNull();
  });
});
