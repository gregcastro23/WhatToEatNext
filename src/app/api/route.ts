import { NextResponse } from "next/server";

export function GET(): Promise<NextResponse> {
  return Promise.resolve(
    NextResponse.json({
      status: "API is running",
      endpoints: ["/api/current-moment"],
      message: "Use the specific endpoints for data access",
    }),
  );
}
