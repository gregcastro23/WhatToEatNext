/**
 * Shared Instacart IDP transport utilities for server routes.
 */

const INSTACART_IDP_BASE_URL = "https://connect.instacart.com";
const INSTACART_IDP_BASE_URL_DEV = "https://connect.dev.instacart.tools";

export class InstacartConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InstacartConfigurationError";
  }
}

export interface InstacartRequestOptions {
  method?: "GET" | "POST";
  body?: unknown;
  searchParams?: Record<string, string | number | undefined>;
  timeoutMs?: number;
}

export function getInstacartBaseUrl(): string {
  const useProduction =
    process.env.NODE_ENV === "production" &&
    process.env.INSTACART_USE_PROD === "true";
  return useProduction ? INSTACART_IDP_BASE_URL : INSTACART_IDP_BASE_URL_DEV;
}

export function getInstacartApiKey(): string {
  const apiKey =
    process.env.INSTACART_API_KEY || process.env.instacart_development_api;
  if (!apiKey) {
    throw new InstacartConfigurationError(
      "Instacart API key not configured. Set INSTACART_API_KEY in your environment.",
    );
  }
  return apiKey;
}

export async function fetchInstacartIdp(
  path: string,
  options: InstacartRequestOptions = {},
): Promise<Response> {
  const apiKey = getInstacartApiKey();
  const url = new URL(`/idp/v1/${path.replace(/^\//, "")}`, getInstacartBaseUrl());

  if (options.searchParams) {
    Object.entries(options.searchParams).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    });
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    options.timeoutMs ?? 15_000,
  );

  try {
    return await fetch(url.toString(), {
      method: options.method ?? "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${apiKey}`,
        ...(options.body ? { "Content-Type": "application/json" } : {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

export function mapInstacartProxyError(
  response: Response,
  errorText: string,
  fallbackMessage: string,
): { statusCode: number; details: string } {
  let statusCode = response.status;
  const detailsByStatus: Record<number, string> = {
    400: `Bad Request: ${errorText}`,
    401: "Unauthorized: Invalid API key",
    403: "Forbidden: API key does not have required permissions",
    422: `Unprocessable Entity: ${errorText}`,
    429: "Too Many Requests: Rate limit exceeded",
  };

  const details =
    detailsByStatus[statusCode] ??
    (statusCode >= 500 ? fallbackMessage : `Instacart returned status ${statusCode}`);

  if (statusCode >= 500) {
    statusCode = 502;
  }

  return { statusCode, details };
}
