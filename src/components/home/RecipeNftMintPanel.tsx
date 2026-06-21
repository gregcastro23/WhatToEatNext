"use client";

import { useEffect, useMemo, useState } from "react";
import { featuredRecipe } from "@/data/featuredRecipe";
import { mintRecipe, mintResultMessage } from "@/lib/recipe-nft/mintClient";

/** Coin display config — glyphs/colors match the ESMS token cards in the Promotion. */
const COINS = [
  { key: "spirit", token: "Spirit", element: "Fire", glyph: "\u{1F747}", text: "text-amber-300", bar: "bg-amber-400" },
  { key: "essence", token: "Essence", element: "Water", glyph: "\u{1F751}", text: "text-blue-300", bar: "bg-blue-400" },
  { key: "matter", token: "Matter", element: "Earth", glyph: "\u{1F759}", text: "text-emerald-300", bar: "bg-emerald-400" },
  { key: "substance", token: "Substance", element: "Air", glyph: "\u{1F749}", text: "text-purple-300", bar: "bg-purple-400" },
] as const;

type CoinKey = (typeof COINS)[number]["key"];
type Token = (typeof COINS)[number]["token"];
type CoinAmounts = Record<CoinKey, number>;

interface QuoteResponse {
  recipeId: string;
  title: string;
  enabled: boolean;
  fingerprint: {
    aSharp: number;
    totals: CoinAmounts;
    physics: { kalchm: number; monica: number; heat: number; entropy: number; reactivity: number; gregsEnergy: number };
    matchRate: number;
  };
  quote: {
    baseCost: CoinAmounts;
    liveCost: CoinAmounts;
    redistributePreview: Record<Token, CoinAmounts>;
    pricing: { multiplier: number; dominantElement: string; timestamp: string };
    swap: { rulingHourPlanet: string; rulingDayPlanet: string };
  };
}

const sum = (c: CoinAmounts) => c.spirit + c.essence + c.matter + c.substance;
const fmt = (n: number) => n.toFixed(2);

const PHYSICS_CHIPS = [
  { key: "kalchm", label: "Kalchm" },
  { key: "monica", label: "Monica" },
  { key: "heat", label: "Heat" },
  { key: "entropy", label: "Entropy" },
  { key: "reactivity", label: "Reactivity" },
  { key: "gregsEnergy", label: "Greg's Energy" },
] as const;

/**
 * "Mint this recipe as an NFT" — the Promotion's headline mechanic. Minting
 * spends ESMS in all four coins equal to the recipe's summed ingredient values,
 * priced live by the sky. Premium members can shift the cost toward their
 * chart's dominant coin (chart-weighted redistribution). The full alchemical
 * fingerprint (ESMS totals + physics) is what gets committed into the NFT.
 */
