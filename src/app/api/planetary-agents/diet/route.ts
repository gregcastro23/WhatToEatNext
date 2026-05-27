/**
 * Planetary Agents Diet Proxy Route
 *
 * Proxies requests to the Planetary Agents backend to retrieve enriched
 * historical diet profiles and alchemical blueprints for agentic users.
 * Implements ISR/caching so we don't hit the external API constantly.
 */

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const backendUrl =
      process.env.PLANETARY_AGENTS_API_URL ||
      process.env.NEXT_PUBLIC_PLANETARY_AGENTS_URL;
    if (!backendUrl) {
      return NextResponse.json(
        { success: false, error: "Planetary agents backend is not configured." },
        { status: 503 },
      );
    }

    const targetUrl = `${backendUrl}/api/agents/diet-profiles`;

    const response = await fetch(targetUrl, {
      headers: {
        Accept: "application/json",
      },
      next: { revalidate: 3600 }, // Cache for 1 hour via Next.js fetch cache
    });

    if (!response.ok) {
      console.error(
        `[Planetary Agents Proxy] Backend returned ${response.status}: ${response.statusText}`,
      );
      return NextResponse.json(
        { success: false, error: "Failed to fetch agent profiles from backend." },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.warn(
      "[Planetary Agents Proxy] Error fetching agent profiles:",
      error,
    );
    return NextResponse.json(
      { success: false, error: "Internal server error during proxy request." },
      { status: 500 },
    );
  }
}
