"use client";

/**
 * Order Ingredients — the one checklist modal every surface reuses (recipe
 * detail, grocery cart, weekly menu, discovery drawer).
 *
 * Every ingredient row links to a TAGGED Amazon Fresh search (whole-catalog
 * coverage, day one). Rows that resolve an ASIN via /api/amazon/search ride
 * the existing Associates cart-POST instead — one tap fills a Fresh cart.
 * Staples sit behind a toggle; unchecked items are remembered as "already
 * have it" (pantry memory). Opening a list with items quietly counts as the
 * list_conjured practice.
 */

import { ExternalLink, Loader2, ShoppingBasket, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, type JSX } from "react";
import { preflightAndSubmitAmazonCart } from "@/lib/amazonCartHandoff";
import { firePractice } from "@/lib/economy/practiceClient";
import {
  buildOrderList,
  pantryCache,
  setPantryItem,
  type OrderInput,
  type OrderListItem,
} from "@/lib/order/orderList";
import type { CheckoutPreflightSource } from "@/types/checkout";

interface OrderIngredientsModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  inputs: OrderInput[];
  /** Serving multiplier (servings / baseServings on recipe surfaces). */
  scale?: number;
  source: CheckoutPreflightSource;
  /** Dedupe target for the list_conjured practice (e.g. `recipe:<id>`). */
  listTarget: string;
}

