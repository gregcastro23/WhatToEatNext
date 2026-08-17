"use client";

/**
 * useUserLocation — shared location capture for restaurant/cuisine discovery
 * and environmental telemetry.
 *
 * Replaces the four near-identical `requestLocation` blocks previously copied
 * into RestaurantDiscovery, CuisineRestaurantFinder, LocalCuisineGroups, and
 * PlanetaryChartControls. Provides:
 *   - browser geolocation (with permission-aware status and GNSS altitude)
 *   - manual city entry via the keyless Nominatim geocoder (`/api/geocoding`)
 *   - lightweight localStorage persistence so the choice survives reloads
 *   - elevation provenance attribution (GNSS `gps`, DEM `dem`, manual `user`, IP `ip`)
 *
 * @file src/hooks/useUserLocation.ts
 */

import { useCallback, useEffect, useRef, useState } from "react";
import type { ElevationProvenance } from "@/hooks/useEnvironmentalObservation";
import { parsePostalCode, POSTAL_FORMAT_LABEL } from "@/lib/location/postalCode";
import type { PostalCodeResolution } from "@/services/geocodingService";

/**
 * How lat/lng was obtained — the HORIZONTAL question, which
 * `elevationProvenance` does not answer.
 *
 * ⚠️ The two are independent and conflating them overstates precision. A
 * postal-code centroid feeds the DEM lookup a coordinate that may be kilometres
 * from the cook, yet the elevation that comes back is still `dem`-provenanced
 * and carries the DEM's own ±15 m grid error — which is the error *at the point
 * queried*, not the error between that point and the kitchen. A surface printing
 * "±15 m" off a centroid is quoting a true number about the wrong place, so any
 * surface that quotes vertical precision must also read this field.
 *
 * `ip` is absent on purpose: nothing in this hook produces an IP-derived
 * location. Add it only alongside code that actually sets it.
 *
 * `device` rather than `gps`: the browser Geolocation API does not say whether a
 * fix came from GNSS, wifi trilateration, or the network, and those differ by
 * three orders of magnitude. What it *does* report is `coords.accuracy`, which
 * is stored as {@link UserLocation.accuracyM} — a measured radius beats a guessed
 * mechanism.
 */
export type HorizontalBasis = "device" | "postal-centroid" | "place-centroid";

export interface UserLocation {
  lat: number;
  lng: number;
  /** Human-readable label (city / "Current location"). */
  label?: string;
  /** Altitude in metres (from GNSS altimeter or DEM lookup), if resolved. */
  altitude?: number;
  /** Vertical accuracy in metres, if provided by device GNSS. */
  altitudeAccuracy?: number;
  /** How altitude was obtained. Governs physical error bars and claims. */
  elevationProvenance?: ElevationProvenance;
  /**
   * How lat/lng was obtained. Optional because locations persisted before this
   * field existed carry no basis — and an absent basis must stay absent rather
   * than defaulting to the most flattering option.
   */
  horizontalBasis?: HorizontalBasis;
  /**
   * Horizontal accuracy radius in metres, when the source measured one.
   *
   * Only the device Geolocation API supplies this. A postal or place centroid
   * has NO radius available: the geocoder's bounding box for a postal code is a
   * fixed synthetic size, identical for a 2 km² and a 5,000 km² code, so any
   * number derived from it would be a constant wearing a measurement's clothes
   * (see `POSTAL_CENTROID_CAVEAT`). Absent here means absent.
   */
  accuracyM?: number;
}

/** Outcome of resolving a typed postal code. */
export type PostalResolution =
  | { ok: true; resolution: PostalCodeResolution }
  | { ok: false; message: string };

export interface CitySuggestion {
  displayName: string;
  latitude: number;
  longitude: number;
  country?: string;
}

export type LocationStatus =
  | "idle"
  | "locating"
  | "ready"
  | "denied"
  | "error";

const STORAGE_KEY = "alchm_user_location";

