"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";

interface ShopItem {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  category: string;
  isOneTime: boolean;
  baseCost: {
    spirit: number;
    essence: number;
    matter: number;
    substance: number;
  };
  liveCost: {
    spirit: number;
    essence: number;
    matter: number;
    substance: number;
  };
  canAfford: boolean;
}

interface ShopResponse {
  success: boolean;
  balances: {
    spirit: number;
    essence: number;
    matter: number;
    substance: number;
  };
  pricing: {
    multiplier: number;
    aNumber: number;
    dominantElement: string;
    timestamp: string;
  };
  items: ShopItem[];
}

const TOKEN_CONFIG = {
  spirit: { symbol: "☉", color: "text-amber-300" },
  essence: { symbol: "☽", color: "text-blue-300" },
  matter: { symbol: "⊕", color: "text-emerald-300" },
  substance: { symbol: "☿", color: "text-fuchsia-300" },
} as const;

export default function TokenShopModal() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shop, setShop] = useState<ShopResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [purchasingSlug, setPurchasingSlug] = useState<string | null>(null);

  const fetchShop = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/economy/shop?category=feature", {
        credentials: "include",
      });
      if (res.status === 401) {
        window.dispatchEvent(new Event("open-signin-modal"));
        setOpen(false);
        return;
      }
      const data = await res.json();
      if (!res.ok || !data?.success) {
        setError(data?.message || "Failed to load shop");
        return;
      }
      setShop(data);
    } catch {
      setError("Failed to load live token shop");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const openHandler = () => {
      setOpen(true);
      void fetchShop();
    };
    const closeHandler = () => setOpen(false);
    window.addEventListener("open-token-shop", openHandler);
    window.addEventListener("close-token-shop", closeHandler);
    return () => {
      window.removeEventListener("open-token-shop", openHandler);
      window.removeEventListener("close-token-shop", closeHandler);
    };
  }, [fetchShop]);

  useEffect(() => {
    if (!open) return;
    const interval = setInterval(() => {
      void fetchShop();
    }, 30000);
    return () => clearInterval(interval);
  }, [open, fetchShop]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const handlePurchase = useCallback(async (slug: string) => {
    setPurchasingSlug(slug);
    setError(null);
    try {
      const res = await fetch("/api/economy/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ shopItemSlug: slug }),
      });
      const data = await res.json();
      if (res.status === 401) {
        window.dispatchEvent(new Event("open-signin-modal"));
        setOpen(false);
        return;
      }
      if (!res.ok || !data?.success) {
        setError(data?.message || "Purchase failed");
      }
      await fetchShop();
    } catch {
      setError("Purchase failed");
    } finally {
      setPurchasingSlug(null);
    }
  }, [fetchShop]);

  const pricePulse = useMemo(() => {
    if (!shop?.pricing) return "x1.00";
    return `x${shop.pricing.multiplier.toFixed(2)}`;
  }, [shop]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-[2rem] border border-white/20 bg-gradient-to-br from-slate-950/95 via-indigo-950/90 to-purple-950/90 shadow-[0_25px_80px_rgba(0,0,0,0.65)]">
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-black uppercase tracking-[0.3em] text-white/70">
              Token Shop
            </h2>
            <p className="text-xs text-white/40">
              Live pricing from current alchemical moment · {pricePulse}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { void fetchShop(); }}
              className="px-3 py-1.5 text-xs font-semibold rounded-full bg-white/10 hover:bg-white/20 text-white/80 border border-white/15"
            >
              Refresh
            </button>
            <button
              onClick={() => setOpen(false)}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white/80 border border-white/15"
              aria-label="Close token shop"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="px-6 py-4 border-b border-white/10 flex flex-wrap gap-3">
          {(["spirit", "essence", "matter", "substance"] as const).map((k) => (
            <div key={k} className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-white/80">
              <span className={`${TOKEN_CONFIG[k].color} mr-1.5`}>{TOKEN_CONFIG[k].symbol}</span>
              {(shop?.balances?.[k] ?? 0).toFixed(2)}
            </div>
          ))}
          <div className="px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-400/25 text-xs font-semibold text-amber-200">
            A# {(shop?.pricing?.aNumber ?? 0).toFixed(2)} · {shop?.pricing?.dominantElement ?? "—"}
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-136px)]">
          {loading && (
            <div className="text-sm text-white/60">Loading live shop...</div>
          )}

          {!loading && error && (
            <div className="rounded-xl border border-red-500/30 bg-red-900/20 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          {!loading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(shop?.items || []).map((item) => (
                <div key={item.id} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-white/90">{item.title}</h3>
                      <p className="text-xs text-white/50 mt-1">{item.description || "Feature unlock"}</p>
                    </div>
                    <span className="text-[10px] uppercase tracking-wider text-white/35">
                      {item.isOneTime ? "one-time" : "per use"}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {(Object.keys(TOKEN_CONFIG) as Array<keyof typeof TOKEN_CONFIG>).map((k) => {
                      const amount = item.liveCost[k];
                      if (!amount || amount <= 0) return null;
                      return (
                        <span key={k} className="px-2.5 py-1 rounded-full bg-black/25 border border-white/10 text-xs text-white/80">
                          <span className={`${TOKEN_CONFIG[k].color} mr-1`}>{TOKEN_CONFIG[k].symbol}</span>
                          {amount.toFixed(2)}
                        </span>
                      );
                    })}
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <span className={`text-xs ${item.canAfford ? "text-emerald-300" : "text-red-300"}`}>
                      {item.canAfford ? "Affordable now" : "Insufficient funds"}
                    </span>
                    <button
                      onClick={() => { void handlePurchase(item.slug); }}
                      disabled={!!purchasingSlug || !item.canAfford}
                      className="px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-amber-500 to-fuchsia-500 text-white disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {purchasingSlug === item.slug ? "Purchasing..." : "Purchase"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