export function OrderIngredientsModal({
  open,
  onClose,
  title,
  inputs,
  scale = 1,
  source,
  listTarget,
}: OrderIngredientsModalProps): JSX.Element | null {
  const items = useMemo(() => buildOrderList(inputs, scale), [inputs, scale]);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [includeStaples, setIncludeStaples] = useState(false);
  const [asins, setAsins] = useState<Record<string, string>>({});
  const [resolving, setResolving] = useState(false);
  const [sendingCart, setSendingCart] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const conjured = useRef(false);

  // Seed checkbox state: pantry-remembered and staple rows start unchecked.
  useEffect(() => {
    if (!open) return;
    const pantry = pantryCache();
    const seed: Record<string, boolean> = {};
    for (const item of items) {
      seed[item.key] = !pantry.has(item.key) && !item.isStaple && !item.optional;
    }
    setChecked(seed);
    setNotice(null);
  }, [open, items]);

  // The act of conjuring a list quietly counts (deduped per target per day).
  useEffect(() => {
    if (open && items.length > 0 && !conjured.current) {
      conjured.current = true;
      firePractice("list_conjured", listTarget);
    }
    if (!open) conjured.current = false;
  }, [open, items.length, listTarget]);

  // Batch-resolve ASINs so resolved rows can ride the one-tap Fresh cart.
  useEffect(() => {
    if (!open || items.length === 0) return;
    let cancelled = false;
    setResolving(true);
    fetch("/api/amazon/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ingredients: items.map((i) => i.name) }),
    })
      .then(async (res) => {
        if (!res.ok || cancelled) return;
        const json = (await res.json()) as { results?: Array<{ ingredient: string; asin: string | null }> };
        if (!json.results) return;
        const map: Record<string, string> = {};
        for (const r of json.results) {
          if (!r.asin) continue;
          const match = items.find((i) => i.name.toLowerCase() === r.ingredient.toLowerCase());
          if (match) map[match.key] = r.asin;
        }
        if (!cancelled) setAsins(map);
      })
      .catch(() => {
        /* search links cover everything anyway */
      })
      .finally(() => {
        if (!cancelled) setResolving(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, items]);

  const visible = useMemo(
    () => items.filter((i) => includeStaples || !i.isStaple),
    [items, includeStaples],
  );
  const selected = visible.filter((i) => checked[i.key]);
  const cartable = selected.filter((i) => asins[i.key]);
  const searchOnly = selected.filter((i) => !asins[i.key]);

  const toggle = useCallback((item: OrderListItem) => {
    setChecked((prev) => {
      const next = !prev[item.key];
      // Unchecking = "already have it" — remembered across sessions.
      setPantryItem(item.key, !next);
      return { ...prev, [item.key]: next };
    });
  }, []);

  const openFreshCart = useCallback(async () => {
    if (cartable.length === 0) return;
    setSendingCart(true);
    setNotice(null);
    try {
      await preflightAndSubmitAmazonCart({
        source,
        cartType: "fresh",
        items: cartable.map((i) => ({
          asin: asins[i.key],
          qty: Math.max(1, Math.ceil(i.quantity)),
          name: i.name,
          category: i.category,
        })),
        metadata: { listTarget, itemCount: cartable.length },
      });
      setNotice(`Fresh cart opened with ${cartable.length} item${cartable.length === 1 ? "" : "s"}.`);
    } catch {
      setNotice("Couldn't open the Fresh cart — the search links below still work.");
    } finally {
      setSendingCart(false);
    }
  }, [cartable, asins, source, listTarget]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={`Order ingredients — ${title}`}
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-lg max-h-[85vh] overflow-hidden flex flex-col rounded-t-2xl sm:rounded-2xl border border-purple-500/20 bg-[#0d0b14]/95 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-white/5">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-300/80">
              Order Ingredients
            </div>
            <div className="text-sm font-semibold text-white/90 truncate max-w-[18rem]">{title}</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-3 flex items-center justify-between gap-3 border-b border-white/5">
          <label className="flex items-center gap-2 text-[11px] text-white/50 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={includeStaples}
              onChange={(e) => setIncludeStaples(e.target.checked)}
              className="accent-purple-500"
            />
            Include staples (salt, oil, flour…)
          </label>
          {resolving && (
            <span className="inline-flex items-center gap-1.5 text-[10px] font-mono text-white/30">
              <Loader2 className="w-3 h-3 animate-spin" /> matching products
            </span>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-1.5">
          {visible.length === 0 && (
            <p className="text-sm text-white/40 py-6 text-center">Nothing to order — the pantry provides.</p>
          )}
          {visible.map((item) => (
            <div
              key={item.key}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 border transition-colors ${
                checked[item.key] ? "border-purple-500/25 bg-purple-500/5" : "border-white/5 bg-white/[0.02] opacity-60"
              }`}
            >
              <input
                type="checkbox"
                checked={Boolean(checked[item.key])}
                onChange={() => toggle(item)}
                className="accent-purple-500 shrink-0"
                aria-label={`Order ${item.name}`}
              />
              <div className="flex-1 min-w-0">
                <span className="text-[13px] text-white/85 truncate block">{item.name}</span>
                <span className="text-[10px] font-mono text-white/35">
                  {item.quantity > 0 ? `${item.quantity} ${item.unit}` : item.unit}
                  {asins[item.key] ? " · cart-ready" : ""}
                  {item.isStaple ? " · staple" : ""}
                </span>
              </div>
              <a
                href={item.searchUrl}
                target="_blank"
                rel="sponsored noopener noreferrer"
                className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-cyan-300/90 hover:text-cyan-200 shrink-0"
              >
                Fresh <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          ))}
        </div>

        <div className="px-5 py-4 border-t border-white/5 space-y-2">
          <button
            type="button"
            onClick={() => void openFreshCart()}
            disabled={cartable.length === 0 || sendingCart}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 disabled:opacity-40 text-white text-xs font-black uppercase tracking-widest transition-all"
          >
            {sendingCart ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShoppingBasket className="w-4 h-4" />}
            {cartable.length > 0
              ? `Open Fresh cart (${cartable.length} item${cartable.length === 1 ? "" : "s"})`
              : "Use the Fresh links above"}
          </button>
          {searchOnly.length > 0 && cartable.length > 0 && (
            <p className="text-[10px] text-white/35 text-center">
              {searchOnly.length} item{searchOnly.length === 1 ? "" : "s"} without a product match — use their Fresh links.
            </p>
          )}
          {notice && <p className="text-[11px] text-emerald-300/90 text-center">{notice}</p>}
          <p className="text-[9px] text-white/25 text-center leading-relaxed">
            As an Amazon Associate, alchm.kitchen earns from qualifying purchases. Unchecked items are
            remembered as already in your pantry.
          </p>
        </div>
      </div>
    </div>
  );
}
