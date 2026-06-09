"use client";

import Link from "next/link";
import React, { useState } from "react";
import { useToast } from "@/components/ToastProvider";
import { useGroceryCart } from "@/contexts/GroceryCartContext";
import { AMAZON_ASSOCIATE_TAG } from "@/data/amazon";
import { getAmazonLink, getAmazonButtonText } from "@/lib/amazonUrl";

function AmazonIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M.045 18.02c.071-.116.178-.221.322-.314C2.271 16.3 4.548 15.147 7.009 14.232c.122-.046.186.017.226.074.132.194.346.382.479.557.089.118.038.182-.065.228-2.015.896-3.907 1.899-5.646 3.086-.078.053-.124.063-.162-.01a4.063 4.063 0 0 1-.396-.647c-.043-.084-.036-.148.045-.224l.555-.484zM6.09 19.633c.22-.4.463-.759.73-1.09.157-.195.254-.167.393-.015 1.088 1.178 2.387 1.826 3.9 1.992.612.067 1.227.045 1.84-.08 1.39-.282 2.137-1.257 2.2-2.686.048-1.082-.36-1.93-1.24-2.584-.642-.478-1.384-.79-2.157-1.032a17.14 17.14 0 0 1-1.953-.752c-1.266-.573-2.315-1.364-2.94-2.658-.354-.733-.5-1.517-.428-2.337.109-1.24.657-2.27 1.6-3.078C9.197 4.35 10.6 3.88 12.183 3.88c1.27 0 2.438.319 3.493.932.146.085.185.166.113.326-.12.265-.226.54-.31.824-.063.212-.13.225-.33.116a6.378 6.378 0 0 0-3.14-.762c-.956.028-1.822.28-2.574.828-1.078.787-1.49 1.84-1.321 3.104.108.806.548 1.435 1.183 1.933.593.466 1.274.788 1.986 1.047.859.312 1.738.582 2.57.961 1.121.51 2.073 1.2 2.673 2.307.4.738.554 1.537.503 2.375-.08 1.306-.555 2.404-1.5 3.29-.691.647-1.51 1.07-2.434 1.307-.654.167-1.32.217-1.994.174-1.503-.096-2.827-.637-3.982-1.572-.065-.053-.136-.1-.203-.154l-.055.003z" />
    </svg>
  );
}

