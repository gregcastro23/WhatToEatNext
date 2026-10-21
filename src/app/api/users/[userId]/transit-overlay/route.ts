import { NextResponse, type NextRequest } from "next/server";
import { executeQuery } from "@/lib/database";
import { _logger } from "@/lib/logger";
import { getTransitNatalOverlay, type NatalChartInput } from "@/lib/mcp/synastryTools";

export const dynamic = "force-dynamic";

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

export async function GET(request: NextRequest, { params }: { params: Promise<{ userId: string }> }): Promise<NextResponse> {
  const { userId } = await params;
  if (!userId) {
    return NextResponse.json(
      { success: false, message: "userId required" },
      { status: 400 },
    );
  }

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
  const lookupColumn = isUuid ? "u.id::text = $1" : "u.email = $1";

  try {
    const profileResult = await executeQuery<ProfileRow>(
      `SELECT u.id AS user_id, up.natal_chart
         FROM users u
         LEFT JOIN user_profiles up ON up.user_id = u.id
        WHERE ${lookupColumn}
        LIMIT 1`,
      [userId],
    );

    const [row] = profileResult.rows;
    if (!row) {
      return NextResponse.json(
        { success: false, message: "Profile not found" },
        { status: 404 },
      );
    }

    const rawNatal = parseJsonField<NatalChartInput | null>(row.natal_chart, null);

    if (!rawNatal?.planets) {
      return NextResponse.json(
        { success: false, message: "Natal chart data missing or incomplete" },
        { status: 400 },
      );
    }

    // Call the in-process MCP tool handler
    const mcpRes = await getTransitNatalOverlay({
      agent: {
        id: row.user_id,
        natalChart: {
          planets: rawNatal.planets,
          ...(typeof rawNatal.ascendant !== "undefined"
            ? { ascendant: rawNatal.ascendant }
            : {}),
          ...(typeof rawNatal.midheaven !== "undefined"
            ? { midheaven: rawNatal.midheaven }
            : {}),
        },
      },
    });

    if (!mcpRes.ok) {
      return NextResponse.json(
        { success: false, message: mcpRes.errorMessage ?? "Failed to calculate transit overlay" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      data: mcpRes.data,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    _logger.error(`[GET /api/users/:userId/transit-overlay] error:`, error);
    return NextResponse.json(
      { success: false, message: `Failed to load transit overlay: ${message}` },
      { status: 500 },
    );
  }
}
