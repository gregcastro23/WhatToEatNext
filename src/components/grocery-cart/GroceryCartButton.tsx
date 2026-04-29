"use client";

import { useGroceryCart } from "@/contexts/GroceryCartContext";

export function GroceryCartButton() {
  const { itemCount, toggle } = useGroceryCart();

  return (
    <button
      type="button"
      onClick={toggle}
      className="relative px-3 py-2 rounded-lg bg-orange-900/40 hover:bg-orange-800/60 text-orange-200 hover:text-white font-semibold text-sm border border-orange-500/30 transition-all duration-200 hover:scale-105"
      aria-label={`Grocery cart (${itemCount} item${itemCount === 1 ? "" : "s"})`}
    >
      <span aria-hidden>🛒</span>
      <span className="ml-1.5 hidden sm:inline">Cart</span>
      {itemCount > 0 && (
        <span
          className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1.5 rounded-full bg-gradient-to-br from-orange-500 to-rose-500 text-white text-[10px] font-extrabold flex items-center justify-center shadow-lg shadow-orange-500/40"
          aria-hidden
        >
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      )}
    </button>
  );
}

export default GroceryCartButton;
