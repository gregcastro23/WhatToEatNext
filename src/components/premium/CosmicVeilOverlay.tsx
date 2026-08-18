"use client";

import React, { useState } from "react";
import { usePremium } from "@/contexts/PremiumContext";

/**
 * CosmicVeilOverlay
 * Rendered over the blurred locked recipe skeleton. Handles user click
 * to upgrade/transcend their subscription plan via Stripe.
 *
 * @file src/components/premium/CosmicVeilOverlay.tsx
 */
export function CosmicVeilOverlay() {
  const { openCheckout } = usePremium();
  const [loading, setLoading] = useState(false);

  const handleTranscend = async (trial: boolean) => {
    try {
      setLoading(true);
      await openCheckout("premium", { trial });
    } catch (e) {
      console.error("Upgrade checkout failed:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center max-w-md p-8 md:p-10 text-center border rounded-3xl bg-[#0b0b14]/80 border-purple-500/20 shadow-[0_0_50px_rgba(168,85,247,0.15)] backdrop-blur-xl transition-all duration-300 hover:border-purple-500/30">
      {/* Astro/Alchemical Icon */}
      <div className="relative mb-6 flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-amber-500/10 to-purple-500/10 border border-purple-500/30 shadow-[0_0_20px_rgba(245,158,11,0.1)]">
        <span className="text-3xl animate-pulse select-none text-amber-300">✨</span>
      </div>

      <h3 className="mb-3 font-serif text-3xl tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-orange-300 to-purple-300 font-semibold leading-tight">
        Unlock the Cosmos
      </h3>
      
      <p className="mb-8 text-sm leading-relaxed text-zinc-400 font-medium max-w-sm">
        Your daily celestial alignment is complete. Upgrade to Alchemist tier to synthesize unlimited recipes, forecast upcoming transits, and perpetually sync your changing daily token yields to the celestial pantry.
      </p>

      {/* CTA Buttons */}
      <div className="w-full space-y-3">
        <button 
          disabled={loading}
          onClick={() => { void handleTranscend(true); }}
          className="w-full py-4 text-xs font-bold tracking-widest text-black uppercase transition-all duration-300 rounded-full bg-gradient-to-r from-amber-300 via-orange-400 to-purple-400 hover:from-amber-200 hover:via-orange-300 hover:to-purple-300 shadow-[0_0_25px_rgba(245,158,11,0.2)] hover:shadow-[0_0_35px_rgba(245,158,11,0.3)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? "COMMUNING..." : "TRY PREMIUM FREE FOR 7 DAYS"}
        </button>

        <button 
          disabled={loading}
          onClick={() => { void handleTranscend(false); }}
          className="w-full py-3.5 text-xs font-bold tracking-widest text-white/80 uppercase transition-all duration-300 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white hover:scale-[1.01]"
        >
          INSTANT TRANSCENDENCE
        </button>
      </div>

      {/* Subtle details */}
      <p className="mt-5 text-[10px] tracking-wider text-zinc-500 uppercase">
        7-Day Free Trial included · Cancel anytime with 1-click
      </p>
    </div>
  );
}
