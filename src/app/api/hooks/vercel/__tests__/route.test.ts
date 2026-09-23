/**
 * @jest-environment node
 *
 * POST /api/hooks/vercel end to end through the real dispatcher: signature,
 * envelope, record, and what each deployment event does. Only the record's
 * SQL, the alert sink, and the probes themselves are stubbed.
 */

import { createHmac } from "node:crypto";

jest.mock("@/lib/hooks/inbox", () => ({
  claimWebhookEvent: jest.fn(),
  completeWebhookEvent: jest.fn(),
  failWebhookEvent: jest.fn(),
}));
jest.mock("@/services/alertService", () => ({ dispatchAlert: jest.fn() }));
jest.mock("@/lib/hooks/runAfterResponse", () => ({ runAfterResponse: jest.fn() }));
jest.mock("@/lib/observability/withObservability", () => ({
  withObservability: (_opts: unknown, handler: unknown): unknown => handler,
}));

import { POST } from "../route";
import { claimWebhookEvent, completeWebhookEvent } from "@/lib/hooks/inbox";
import { runAfterResponse } from "@/lib/hooks/runAfterResponse";
import { dispatchAlert } from "@/services/alertService";

const mockClaim = jest.mocked(claimWebhookEvent);
const mockComplete = jest.mocked(completeWebhookEvent);
const mockAlert = jest.mocked(dispatchAlert);
const mockAfter = jest.mocked(runAfterResponse);

const SECRET = "whsec_route_test";

function body(type: string, target: string | null): string {
  return JSON.stringify({
    id: `evt_${type}_${String(target)}`,
    type,
    createdAt: 1790125000000,
    payload: {
      deployment: { id: "dpl_1", url: "alchm-kitchen-1.vercel.app", meta: { githubCommitSha: "abcdef1234567" } },
      target,
      project: { id: "prj_1" },
      links: { deployment: "https://vercel.com/inspect/dpl_1" },
    },
    region: "iad1",
  });
}

function post(raw: string, signature?: string): Request {
  const sig = signature ?? createHmac("sha1", SECRET).update(raw).digest("hex");
  return new Request("https://alchm.kitchen/api/hooks/vercel", {
    method: "POST",
    headers: { "content-type": "application/json", "x-vercel-signature": sig },
    body: raw,
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  process.env.VERCEL_WEBHOOK_SECRET = SECRET;
  mockClaim.mockResolvedValue({ kind: "claimed", rowId: 1, attempt: 1, startedAt: 0 });
  mockAlert.mockResolvedValue({
    id: 42,
    triggeredAt: "",
    dispatch: {},
    component: "deploy",
    componentLabel: "",
    previous: "OK",
    current: "DEGRADED",
    severity: "error",
    title: "",
    message: "",
  });
});

describe("POST /api/hooks/vercel", () => {
  it("refuses with 503 until the secret is configured (Vercel keeps retrying)", async () => {
    delete process.env.VERCEL_WEBHOOK_SECRET;
    const res = await POST(post(body("deployment.ready", "production")));
    expect(res.status).toBe(503);
    expect(mockClaim).not.toHaveBeenCalled();
  });

  it("rejects a bad signature before recording anything", async () => {
    const res = await POST(post(body("deployment.error", "production"), "0".repeat(40)));
    expect(res.status).toBe(401);
    expect(mockClaim).not.toHaveBeenCalled();
    expect(mockAlert).not.toHaveBeenCalled();
  });

  it("alerts the operator when a PRODUCTION build fails, with the inspect link", async () => {
    const res = await POST(post(body("deployment.error", "production")));
    expect(res.status).toBe(200);
    expect(mockAlert).toHaveBeenCalledTimes(1);
    const [candidate] = mockAlert.mock.calls[0] ?? [];
    expect(candidate?.component).toBe("deploy");
    expect(candidate?.title).toContain("abcdef1");
    expect(candidate?.message).toContain("https://vercel.com/inspect/dpl_1");
  });

  it("does not page on a failed PREVIEW build", async () => {
    const res = await POST(post(body("deployment.error", null)));
    expect(res.status).toBe(200);
    expect(mockAlert).not.toHaveBeenCalled();
    expect(mockComplete).toHaveBeenCalledWith(expect.anything(), "processed", { action: "none", reason: "not production" });
  });

  it("schedules the post-deploy probes after a production deploy is ready", async () => {
    const res = await POST(post(body("deployment.ready", "production")));
    expect(res.status).toBe(200);
    expect(mockAfter).toHaveBeenCalledTimes(1);
    expect(mockAfter.mock.calls[0]?.[0]).toContain("post-deploy probes");
  });

  it("does not probe after a preview deploy", async () => {
    await POST(post(body("deployment.ready", null)));
    expect(mockAfter).not.toHaveBeenCalled();
  });

  it("acknowledges a redelivery without alerting twice", async () => {
    mockClaim.mockResolvedValue({ kind: "duplicate", status: "processed" });
    const res = await POST(post(body("deployment.error", "production")));
    expect(res.status).toBe(200);
    expect(mockAlert).not.toHaveBeenCalled();
  });

  it("answers 500 when the alert cannot be sent, so Vercel redelivers", async () => {
    mockAlert.mockRejectedValue(new Error("alert_events unwritable"));
    const res = await POST(post(body("deployment.error", "production")));
    expect(res.status).toBe(500);
  });
});
