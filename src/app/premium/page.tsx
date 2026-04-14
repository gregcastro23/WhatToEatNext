/**
 * Premium Dashboard Page
 *
 * Shows subscription status, usage stats, upgrade/manage buttons,
 * and a feature comparison table between Free and Premium tiers.
 *
 * @file src/app/premium/page.tsx
 */

"use client";

import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import { usePremium } from "@/contexts/PremiumContext";
import {
  TIER_LIMITS,
  FEATURE_LIST,
  type SubscriptionTier,
} from "@/types/subscription";

const TIER_ORDER: SubscriptionTier[] = ["free", "premium"];

const TIER_STYLES: Record<
  SubscriptionTier,
  { gradient: string; border: string; badge: string; glow: string }
> = {
  free: {
    gradient: "from-white/10 to-white/5",
    border: "border-white/10",
    badge: "bg-white/10 text-white/80",
    glow: "",
  },
  premium: {
    gradient: "from-purple-50 to-indigo-100",
    border: "border-purple-300",
    badge: "bg-purple-100 text-purple-800",
    glow: "ring-2 ring-purple-200 shadow-lg shadow-purple-50",
  },
};

export default function PremiumPage() {
  const { data: session, status: authStatus } = useSession();
  const {
    subscription,
    tier,
    isLoading,
    recipeUsage,
    recipeLimit,
    openCheckout,
    openPortal,
    refresh,
  } = usePremium();

  const searchParams = useSearchParams();
  const [checkoutMessage, setCheckoutMessage] = useState<string | null>(null);

  useEffect(() => {
    const checkoutStatus = searchParams?.get("checkout");
    if (checkoutStatus === "success") {
      setCheckoutMessage("Your Premium subscription is now active! Welcome aboard.");
      void refresh();
    } else if (checkoutStatus === "canceled") {
      setCheckoutMessage("Checkout was canceled. No changes were made.");
    }
  }, [searchParams, refresh]);

  if (authStatus === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-[#08080e] text-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60 font-medium">Loading your plan...</p>
        </div>
      </div>
    );
  }

  const usagePercent =
    recipeLimit === Infinity ? 0 : Math.min(100, (recipeUsage / recipeLimit) * 100);

  return (
    <div className="min-h-screen bg-[#08080e] text-white via-purple-50 to-indigo-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black mb-3 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Alchm Kitchen Premium
          </h1>
          <p className="text-lg text-white/60 max-w-xl mx-auto">
            Unlock unlimited recipe generation, the Cosmic Restaurant Creator,
            advanced planetary charts, and more.
          </p>
        </div>

        {/* Checkout Message */}
        {checkoutMessage && (
          <div
            className={`mb-8 p-4 rounded-xl text-center font-medium ${
              searchParams?.get("checkout") === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-amber-50 text-amber-800 border border-amber-200"
            }`}
          >
            {checkoutMessage}
          </div>
        )}

        {/* Current Plan Status */}
        {session?.user && (
          <div className="mb-10 glass-card-premium rounded-2xl border border-white/8 p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-2xl font-bold text-white">Your Plan</h2>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-bold ${TIER_STYLES[tier].badge}`}
                  >
                    {TIER_LIMITS[tier].label}
                  </span>
                  {subscription?.cancelAtPeriodEnd && (
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-50 text-red-700">
                      Canceling at period end
                    </span>
                  )}
                </div>
                <p className="text-white/60">
                  {tier === "free"
                    ? "Free tier — 10 recipe generations per month"
                    : `$${TIER_LIMITS.premium.price}/month — Unlimited access`}
                </p>
              </div>

              {tier === "premium" && (
                <button
                  onClick={() => { void openPortal(); }}
                  className="px-5 py-2.5 rounded-xl border-2 border-white/10 text-white/80 font-semibold hover:bg-white/5 transition-all"
                >
                  Manage Billing
                </button>
              )}
            </div>

            <div className="mt-8 grid md:grid-cols-3 gap-6">
              <div className="bg-white/5 rounded-xl p-5">
                <p className="text-xs font-bold text-white/60 uppercase tracking-wider mb-2">
                  Recipe Generations
                </p>
                <div className="flex items-end gap-2 mb-3">
                  <span className="text-3xl font-black text-white">
                    {recipeUsage}
                  </span>
                  <span className="text-white/60 font-medium pb-1">
                    / {recipeLimit === Infinity ? "\u221E" : recipeLimit}
                  </span>
                </div>
                {tier === "free" && (
                  <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        usagePercent > 80 ? "bg-red-500" : usagePercent > 50 ? "bg-amber-500" : "bg-purple-500"
                      }`}
                      style={{ width: `${usagePercent}%` }}
                    />
                  </div>
                )}
              </div>

              <div className="bg-white/5 rounded-xl p-5">
                <p className="text-xs font-bold text-white/60 uppercase tracking-wider mb-2">
                  Renewal
                </p>
                <p className="text-lg font-semibold text-white/80">
                  {subscription?.currentPeriodEnd && tier === "premium"
                    ? new Date(subscription.currentPeriodEnd).toLocaleDateString()
                    : "Monthly reset"}
                </p>
              </div>

              <div className="bg-white/5 rounded-xl p-5">
                <p className="text-xs font-bold text-white/60 uppercase tracking-wider mb-2">
                  Status
                </p>
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      !subscription || subscription.status === "active"
                        ? "bg-green-500"
                        : subscription.status === "past_due"
                          ? "bg-amber-500"
                          : "bg-white/20"
                    }`}
                  />
                  <span className="text-lg font-semibold text-white/80 capitalize">
                    {subscription?.status || "Active"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-14">
          {TIER_ORDER.map((t) => {
            const config = TIER_LIMITS[t];
            const styles = TIER_STYLES[t];
            const isCurrent = tier === t;

            return (
              <div
                key={t}
                className={`relative bg-gradient-to-b ${styles.gradient} rounded-2xl border-2 ${styles.border} ${styles.glow} p-8 flex flex-col`}
              >
                {t === "premium" && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-purple-600 text-white text-xs font-bold uppercase tracking-wider rounded-full">
                    Recommended
                  </div>
                )}

                <h3 className="text-2xl font-black mb-2">{config.label}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-black">
                    {config.price === 0 ? "Free" : `$${config.price}`}
                  </span>
                  {config.price > 0 && (
                    <span className="text-white/60 font-medium">/month</span>
                  )}
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {FEATURE_LIST.map((feature) => {
                    const value = feature[t];
                    const hasIt = value === true || typeof value === "string";
                    return (
                      <li key={feature.key} className="flex items-center gap-2.5 text-sm">
                        <span
                          className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                            hasIt ? "bg-green-100 text-green-700" : "bg-white/10 text-white/60"
                          }`}
                        >
                          {hasIt ? "\u2713" : "\u2715"}
                        </span>
                        <span className={hasIt ? "text-white" : "text-white/60"}>
                          {feature.label}
                          {typeof value === "string" && (
                            <span className="font-bold ml-1">({value})</span>
                          )}
                        </span>
                      </li>
                    );
                  })}
                </ul>

                {isCurrent ? (
                  <button
                    disabled
                    className="w-full py-3 rounded-xl bg-white/10 text-white/60 font-bold cursor-not-allowed"
                  >
                    Current Plan
                  </button>
                ) : session?.user ? (
                  <button
                    onClick={() => { void openCheckout(t); }}
                    className={`w-full py-3 rounded-xl font-bold transition-all ${
                      t === "premium"
                        ? "bg-purple-600 text-white hover:bg-purple-700 shadow-md"
                        : "bg-white border-2 border-white/10 text-white/80 hover:bg-white/5"
                    }`}
                  >
                    {t === "free" ? "Downgrade to Free" : "Upgrade to Premium"}
                  </button>
                ) : (
                  <a
                    href="/login"
                    className="block w-full py-3 rounded-xl bg-purple-600 text-white font-bold text-center hover:bg-purple-700 transition-all"
                  >
                    Sign in to Get Premium
                  </a>
                )}
              </div>
            );
          })}
        </div>

        {/* Feature Comparison Table */}
        <div className="glass-card-premium rounded-2xl border border-white/8 overflow-hidden">
          <div className="p-8 border-b border-white/10">
            <h2 className="text-2xl font-black text-white">What&apos;s included</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-4 pl-8 text-sm font-bold text-white/60 uppercase tracking-wider">
                    Feature
                  </th>
                  {TIER_ORDER.map((t) => (
                    <th
                      key={t}
                      className="p-4 text-center text-sm font-bold text-white/60 uppercase tracking-wider"
                    >
                      {TIER_LIMITS[t].label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {FEATURE_LIST.map((feature, i) => (
                  <tr key={feature.key} className={i % 2 === 0 ? "bg-white/5" : ""}>
                    <td className="p-4 pl-8 font-medium text-white/80">
                      {feature.label}
                    </td>
                    {TIER_ORDER.map((t) => {
                      const value = feature[t];
                      return (
                        <td key={t} className="p-4 text-center">
                          {typeof value === "string" ? (
                            <span className="font-bold text-white">{value}</span>
                          ) : value ? (
                            <span className="text-green-600 font-bold text-lg">{"\u2713"}</span>
                          ) : (
                            <span className="text-white/80 text-lg">{"\u2014"}</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
