import { NextResponse, type NextRequest } from "next/server";
import { executeQuery } from "@/lib/database";
import { computeSynastryOverlay } from "@/lib/mcp/synastryTools";
import { createLogger } from "@/utils/logger";

const _logger = createLogger("users-synastry-api");

export const dynamic = "force-dynamic";

interface NatalPlanetPayload {
  sign: string;
  degree: number;
  retrograde?: boolean;
  house?: number;
}

interface NatalChartPayload {
  planets: Record<string, NatalPlanetPayload>;
  ascendant?: number | NatalPlanetPayload;
  midheaven?: number | NatalPlanetPayload;
}

interface SynastryRequestBody {
  viewer?: {
    id?: string;
    natalChart?: NatalChartPayload;
  };
}

interface ProfileRow {
  user_id: string;
  natal_chart: unknown;
}

function parseJsonField<T>(value: unknown, fallback: T): T {
  if (!value) return fallback;
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  }
  return value as T;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
): Promise<NextResponse> {
  const { userId } = await params;
  if (!userId) {
    return NextResponse.json(
      { success: false, message: "userId required" },
      { status: 400 },
    );
  }

  try {
    const body = (await req.json()) as SynastryRequestBody;
    const { viewer } = body; // viewer should contain { id, natalChart } or similar

    if (!viewer?.natalChart?.planets) {
      return NextResponse.json(
        { success: false, message: "Viewer's natal chart details required in request body" },
        { status: 400 },
      );
    }

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
    const lookupColumn = isUuid ? "u.id::text = $1" : "u.email = $1";

    const profileResult = await executeQuery<ProfileRow>(
      `SELECT u.id AS user_id, up.natal_chart
         FROM users u
         LEFT JOIN user_profiles up ON up.user_id = u.id
        WHERE ${lookupColumn}
        LIMIT 1`,
      [userId],
    );

    if (profileResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Agent profile not found" },
        { status: 404 },
      );
    }

    const [row] = profileResult.rows;
    const rawNatal = parseJsonField<NatalChartPayload | null>(row.natal_chart, null);

    if (!rawNatal?.planets) {
      return NextResponse.json(
        { success: false, message: "Agent natal chart data missing or incomplete" },
        { status: 400 },
      );
    }

    // Call the in-process MCP tool handler
    const mcpRes = await computeSynastryOverlay({
      agentA: {
        id: viewer.id ?? "viewer",
        natalChart: {
          planets: viewer.natalChart.planets,
          ascendant: viewer.natalChart.ascendant,
          midheaven: viewer.natalChart.midheaven,
        },
      },
      agentB: {
        id: row.user_id,
        natalChart: {
          planets: rawNatal.planets,
          ascendant: rawNatal.ascendant,
          midheaven: rawNatal.midheaven,
        },
      },
    });

    if (!mcpRes.ok) {
      return NextResponse.json(
        { success: false, message: mcpRes.errorMessage ?? "Failed to calculate synastry overlay" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      data: mcpRes.data,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    _logger.error(`[POST /api/users/:userId/synastry] error:`, error);
    return NextResponse.json(
      { success: false, message: `Failed to compute synastry: ${message}` },
      { status: 500 },
    );
  }
}
