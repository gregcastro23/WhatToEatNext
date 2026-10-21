import { agentPublicationService } from "@/services/agentPublicationService";

describe("AgentPublicationService", () => {
  beforeEach(() => {
    agentPublicationService.clearMemory();
  });

  it("handles initial proceed, duplicate replay, and payload conflicts", async () => {
    const key = "test-delivery-key-1";
    const fingerprintA = "fp_version_a";
    const fingerprintB = "fp_version_b";

    // 1. Initial reservation
    const res1 = await agentPublicationService.preparePublication({
      principalId: "principal-1",
      operation: "feed_publish",
      deliveryKey: key,
      actorId: "actor-1",
      payloadFingerprint: fingerprintA,
    });
    expect(res1.kind).toBe("proceed");

    // 2. Complete publication
    await agentPublicationService.completePublication({
      publicationId: res1.publicationId,
      feedPublished: true,
      receiptPayload: {
        success: true,
        schemaVersion: 1,
        deliveryId: key,
        operation: "feed_publish",
        feedPublished: true,
      },
    });

    // 3. Replay with identical fingerprint
    const resReplay = await agentPublicationService.preparePublication({
      principalId: "principal-1",
      operation: "feed_publish",
      deliveryKey: key,
      actorId: "actor-1",
      payloadFingerprint: fingerprintA,
    });
    expect(resReplay.kind).toBe("replayed");
    if (resReplay.kind === "replayed") {
      expect(resReplay.receipt.deliveryId).toBe(key);
      expect(resReplay.receipt.feedPublished).toBe(true);
    }

    // 4. Replay with changed semantic payload returns payload_conflict
    const resConflict = await agentPublicationService.preparePublication({
      principalId: "principal-1",
      operation: "feed_publish",
      deliveryKey: key,
      actorId: "actor-1",
      payloadFingerprint: fingerprintB,
    });
    expect(resConflict.kind).toBe("payload_conflict");
    if (resConflict.kind === "payload_conflict") {
      expect(resConflict.code).toBe("PAYLOAD_CONFLICT");
    }
  });

  it("enforces principal isolation (principal B cannot replay or read principal A's delivery key)", async () => {
    const key = "shared-delivery-key";
    const fp = "fp_123";

    // Principal A reserves and completes
    const resA = await agentPublicationService.preparePublication({
      principalId: "principal-A",
      operation: "weekly_menu_publish",
      deliveryKey: key,
      actorId: "actor-A",
      payloadFingerprint: fp,
    });
    expect(resA.kind).toBe("proceed");

    await agentPublicationService.completePublication({
      publicationId: resA.publicationId,
      feedPublished: false,
      receiptPayload: {
        success: true,
        schemaVersion: 1,
        deliveryId: key,
        operation: "weekly_menu_publish",
        feedPublished: false,
      },
    });

    // Principal B with same key gets a clean separate reservation (not A's receipt!)
    const resB = await agentPublicationService.preparePublication({
      principalId: "principal-B",
      operation: "weekly_menu_publish",
      deliveryKey: key,
      actorId: "actor-B",
      payloadFingerprint: fp,
    });
    expect(resB.kind).toBe("proceed");

    // Principal B cannot read Principal A's receipt
    const lookupB = await agentPublicationService.getReceiptByDeliveryKey("principal-B", key);
    expect(lookupB?.actor_id).not.toBe("actor-A");
  });
});
