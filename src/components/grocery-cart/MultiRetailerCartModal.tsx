"use client";

/**
 * MultiRetailerCartModal — Intelligent 1-Click Multi-Retailer Split Cart Fulfillment
 *
 * Automatically splits grocery / recipe items across:
 * 1. Instacart IDP: Specialty, ethnic (Asian, Latin, Middle Eastern), foraged & specialty produce
 * 2. Amazon Fresh: Commodities, pantry staples, standard dairy & pantry essentials
 * 3. In-Pantry: Items already detected in pantry inventory
 *
 * Provides postal code auto-detection for nearby Instacart specialty grocers and dual 1-click dispatch.
 */

import { ShoppingBag, Store, Sparkles, MapPin, ArrowRight, CheckCircle2, ExternalLink, X } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { useToast } from "@/components/ToastProvider";
import { useGroceryCart } from "@/contexts/GroceryCartContext";
import { instacartService } from "@/services/InstacartService";
import type { InstacartRetailer } from "@/types/instacart";
import type { GroceryItem } from "@/types/menuPlanner";
import { splitCartByRetailer, type SplitCartResult } from "@/utils/instacart/ingredientIntelligence";

export interface MultiRetailerCartModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: Array<{ name: string; quantity?: number; unit?: string }>;
  inventory?: string[];
  dietaryFlags?: string[];
  title?: string;
}