function readStored(): UserLocation | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<UserLocation>;
    if (
      typeof parsed.lat === "number" &&
      typeof parsed.lng === "number" &&
      Number.isFinite(parsed.lat) &&
      Number.isFinite(parsed.lng)
    ) {
      return {
        lat: parsed.lat,
        lng: parsed.lng,
        label: typeof parsed.label === "string" ? parsed.label : undefined,
        altitude: typeof parsed.altitude === "number" && Number.isFinite(parsed.altitude) ? parsed.altitude : undefined,
        altitudeAccuracy: typeof parsed.altitudeAccuracy === "number" && Number.isFinite(parsed.altitudeAccuracy) ? parsed.altitudeAccuracy : undefined,
        elevationProvenance: parsed.elevationProvenance,
        horizontalBasis: parsed.horizontalBasis,
        accuracyM:
          typeof parsed.accuracyM === "number" && Number.isFinite(parsed.accuracyM)
            ? parsed.accuracyM
            : undefined,
      };
    }
  } catch {
    // ignore malformed storage
  }
  return null;
}

function persist(loc: UserLocation | null): void {
  if (typeof window === "undefined") return;
  try {
    if (loc) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(loc));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // ignore quota errors
  }
}

/** Everything the hook hands back. Named so the hook can declare a return type. */
export interface UseUserLocationResult {
  location: UserLocation | null;
  status: LocationStatus;
  error: string | null;
  /** Trigger the browser geolocation prompt. */
  requestBrowserLocation: () => void;
  /** Set an explicit location (e.g. from a city search result). */
  setLocation: (loc: UserLocation | null) => void;
  /** Reset to no-location. */
  clearLocation: () => void;
  /** Search cities by name; returns up to 5 suggestions. */
  searchCity: (query: string) => Promise<CitySuggestion[]>;
  /**
   * Resolve a typed postal code (US ZIP / CA postal / UK postcode) and adopt it
   * as the location. Returns the resolution so the caller can confirm the town
   * back to the user.
   */
  resolvePostalInput: (input: string) => Promise<PostalResolution>;
}

interface UseUserLocationOptions {
  /** Seed coordinates (e.g. from the user's profile birth location). */
  initial?: UserLocation;
  /** Restore a previously persisted location on mount. Default: true. */
  persistChoice?: boolean;
}

