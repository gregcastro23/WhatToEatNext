/** @jest-environment node */

import { shopAuditAlertCandidate } from "@/services/chainShopAlertService";
import type { BurnHealSummary } from "@/services/chainReconcileService";

const now = new Date("2026-09-30T12:00:00.000Z");
const blocked: BurnHealSummary = {
  pairsChecked: 0, healed: 0, failures: 1,
  preflight: "contract-missing",
  firstError: "No ESMS contract code at 0x124E on eip155:8453",
};
const ready: BurnHealSummary = {
  pairsChecked: 40, healed: 0, failures: 0, preflight: "ready",
};

describe("shop audit alert transitions", () => {
  it("reports one actionable degradation without claiming an unobserved healthy state", () => {
    const candidate = shopAuditAlertCandidate(blocked, null, now);
    expect(candidate).toMatchObject({
      previous: "UNKNOWN", current: "DEGRADED",
      title: "Shop burn audit blocked: contract-missing",
    });
    expect(candidate?.message).toContain("eip155:8453");
  });

  it("holds repeated emails for a full day, then sends an honest reminder", () => {
    const last = { status: "DEGRADED" as const, triggeredAt: new Date("2026-09-30T11:00:00.000Z") };
    expect(shopAuditAlertCandidate(blocked, last, now)).toBeNull();
    const old = { ...last, triggeredAt: new Date("2026-09-29T11:00:00.000Z") };
    expect(shopAuditAlertCandidate(blocked, old, now)).toMatchObject({
      previous: "DEGRADED", current: "DEGRADED",
      title: "Shop burn audit still blocked: contract-missing",
    });
  });

  it("announces verified recovery once and does not claim recovery when monitoring is disabled", () => {
    const last = { status: "DEGRADED" as const, triggeredAt: new Date("2026-09-30T11:00:00.000Z") };
    expect(shopAuditAlertCandidate(ready, last, now)).toMatchObject({
      previous: "DEGRADED", current: "OK", title: "Shop burn audit recovered",
    });
    expect(shopAuditAlertCandidate(ready, { status: "OK", triggeredAt: now }, now)).toBeNull();
    expect(shopAuditAlertCandidate({ pairsChecked: 0, healed: 0, failures: 0 }, last, now)).toBeNull();
  });
});
