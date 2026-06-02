import { NextResponse, type NextRequest } from "next/server";
import { executeQuery } from "@/lib/database";
import { computeSynastryOverlay } from "@/lib/mcp/synastryTools";

export const dynamic = "force-dynamic";

interface ProfileRow {
  user_id: string;
  natal_chart: any;
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
) {
  const { userId } = await params;
  if (!userId) {
    return NextResponse.json(
      { success: false, message: "userId required" },
      { status: 400 },
    );
  }

  try {
    const body = await req.json();
    const { viewer } = body; // viewer should contain { id, natalChart } or similar

    if (!viewer || !viewer.natalChart || !viewer.natalChart.planets) {
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

    const row = profileResult.rows[0];
    const rawNatal = parseJsonField<any>(row.natal_chart, null);

    if (!rawNatal || !rawNatal.planets) {
      return NextResponse.json(
        { success: false, message: "Agent natal chart data missing or incomplete" },
        { status: 400 },
      );
    }

    // Call the in-process MCP tool handler
    const mcpRes = await computeSynastryOverlay({
      agentA: {
        id: viewer.id || "viewer",
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
        { success: false, message: mcpRes.errorMessage || "Failed to calculate synastry overlay" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      data: mcpRes.data,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[POST /api/users/:userId/synastry] error:`, error);
    return NextResponse.json(
      { success: false, message: `Failed to compute synastry: ${message}` },
      { status: 500 },
    );
  }
}
