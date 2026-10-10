import { NextResponse } from "next/server";
import { planetaryAgentsGateway } from "@/lib/agents/planetaryAgentsGateway";
import { createLogger } from "@/utils/logger";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const logger = createLogger("AgentsDegreeParamRoute");

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ degree: string }> }
) {
  try {
    const { degree: rawDegree } = await params;
    const degree = parseInt(rawDegree, 10);
    if (isNaN(degree) || degree < 0 || degree > 359) {
      return NextResponse.json(
        { error: "Degree must be an integer between 0 and 359" },
        { status: 400 }
      );
    }
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date");
    const date = dateParam ? new Date(dateParam) : new Date();

    const data = await planetaryAgentsGateway.fetchAgentForDegree(degree, date);
    return NextResponse.json(data);
  } catch (error) {
    logger.error("Error fetching agent for degree:", error);
    return NextResponse.json(
      { active: false, message: "Failed to fetch agent for degree" },
      { status: 500 }
    );
  }
}
