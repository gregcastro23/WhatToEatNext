"use client";

import { useState } from "react";
import { useToast } from "@/components/ToastProvider";
import { useGroceryCart } from "@/contexts/GroceryCartContext";

export function GroceryCartDrawer() {
  const {
    items,
    isOpen,
    close,
    removeItem,
    updateQuantity,
    clear,
    checkoutToInstacart,
  } = useGroceryCart();
  const { showToast } = useToast();
  const [checkingOut, setCheckingOut] = useState(false);

  const handleCheckout = async () => {
    setCheckingOut(true);
    try {
      const url = await checkoutToInstacart();
      showToast("Opening Instacart with your cart...", "success");
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to send to Instacart.";
      showToast(msg, "error");
    } finally {
      setCheckingOut(false);
    }
  };

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
        aria-label="Grocery cart"
        aria-hidden={!isOpen}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-purple-500/30 bg-gradient-to-r from-purple-900/30 to-transparent">
          <div>
            <h2 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-orange-300">
              Grocery Cart
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
            className="text-gray-400 hover:text-white text-2xl leading-none p-1"
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
                      <div className="text-sm font-semibold text-white capitalize truncate">
                        {item.name}
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
                        <span className="text-xs text-gray-400">{item.unit}</span>
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
            <button
              type="button"
              onClick={() => void handleCheckout()}
              disabled={checkingOut}
              className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-sm hover:from-orange-400 hover:to-amber-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {checkingOut ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Sending to Instacart...
                </>
              ) : (
                <>
                  <span aria-hidden>🛍️</span> Checkout with Instacart
                </>
              )}
            </button>
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

export default GroceryCartDrawer;
