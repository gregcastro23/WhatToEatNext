import { GET, POST } from "@/app/api/agent/publications/[deliveryId]/route";
import { agentPublicationService } from "@/services/agentPublicationService";
import { NextRequest } from "next/server";

function makeGetRequest(deliveryId: string, token = "test-secret"): NextRequest {
  return new NextRequest(`http://x/api/agent/publications/${encodeURIComponent(deliveryId)}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

function makePostRequest(deliveryId: string, body: unknown = {}, token = "test-secret"): NextRequest {
  return new NextRequest(`http://x/api/agent/publications/${encodeURIComponent(deliveryId)}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
}

describe("Agent Publication Receipt & Reconciliation API", () => {
  beforeEach(() => {
    process.env.INTERNAL_API_SECRET = "test-secret";
    agentPublicationService.clearMemory();
  });

  afterEach(() => {
    delete process.env.INTERNAL_API_SECRET;
  });

  it("rejects unauthorized GET without bearer token", async () => {
    const res = await GET(makeGetRequest("any-id", "wrong-secret"), {
      params: Promise.resolve({ deliveryId: "any-id" }),
    });
    expect(res.status).toBe(401);
  });

  it("returns 404 when deliveryId does not exist", async () => {
    const res = await GET(makeGetRequest("nonexistent-key"), {
      params: Promise.resolve({ deliveryId: "nonexistent-key" }),
    });
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe("Publication not found");
  });

  it("returns truthful receipt when publication exists", async () => {
    const deliveryId = "confirmed-delivery-123";

    // Prepare and complete publication in service
    const prep = await agentPublicationService.preparePublication({
      principalId: "internal_api_secret",
      operation: "feed_publish",
      deliveryKey: deliveryId,
      actorId: "actor-leo",
      payloadFingerprint: "sha256_mock_fp",
    });

    await agentPublicationService.completePublication({
      publicationId: prep.publicationId,
      feedPublished: true,
      feedEventId: "feed-event-999",
      recipeReflectionId: "refl-888",
      recipeCommentStatus: "saved",
      legacyInteractionStatus: "saved",
      receiptPayload: {
        success: true,
        schemaVersion: 1,
        deliveryId,
        operation: "feed_publish",
        feedPublished: true,
        recipeCommentSaved: true,
        event: { id: "feed-event-999" },
        recipeReflection: { id: "refl-888" },
        outcomes: {
          feed: { status: "published", id: "feed-event-999" },
          recipeReflection: { status: "saved", id: "refl-888" },
        },
      },
    });

    const res = await GET(makeGetRequest(deliveryId), {
      params: Promise.resolve({ deliveryId }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.deliveryId).toBe(deliveryId);
    expect(body.feedPublished).toBe(true);
    expect(body.recipeCommentSaved).toBe(true);
    expect(body.event.id).toBe("feed-event-999");
    expect(body.recipeReflection.id).toBe("refl-888");
  });

  it("safely reconciles partial outcomes without duplicating confirmed writes", async () => {
    const deliveryId = "reconcile-key-456";

    // Setup an in-flight / partial publication
    await agentPublicationService.preparePublication({
      principalId: "internal_api_secret",
      operation: "weekly_menu_publish",
      deliveryKey: deliveryId,
      actorId: "actor-leo",
      payloadFingerprint: "sha256_reconcile_fp",
    });

    const res = await POST(
      makePostRequest(deliveryId, {
        reconcileFeed: false,
        reconcileComment: false,
      }),
      { params: Promise.resolve({ deliveryId }) },
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.reconciled).toBe(true);
    expect(body.deliveryId).toBe(deliveryId);
  });
});
