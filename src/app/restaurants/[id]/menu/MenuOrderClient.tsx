"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { DeliverectMenu } from "@/lib/integrations/deliverect";
import {
  canAffordEsmsBasket,
  esmsRestaurantCentsPerToken,
  esmsRestaurantPaymentsEnabled,
  quoteEsmsBasket,
} from "@/lib/payments/restaurantEsms";
import type { EsmsBalanceLike } from "@/lib/payments/restaurantEsms";
import { restaurantCryptoPaymentsEnabled } from "@/lib/payments/restaurantPayments";
import type { RestaurantPaymentPreference } from "@/lib/payments/restaurantPayments";

interface RestaurantMenuClientProps {
  restaurant: {
    id: string;
    name: string;
    url: string;
    stripeConnectAccountId?: string;
  };
  menu: DeliverectMenu;
}

interface CartItem {
  id: string;
  plu: string;
  name: string;
  quantity: number;
  unitPriceCents: number;
}

interface CheckoutResponse {
  mode?: "stripe_checkout" | "external" | "esms";
  url?: string;
  error?: string;
  code?: string;
  orderId?: string;
}

function money(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export default function MenuOrderClient({
  restaurant,
  menu,
}: RestaurantMenuClientProps) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] =
    useState<RestaurantPaymentPreference>("card");
  const [esmsBalances, setEsmsBalances] = useState<EsmsBalanceLike | null>(null);
  const [esmsBalanceStatus, setEsmsBalanceStatus] = useState<
    "idle" | "loading" | "ready" | "signed_out" | "error"
  >("idle");
  const checkoutIdempotencyKey = useRef<string | null>(null);

  const cryptoEnabled = restaurantCryptoPaymentsEnabled();
  const esmsEnabled = esmsRestaurantPaymentsEnabled();

  const subtotalCents = useMemo(
    () => cart.reduce((sum, item) => sum + item.unitPriceCents * item.quantity, 0),
    [cart],
  );
  const esmsCost = useMemo(
    () => quoteEsmsBasket(subtotalCents),
    [subtotalCents],
  );
  const canAffordEsms = Boolean(
    esmsBalances && esmsCost && canAffordEsmsBasket(esmsBalances, esmsCost),
  );

  useEffect(() => {
    if (!esmsEnabled || paymentMethod !== "esms") return;

    let active = true;
    setEsmsBalanceStatus("loading");
    void fetch("/api/economy/balance")
      .then(async (response) => {
        if (response.status === 401) {
          if (active) setEsmsBalanceStatus("signed_out");
          return;
        }
        if (!response.ok) throw new Error("Could not load ESMS balance");
        const data = (await response.json()) as {
          balances?: EsmsBalanceLike;
        };
        if (!data.balances) throw new Error("ESMS balance was unavailable");
        if (active) {
          setEsmsBalances(data.balances);
          setEsmsBalanceStatus("ready");
        }
      })
      .catch(() => {
        if (active) setEsmsBalanceStatus("error");
      });

    return () => {
      active = false;
    };
  }, [esmsEnabled, paymentMethod]);

  function addItem(item: DeliverectMenu["categories"][number]["items"][number]) {
    setCart((current) => {
      const existing = current.find((cartItem) => cartItem.id === item.id);
      if (existing) {
        return current.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem,
        );
      }
      return [
        ...current,
        {
          id: item.id,
          plu: item.plu,
          name: item.name,
          quantity: 1,
          unitPriceCents: item.priceCents,
        },
      ];
    });
  }

  function removeItem(id: string) {
    setCart((current) =>
      current.flatMap((item) => {
        if (item.id !== id) return [item];
        if (item.quantity <= 1) return [];
        return [{ ...item, quantity: item.quantity - 1 }];
      }),
    );
  }

  async function checkout() {
    if (cart.length === 0 || subtotalCents <= 0) return;

    setIsCheckingOut(true);
    setError(null);

    try {
      checkoutIdempotencyKey.current ??= crypto.randomUUID();
      const response = await fetch("/api/stripe/restaurant-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": checkoutIdempotencyKey.current,
        },
        body: JSON.stringify({
          cuisineType: "Restaurant",
          provider: "deliverect",
          restaurant: {
            id: restaurant.id,
            name: restaurant.name,
            url: restaurant.url,
            stripeConnectedAccountId: restaurant.stripeConnectAccountId,
          },
          order: {
            amountCents: subtotalCents,
            currency: "usd",
            orderType: "pickup",
            paymentMethod,
            customer: {
              name: customerName || "Guest",
              email: customerEmail || undefined,
            },
            items: cart.map((item) => ({
              id: item.id,
              plu: item.plu,
              name: item.name,
              quantity: item.quantity,
              unitPriceCents: item.unitPriceCents,
            })),
          },
        }),
      });

      const data = (await response.json().catch(() => ({}))) as CheckoutResponse;
      if (data.code === "settlement_pending" && data.orderId) {
        throw new Error(
          `Order ${data.orderId} is awaiting restaurant settlement. Do not submit it again.`,
        );
      }

      if (!response.ok) {
        throw new Error(data.error || "Could not start checkout.");
      }

      if (data.mode === "esms" && data.orderId) {
        checkoutIdempotencyKey.current = null;
        const successUrl = new URL("/restaurants", window.location.origin);
        successUrl.searchParams.set("order", "success");
        successUrl.searchParams.set("restaurant", restaurant.name);
        successUrl.searchParams.set("order_id", data.orderId);
        successUrl.searchParams.set("payment", "esms");
        window.location.assign(successUrl.toString());
        return;
      }

      if (!data.url) throw new Error("Checkout URL was unavailable.");
      checkoutIdempotencyKey.current = null;
      window.location.assign(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start checkout.");
    } finally {
      setIsCheckingOut(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <section className="space-y-8">
        {menu.categories.map((category) => (
          <div key={category.id}>
            <h2 className="mb-3 text-lg font-bold text-white">{category.name}</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {category.items.map((item) => (
                <article
                  key={item.id}
                  className="rounded-lg border border-white/10 bg-white/[0.06] p-4"
                >
                  <div className="flex min-h-24 flex-col justify-between gap-4">
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-sm font-bold text-white">{item.name}</h3>
                        <span className="text-sm font-semibold text-amber-200">
                          {money(item.priceCents)}
                        </span>
                      </div>
                      {item.description && (
                        <p className="mt-2 text-xs leading-relaxed text-white/55">
                          {item.description}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => addItem(item)}
                      disabled={!item.available}
                      className="rounded-md bg-emerald-600 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/40"
                    >
                      {item.available ? "Add to Cart" : "Unavailable"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ))}
      </section>

      <aside className="h-fit rounded-lg border border-white/10 bg-white/[0.06] p-4">
        <h2 className="text-base font-bold text-white">Pickup Order</h2>
        <div className="mt-4 space-y-3">
          <input
            type="text"
            value={customerName}
            onChange={(event) => setCustomerName(event.target.value)}
            placeholder="Name"
            className="w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-orange-400 focus:outline-none"
          />
          <input
            type="email"
            value={customerEmail}
            onChange={(event) => setCustomerEmail(event.target.value)}
            placeholder="Email"
            className="w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-orange-400 focus:outline-none"
          />
        </div>

        <div className="mt-5 space-y-3">
          {cart.length === 0 ? (
            <p className="text-sm text-white/50">Add menu items to begin.</p>
          ) : (
            cart.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-white">{item.name}</p>
                  <p className="text-xs text-white/45">
                    {item.quantity} x {money(item.unitPriceCents)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="rounded border border-white/10 px-2 py-1 text-xs text-white/70 hover:border-rose-300/40 hover:text-rose-200"
                >
                  -
                </button>
              </div>
            ))
          )}
        </div>

        <div className="mt-5 border-t border-white/10 pt-4">
          <div className="flex items-center justify-between text-sm font-bold text-white">
            <span>Subtotal</span>
            <span>{money(subtotalCents)}</span>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3 lg:grid-cols-1">
            <button
              type="button"
              onClick={() => setPaymentMethod("card")}
              aria-pressed={paymentMethod === "card"}
              className={`rounded-md border px-3 py-2 text-left text-xs transition-colors ${
                paymentMethod === "card"
                  ? "border-emerald-300/60 bg-emerald-500/15 text-emerald-100"
                  : "border-white/10 bg-black/20 text-white/60 hover:border-white/25"
              }`}
            >
              <span className="block font-bold">Card</span>
              <span className="mt-0.5 block text-[10px] opacity-65">USD checkout</span>
            </button>
            {cryptoEnabled && (
              <button
                type="button"
                onClick={() => setPaymentMethod("crypto")}
                aria-pressed={paymentMethod === "crypto"}
                className={`rounded-md border px-3 py-2 text-left text-xs transition-colors ${
                  paymentMethod === "crypto"
                    ? "border-blue-300/60 bg-blue-500/15 text-blue-100"
                    : "border-white/10 bg-black/20 text-white/60 hover:border-white/25"
                }`}
              >
                <span className="block font-bold">USDC</span>
                <span className="mt-0.5 block text-[10px] opacity-65">Pay from a wallet</span>
              </button>
            )}
            {esmsEnabled && (
              <button
                type="button"
                onClick={() => setPaymentMethod("esms")}
                aria-pressed={paymentMethod === "esms"}
                className={`rounded-md border px-3 py-2 text-left text-xs transition-colors ${
                  paymentMethod === "esms"
                    ? "border-violet-300/60 bg-violet-500/15 text-violet-100"
                    : "border-white/10 bg-black/20 text-white/60 hover:border-white/25"
                }`}
              >
                <span className="block font-bold">ESMS</span>
                <span className="mt-0.5 block text-[10px] opacity-65">Four-axis balance</span>
              </button>
            )}
          </div>
          {paymentMethod === "crypto" && (
            <p className="mt-3 rounded-md border border-blue-300/20 bg-blue-500/10 p-2 text-[10px] leading-relaxed text-blue-100/75">
              Stripe presents the USD total and accepts supported stablecoins,
              including USDC on Base. The restaurant still settles in USD.
            </p>
          )}
          {paymentMethod === "esms" && esmsCost && (
            <div className="mt-3 rounded-md border border-violet-300/20 bg-violet-500/10 p-2 text-[10px] leading-relaxed text-violet-100/75">
              <p className="font-bold text-violet-100">ESMS basket</p>
              <p className="mt-1">
                {esmsCost.spirit} Spirit / {esmsCost.essence} Essence /{" "}
                {esmsCost.matter} Matter / {esmsCost.substance} Substance
              </p>
              {esmsBalanceStatus === "loading" && <p className="mt-1">Checking balance...</p>}
              {esmsBalanceStatus === "signed_out" && (
                <p className="mt-1 text-amber-200">Sign in to use ESMS.</p>
              )}
              {esmsBalanceStatus === "error" && (
                <p className="mt-1 text-rose-200">Could not load your ESMS balance.</p>
              )}
              {esmsBalanceStatus === "ready" && !canAffordEsms && (
                <p className="mt-1 text-amber-200">One or more axes are below the required balance.</p>
              )}
              <p className="mt-2 border-t border-violet-300/15 pt-2 text-violet-100/55">
                {esmsRestaurantCentsPerToken() > 0
                  ? `1 ESMS = ${esmsRestaurantCentsPerToken()}¢ of food value (closed-loop, not withdrawable cash). `
                  : "ESMS is closed-loop food value, not withdrawable cash. "}
                <a href="/rewards" className="text-violet-200 underline hover:text-violet-100">
                  How ESMS redemption works
                </a>
              </p>
            </div>
          )}
          {error && <p className="mt-3 text-xs text-rose-300">{error}</p>}
          <button
            type="button"
            onClick={() => void checkout()}
            disabled={
              cart.length === 0 ||
              isCheckingOut ||
              (paymentMethod === "esms" && !canAffordEsms)
            }
            className="mt-4 w-full rounded-md bg-gradient-to-r from-emerald-600 to-teal-500 px-4 py-2.5 text-sm font-bold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isCheckingOut
              ? paymentMethod === "esms"
                ? "Settling ESMS..."
                : "Starting Checkout..."
              : paymentMethod === "crypto"
                ? "Pay with USDC"
                : paymentMethod === "esms"
                  ? "Pay with ESMS"
                  : "Pay with Card"}
          </button>
        </div>
      </aside>
    </div>
  );
}
