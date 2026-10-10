import { NextResponse } from "next/server";
import { planetaryAgentsGateway } from "@/lib/agents/planetaryAgentsGateway";
import { createLogger } from "@/utils/logger";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const logger = createLogger("AgentsDegreesRoute");

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date");

    const date = dateParam ? new Date(dateParam) : new Date();
    if (isNaN(date.getTime())) {
      return NextResponse.json(
        { error: "Invalid date parameter" },
        { status: 400 }
      );
    }

    const result = await planetaryAgentsGateway.fetchDegreesMap(date);

    return NextResponse.json(result.degrees, {
      headers: {
        "Cache-Control": "public, max-age=60, s-maxage=120, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    logger.error("Error fetching agent degrees map:", error);
    return NextResponse.json(
      {},
      { status: 500 }
    );
  }
}
