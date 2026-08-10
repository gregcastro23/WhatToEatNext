/**
 * Alchm ESMS Token Vault & Economy Hub
 *
 * Displays live ESMS token balances (Spirit, Essence, Matter, Substance),
 * tool token costs, daily Cosmic Yield claim status, and token top-up options.
 *
 * @file src/app/premium/page.tsx
 */

"use client";

import { useSession } from "next-auth/react";
import React, { useEffect, useState, Suspense } from "react";
import { FEATURE_TOKEN_COSTS } from "@/types/subscription";

interface TokenBalances {
  spirit: number;
  essence: number;
  matter: number;
  substance: number;
}

function PremiumPageContent() {
  const { data: session, status: authStatus } = useSession();
  const [balances, setBalances] = useState<TokenBalances>({
    spirit: 0,
    essence: 0,
    matter: 0,
    substance: 0,
  });
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [claimMessage, setClaimMessage] = useState<string | null>(null);

  const fetchBalances = async () => {
    if (!session?.user) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/economy/balances");
      if (res.ok) {
        const data = await res.json();
        if (data.balances) {
          setBalances(data.balances);
        }
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchBalances();
  }, [session]);

  const handleClaimDaily = async () => {
    setClaiming(true);
    setClaimMessage(null);
    try {
      const res = await fetch("/api/economy/claim-daily", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.success) {
        setClaimMessage(data.message || "✨ Daily Cosmic Yield collected!");
        void fetchBalances();
      } else {
        setClaimMessage(data.message || "Could not claim daily yield today.");
      }
    } catch {
      setClaimMessage("Failed to connect to economy service.");
    } finally {
      setClaiming(false);
    }
  };

  if (authStatus === "loading" || loading) {
    return (
      <div className="min-h-screen bg-[#08080e] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60 font-medium">Opening Token Vault...</p>
        </div>
      </div>
    );
  }

  const totalTokens =
    balances.spirit + balances.essence + balances.matter + balances.substance;

  return (
    <div className="min-h-screen bg-[#08080e] text-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold uppercase tracking-wider mb-4">
            ✨ Web3 ESMS Token Economy
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-3 bg-gradient-to-r from-purple-400 via-amber-400 to-orange-400 bg-clip-text text-transparent">
            Alchm ESMS Token Vault
          </h1>
          <p className="text-lg text-white/60 max-w-xl mx-auto">
            Use your Spirit, Essence, Matter, and Substance tokens to access all
            Alchm kitchen tools. Claim your daily Cosmic Yield to top up your balance.
          </p>
        </div>

        {/* Claim Message Notification */}
        {claimMessage && (
          <div className="mb-8 p-4 rounded-xl text-center font-medium bg-purple-900/40 border border-purple-500/40 text-purple-200">
            {claimMessage}
          </div>
        )}

        {/* Token Balance Cards */}
        <div className="mb-10 glass-card-premium rounded-2xl border border-white/10 p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Your Token Wallet</h2>
              <p className="text-sm text-white/60">
                Total Balance: <span className="font-bold text-amber-400">{totalTokens.toFixed(1)} ESMS</span>
              </p>
            </div>
            {session?.user ? (
              <button
                onClick={() => { void handleClaimDaily(); }}
                disabled={claiming}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 via-amber-500 to-orange-500 text-white font-bold hover:brightness-110 transition-all shadow-lg shadow-purple-900/30 disabled:opacity-50"
              >
                {claiming ? "Claiming..." : "⚡ Claim Daily Cosmic Yield"}
              </button>
            ) : (
              <a
                href="/login"
                className="px-6 py-3 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-700 transition-all"
              >
                Sign In to Claim Free ESMS
              </a>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-center">
              <div className="text-2xl mb-1">🝇</div>
              <div className="text-xs uppercase tracking-wider text-amber-400 font-bold">Spirit</div>
              <div className="text-2xl font-black mt-1 text-white">{balances.spirit.toFixed(1)}</div>
            </div>
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 text-center">
              <div className="text-2xl mb-1">🝑</div>
              <div className="text-xs uppercase tracking-wider text-purple-400 font-bold">Essence</div>
              <div className="text-2xl font-black mt-1 text-white">{balances.essence.toFixed(1)}</div>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
              <div className="text-2xl mb-1">🝙</div>
              <div className="text-xs uppercase tracking-wider text-emerald-400 font-bold">Matter</div>
              <div className="text-2xl font-black mt-1 text-white">{balances.matter.toFixed(1)}</div>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-center">
              <div className="text-2xl mb-1">🝉</div>
              <div className="text-xs uppercase tracking-wider text-blue-400 font-bold">Substance</div>
              <div className="text-2xl font-black mt-1 text-white">{balances.substance.toFixed(1)}</div>
            </div>
          </div>
        </div>

        {/* Tool Token Costs Catalog */}
        <div className="glass-card-premium rounded-2xl border border-white/10 overflow-hidden mb-12">
          <div className="p-8 border-b border-white/10">
            <h2 className="text-2xl font-black text-white">Tool Token Costs</h2>
            <p className="text-sm text-white/60 mt-1">
              Every tool on Alchm.kitchen is pay-as-you-go using your ESMS tokens.
            </p>
          </div>
          <div className="divide-y divide-white/10">
            {Object.entries(FEATURE_TOKEN_COSTS).map(([key, item]) => (
              <div key={key} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-lg text-white capitalize">
                    {key.replace(/([A-Z])/g, " $1")}
                  </h3>
                  <p className="text-sm text-white/60">{item.description}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-amber-300 font-bold text-sm">
                    {item.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PremiumPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#08080e] text-white flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
        </div>
      }
    >
      <PremiumPageContent />
    </Suspense>
  );
}
