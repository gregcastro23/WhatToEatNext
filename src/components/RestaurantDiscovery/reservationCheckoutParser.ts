/**
 * Wire parser for `POST /api/stripe/restaurant-order` success bodies as the
 * reservation modal consumes them.
 *
 * The modal only ever asks for a card or USDC checkout, and the route answers
 * those with `{ mode: "stripe_checkout", url, … }` (Stripe Checkout session) or
 * `{ mode: "external", url, … }` (restaurant-site fallback). The modal reads
 * `mode` and `url` and nothing else, so those are the fields validated here;
 * the rest of the body is preserved untouched.
 *
 * ⚠ The route has a third success mode, `esms` (paid, no url), that this modal
 * cannot finish and therefore never requests. If an ESMS button is ever added to
 * the modal, add its arm to the union below: until then `esms` is refused, and
 * `__tests__/reservationCheckoutParser.test.ts` pins that refusal.
 *
 * A body that does not match throws a plain `Error`; the modal runs the parse
 * inside its existing `try { … } catch (err) { setState({ kind: "error" }) }`,
 * so it surfaces as that same checkout-error state instead of navigating to
 * `undefined`/`null`.
 *
 * @file src/components/RestaurantDiscovery/reservationCheckoutParser.ts
 */

import { z } from "zod";

const ReservationCheckoutSchema = z.discriminatedUnion("mode", [
  z.looseObject({ mode: z.literal("stripe_checkout"), url: z.string().min(1) }),
  z.looseObject({ mode: z.literal("external"), url: z.string() }),
]);

export type ReservationCheckoutResult = z.infer<
  typeof ReservationCheckoutSchema
>;

/** `parse` for `readJson`. */
export function parseReservationCheckoutResult(
  value: unknown,
): ReservationCheckoutResult {
  const result = ReservationCheckoutSchema.safeParse(value);
  if (!result.success) {
    throw new Error("Checkout returned an unexpected response.");
  }
  return result.data;
}
