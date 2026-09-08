import { NextResponse } from "next/server";
import { _logger } from "@/lib/logger";
import { BirthDataSchema } from "@/lib/validation/apiSchemas";

// This function determines the base URL for the backend API.
// It should match the logic in src/services/astrologizeApi.ts
const getBackendBaseUrl = () =>
  // Server-side: use absolute URL from environment variables
  (
    process.env.NEXT_PUBLIC_BACKEND_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ??
    "http://localhost:8001"
  ); // Fallback to local Docker port

export async function POST(request: Request) {
  try {
    const rawBody: unknown = await request.json().catch(() => null);
    if (!rawBody) {
      return NextResponse.json({ message: "Invalid JSON in request body" }, { status: 400 });
    }

    const parsed = BirthDataSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid birthData payload", details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }
    const birthData = parsed.data;

    const backendEndpoint = `${getBackendBaseUrl()}/api/astrological/recipe-recommendations-by-chart`;
    const backendResponse = await fetch(backendEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(birthData),
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({ message: backendResponse.statusText }));
      return NextResponse.json(
        {
          message: "Failed to fetch recipe recommendations from backend",
          error: errorData,
        },
        { status: backendResponse.status },
      );
    }

    const data = await backendResponse.json();
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    _logger.error("Error in recipe recommendations API route:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: message },
      { status: 500 },
    );
  }
}
