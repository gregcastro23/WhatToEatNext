import { useState, useEffect } from "react";
import { _logger } from "@/lib/logger";
import { AstrologicalService } from "@/services/AstrologicalService";
import { log } from "@/services/LoggingService";

interface AstrologizeOptions {
  useCurrentTime?: boolean;
  useCurrentLocation?: boolean;
  year?: number;
  month?: number;
  date?: number;
  hour?: number;
  minute?: number;
  latitude?: number;
  longitude?: number;
  zodiacSystem?: "tropical" | "sidereal";
}
interface AstrologizeResult {
  loading: boolean;
  error: Error | null;
  data: unknown;
  refetch: () => Promise<void>;
}

/**
 * Hook for accessing the Astrologize API
 * @param options Configuration options
 * @returns Result with loading state, error, data, and refetch function
 */
export function useAstrologize(
  options: AstrologizeOptions = {},
): AstrologizeResult {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const [data, setData] = useState<any>(null);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  // Default options
  const {
    useCurrentTime = true,
    useCurrentLocation = true,
    year,
    month,
    date,
    hour,
    minute,
    latitude,
    longitude,
    zodiacSystem = "tropical",
  } = options;

  // Get current location if needed
  useEffect(() => {
    if (useCurrentLocation && !location) {
      const getLocation = async () => {
        try {
          const coords = await (
            AstrologicalService as any
          )?.requestLocation?.();
          if (coords) {
            setLocation({
              latitude: coords.latitude,
              longitude: coords.longitude,
            });
          }
        } catch (locationError) {
          _logger.warn(
            "Failed to get location, using default: ",
            locationError,
          );
          // Use default location (coordinates will be provided by the API)
          setLocation(null);
        }
      };

      void getLocation();
    } else if (!useCurrentLocation) {
      // Use provided coordinates or null
      setLocation(latitude && longitude ? { latitude, longitude } : null);
    }
  }, [useCurrentLocation, latitude, longitude, location]);

  // Fetch data from the API
  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Determine if we're using current time or custom time
      let url = "/api/astrologize";
      let method = "GET";
      let body: string | undefined = undefined;

      if (!useCurrentTime && year && month && date) {
        // Use POST with custom date/time
        method = "POST";
        body = JSON.stringify({
          year,
          month,
          date,
          hour,
          minute,
          zodiacSystem,
          ...(location && {
            latitude: location.latitude,
            longitude: location.longitude,
          }),
        });
      } else {
        // Use GET with query params for current time
        const params = new URLSearchParams();
        if (location) {
          params.append("latitude", location.latitude.toString());
          params.append("longitude", location.longitude.toString());
        }
        params.append("zodiacSystem", zodiacSystem);

        if (params.toString()) {
          url = `/api/astrologize?${params.toString()}`;
        }
      }

      log.info(`🌟 Making ${method} request to astrologize API: `, {
        url,
        body: body ? JSON.parse(body) : "GET params",
      });

      // Make the API request
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body,
      });

      if (!response.ok) {
        throw new Error(
          `API request failed: ${response.status} ${response.statusText}`,
        );
      }

      const result = await response.json();
      log.info("✅ Astrologize API response received: ", {
        dataType: result._celestialBodies
          ? "Valid celestial data"
          : "Unknown format",
      });
      setData(result);
    } catch (fetchError) {
      _logger.error("Error fetching from Astrologize API: ", fetchError);
      setError(
        fetchError instanceof Error ? fetchError : new Error("Unknown error"),
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when dependencies change
  useEffect(() => {
    if ((useCurrentLocation && location) || !useCurrentLocation) {
      void fetchData();
    }
  }, [
    useCurrentTime,
    useCurrentLocation,
    year,
    month,
    date,
    hour,
    minute,
    location,
    zodiacSystem,
  ]);

  // Return the result
  return {
    loading,
    error,
    data,
    refetch: fetchData,
  };
}