export function MultiRetailerCartModal({
  isOpen,
  onClose,
  items,
  inventory = [],
  dietaryFlags = [],
  title = "Multi-Retailer Cart Split",
}: MultiRetailerCartModalProps): React.JSX.Element | null {
  const { showToast } = useToast();
  const { checkoutToAmazon } = useGroceryCart();

  const [postalCode, setPostalCode] = useState("94105");
  const [nearbyRetailers, setNearbyRetailers] = useState<InstacartRetailer[]>([]);
  const [loadingRetailers, setLoadingRetailers] = useState(false);
  const [instacartLoading, setInstacartLoading] = useState(false);
  const [amazonLoading, setAmazonLoading] = useState(false);
  const [instacartSent, setInstacartSent] = useState(false);
  const [amazonSent, setAmazonSent] = useState(false);

  // Compute split
  const splitResult = useMemo<SplitCartResult<{ name: string; quantity?: number; unit?: string }>>(
    () => splitCartByRetailer(items, inventory, dietaryFlags),
    [items, inventory, dietaryFlags],
  );


  // Try to load nearby retailers on mount or postal code change
  useEffect(() => {
    if (!isOpen || !postalCode || postalCode.length < 5) return;
    let isCancelled = false;

    setLoadingRetailers(true);
    instacartService
      .fetchNearbyRetailers(postalCode)
      .then((retailers) => {
        if (!isCancelled) {
          setNearbyRetailers(retailers.slice(0, 4));
        }
      })
      .catch(() => {
        if (!isCancelled) setNearbyRetailers([]);
      })
      .finally(() => {
        if (!isCancelled) setLoadingRetailers(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [isOpen, postalCode]);

  // Escape key listener
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleDispatchInstacart = async (): Promise<void> => {
    if (splitResult.instacartItems.length === 0) return;
    setInstacartLoading(true);

    try {
      const groceryItems: GroceryItem[] = splitResult.instacartItems.map((item, idx) => ({
        id: `split-ic-${idx}`,
        ingredient: item.name,
        quantity: item.quantity ?? 1,
        unit: item.unit ?? "each",
        category: "Specialty",
        purchased: false,
        inPantry: false,
        usedInRecipes: [],
      }));

      const url = await instacartService.createShoppingList(
        groceryItems,
        "Specialty & Fresh Ingredients from Alchm Kitchen",
      );

      setInstacartSent(true);
      showToast(`Opening Instacart with ${splitResult.instacartItems.length} specialty items...`, "success");

      const opened = window.open(url, "_blank");
      if (opened) opened.opener = null;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to open Instacart.";
      showToast(msg, "error");
    } finally {
      setInstacartLoading(false);
    }
  };

  const handleDispatchAmazon = async (): Promise<void> => {
    if (splitResult.amazonItems.length === 0) return;
    setAmazonLoading(true);


    try {
      const count = await checkoutToAmazon("fresh");
      setAmazonSent(true);
      showToast(`Opening Amazon Fresh with ${count > 0 ? count : splitResult.amazonItems.length} staples...`, "success");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to send to Amazon.";
      showToast(msg, "error");
    } finally {
      setAmazonLoading(false);
    }
  };

  const instacartPercent = Math.round(splitResult.instacartRatio * 100);
  const amazonPercent = Math.round(splitResult.amazonRatio * 100);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close modal"
        onClick={onClose}
        className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity"
      />

      {/* Modal Card */}
      <div
        className="relative z-10 w-full max-w-3xl overflow-hidden rounded-2xl border border-amber-500/30 bg-[#0d0b16] shadow-2xl shadow-purple-950/60 flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        {/* Header */}
        <div className="relative border-b border-purple-500/20 bg-gradient-to-r from-purple-950/60 via-amber-950/30 to-black/60 p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-purple-500/20 border border-amber-400/30 text-amber-300">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-purple-200 to-white">
                  {title}
                </h3>
                <p className="text-xs text-alchm-fg-dim">
                  Optimized split between specialty grocers (Instacart) &amp; commodities (Amazon Fresh)
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-alchm-fg-mute hover:bg-white/10 hover:text-white transition-colors"
              aria-label="Close dialog"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Split summary bar */}
          <div className="mt-4 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-amber-300 flex items-center gap-1">
                <Store className="h-3.5 w-3.5" />
                Instacart Specialty: {splitResult.instacartItems.length} items ({instacartPercent}%)
              </span>
              <span className="text-emerald-300 flex items-center gap-1">
                <ShoppingBag className="h-3.5 w-3.5" />
                Amazon Fresh Staples: {splitResult.amazonItems.length} items ({amazonPercent}%)
              </span>
            </div>

            <div className="flex h-2 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-500"
                style={{ width: `${instacartPercent}%` }}
              />
              <div
                className="bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
                style={{ width: `${amazonPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Postal Code & Local Retailers discovery */}
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-medium text-alchm-fg">
                <MapPin className="h-4 w-4 text-amber-400" />
                <span>Hyperlocal Specialty Retailers</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-alchm-fg-mute">Postal Code:</span>
                <input
                  type="text"
                  maxLength={5}
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="ZIP"
                  className="w-16 rounded border border-white/10 bg-black/40 px-2 py-0.5 text-center font-mono text-xs text-amber-300 focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>

            {loadingRetailers ? (
              <div className="mt-2 text-xs text-alchm-fg-mute animate-pulse">
                Discovering nearest specialty grocers...
              </div>
            ) : nearbyRetailers.length > 0 ? (
              <div className="mt-2.5 flex flex-wrap gap-2">
                {nearbyRetailers.map((retailer) => (
                  <span
                    key={retailer.retailer_key}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-amber-400/20 bg-amber-400/5 px-2.5 py-1 text-[11px] font-medium text-amber-200"
                  >
                    <Store className="h-3 w-3 text-amber-400" />
                    {retailer.name}
                  </span>
                ))}

              </div>
            ) : (
              <div className="mt-2 text-[11px] text-alchm-fg-mute">
                Connected to Instacart partner network (H Mart, Mitsuwa, 99 Ranch, Vallarta, Whole Foods, Sprouts)
              </div>
            )}
          </div>

          {/* Two-Column Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Column 1: Instacart Specialty */}
            <div className="flex flex-col rounded-xl border border-amber-500/25 bg-amber-950/10 p-4">
              <div className="flex items-center justify-between pb-3 border-b border-amber-500/20">
                <div>
                  <h4 className="text-sm font-bold text-amber-300 flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4" />
                    Instacart Specialty
                  </h4>
                  <p className="text-[11px] text-amber-200/70">
                    Ethnic staples, fresh herbs, specialty aromatics
                  </p>
                </div>
                <span className="rounded-full bg-amber-400/20 px-2 py-0.5 font-mono text-xs font-bold text-amber-300">
                  {splitResult.instacartItems.length}
                </span>
              </div>

              <div className="flex-1 max-h-48 overflow-y-auto py-2 space-y-1.5">
                {splitResult.instacartItems.length === 0 ? (
                  <p className="text-xs text-alchm-fg-mute py-4 text-center">
                    No specialty items identified.
                  </p>
                ) : (
                  splitResult.instacartItems.map((item, i) => (
                    <div
                      key={`ic-${item.name}-${i}`}
                      className="flex items-center justify-between rounded-lg bg-black/30 px-2.5 py-1.5 text-xs text-white"
                    >
                      <span className="capitalize font-medium">{item.name}</span>
                      {item.quantity && (
                        <span className="font-mono text-amber-300/80 text-[11px]">
                          {item.quantity} {item.unit ?? "ea"}
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  handleDispatchInstacart().catch(() => {});
                }}
                disabled={instacartLoading || splitResult.instacartItems.length === 0}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2.5 text-xs font-bold text-black shadow-md hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 transition-all cursor-pointer"
              >
                {instacartLoading ? (
                  <span className="animate-spin">⟳</span>
                ) : instacartSent ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Sent to Instacart ✓
                  </>
                ) : (
                  <>
                    <ExternalLink className="h-4 w-4" />
                    Send Specialty to Instacart ({splitResult.instacartItems.length})
                  </>
                )}
              </button>
            </div>

            {/* Column 2: Amazon Fresh Commodities */}
            <div className="flex flex-col rounded-xl border border-emerald-500/25 bg-emerald-950/10 p-4">
              <div className="flex items-center justify-between pb-3 border-b border-emerald-500/20">
                <div>
                  <h4 className="text-sm font-bold text-emerald-300 flex items-center gap-1.5">
                    <ShoppingBag className="h-4 w-4" />
                    Amazon Fresh Staples
                  </h4>
                  <p className="text-[11px] text-emerald-200/70">
                    Oils, flour, dairy, proteins, staple produce
                  </p>
                </div>
                <span className="rounded-full bg-emerald-400/20 px-2 py-0.5 font-mono text-xs font-bold text-emerald-300">
                  {splitResult.amazonItems.length}
                </span>
              </div>

              <div className="flex-1 max-h-48 overflow-y-auto py-2 space-y-1.5">
                {splitResult.amazonItems.length === 0 ? (
                  <p className="text-xs text-alchm-fg-mute py-4 text-center">
                    No commodity staples in this cart.
                  </p>
                ) : (
                  splitResult.amazonItems.map((item, i) => (
                    <div
                      key={`amz-${item.name}-${i}`}
                      className="flex items-center justify-between rounded-lg bg-black/30 px-2.5 py-1.5 text-xs text-white"
                    >
                      <span className="capitalize font-medium">{item.name}</span>
                      {item.quantity && (
                        <span className="font-mono text-emerald-300/80 text-[11px]">
                          {item.quantity} {item.unit ?? "ea"}
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  handleDispatchAmazon().catch(() => {});
                }}
                disabled={amazonLoading || splitResult.amazonItems.length === 0}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:from-emerald-500 hover:to-emerald-600 disabled:opacity-50 transition-all cursor-pointer"
              >
                {amazonLoading ? (
                  <span className="animate-spin">⟳</span>
                ) : amazonSent ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Sent to Amazon Fresh ✓
                  </>
                ) : (
                  <>
                    <ArrowRight className="h-4 w-4" />
                    Checkout Staples on Amazon Fresh ({splitResult.amazonItems.length})
                  </>
                )}
              </button>


            </div>
          </div>

          {/* Pantry Excluded Items */}
          {splitResult.excludedPantryItems.length > 0 && (
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-xs">
              <div className="flex items-center gap-1.5 text-alchm-fg-mute font-medium">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                <span>
                  {splitResult.excludedPantryItems.length} item{splitResult.excludedPantryItems.length !== 1 ? "s" : ""} excluded (already in your pantry)
                </span>
              </div>
              <p className="mt-1 text-[11px] text-alchm-fg-dim">
                {splitResult.excludedPantryItems.map((i) => i.name).join(", ")}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MultiRetailerCartModal;
