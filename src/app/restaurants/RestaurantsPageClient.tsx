"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { BestMatchExplorer } from "@/components/RestaurantDiscovery/BestMatchExplorer";
import { RateDishModal } from "@/components/RestaurantDiscovery/RateDishModal";

export default function RestaurantsPageClient() {
  const params = useSearchParams();
  const initial = params?.get("cuisine") ?? "";
  const orderStatus = params?.get("order") ?? "";
  const orderRestaurant = params?.get("restaurant") ?? "";
  const orderDish = params?.get("dish") ?? "";
  const orderId = params?.get("order_id") ?? "";
  const onboardingStatus = params?.get("onboarding") ?? "";
  const [isRatingOpen, setIsRatingOpen] = useState(false);

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

        {orderStatus === "success" ? (
          <div
            className="mb-6 rounded-2xl border border-emerald-400/30 bg-gradient-to-br from-emerald-950/40 via-emerald-900/20 to-[#0c0c14] p-5 shadow-xl shadow-emerald-950/30"
            role="status"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-300">
                  <span aria-hidden>✓</span> Order Placed Successfully
                </div>
                <h2 className="text-base font-extrabold text-white mt-1">
                  Enjoy your {orderDish ? `order of ${orderDish}` : "meal"}
                  {orderRestaurant ? ` from ${orderRestaurant}` : ""}!
                </h2>
                <p className="text-xs text-white/60 mt-0.5">
                  Rate your dish to help the community and automatically track how it felt in your Food Diary.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsRatingOpen(true)}
                className="shrink-0 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-stone-950 text-xs font-black uppercase tracking-wider shadow-lg shadow-amber-900/20 hover:brightness-110 transition-all flex items-center gap-2"
              >
                <span aria-hidden>⭐</span> Rate Your Dish
              </button>
            </div>
          </div>
        ) : orderStatus ? (
          <div
            className="mb-6 rounded-2xl border border-amber-400/30 bg-amber-500/10 p-4 text-sm text-amber-100"
            role="status"
          >
            <span className="font-bold">⚠️ </span>
            Order checkout was canceled{orderRestaurant ? ` for ${orderRestaurant}` : ""}.
          </div>
        ) : null}

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

        {isRatingOpen && (
          <RateDishModal
            restaurant={{
              id: orderRestaurant
                ? `restaurant_${orderRestaurant.toLowerCase().replace(/[^a-z0-9]/g, "_")}`
                : "partner_order",
              name: orderRestaurant || "Restaurant Order",
              cuisine: initial || "General",
            }}
            {...(orderDish ? { initialDishName: orderDish } : {})}
            {...(orderId ? { orderId } : {})}
            onClose={() => setIsRatingOpen(false)}
          />
        )}
      </div>
    </main>
  );
}
