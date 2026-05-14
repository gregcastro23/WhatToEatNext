import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/database";
import { questService, type QuestEventMetadata } from "@/services/QuestService";
import type { NextRequest} from "next/server";

/**
 * POST /api/economy/sync-event
 *
 * Internal server-to-server endpoint for reporting quest events from planetary-agents.
 *
 * Headers:
 *   X-Sync-Secret: <ALCHM_KITCHEN_SYNC_SECRET>
 *
 * Body:
 *   {
 *     userEmail: string,
 *     event: string,
 *     metadata?: {
 *       agentName?: string,
 *       sacredStat?: string,
 *       planetarySignature?: { ... }
 *     }
 *   }
 *
 * Response: { ok, event, completedCount, completed: [{ questSlug, tokensAwarded, tokenType }] }
 */
interface SyncEventBody {
  userEmail?: unknown;
  event?: unknown;
  metadata?: unknown;
}

const EVENT_MAX_LENGTH = 100;
const STRING_MAX_LENGTH = 200;

function coerceString(value: unknown, max: number): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > max) return undefined;
  return trimmed;
}

function parseEventMetadata(raw: unknown): QuestEventMetadata | undefined {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return undefined;
  const obj = raw as Record<string, unknown>;
  const agentName = coerceString(obj.agentName, STRING_MAX_LENGTH);
  const sacredStat = coerceString(obj.sacredStat, STRING_MAX_LENGTH);
  const signature =
    obj.planetarySignature && typeof obj.planetarySignature === "object" && !Array.isArray(obj.planetarySignature)
      ? (obj.planetarySignature as Record<string, unknown>)
      : undefined;
  if (!agentName && !sacredStat && !signature) return undefined;
  return {
    ...(agentName ? { agentName } : {}),
    ...(sacredStat ? { sacredStat } : {}),
    ...(signature ? { planetarySignature: signature } : {}),
  };
}

export async function POST(req: NextRequest) {
  try {
    // 1. Validate Sync Secret
    const authHeader = req.headers.get("X-Sync-Secret");
    const syncSecret = process.env.ALCHM_KITCHEN_SYNC_SECRET;

    if (!syncSecret || authHeader !== syncSecret) {
      return NextResponse.json(
        { ok: false, reason: "unauthorized" },
        { status: 401 }
      );
    }

    let body: SyncEventBody;
    try {
      body = (await req.json()) as SyncEventBody;
    } catch {
      return NextResponse.json(
        { ok: false, reason: "invalid_request", message: "Body must be valid JSON" },
        { status: 400 }
      );
    }

    const userEmail = coerceString(body.userEmail, STRING_MAX_LENGTH);
    const event = coerceString(body.event, EVENT_MAX_LENGTH);

    if (!userEmail || !event) {
      return NextResponse.json(
        { ok: false, reason: "invalid_request", message: "Missing or invalid userEmail or event" },
        { status: 400 }
      );
    }

    const metadata = parseEventMetadata(body.metadata);

    // 2. Look up user ID by email (and confirm they're an agentic account)
    const userResult = await executeQuery<{ id: string; is_agent: boolean | null }>(
      "SELECT id, is_agent FROM users WHERE email = $1 LIMIT 1",
      [userEmail.toLowerCase()]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { ok: false, reason: "user_not_found" },
        { status: 404 }
      );
    }

    const { id: userId, is_agent: isAgent } = userResult.rows[0];

    // 3. Report Event to QuestService
    const completed = await questService.reportEvent(userId, event, metadata);

    return NextResponse.json({
      ok: true,
      event,
      isAgent: isAgent === true,
      completedCount: completed.length,
      completed,
    });

  } catch (error) {
    console.error("[sync-event] Internal Error:", error);
    return NextResponse.json(
      { ok: false, reason: "internal_error", message: (error as Error).message },
      { status: 500 }
    );
  }
}