export function RecipeNftMintPanel() {
  const [data, setData] = useState<QuoteResponse | null>(null);
  const [error, setError] = useState(false);
  const [dominant, setDominant] = useState<Token | null>(null);
  const [minting, setMinting] = useState(false);
  const [mintMsg, setMintMsg] = useState<string | null>(null);

  const handleMint = async () => {
    setMinting(true);
    setMintMsg(null);
    const result = await mintRecipe(featuredRecipe);
    setMintMsg(mintResultMessage(result));
    setMinting(false);
  };

  useEffect(() => {
    let active = true;
    fetch("/api/recipes/featured/mint-quote")
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((j) => active && setData(j))
      .catch(() => active && setError(true));
    return () => {
      active = false;
    };
  }, []);

  const displayCost: CoinAmounts | null = useMemo(() => {
    if (!data) return null;
    if (dominant) return data.quote.redistributePreview[dominant];
    return data.quote.liveCost;
  }, [data, dominant]);

  return (
    <div className="mt-6 rounded-2xl overflow-hidden border border-cyan-500/25 bg-gradient-to-br from-[#06090c]/80 to-[#0a0f0a]/60 p-5 md:p-6 relative">
      <div className="absolute -top-16 -left-10 w-56 h-56 bg-cyan-600/10 rounded-full blur-[90px] pointer-events-none" />
      <div className="relative z-10">
        {/* Header */}
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[9px] font-extrabold text-cyan-300 uppercase tracking-widest">
            ⛓ Mint as an NFT
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-bold text-white/60 uppercase tracking-wide">
            Alchm Recipe License · 5% royalty
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-bold text-white/45 uppercase tracking-wide">
            on Base
          </span>
        </div>

        <h4 className="text-base md:text-xl font-black text-white/95 leading-tight tracking-tight">
          Mint this recipe as an on-chain NFT
        </h4>
        <p className="mt-1.5 text-xs text-white/50 leading-relaxed max-w-2xl">
          Minting spends ESMS across all four coins, equal to the recipe&apos;s
          summed ingredient values — priced live by the sky. Its full alchemical
          fingerprint is committed immutably into the token.
        </p>

        {error && (
          <p className="mt-4 text-xs text-red-400/80">Couldn&apos;t load the live mint quote. Please try again shortly.</p>
        )}

        {!data && !error && (
          <div className="mt-5 h-24 rounded-xl bg-white/[0.02] border border-white/5 animate-pulse" />
        )}

        {data && displayCost && (
          <>
            {/* Recipe # + live cost */}
            <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Recipe #</div>
                <div className="text-2xl font-black text-cyan-300 leading-none">{fmt(data.fingerprint.aSharp)}</div>
                <div className="text-[10px] text-white/35 mt-0.5">summed ingredient ESMS</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                  {dominant ? `Premium · weighted to ${dominant}` : "Live mint cost"}
                </div>
                <div className="text-xl font-black text-white/90 leading-none">{fmt(sum(displayCost))} <span className="text-sm text-white/50">ESMS</span></div>
                <div className="text-[10px] text-white/35 mt-0.5">
                  under {data.quote.swap.rulingHourPlanet}&apos;s hour · ×{data.quote.pricing.multiplier.toFixed(2)} sky
                </div>
              </div>
            </div>

            {/* Per-coin cost */}
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {COINS.map((c) => {
                const base = data.quote.liveCost[c.key];
                const shown = displayCost[c.key];
                const changed = dominant && Math.abs(shown - base) > 0.005;
                return (
                  <div key={c.key} className="rounded-xl bg-white/[0.02] border border-white/5 px-3 py-2.5">
                    <div className={`flex items-center gap-1.5 ${c.text}`}>
                      <span className="text-base">{c.glyph}</span>
                      <span className="text-[11px] font-extrabold tracking-wide">{c.token}</span>
                    </div>
                    <div className="mt-1 text-sm font-bold text-white/90">{fmt(shown)}</div>
                    {changed && (
                      <div className="text-[9px] text-white/35 line-through">{fmt(base)}</div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Premium chart-weighted redistribution */}
            <div className="mt-4 rounded-xl bg-purple-500/[0.04] border border-purple-500/15 p-3.5">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/25 text-[9px] font-extrabold text-purple-300 uppercase tracking-wide">
                  Premium
                </span>
                <span className="text-[11px] font-bold text-white/55">Pay with the coin your chart favors</span>
              </div>
              <p className="text-[10px] text-white/40 leading-relaxed mb-2.5">
                Premium members shift the cost toward their chart&apos;s dominant coin (converted at live swap rates), leaning on what they hold most. Preview:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {COINS.map((c) => (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => setDominant(dominant === c.token ? null : c.token)}
                    className={`px-2.5 py-1 rounded-lg border text-[10px] font-bold transition-all ${
                      dominant === c.token
                        ? "bg-purple-500/20 border-purple-500/50 text-purple-200"
                        : "bg-white/[0.02] border-white/10 text-white/50 hover:border-white/20"
                    }`}
                  >
                    {c.glyph} {c.element} → {c.token}
                  </button>
                ))}
              </div>
            </div>

            {/* Embedded fingerprint: physics */}
            <details className="mt-4 group">
              <summary className="cursor-pointer list-none text-[11px] font-bold text-white/45 uppercase tracking-widest hover:text-white/65 transition-colors">
                Alchemical fingerprint (embedded in the NFT) <span className="group-open:hidden">▾</span><span className="hidden group-open:inline">▴</span>
              </summary>
              <div className="mt-2.5 grid grid-cols-2 sm:grid-cols-3 gap-2">
                {PHYSICS_CHIPS.map((p) => (
                  <div key={p.key} className="rounded-lg bg-white/[0.02] border border-white/5 px-2.5 py-1.5">
                    <div className="text-[9px] text-white/35 uppercase tracking-wide">{p.label}</div>
                    <div className="text-xs font-bold text-white/80">{data.fingerprint.physics[p.key].toFixed(3)}</div>
                  </div>
                ))}
              </div>
            </details>

            {/* CTA */}
            <div className="mt-5">
              {data.enabled ? (
                <button
                  type="button"
                  onClick={() => { void handleMint(); }}
                  disabled={minting}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/35 hover:border-cyan-500/55 text-cyan-200 font-semibold text-sm transition-all duration-200 group disabled:opacity-60"
                >
                  {minting ? "Minting…" : `⛓ Mint for ${fmt(sum(displayCost))} ESMS`}
                  <span className="group-hover:translate-x-1 transition-transform duration-200">&rarr;</span>
                </button>
              ) : (
                <div className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/[0.03] border border-white/10 text-white/55 font-semibold text-sm cursor-default">
                  <span className="w-2 h-2 rounded-full bg-cyan-400/70 animate-pulse" />
                  Minting goes live when the protocol deploys to Base · U.S. Copyright VA 2-434-962
                </div>
              )}
              {mintMsg && (
                <p className="mt-2.5 text-[11px] text-cyan-200/80 leading-relaxed">{mintMsg}</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
