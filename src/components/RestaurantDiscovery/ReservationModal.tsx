"use client";

/**
 * ReservationModal — small Stripe checkout flow for any restaurant.
 *
 * Posts to /api/stripe/restaurant-order with a user-entered tab amount.
 * Handles both stripe_checkout (redirect) and external (open in new tab)
 * response modes.
 */

import { useState } from "react";
import { useToast } from "@/components/ToastProvider";
import type { AlchmScoredRestaurant, RestaurantDiscoverySource } from "@/types/yelp";

interface ReservationModalProps {
  entry: AlchmScoredRestaurant;
  source: RestaurantDiscoverySource;
  cuisineType: string;
  onClose: () => void;
}

type SubmitState =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "error"; message: string };

const PRESET_AMOUNTS = [25, 50, 100];

export function ReservationModal({
  entry,
  source,
  cuisineType,
  onClose,
}: ReservationModalProps) {
  const { business } = entry;
  const [amount, setAmount] = useState<string>("50");
  const [state, setState] = useState<SubmitState>({ kind: "idle" });
  const { showToast } = useToast();

  const handleSubmit = async () => {
    const parsed = Number(amount);
    if (!Number.isFinite(parsed) || parsed < 1) {
      setState({ kind: "error", message: "Enter an amount of at least $1." });
      return;
    }
    if (parsed > 5000) {
      setState({ kind: "error", message: "Maximum reservation is $5,000." });
      return;
    }

    setState({ kind: "submitting" });
    try {
      const res = await fetch("/api/stripe/restaurant-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cuisineType: cuisineType || "Restaurant",
          provider: source,
          restaurant: {
            id: business.id,
            name: business.name,
            url: business.url,
            stripeConnectedAccountId: entry.stripeConnectAccountId,
          },
          order: {
            amountCents: Math.round(parsed * 100),
            currency: "usd",
            description: `Alchm Kitchen pre-paid tab at ${business.name}`,
            orderType: "pickup",
          },
        }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        setState({
          kind: "error",
          message: data?.error ?? `Checkout failed (${res.status})`,
        });
        return;
      }

      const data = (await res.json()) as
        | { mode: "stripe_checkout"; url: string; orderId: string }
        | { mode: "external"; url: string; reason: string; orderId: string };

      if (data.mode === "stripe_checkout") {
        window.location.href = data.url;
        return;
      }

      // External fallback: Stripe not configured or no partner; surface the restaurant link.
      showToast(
        "Stripe checkout isn't available for this restaurant — opening their site.",
        "info",
      );
      window.open(data.url, "_blank", "noopener,noreferrer");
      onClose();
    } catch (err) {
      setState({
        kind: "error",
        message: err instanceof Error ? err.message : "Checkout failed.",
      });
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-3xl border border-purple-500/30 bg-gradient-to-br from-[#0c0c14] to-[#1a0f24] p-6 shadow-2xl shadow-purple-900/40"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-white/40 hover:text-white/80"
          aria-label="Close"
        >
          ✕
        </button>

        <div className="mb-1 text-xs font-bold uppercase tracking-[0.2em] text-purple-300/80">
          Alchm Pre-Pay
        </div>
        <h3 className="text-xl font-extrabold text-white">{business.name}</h3>
        <p className="mt-2 text-sm text-white/60 leading-relaxed">
          Pre-pay your tab through Alchm Kitchen. We&apos;ll send you a receipt and
          a code to show the restaurant.
        </p>

        <div className="mt-6">
          <label className="text-[10px] font-black uppercase tracking-[0.18em] text-purple-200/70">
            Amount
          </label>
          <div className="mt-2 flex items-center gap-2 rounded-xl border border-white/10 bg-black/40 px-4 py-3 focus-within:border-purple-400/60">
            <span className="text-2xl font-extrabold text-white/40">$</span>
            <input
              type="number"
              inputMode="decimal"
              min={1}
              max={5000}
              step={1}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1 bg-transparent text-2xl font-extrabold text-white outline-none placeholder:text-white/20"
              placeholder="50"
            />
          </div>

          <div className="mt-3 flex gap-2">
            {PRESET_AMOUNTS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setAmount(String(preset))}
                className={`flex-1 rounded-lg border px-3 py-2 text-xs font-bold transition-colors ${
                  Number(amount) === preset
                    ? "border-purple-400/60 bg-purple-500/20 text-purple-100"
                    : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
                }`}
              >
                ${preset}
              </button>
            ))}
          </div>
        </div>

        {state.kind === "error" && (
          <p className="mt-4 rounded-lg border border-rose-400/30 bg-rose-500/10 p-3 text-xs text-rose-200">
            {state.message}
          </p>
        )}

        <button
          type="button"
          onClick={() => void handleSubmit()}
          disabled={state.kind === "submitting"}
          className="mt-6 w-full rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-3 text-sm font-black uppercase tracking-[0.18em] text-white shadow-lg shadow-purple-900/40 transition-all hover:brightness-110 disabled:opacity-50"
        >
          {state.kind === "submitting" ? "Opening Stripe…" : "Continue to Checkout"}
        </button>

        <p className="mt-3 text-center text-[10px] font-medium text-white/30">
          Payments processed securely by Stripe.
        </p>
      </div>
    </div>
  );
}

export default ReservationModal;
