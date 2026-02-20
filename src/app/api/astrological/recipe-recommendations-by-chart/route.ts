import { NextResponse } from "next/server";

// This function determines the base URL for the backend API.
// It should match the logic in src/services/astrologizeApi.ts
const getBackendBaseUrl = () => {
  // Server-side: use absolute URL from environment variables
  return (
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
    "http://localhost:8001"
  ); // Fallback to local Docker port
};

export async function POST(request: Request) {
  try {
    const birthData = await request.json();

    const backendUrl = getBackendBaseUrl();
    const backendEndpoint = `${backendUrl}/api/astrological/recipe-recommendations-by-chart`;

    const backendResponse = await fetch(backendEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(birthData),
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse
        .json()
        .catch(() => ({ message: backendResponse.statusText }));
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
  } catch (error: any) {
    console.error("Error in recipe recommendations API route:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 },
    );
  }
}
