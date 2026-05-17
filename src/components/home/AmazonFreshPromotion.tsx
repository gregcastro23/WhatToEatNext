"use client";

import { motion } from "framer-motion";
import Link from "next/link";

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

const HOW_IT_WORKS = [
  { icon: "🌙", text: "Sign in & enter your birth data" },
  { icon: "⚗️", text: "Earn daily tokens from your Cosmic Yield" },
  { icon: "🍽️", text: "Spend tokens on personalized recipes & recs" },
];

export function AmazonFreshPromotion() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 90, damping: 20, delay: 0.1 }}
      className="relative rounded-3xl overflow-hidden border border-purple-500/20 bg-[#0a0f0a]/80 backdrop-blur-xl shadow-2xl shadow-purple-900/10"
    >
      {/* Ambient glows */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/8 rounded-full blur-[100px] pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-600/6 rounded-full blur-[100px] pointer-events-none -ml-20 -mb-20" />

      <div className="relative z-10 p-6 md:p-8">
        {/* Header */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold tracking-widest text-purple-400/80 uppercase">
              Cosmic Token Economy
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-[10px] font-bold text-purple-400">
              No hard limits
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white/90 leading-tight">
            Your Natal Chart Powers Everything
          </h2>
          <p className="mt-1.5 text-sm text-white/40 leading-relaxed max-w-lg">
            Alchm Kitchen runs on four cosmic tokens:{" "}
            <span className="text-violet-400 font-semibold">Spirit</span>,{" "}
            <span className="text-blue-400 font-semibold">Essence</span>,{" "}
            <span className="text-emerald-400 font-semibold">Matter</span>, and{" "}
            <span className="text-amber-400 font-semibold">Substance</span>.
            Your natal chart and the current sky determine both what you earn
            daily and what each action costs — so your experience is always
            unique to you.
          </p>
        </div>

        {/* Token cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {TOKENS.map((t) => (
            <div
              key={t.name}
              className={`flex flex-col items-start gap-1 px-4 py-3 rounded-2xl border ${t.bg} hover:brightness-125 transition-all`}
            >
              <div className="flex items-center gap-1.5">
                <span className={`text-lg ${t.color}`}>{t.symbol}</span>
                <span className={`text-sm font-bold ${t.color}`}>{t.name}</span>
              </div>
              <div className="text-[10px] text-white/30">{t.description}</div>
            </div>
          ))}
        </div>

        {/* How it works */}
        <div className="flex flex-wrap gap-x-6 gap-y-2 mb-6">
          {HOW_IT_WORKS.map((step, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-white/40">
              <span>{step.icon}</span>
              <span>{step.text}</span>
              {i < HOW_IT_WORKS.length - 1 && (
                <span className="text-white/20 hidden md:inline">&rarr;</span>
              )}
            </div>
          ))}
        </div>

        {/* Personalized pricing note */}
        <div className="mb-6 p-4 rounded-2xl bg-white/[0.03] border border-purple-500/10">
          <p className="text-xs text-white/50 leading-relaxed">
            <span className="text-purple-400 font-semibold">Personalized pricing:</span>{" "}
            Token costs shift with the planets. When your natal chart resonates
            with today&apos;s sky, actions cost less — work with the cosmic grain
            and stretch your tokens further. New users receive a welcome grant of
            5 tokens each to start exploring.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-wrap gap-3">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 hover:border-purple-500/50 text-purple-300 font-semibold text-sm transition-all duration-200 group"
          >
            Sign In & Start Earning
            <span className="group-hover:translate-x-1 transition-transform duration-200">&rarr;</span>
          </Link>

          {/* Amazon shopping — primary revenue source */}
          <Link
            href="/ingredients"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 hover:border-emerald-500/40 text-emerald-300 font-semibold text-sm transition-all duration-200 group"
          >
            <span className="text-base">🛒</span>
            Shop Amazon Ingredients & Earn
            <span className="group-hover:translate-x-1 transition-transform duration-200">&rarr;</span>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
