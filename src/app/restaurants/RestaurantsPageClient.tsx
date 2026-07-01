"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { BestMatchExplorer } from "@/components/RestaurantDiscovery/BestMatchExplorer";

export default function RestaurantsPageClient() {
  const params = useSearchParams();
  const initial = params?.get("cuisine") ?? "";
  const orderStatus = params?.get("order") ?? "";
  const orderRestaurant = params?.get("restaurant") ?? "";
  const onboardingStatus = params?.get("onboarding") ?? "";

  return (
    <main className="min-h-screen bg-[#08080e] text-white relative overflow-hidden">
      {/* Ambient cosmic glow */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[180px] pointer-events-none" />
      <div className="absolute top-32 right-1/4 w-[500px] h-[500px] bg-rose-600/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 pt-8 pb-16">
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/cuisines"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-white/60 hover:text-purple-300 transition-colors"
          >
            <span aria-hidden>←</span> Back to cuisines
          </Link>
          <Link
            href={
              initial
                ? `/recipes?cuisine=${encodeURIComponent(initial.toLowerCase())}`
                : "/recipes"
            }
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-400/30 text-amber-200 text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all"
          >
            <span aria-hidden>🥘</span> Cook It instead
          </Link>
        </div>

        {orderStatus && (
          <div
            className={`mb-6 rounded-2xl border p-4 text-sm ${
              orderStatus === "success"
                ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-100"
                : "border-amber-400/30 bg-amber-500/10 text-amber-100"
            }`}
            role="status"
          >
            <span className="font-bold">
              {orderStatus === "success" ? "✓ " : "⚠️ "}
            </span>
            {orderStatus === "success"
              ? `Order checkout completed${orderRestaurant ? ` for ${orderRestaurant}` : ""}.`
              : `Order checkout was canceled${orderRestaurant ? ` for ${orderRestaurant}` : ""}.`}
          </div>
        )}

        {onboardingStatus && (
          <div
            className={`mb-6 rounded-2xl border p-4 text-sm ${
              onboardingStatus === "success"
                ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-100"
                : "border-amber-400/30 bg-amber-500/10 text-amber-100"
            }`}
            role="status"
          >
            {onboardingStatus === "success"
              ? "Restaurant payout onboarding submitted. Stripe will update the account status as requirements are completed."
              : "Restaurant onboarding needs to be refreshed. Reopen the onboarding link to continue."}
          </div>
        )}

        <BestMatchExplorer initialCuisine={initial} />
      </div>
    </main>
  );
}
