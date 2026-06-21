"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { FeaturedRecipe } from "@/components/home/FeaturedRecipe";
import {
  cryptoFoodCheckoutEnabled,
  onchainEsmsEnabled,
} from "@/lib/payments/cryptoPromo";

const TOKENS = [
  {
    symbol: "\u{1F747}",
    name: "Spirit",
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
    description: "Powers cosmic recipe generation",
  },
  {
    symbol: "\u{1F751}",
    name: "Essence",
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20",
    description: "Fuels cuisine recommendations",
  },
  {
    symbol: "\u{1F759}",
    name: "Matter",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
    description: "Earned by shopping ingredients",
  },
  {
    symbol: "\u{1F749}",
    name: "Substance",
    color: "text-purple-400",
    bg: "bg-purple-500/10 border-purple-500/20",
    description: "Refines and perfects recipes",
  },
] as const;

export function Promotion() {
  // Only advertise crypto/on-chain rails that are actually live in this
  // deployment. Off by default → the promo can never promise a flow that
  // doesn't work. The off-chain ESMS welcome grant + token economy below are
  // live regardless and are always shown.
  const cryptoCheckout = cryptoFoodCheckoutEnabled();
  const onchainEsms = onchainEsmsEnabled();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 90, damping: 20, delay: 0.1 }}
      className="relative rounded-3xl overflow-hidden border border-purple-500/20 bg-[#0a0f0a]/90 backdrop-blur-xl shadow-2xl shadow-purple-900/10"
    >
      {/* Ambient glows */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-600/8 rounded-full blur-[100px] pointer-events-none -ml-20 -mb-20" />
      <div className="absolute top-1/2 left-1/3 w-60 h-60 bg-emerald-600/5 rounded-full blur-[120px] pointer-events-none -translate-y-1/2" />

      <div className="relative z-10 p-6 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 md:gap-8">
          
          {/* Left Column: Tech Week Promo & Tokens (Span 3) */}
          <div className="lg:col-span-3 space-y-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="text-[10px] font-bold tracking-widest text-purple-400/80 uppercase">
                  New member welcome
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-[9px] font-extrabold text-purple-400 uppercase tracking-wide animate-pulse">
                  Available now
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[9px] font-extrabold text-amber-400 uppercase tracking-wide">
                  +60 ESMS Welcome Grant
                </span>
                {onchainEsms && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[9px] font-extrabold text-cyan-400 uppercase tracking-wide">
                    New · On-Chain ESMS
                  </span>
                )}
              </div>
              <h2 className="text-xl md:text-3xl font-black text-white/95 leading-tight tracking-tight">
                Start with 60 ESMS tokens
              </h2>
              <p className="mt-2 text-xs md:text-sm text-white/50 leading-relaxed max-w-xl">
                Alchm Kitchen balances four primary alchemical elements to match recipes with your birth chart and the live sky. Create an account to receive a welcome grant of{" "}
                <strong className="text-white/80">60 ESMS tokens</strong> (15 of each: Spirit, Essence, Matter, Substance) to immediately begin your cosmic culinary journey.
                {onchainEsms && (
                  <>
                    {" "}Your ESMS now lives{" "}
                    <strong className="text-white/80">on-chain</strong> — claim it to
                    your Base wallet
                    {cryptoCheckout && (
                      <>
                        {" "}and check out real food with{" "}
                        <strong className="text-white/80">USDC</strong>
                      </>
                    )}
                    .
                  </>
                )}
                {!onchainEsms && cryptoCheckout && (
                  <>
                    {" "}Check out real restaurant food with{" "}
                    <strong className="text-white/80">USDC</strong>, settled on-chain.
                  </>
                )}
              </p>
            </div>

            {/* Token Cards Grid */}
            <div className="grid grid-cols-2 gap-3">
              {TOKENS.map((t) => (
                <div
                  key={t.name}
                  className={`flex flex-col items-start gap-0.5 px-4 py-3 rounded-2xl border ${t.bg} hover:scale-[1.02] hover:brightness-110 transition-all duration-200`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className={`text-lg ${t.color}`}>{t.symbol}</span>
                    <span className={`text-xs font-extrabold tracking-wide ${t.color}`}>{t.name}</span>
                  </div>
                  <div className="text-[10px] text-white/40 mt-0.5 leading-normal">
                    {t.description}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: New User-Facing Features (Span 2) */}
          <div className="lg:col-span-2 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-white/50 tracking-widest uppercase mb-1">
                What you can do
              </h3>

              {/* Feature: Web3 crypto food checkout */}
              {cryptoCheckout && (
                <div className="p-3.5 rounded-2xl bg-cyan-500/[0.04] border border-cyan-500/20 hover:border-cyan-500/35 transition-all duration-200 flex items-start gap-3">
                  <span className="text-xl p-1 bg-cyan-500/10 rounded-lg text-cyan-400">🪙</span>
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-white/90">Pay for Food with Crypto</h4>
                    <p className="text-[10px] text-white/40 leading-relaxed">
                      Check out real restaurant orders with USDC — settled on-chain, with card always available as a fallback.
                    </p>
                  </div>
                </div>
              )}

              {/* Feature 1 */}
              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-purple-500/10 transition-all duration-200 flex items-start gap-3">
                <span className="text-xl p-1 bg-purple-500/10 rounded-lg text-purple-400">⚗️</span>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-white/90">Smart Lab Book Ingestion</h4>
                  <p className="text-[10px] text-white/40 leading-relaxed">
                    Paste text or snap a recipe photo to extract its alchemical signature, save it to your cookbook, and earn ESMS milestone rewards.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-blue-500/10 transition-all duration-200 flex items-start gap-3">
                <span className="text-xl p-1 bg-blue-500/10 rounded-lg text-blue-400">🔌</span>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-white/90">Developer API Keys & MCP</h4>
                  <p className="text-[10px] text-white/40 leading-relaxed">
                    Mint keys in your profile to connect local AI environments (Cursor, Claude) directly to your alchemical kitchen data.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-emerald-500/10 transition-all duration-200 flex items-start gap-3">
                <span className="text-xl p-1 bg-emerald-500/10 rounded-lg text-emerald-400">🛒</span>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-white/90">Shop Amazon Fresh & Earn</h4>
                  <p className="text-[10px] text-white/40 leading-relaxed">
                    Integrate ingredients directly with your shopping cart, purchase items natively, and automatically earn Matter tokens.
                  </p>
                </div>
              </div>
            </div>

            {/* Note */}
            <p className="text-[10px] text-white/30 leading-relaxed">
              <span className="text-purple-400/80 font-bold">Personalized rates:</span> Token costs fluctuate with the sky. Aligning your schedule with daily cosmic transits lowers costs and stretches your grant.
            </p>
          </div>
        </div>

        {/* Action CTAs (Keeping all original promotional links) */}
        <div className="flex flex-wrap gap-3 pt-6 mt-6 border-t border-white/[0.04]">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 hover:border-purple-500/50 text-purple-300 font-semibold text-sm transition-all duration-200 group"
          >
            Sign In & Start Earning
            <span className="group-hover:translate-x-1 transition-transform duration-200">&rarr;</span>
          </Link>

          <Link
            href="/lab-book"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-purple-500/5 hover:bg-purple-500/10 border border-purple-500/10 hover:border-purple-500/20 text-purple-400/90 font-semibold text-sm transition-all duration-200 group"
          >
            ✨ Open Lab Book
            <span className="group-hover:translate-x-1 transition-transform duration-200">&rarr;</span>
          </Link>

          {/* Web3 crypto food checkout */}
          {cryptoCheckout && (
            <Link
              href="/restaurants"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/25 hover:border-cyan-500/40 text-cyan-300 font-semibold text-sm transition-all duration-200 group"
            >
              <span>🪙</span>
              Order Food — Pay with USDC
              <span className="group-hover:translate-x-1 transition-transform duration-200">&rarr;</span>
            </Link>
          )}

          {/* Amazon shopping — primary revenue source, exact original promotional link */}
          <Link
            href="/ingredients"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 hover:border-emerald-500/40 text-emerald-300 font-semibold text-sm transition-all duration-200 group md:ml-auto"
          >
            <span>🛒</span>
            Shop Amazon Ingredients & Earn
            <span className="group-hover:translate-x-1 transition-transform duration-200">&rarr;</span>
          </Link>
        </div>

        {/* Featured Recipe of the Month */}
        <FeaturedRecipe />
      </div>
    </motion.div>
  );
}
