import { NextResponse } from "next/server";
import { validateAdminRequest } from "@/lib/auth/validateRequest";
import { getServiceUrl } from "@/lib/serviceUrls";
import { userDatabase } from "@/services/userDatabaseService";
import type { UserWithProfile } from "@/services/userDatabaseService";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const SYNC_TIMEOUT_MS = 8000;
const AGENTIC_EMAIL_DOMAIN = "@agentic.alchm.kitchen";

type SyncAction = "sync-all" | "sync-one";

interface SyncFailure {
  agent: string;
  statusCode?: number;
  message: string;
}

function deriveAgentId(user: UserWithProfile): string {
  return user.email.split("@")[0].toLowerCase().trim();
}

function deriveDisplayName(user: UserWithProfile): string {
  const profileName = user.profile?.name?.trim();
  if (profileName) return profileName;

  return deriveAgentId(user)
    .split(/[-_.]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ") || "Agent";
}

function isSyncableAgent(user: UserWithProfile): boolean {
  return Boolean(
    user.isAgent &&
      user.isActive &&
      user.email?.toLowerCase().endsWith(AGENTIC_EMAIL_DOMAIN),
  );
}

async function fetchWithTimeout(url: string, options: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), SYNC_TIMEOUT_MS);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

async function resolveSyncTargets(
  action: SyncAction,
  agentEmail?: string,
  agentId?: string,
): Promise<{ targets: UserWithProfile[]; error?: string }> {
  const allUsers = await userDatabase.getAllUsers();
  const syncableAgents = allUsers.filter(isSyncableAgent);

  if (action === "sync-all") {
    return { targets: syncableAgents };
  }

  const identifier = (agentEmail || agentId || "").trim().toLowerCase();
  if (!identifier) {
    return { targets: [], error: "Missing agent email or ID for sync-one action." };
  }

  const target = identifier.includes("@")
    ? syncableAgents.find((user) => user.email.toLowerCase() === identifier)
    : syncableAgents.find(
        (user) => deriveAgentId(user) === identifier || user.id === identifier,
      );

  if (!target) {
    return {
      targets: [],
      error: `No active WTEN agent found for '${identifier}'. Expected an ${AGENTIC_EMAIL_DOMAIN} user with is_agent=true.`,
    };
  }

  return { targets: [target] };
}

/**
 * POST /api/admin/planetary-sync
 * Secure admin proxy to request agent synchronization on the Planetary Agents backend.
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Validate admin session/role
    const authResult = await validateAdminRequest(request);
    if ("error" in authResult) {
      return authResult.error;
    }

    // 2. Parse payload
    const body = (await request.json().catch(() => ({}))) as {
      action?: SyncAction;
      agentEmail?: string;
      agentId?: string;
    };
    const { action, agentEmail, agentId } = body;

    if (!action || (action !== "sync-all" && action !== "sync-one")) {
      return NextResponse.json(
        { success: false, message: "Invalid action. Must be 'sync-all' or 'sync-one'." },
        { status: 400 }
      );
    }

    if (!process.env.INTERNAL_API_SECRET) {
      return NextResponse.json(
        {
          success: false,
          statusCode: 500,
          affectedCount: 0,
          failures: ["INTERNAL_API_SECRET is not configured for PA sync."],
        },
        { status: 500 },
      );
    }

    const { targets, error } = await resolveSyncTargets(action, agentEmail, agentId);
    if (error) {
      return NextResponse.json(
        { success: false, statusCode: 404, affectedCount: 0, failures: [error] },
        { status: 404 },
      );
    }

    if (targets.length === 0) {
      return NextResponse.json({
        success: true,
        statusCode: 200,
        affectedCount: 0,
        failures: [],
        message: "No active WTEN agent users found to synchronize.",
        timestamp: new Date().toISOString(),
      });
    }

    // 3. Prepare PA backend request
    const internalSecret = process.env.INTERNAL_API_SECRET;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Accept": "application/json",
    };
    headers.Authorization = `Bearer ${internalSecret}`;
    headers["X-Sync-Secret"] = internalSecret;
    headers["X-Internal-Secret"] = internalSecret;

    // 4. Dispatch each WTEN agent to the FastAPI backend boundary.
    const PA_BACKEND_URL = getServiceUrl("planetaryAgentsApi");
    console.log(
      `[Admin Sync] Dispatching ${targets.length} ${action} target(s) to ${PA_BACKEND_URL}...`,
    );

    const failures: SyncFailure[] = [];
    let affectedCount = 0;

    for (const target of targets) {
      const paPayload = {
        agentId: deriveAgentId(target),
        displayName: deriveDisplayName(target),
        email: target.email.toLowerCase(),
      };

      try {
        const response = await fetchWithTimeout(`${PA_BACKEND_URL}/api/internal/agent-sync`, {
          method: "POST",
          headers,
          body: JSON.stringify(paPayload),
        });
        const responseText = await response.text();
        let responseData: { detail?: string; message?: string; success?: boolean } = {};

        try {
          responseData = responseText ? JSON.parse(responseText) : {};
        } catch {
          responseData = { message: responseText };
        }

        if (!response.ok) {
          failures.push({
            agent: target.email,
            statusCode: response.status,
            message:
              responseData.detail ||
              responseData.message ||
              `PA Backend responded with error code ${response.status}.`,
          });
          continue;
        }

        affectedCount++;
      } catch (networkError) {
        failures.push({
          agent: target.email,
          statusCode: 503,
          message:
            networkError instanceof Error
              ? networkError.message
              : "Planetary Agents API is unreachable or timed out.",
        });
      }
    }

    const failureMessages = failures.map((failure) =>
      failure.statusCode
        ? `${failure.agent}: HTTP ${failure.statusCode} - ${failure.message}`
        : `${failure.agent}: ${failure.message}`,
    );

    console.log(
      `[Admin Sync] Sync complete. Affected: ${affectedCount}, Failures: ${failures.length}`,
    );

    const success = failures.length === 0;
    return NextResponse.json(
      {
        success,
        statusCode: success ? 200 : 207,
        affectedCount,
        failures: failureMessages,
        timestamp: new Date().toISOString(),
      },
      {
        status: success ? 200 : 207,
      });

  } catch (error) {
    console.error("[Admin Sync] Internal Handler Error:", error);
    return NextResponse.json(
      { 
        success: false, 
        statusCode: 500,
        affectedCount: 0,
        failures: [error instanceof Error ? error.message : "Internal server error during sync dispatch."],
      },
      { status: 500 }
    );
  }
}
