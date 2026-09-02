"use client";

import Link from "next/link";
import { useState } from "react";

// Real recipe-NFT protocol wiring for the ledger showcase
const REGISTRY_ADDRESS = process.env.NEXT_PUBLIC_RECIPE_REGISTRY_ADDRESS ?? "";
const RIGHTS_ID = process.env.NEXT_PUBLIC_ALCHM_RIGHTS_ID ?? "";
const IS_TESTNET = (process.env.NEXT_PUBLIC_RECIPE_NFT_CHAIN ?? "base-sepolia") !== "base";
const NFT_ENABLED =
  process.env.NEXT_PUBLIC_RECIPE_NFT_ENABLED === "true" && Boolean(REGISTRY_ADDRESS) && Boolean(RIGHTS_ID);
const CHAIN_LABEL = IS_TESTNET ? "Base Sepolia" : "Base";
const EXPLORER_BASE = IS_TESTNET ? "https://sepolia.basescan.org" : "https://basescan.org";

export function RecipeMintPromo() {
  const [copiedAddress, setCopiedAddress] = useState(false);

  const handleCopyAddress = () => {
    if (!REGISTRY_ADDRESS) return;
    navigator.clipboard.writeText(REGISTRY_ADDRESS);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  return (
    <div className="relative rounded-3xl overflow-hidden border border-amber-500/25 bg-gradient-to-br from-[#0c0a0f]/90 via-[#080b12]/95 to-[#06080b]/90 p-6 sm:p-8 md:p-10 shadow-2xl shadow-cyan-950/20">
      {/* Background radial atmosphere */}
      <div className="absolute -top-24 -left-16 w-80 h-80 bg-amber-500/10 rounded-full blur-[110px] pointer-events-none" />
      <div className="absolute -bottom-24 -right-16 w-80 h-80 bg-cyan-500/10 rounded-full blur-[110px] pointer-events-none" />

      <div className="relative z-10 space-y-8">
        {/* Badges & Eyebrow */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-[10px] font-extrabold text-cyan-300 uppercase tracking-widest">
              ⛓ Base On-Chain Ledger
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-[10px] font-extrabold text-amber-300 uppercase tracking-widest">
              🪙 100% Gasless &amp; Sponsored
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-extrabold text-emerald-400 uppercase tracking-widest">
              VA 2-434-962 Rights Anchor
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-white/50">
            {NFT_ENABLED ? (
              <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Registry Live on {CHAIN_LABEL}
              </span>
            ) : (
              <span className="text-amber-400 font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                {CHAIN_LABEL} Protocol
              </span>
            )}
          </div>
        </div>

        {/* Hero Copy */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-white to-cyan-200 tracking-tight leading-[1.15]">
              Have a favorite recipe you want to mint?
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-cyan-300">
                Prove it’s yours forever.
              </span>
            </h2>
            <p className="text-sm md:text-base text-white/70 leading-relaxed max-w-2xl">
              Every chef and home cook carries a signature formulation. Don’t let your culinary genius vanish into algorithms or ephemeral feeds. Anchor your recipe’s immutable content hash to the Base blockchain with authentic elemental thermodynamics, permanent creator attribution, and automatic rights protection.
            </p>
          </div>

          {/* Quick CTA Card */}
          <div className="lg:col-span-4 rounded-2xl border border-cyan-500/25 bg-[#05080c]/90 p-5 space-y-4 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-[50px] pointer-events-none" />
            <div className="relative z-10 space-y-3">
              <span className="text-[10px] font-mono text-cyan-300 uppercase tracking-widest font-bold">
                Quick Action · Zero Gas
              </span>
              <h3 className="text-lg font-bold text-white leading-snug">
                Claim Culinary Immortality
              </h3>
              <p className="text-xs text-white/60 leading-relaxed">
                Conjure from celestial transits or enter your secret recipe to register your on-chain ownership.
              </p>
              <div className="pt-2 flex flex-col gap-2.5">
                <Link
                  href="/cosmic-recipe"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-xs tracking-wide shadow-lg shadow-amber-900/30 transition-all duration-200 transform hover:-translate-y-0.5"
                >
                  ✨ Conjure &amp; Mint Your Recipe
                  <span>&rarr;</span>
                </Link>
                <Link
                  href="/kitchen-lab"
                  className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 text-white/80 font-bold text-xs transition-all duration-200"
                >
                  ⚗️ Extract Recipe Signature in Lab
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {/* Pillar 1 */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 space-y-2.5 hover:border-amber-500/30 transition-colors duration-300">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-base">
              🔐
            </div>
            <h4 className="text-sm font-bold text-white">Cryptographic Authorship</h4>
            <p className="text-xs text-white/55 leading-relaxed">
              Your exact ingredients, ratios, and steps form an immutable cryptographic hash on Base, permanently sealing your creation date and author identity.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 space-y-2.5 hover:border-cyan-500/30 transition-colors duration-300">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-base">
              ⚗️
            </div>
            <h4 className="text-sm font-bold text-white">Elemental Physics</h4>
            <p className="text-xs text-white/55 leading-relaxed">
              Calculates your recipe’s A# harmonic weight, Monica constant, and Fire/Earth/Water/Air signature so your dish is mathematically characterized.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 space-y-2.5 hover:border-emerald-500/30 transition-colors duration-300">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-base">
              ⛽
            </div>
            <h4 className="text-sm font-bold text-white">100% Sponsored Gas</h4>
            <p className="text-xs text-white/55 leading-relaxed">
              No cryptocurrency or complex wallet setup needed. The Alchm backend sponsors all Base network gas fees for your culinary mints.
            </p>
          </div>

          {/* Pillar 4 */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 space-y-2.5 hover:border-purple-500/30 transition-colors duration-300">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-base">
              📜
            </div>
            <h4 className="text-sm font-bold text-white">Perpetual Attribution</h4>
            <p className="text-xs text-white/55 leading-relaxed">
              Protected by Alchm VA 2-434-962 licensing. 5% creator attribution and fork lineage travel with your dish across any kitchen or commensal lobby.
            </p>
          </div>
        </div>

        {/* Ledger Technical Telemetry Bar */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#05070a]/90 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono text-[11px] text-white/70">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <div>
              <span className="text-white/35 uppercase text-[9px] block">Chain</span>
              <span className="text-cyan-300 font-bold">{CHAIN_LABEL} L2</span>
            </div>
            <div>
              <span className="text-white/35 uppercase text-[9px] block">Rights Registry</span>
              {REGISTRY_ADDRESS ? (
                <a
                  href={`${EXPLORER_BASE}/address/${REGISTRY_ADDRESS}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-300 hover:text-cyan-200 transition-colors inline-flex items-center gap-1"
                  title={REGISTRY_ADDRESS}
                >
                  {REGISTRY_ADDRESS.substring(0, 8)}…{REGISTRY_ADDRESS.substring(REGISTRY_ADDRESS.length - 6)}
                  <span className="text-[10px]">↗</span>
                </a>
              ) : (
                <span className="text-white/40">Active Deploy</span>
              )}
            </div>
            <div>
              <span className="text-white/35 uppercase text-[9px] block">Rights Anchor</span>
              <span className="text-amber-300 font-semibold">{RIGHTS_ID ? `${RIGHTS_ID.substring(0, 10)}…` : "VA 2-434-962"}</span>
            </div>
            <div>
              <span className="text-white/35 uppercase text-[9px] block">Standard</span>
              <span className="text-white/90">Alchm ERC-721</span>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            {REGISTRY_ADDRESS && (
              <button
                type="button"
                onClick={handleCopyAddress}
                className="px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-white/80 hover:text-white transition-colors text-[10px] font-sans font-bold"
              >
                {copiedAddress ? "✓ Copied Contract" : "Copy Registry"}
              </button>
            )}
            <Link
              href="/recipe-builder"
              className="px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/25 text-cyan-300 hover:text-cyan-200 transition-colors text-[10px] font-sans font-bold"
            >
              Recipe Builder →
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

// Alias for backwards compatibility with any existing imports
export const FeaturedRecipe = RecipeMintPromo;
