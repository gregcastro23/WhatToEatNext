/**
 * @jest-environment node
 *
 * Stripe webhook coverage: the declared list vs the route, and the route vs the
 * Dashboard.
 *
 * A webhook integration has two halves that cannot see each other — the
 * `switch` decides what we CAN process, the Stripe Dashboard decides what we
 * ever RECEIVE — and a mismatch raises no error anywhere. The declared list in
 * `handledEvents.ts` is what bridges them, so it is only useful if it cannot
 * drift from the route.
 */

import fs from "node:fs";
import path from "node:path";
import {
  CRITICAL_STRIPE_EVENT_TYPES,
  HANDLED_STRIPE_EVENTS,
  HANDLED_STRIPE_EVENT_TYPES,
} from "@/lib/stripe/handledEvents";
import {
  classifyWebhookCoverage,
  selectOurEndpoint,
} from "@/services/stripeWebhookCoverageService";

const ROUTE_PATH = path.join(
  process.cwd(),
  "src/app/api/stripe/webhook/route.ts",
);

/** Every `case "<event>":` in the webhook's switch. */
function routeCaseEvents(): string[] {
  const source = fs.readFileSync(ROUTE_PATH, "utf8");
  const matches = source.matchAll(/case\s+"([a-z_]+(?:\.[a-z_]+)+)":/g);
  return [...matches].map((m) => m[1]).sort();
}

describe("the declared list cannot drift from the route", () => {
  it("finds the route's cases at all (control — a zero here would pass everything)", () => {
    expect(routeCaseEvents().length).toBeGreaterThan(0);
  });

  it("declares every event the route handles", () => {
    const inRoute = routeCaseEvents();
    const undeclared = inRoute.filter(
      (e) => !HANDLED_STRIPE_EVENT_TYPES.includes(e),
    );
    // A handled event missing from the list would never be checked against the
    // Dashboard, so nobody would notice Stripe wasn't sending it.
    expect(undeclared).toEqual([]);
  });

  it("does not declare events the route cannot actually process", () => {
    const inRoute = routeCaseEvents();
    const phantom = HANDLED_STRIPE_EVENT_TYPES.filter(
      (e) => !inRoute.includes(e),
    );
    // A phantom entry makes the admin board demand a Dashboard event that would
    // hit `default` — busywork that erodes trust in the check.
    expect(phantom).toEqual([]);
  });

  it("still handles the async events the 2026-08 crypto gap was about", () => {
    const inRoute = routeCaseEvents();
    expect(inRoute).toContain("checkout.session.async_payment_succeeded");
    expect(inRoute).toContain("checkout.session.async_payment_failed");
    expect(CRITICAL_STRIPE_EVENT_TYPES).toContain(
      "checkout.session.async_payment_succeeded",
    );
  });
});

describe("classifyWebhookCoverage", () => {
  const allEnabled = [...HANDLED_STRIPE_EVENT_TYPES];

  it("is ok when every handled event is enabled", () => {
    const r = classifyWebhookCoverage({ enabledEvents: allEnabled });
    expect(r.status).toBe("ok");
    expect(r.missingEvents).toEqual([]);
  });

  it("is ok for a wildcard endpoint", () => {
    const r = classifyWebhookCoverage({ enabledEvents: ["*"] });
    expect(r.status).toBe("ok");
    expect(r.missingEvents).toEqual([]);
  });

  it("is an INCIDENT when a critical event is not enabled", () => {
    const r = classifyWebhookCoverage({
      enabledEvents: allEnabled.filter(
        (e) => e !== "checkout.session.async_payment_succeeded",
      ),
    });
    expect(r.status).toBe("incident");
    expect(r.missingCriticalEvents).toEqual([
      "checkout.session.async_payment_succeeded",
    ]);
    // The summary must name the real cause, not a generic failure.
    expect(r.summary).toMatch(/async_payment_succeeded/);
  });

  it("is only DEGRADED when a non-critical event is missing", () => {
    const r = classifyWebhookCoverage({
      enabledEvents: allEnabled.filter((e) => e !== "invoice.payment_failed"),
    });
    expect(r.status).toBe("degraded");
    expect(r.missingCriticalEvents).toEqual([]);
  });

  it("is an INCIDENT when the endpoint is disabled, whatever it subscribes to", () => {
    const r = classifyWebhookCoverage({
      enabledEvents: allEnabled,
      endpointStatus: "disabled",
    });
    expect(r.status).toBe("incident");
    expect(r.summary).toMatch(/disabled/);
  });

  it("reports unknown — never ok — when no endpoint matches", () => {
    const r = classifyWebhookCoverage({ enabledEvents: null });
    expect(r.status).toBe("unknown");
    expect(r.status).not.toBe("ok");
  });

  it("flags extra subscribed events as noise, not danger", () => {
    const r = classifyWebhookCoverage({
      enabledEvents: [...allEnabled, "radar.early_fraud_warning.created"],
    });
    expect(r.status).toBe("ok");
    expect(r.unhandledEvents).toEqual(["radar.early_fraud_warning.created"]);
  });
});

describe("selectOurEndpoint — the Stripe account is shared across projects", () => {
  it("picks by path, so a sibling project's endpoint is not mistaken for ours", () => {
    const chosen = selectOurEndpoint([
      { url: "https://other-project.com/api/stripe/webhook-v1", status: "enabled" },
      { url: "https://alchm.kitchen/api/stripe/webhook", status: "enabled" },
    ]);
    expect(chosen?.url).toBe("https://alchm.kitchen/api/stripe/webhook");
  });

  it("prefers the enabled endpoint when several share our path", () => {
    const chosen = selectOurEndpoint([
      { url: "https://preview.alchm.kitchen/api/stripe/webhook", status: "disabled" },
      { url: "https://alchm.kitchen/api/stripe/webhook", status: "enabled" },
    ]);
    expect(chosen?.status).toBe("enabled");
  });

  it("returns null rather than guessing among unrelated endpoints", () => {
    const chosen = selectOurEndpoint([
      { url: "https://a.com/hooks/one", status: "enabled" },
      { url: "https://b.com/hooks/two", status: "enabled" },
    ]);
    expect(chosen).toBeNull();
  });

  it("accepts a lone endpoint even on an unexpected path", () => {
    const chosen = selectOurEndpoint([
      { url: "https://alchm.kitchen/api/stripe/webhook-legacy", status: "enabled" },
    ]);
    expect(chosen).not.toBeNull();
  });
});

describe("every declared event explains what breaks without it", () => {
  it.each(HANDLED_STRIPE_EVENTS.map((e) => [e.type, e.why]))(
    "%s has a non-trivial rationale",
    (_type, why) => {
      expect(why.length).toBeGreaterThan(20);
    },
  );
});
