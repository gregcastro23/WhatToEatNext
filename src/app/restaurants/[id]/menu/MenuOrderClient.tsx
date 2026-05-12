"use client";

import { useMemo, useState } from "react";
import type { DeliverectMenu } from "@/lib/integrations/deliverect";

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
  url?: string;
  error?: string;
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

  const subtotalCents = useMemo(
    () => cart.reduce((sum, item) => sum + item.unitPriceCents * item.quantity, 0),
    [cart],
  );

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
      const response = await fetch("/api/stripe/restaurant-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      if (!response.ok || !data.url) {
        throw new Error(data.error || "Could not start checkout.");
      }

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
          {error && <p className="mt-3 text-xs text-rose-300">{error}</p>}
          <button
            type="button"
            onClick={() => void checkout()}
            disabled={cart.length === 0 || isCheckingOut}
            className="mt-4 w-full rounded-md bg-gradient-to-r from-emerald-600 to-teal-500 px-4 py-2.5 text-sm font-bold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isCheckingOut ? "Starting Checkout..." : "Order with Stripe"}
          </button>
        </div>
      </aside>
    </div>
  );
}