export function useUserLocation(options?: UseUserLocationOptions): UseUserLocationResult {
  const persistChoice = options?.persistChoice ?? true;
  const [location, setLocationState] = useState<UserLocation | null>(
    options?.initial ?? null,
  );
  const [status, setStatus] = useState<LocationStatus>(
    options?.initial ? "ready" : "idle",
  );
  const [error, setError] = useState<string | null>(null);
  const hydrated = useRef(false);

  // Restore persisted location once on mount (client only) if nothing seeded.
  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    if (options?.initial || !persistChoice) return;
    const stored = readStored();
    if (stored) {
      setLocationState(stored);
      setStatus("ready");
    }
  }, [options?.initial, persistChoice]);

  const setLocation = useCallback(
    (loc: UserLocation | null) => {
      setLocationState(loc);
      setStatus(loc ? "ready" : "idle");
      setError(null);
      if (persistChoice) persist(loc);
    },
    [persistChoice],
  );

  const requestBrowserLocation = useCallback((): void => {
    // `navigator.geolocation` is non-optional in lib.dom, but is genuinely
    // absent in non-secure contexts and some embedded webviews — hence the
    // runtime check the type system says is unnecessary.
    if (typeof navigator === "undefined" || typeof navigator.geolocation === "undefined") {
      setStatus("error");
      setError("Location services are unavailable in this browser.");
      return;
    }
    setStatus("locating");
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const hasGpsAltitude =
          pos.coords.altitude !== null &&
          typeof pos.coords.altitude === "number" &&
          Number.isFinite(pos.coords.altitude);

        const next: UserLocation = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          label: "Current location",
          altitude: hasGpsAltitude ? pos.coords.altitude : undefined,
          altitudeAccuracy:
            typeof pos.coords.altitudeAccuracy === "number" &&
            Number.isFinite(pos.coords.altitudeAccuracy)
              ? pos.coords.altitudeAccuracy
              : undefined,
          elevationProvenance: hasGpsAltitude ? "gps" : undefined,
          horizontalBasis: "device",
          accuracyM: Number.isFinite(pos.coords.accuracy) ? pos.coords.accuracy : undefined,
        };
        setLocationState(next);
        setStatus("ready");
        if (persistChoice) persist(next);
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setStatus("denied");
          setError(
            "Location permission denied. Enable it in your browser, or enter a city below.",
          );
        } else {
          setStatus("error");
          setError("Couldn't read your location. Please try again.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5 * 60 * 1000 },
    );
  }, [persistChoice]);

  /** Free-text city/address search via the Nominatim-backed geocoding route. */
  const searchCity = useCallback(
    async (query: string): Promise<CitySuggestion[]> => {
      const q = query.trim();
      if (q.length < 2) return [];
      try {
        const res = await fetch(`/api/geocoding?q=${encodeURIComponent(q)}`);
        if (!res.ok) return [];
        const data = (await res.json()) as {
          success?: boolean;
          results?: CitySuggestion[];
        };
        return Array.isArray(data.results) ? data.results : [];
      } catch {
        return [];
      }
    },
    [],
  );

  /**
   * Resolve a typed postal code and adopt it as the location.
   *
   * This is the answer to "where are you?" that does not depend on the browser
   * being honest about it — a VPN moves the IP-derived answer to another
   * continent, and a denied permission prompt removes it entirely, but a typed
   * code is the cook's own statement. It is also *tighter* than a city name
   * wherever a city is big: a New York place-centroid serves one point for
   * ~780 km², while `10001` serves one for ~2 km².
   *
   * On success the location is set with `horizontalBasis: "postal-centroid"` and
   * NO accuracy radius — see {@link UserLocation.accuracyM} for why there is
   * none to give. The full resolution is returned so the caller can show the
   * user which town the code landed in; a code whose `locality` is `null` did
   * not resolve to a town and may be a bad geocoder entry rather than a bad
   * code.
   */
  const resolvePostalInput = useCallback(
    async (input: string): Promise<PostalResolution> => {
      const parsed = parsePostalCode(input);
      if (!parsed) {
        return {
          ok: false,
          message:
            "Not a postal code we recognise. Try a city or address instead.",
        };
      }

      setStatus("locating");
      setError(null);

      try {
        const res = await fetch(
          `/api/geocoding/postal?code=${encodeURIComponent(parsed.code)}`,
        );
        const data = (await res.json()) as {
          success?: boolean;
          result?: PostalCodeResolution;
          message?: string;
        };

        if (!res.ok || data.success !== true || !data.result) {
          const message =
            data.message ??
            `Couldn't find ${parsed.code}. Check the ${POSTAL_FORMAT_LABEL[parsed.format]} and try again.`;
          setStatus("error");
          setError(message);
          return { ok: false, message };
        }

        const resolution = data.result;
        const next: UserLocation = {
          lat: resolution.latitude,
          lng: resolution.longitude,
          label: resolution.locality
            ? `${resolution.postalCode} · ${resolution.locality}`
            : resolution.postalCode,
          horizontalBasis: "postal-centroid",
        };

        setLocationState(next);
        setStatus("ready");
        if (persistChoice) persist(next);

        return { ok: true, resolution };
      } catch {
        const message = "Couldn't reach the location service. Try again.";
        setStatus("error");
        setError(message);
        return { ok: false, message };
      }
    },
    [persistChoice],
  );

  const clearLocation = useCallback(() => {
    setLocationState(null);
    setStatus("idle");
    setError(null);
    if (persistChoice) persist(null);
  }, [persistChoice]);

  return {
    location,
    status,
    error,
    /** Trigger the browser geolocation prompt. */
    requestBrowserLocation,
    /** Set an explicit location (e.g. from a city search result). */
    setLocation,
    /** Reset to no-location. */
    clearLocation,
    /** Search cities by name; returns up to 5 suggestions. */
    searchCity,
    /** Resolve a typed postal code and adopt it. */
    resolvePostalInput,
  };
}

export default useUserLocation;