export default function GroceryCartPage() {
  const {
    items,
    removeItem,
    updateQuantity,
    clear,
    checkoutToAmazon,
    unmappedItems,
    updateAsin,
  } = useGroceryCart();
  const { showToast } = useToast();
  const [checkingOut, setCheckingOut] = useState(false);

  const handleCheckout = async (cartType: "fresh" | "standard") => {
    setCheckingOut(true);
    try {
      const count = await checkoutToAmazon(cartType);
      if (count === 0) {
        showToast("No items could be matched to Amazon products.", "error");
      } else {
        const dest = cartType === "fresh" ? "Amazon Fresh" : "Amazon";
        showToast(`Opening ${dest} with ${count} item${count !== 1 ? "s" : ""} in your cart...`, "success");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to send to Amazon.";
      showToast(msg, "error");
    } finally {
      setCheckingOut(false);
    }
  };

  const mappedCount = items.length - unmappedItems.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0d0b16] via-[#1a1528] to-[#0d0b16] text-white">
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="mb-8 flex items-start justify-between flex-wrap gap-4 border-b border-purple-500/30 pb-6">
          <div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-orange-300">
              🛒 Grocery Cart
            </h1>
            <p className="text-sm text-gray-400 mt-2">
              Review your recipe ingredients and check out directly via Amazon or Amazon Fresh. 
              <br />
              Add more items from the{" "}
              <Link
                href="/menu-planner"
                className="text-purple-400 underline hover:text-purple-300"
              >
                Menu Planner
              </Link>{" "}
              or{" "}
              <Link
                href="/recipes"
                className="text-orange-400 underline hover:text-orange-300"
              >
                Recipes
              </Link>.
            </p>
          </div>
          {items.length > 0 && (
            <button
              onClick={() => {
                // eslint-disable-next-line no-alert
                if (window.confirm("Clear all grocery items? This cannot be undone.")) {
                  clear();
                }
              }}
              className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 text-sm font-medium hover:bg-white/10 hover:text-white transition-colors"
            >
              Clear cart
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center text-gray-400 py-24 px-4 bg-white/5 rounded-2xl border border-white/10">
            <div className="text-6xl mb-4" aria-hidden>🛒</div>
            <h2 className="text-xl font-semibold text-white mb-2">Your cart is empty</h2>
            <p className="text-sm max-w-md">
              Open a recipe and tap <span className="text-purple-300">Add to grocery cart</span> to get started. 
              Ingredients will automatically aggregate here.
            </p>
            <div className="mt-8 flex gap-4">
              <Link
                href="/recipes"
                className="px-6 py-3 rounded-xl bg-purple-600/20 text-purple-300 border border-purple-500/30 font-medium hover:bg-purple-600/40 transition-colors"
              >
                Browse Recipes
              </Link>
              <Link
                href="/menu-planner"
                className="px-6 py-3 rounded-xl bg-orange-600/20 text-orange-300 border border-orange-500/30 font-medium hover:bg-orange-600/40 transition-colors"
              >
                Plan Menus
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                Items ({items.length})
              </h2>
              <ul className="space-y-3">
                {items.map((item) => (
                  <li
                    key={item.id}
                    className="rounded-xl border border-purple-500/20 bg-white/5 p-4 flex flex-col sm:flex-row sm:items-center gap-4 transition-colors hover:bg-white/10"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-base font-medium text-white capitalize truncate">
                        {item.name}
                      </div>
                      {item.recipeIds.length > 0 && (
                        <p className="mt-1 text-xs text-gray-400 italic truncate">
                          From {item.recipeIds.length} recipe{item.recipeIds.length === 1 ? "" : "s"}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3 shrink-0 bg-black/20 rounded-lg p-1.5">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-md bg-white/10 hover:bg-white/20 text-white text-lg font-bold transition-colors"
                        aria-label={`Decrease ${item.name}`}
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min={0}
                        step="0.25"
                        value={item.quantity}
                        onChange={(e) => {
                          const v = parseFloat(e.target.value);
                          if (!Number.isNaN(v)) updateQuantity(item.id, v);
                        }}
                        className="w-16 text-center bg-transparent border-0 text-white font-medium py-1 focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-md bg-white/10 hover:bg-white/20 text-white text-lg font-bold transition-colors"
                        aria-label={`Increase ${item.name}`}
                      >
                        +
                      </button>
                      <span className="text-sm text-gray-400 w-12 text-center truncate">{item.unit}</span>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <a
                        href={getAmazonLink(`${item.name} grocery`, item.asin)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-black bg-[#FF9900] hover:bg-[#FFB347] px-3 py-1.5 rounded-lg transition-colors flex items-center justify-center min-w-[90px]"
                        title={item.asin ? "Buy on Amazon" : "Search on Amazon"}
                      >
                        {getAmazonButtonText(item.asin)}
                      </a>
                      
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="text-gray-500 hover:text-rose-400 text-2xl leading-none p-2 rounded-lg hover:bg-rose-500/10 transition-colors"
                        aria-label={`Remove ${item.name}`}
                        title="Remove item"
                      >
                        ×
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Checkout Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 rounded-2xl border border-purple-500/30 bg-black/40 p-6 flex flex-col gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Checkout</h3>
                  <p className="text-sm text-gray-400">
                    Send your resolved ingredients directly to Amazon. 
                    {unmappedItems.length > 0 && " Unmapped items will need to be added manually."}
                  </p>
                </div>

                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => {
                      void handleCheckout("fresh");
                    }}
                    disabled={checkingOut || mappedCount === 0}
                    className="w-full px-5 py-4 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20"
                  >
                    {checkingOut ? (
                      <>
                        <span className="inline-block w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        Sending to Fresh...
                      </>
                    ) : (
                      <>
                        <AmazonIcon />
                        Amazon Fresh ({mappedCount})
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      void handleCheckout("standard");
                    }}
                    disabled={checkingOut || mappedCount === 0}
                    className="w-full px-5 py-4 rounded-xl bg-[#FF9900] text-black font-bold text-sm hover:bg-[#FFB347] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-[#FF9900]/20"
                  >
                    {checkingOut ? (
                      <>
                        <span className="inline-block w-5 h-5 border-2 border-black/40 border-t-black rounded-full animate-spin" />
                        Sending to Amazon...
                      </>
                    ) : (
                      <>
                        <AmazonIcon />
                        Amazon Standard ({mappedCount})
                      </>
                    )}
                  </button>
                </div>

                {unmappedItems.length > 0 && (
                  <div className="pt-6 border-t border-purple-500/20">
                    <h4 className="text-sm font-medium text-yellow-400 mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                      Needs Manual Mapping ({unmappedItems.length})
                    </h4>
                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                      {unmappedItems.map((item) => (
                        <div key={item.id} className="flex flex-col gap-2 p-3 rounded-lg bg-white/5 border border-white/10">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-medium text-white/90 truncate">{item.name}</span>
                          </div>
                          <div className="flex gap-2">
                            <a
                              href={`https://www.amazon.com/s?k=${encodeURIComponent(item.name)}&i=amazonfresh&tag=${AMAZON_ASSOCIATE_TAG}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 text-center py-1.5 rounded bg-emerald-950/80 border border-emerald-500/30 text-xs text-emerald-300 hover:bg-emerald-900 transition-colors font-medium"
                            >
                              Search Fresh
                            </a>
                            <a
                              href={`https://www.amazon.com/s?k=${encodeURIComponent(item.name)}&tag=${AMAZON_ASSOCIATE_TAG}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 text-center py-1.5 rounded bg-amber-950/80 border border-amber-500/30 text-xs text-amber-300 hover:bg-amber-900 transition-colors font-medium"
                            >
                              Search Amazon
                            </a>
                          </div>
                          <form 
                            className="flex items-center gap-2 mt-1"
                            onSubmit={(e) => {
                              e.preventDefault();
                              const form = e.currentTarget;
                              const formData = new FormData(form);
                              const asin = formData.get('asin') as string;
                              if (!asin) return;
                              updateAsin(item.id, asin);
                              form.reset();
                              void (async () => {
                                try {
                                  const res = await fetch('/api/amazon/feedback', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ ingredientName: item.name, asin })
                                  });
                                  if (res.ok) {
                                    showToast('ASIN mapped and saved to database!', 'success');
                                  } else if (res.status === 401) {
                                    showToast('Mapped locally (sign in to save permanently)', 'success');
                                  } else {
                                    showToast('Mapped locally (database save failed)', 'success');
                                  }
                                } catch {
                                  showToast('Mapped locally (offline — database save skipped)', 'success');
                                }
                              })();
                            }}
                          >
                            <input 
                              type="text" 
                              name="asin" 
                              placeholder="Paste ASIN here" 
                              className="flex-1 px-2 py-1.5 text-xs bg-black/40 border border-white/20 rounded text-white placeholder-gray-500 focus:outline-none focus:border-purple-500" 
                            />
                            <button type="submit" className="px-3 py-1.5 text-xs font-medium bg-white/10 hover:bg-white/20 border border-white/10 rounded text-white transition-colors">
                              Save
                            </button>
                          </form>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
