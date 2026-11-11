/**
 * The reservation modal navigates to `data.url` straight from this parse, so
 * the cases that matter are the ones that must NOT reach `window.location`.
 * Bodies are round-tripped through JSON, as on the wire (Stripe's `url` is
 * `string | null`, and `null` survives the trip).
 */
import { parseReservationCheckoutResult } from "../reservationCheckoutParser";

function wire(body: unknown): unknown {
  return JSON.parse(JSON.stringify(body));
}

describe("parseReservationCheckoutResult", (): void => {
  it("keeps a Stripe Checkout session and the fields the route also sends", (): void => {
    const out = parseReservationCheckoutResult(wire({ mode: "stripe_checkout", url: "https://checkout.example.test/s/1", orderId: "o1" }));
    expect(out.mode).toBe("stripe_checkout");
    expect(out.url).toBe("https://checkout.example.test/s/1");
    expect(out).toHaveProperty("orderId", "o1");
  });

  it("keeps the restaurant-site fallback", (): void => {
    const out = parseReservationCheckoutResult(wire({ mode: "external", url: "https://restaurant.example.test/order" }));
    expect(out).toEqual({ mode: "external", url: "https://restaurant.example.test/order" });
  });

  it.each([[null], [""]])("refuses a stripe_checkout session whose url is %j", (url): void => {
    expect((): unknown => parseReservationCheckoutResult(wire({ mode: "stripe_checkout", url }))).toThrow("unexpected response");
  });

  it("refuses the route's esms mode, which this modal has no way to finish", (): void => {
    // /api/stripe/restaurant-order answers { mode: "esms", status: "paid" } with no url when
    // paymentPreference is "esms". The modal offers card and USDC only; a new ESMS button
    // needs its own arm in ReservationCheckoutSchema, and this test is what says so.
    const body = wire({ mode: "esms", orderId: "o2", status: "paid" });
    expect((): unknown => parseReservationCheckoutResult(body)).toThrow("unexpected response");
  });

  it.each([[null], [[]], ["checkout"], [{}], [{ url: "https://x.test" }]])("refuses a body with no usable mode (%j)", (value): void => {
    expect((): unknown => parseReservationCheckoutResult(value)).toThrow("unexpected response");
  });
});
