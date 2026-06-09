"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/ToastProvider";
import { useGroceryCart } from "@/contexts/GroceryCartContext";
import { AMAZON_ASSOCIATE_TAG } from "@/data/amazon";
import { getAmazonLink, getAmazonButtonText } from "@/lib/amazonUrl";

export function GroceryCartDrawer() {
  const {
    items,
    isOpen,
    close,
    removeItem,
    updateQuantity,
    clear,
    checkoutToAmazon,
    unmappedItems,
    updateAsin,
    isLiveSynced,
  } = useGroceryCart();
  const { showToast } = useToast();
  const [checkingOut, setCheckingOut] = useState(false);

  // Escape key handler — closes the drawer for keyboard users
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

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
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm transition-opacity duration-200 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={close}
        aria-hidden={!isOpen}
      />

      {/* Drawer */}
      <aside
        className={`fixed top-0 right-0 z-[61] h-full w-full max-w-md bg-[#0d0b16] border-l border-purple-500/30 shadow-2xl shadow-purple-900/40 flex flex-col transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Grocery cart"
        aria-hidden={!isOpen}
        inert={!isOpen}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-purple-500/30 bg-gradient-to-r from-purple-900/30 to-transparent">
          <div>
            <h2 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-orange-300">
              Grocery Cart
              {isLiveSynced && (
                <span
                  className="ml-2 inline-flex items-center gap-1 rounded-full border border-amber-300/30 bg-amber-400/10 px-2 py-0.5 align-middle font-mono text-[9px] uppercase tracking-wider text-amber-300"
                  title="Cart is synced across your devices in real time"
                >
                  ⚡ live
                </span>
              )}
            </h2>
            <p className="text-xs text-gray-400">
              {items.length === 0
                ? "Empty"
                : `${items.length} ingredient${items.length === 1 ? "" : "s"}`}
            </p>
          </div>
          <button
            type="button"
            onClick={close}
            className="text-gray-400 hover:text-white text-2xl leading-none flex items-center justify-center min-w-[44px] min-h-[44px] rounded-full hover:bg-white/5"
            aria-label="Close grocery cart"
          >
            ×
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 px-4">
              <div className="text-5xl mb-3" aria-hidden>🛒</div>
              <p className="text-sm">Your cart is empty.</p>
              <p className="text-xs mt-2 text-gray-500">
                Open a recipe and tap <span className="text-purple-300">Add to grocery cart</span> to get started.
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="rounded-lg border border-purple-500/20 bg-white/5 p-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-semibold text-white capitalize truncate">
                          {item.name}
                        </div>
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center rounded bg-white/10 hover:bg-white/20 text-white text-sm font-bold"
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
                          className="w-16 text-center bg-white/5 border border-white/10 rounded text-white text-sm py-0.5 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-6 h-6 flex items-center justify-center rounded bg-white/10 hover:bg-white/20 text-white text-sm font-bold"
                          aria-label={`Increase ${item.name}`}
                        >
                          +
                        </button>
                        <span className="text-xs text-gray-400 flex-1">{item.unit}</span>
                        <a
                          href={getAmazonLink(`${item.name} grocery`, item.asin)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 text-[10px] font-semibold text-black bg-[#FF9900] hover:bg-[#FFB347] px-2 py-1 rounded transition-colors"
                          title={item.asin ? "Buy on Amazon" : "Search on Amazon"}
                        >
                          {getAmazonButtonText(item.asin)}
                        </a>
                      </div>
                      {item.recipeIds.length > 0 && (
                        <p className="mt-1.5 text-[11px] text-gray-500 italic truncate">
                          From {item.recipeIds.length} recipe{item.recipeIds.length === 1 ? "" : "s"}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="text-gray-500 hover:text-rose-400 text-lg leading-none p-1"
                      aria-label={`Remove ${item.name}`}
                    >
                      ×
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer actions */}
        {items.length > 0 && (
          <div className="border-t border-purple-500/30 p-4 space-y-2 bg-black/40">
            {unmappedItems.length > 0 && (
              <div className="mb-2">
                <p className="text-xs text-yellow-400/80 mb-1">
                  {unmappedItems.length} item{unmappedItems.length !== 1 ? "s" : ""} not auto-matched (yellow dot):
                </p>
                <div className="flex flex-col gap-2">
                  {unmappedItems.map((item) => (
                    <div key={item.id} className="flex flex-col gap-1.5 border-b border-purple-500/10 pb-2 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-white/90 truncate">{item.name}</span>
                        <div className="flex gap-1.5 shrink-0">
                          <a
                            href={`https://www.amazon.com/s?k=${encodeURIComponent(item.name)}&i=amazonfresh&tag=${AMAZON_ASSOCIATE_TAG}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/30 text-[10px] text-emerald-300 hover:bg-emerald-900 transition-colors font-semibold"
                          >
                            Search Fresh
                          </a>
                          <a
                            href={`https://www.amazon.com/s?k=${encodeURIComponent(item.name)}&tag=${AMAZON_ASSOCIATE_TAG}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2 py-0.5 rounded bg-amber-950/80 border border-amber-500/30 text-[10px] text-amber-300 hover:bg-amber-900 transition-colors font-semibold"
                          >
                            Search Amazon
                          </a>
                        </div>
                      </div>
                      <form 
                        className="flex items-center gap-1 pl-2"
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
                          placeholder="Found it? Paste ASIN" 
                          className="w-32 px-1.5 py-0.5 text-[10px] bg-black/40 border border-white/20 rounded text-white placeholder-gray-500 focus:outline-none focus:border-purple-500" 
                        />
                        <button type="submit" className="px-2 py-0.5 text-[10px] bg-white/10 hover:bg-white/20 border border-white/10 rounded text-white transition-colors">
                          Save
                        </button>
                      </form>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  void handleCheckout("fresh");
                }}
                disabled={checkingOut || mappedCount === 0}
                className="w-full px-4 py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {checkingOut ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Sending to Fresh...
                  </>
                ) : (
                  <>
                    <AmazonIcon />
                    Checkout with Amazon Fresh ({mappedCount})
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  void handleCheckout("standard");
                }}
                disabled={checkingOut || mappedCount === 0}
                className="w-full px-4 py-3 rounded-xl bg-[#FF9900] text-black font-bold text-sm hover:bg-[#FFB347] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {checkingOut ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-black/40 border-t-black rounded-full animate-spin" />
                    Sending to Amazon...
                  </>
                ) : (
                  <>
                    <AmazonIcon />
                    Checkout with Amazon ({mappedCount})
                  </>
                )}
              </button>
            </div>
            <button
              type="button"
              onClick={clear}
              className="w-full px-4 py-2 rounded-lg border border-white/10 text-gray-400 text-xs hover:text-white hover:border-white/20 transition-colors"
            >
              Clear cart
            </button>
          </div>
        )}
      </aside>
    </>
  );
}

function AmazonIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M.045 18.02c.071-.116.178-.221.322-.314C2.271 16.3 4.548 15.147 7.009 14.232c.122-.046.186.017.226.074.132.194.346.382.479.557.089.118.038.182-.065.228-2.015.896-3.907 1.899-5.646 3.086-.078.053-.124.063-.162-.01a4.063 4.063 0 0 1-.396-.647c-.043-.084-.036-.148.045-.224l.555-.484zM6.09 19.633c.22-.4.463-.759.73-1.09.157-.195.254-.167.393-.015 1.088 1.178 2.387 1.826 3.9 1.992.612.067 1.227.045 1.84-.08 1.39-.282 2.137-1.257 2.2-2.686.048-1.082-.36-1.93-1.24-2.584-.642-.478-1.384-.79-2.157-1.032a17.14 17.14 0 0 1-1.953-.752c-1.266-.573-2.315-1.364-2.94-2.658-.354-.733-.5-1.517-.428-2.337.109-1.24.657-2.27 1.6-3.078C9.197 4.35 10.6 3.88 12.183 3.88c1.27 0 2.438.319 3.493.932.146.085.185.166.113.326-.12.265-.226.54-.31.824-.063.212-.13.225-.33.116a6.378 6.378 0 0 0-3.14-.762c-.956.028-1.822.28-2.574.828-1.078.787-1.49 1.84-1.321 3.104.108.806.548 1.435 1.183 1.933.593.466 1.274.788 1.986 1.047.859.312 1.738.582 2.57.961 1.121.51 2.073 1.2 2.673 2.307.4.738.554 1.537.503 2.375-.08 1.306-.555 2.404-1.5 3.29-.691.647-1.51 1.07-2.434 1.307-.654.167-1.32.217-1.994.174-1.503-.096-2.827-.637-3.982-1.572-.065-.053-.136-.1-.203-.154l-.055.003z" />
    </svg>
  );
}

export default GroceryCartDrawer;
