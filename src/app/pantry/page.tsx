"use client";

import Link from "next/link";
import React, { useMemo, useState } from "react";
import { usePantry } from "@/hooks/usePantry";

function formatName(name: string): string {
  return name
    .replace(/_/g, " ")
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

export default function PantryPage() {
  const { items, stats, isLoaded, removeItem, updateItem, clear } = usePantry();
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const categories = useMemo(() => {
    const cats = new Set<string>();
    items.forEach((i) => cats.add(i.category || "other"));
    return Array.from(cats).sort();
  }, [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items
      .filter((i) => categoryFilter === "all" || i.category === categoryFilter)
      .filter((i) => !q || i.name.toLowerCase().includes(q))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [items, query, categoryFilter]);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof filtered>();
    filtered.forEach((item) => {
      const key = item.category || "other";
      if (!map.has(key)) map.set(key, [] as typeof filtered);
      map.get(key)!.push(item);
    });
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-emerald-50">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              🥫 Your Pantry
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Ingredients you have on hand. Add from the{" "}
              <Link
                href="/#ingredients"
                className="text-emerald-700 underline hover:text-emerald-900"
              >
                Ingredient Recommender
              </Link>{" "}
              on the home page, or jump over to the{" "}
              <Link
                href="/menu-planner"
                className="text-purple-700 underline hover:text-purple-900"
              >
                Menu Planner
              </Link>{" "}
              to build meals around what you own.
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/#ingredients"
              className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700"
            >
              + Browse ingredients
            </Link>
            {items.length > 0 && (
              <button
                onClick={() => {
                  if (confirm("Clear all pantry items? This cannot be undone.")) {
                    clear();
                  }
                }}
                className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200"
              >
                Clear pantry
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="text-xs uppercase tracking-wide text-gray-500">
              Total items
            </div>
            <div className="text-2xl font-bold text-gray-900 mt-1">
              {stats.totalItems}
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="text-xs uppercase tracking-wide text-gray-500">
              Categories
            </div>
            <div className="text-2xl font-bold text-gray-900 mt-1">
              {Object.keys(stats.categoryCounts).length}
            </div>
          </div>
          <div className="bg-white border border-amber-200 rounded-xl p-4">
            <div className="text-xs uppercase tracking-wide text-amber-700">
              Expiring ≤ 7 days
            </div>
            <div className="text-2xl font-bold text-amber-900 mt-1">
              {stats.expiringIn7Days}
            </div>
          </div>
          <div className="bg-white border border-red-200 rounded-xl p-4">
            <div className="text-xs uppercase tracking-wide text-red-700">
              Expired
            </div>
            <div className="text-2xl font-bold text-red-900 mt-1">
              {stats.expired}
            </div>
          </div>
        </div>

        {/* Filters */}
        {items.length > 0 && (
          <div className="mb-6 flex gap-3 flex-wrap items-center">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search pantry..."
              className="flex-1 min-w-[200px] px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              <option value="all">All categories ({items.length})</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {formatName(c)} ({stats.categoryCounts[c] || 0})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Items */}
        {!isLoaded ? (
          <div className="text-center py-12 text-gray-500">Loading pantry...</div>
        ) : items.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
            <div className="text-5xl mb-3">🧺</div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Your pantry is empty
            </h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Tap the{" "}
              <span className="inline-block bg-amber-100 text-amber-800 text-xs font-medium px-2 py-0.5 rounded">
                + Pantry
              </span>{" "}
              button on any ingredient card on the home page to start tracking
              what you own.
            </p>
            <Link
              href="/#ingredients"
              className="inline-block px-6 py-3 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700"
            >
              Browse ingredients
            </Link>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
            <p className="text-gray-600">No pantry items match those filters.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {grouped.map(([category, catItems]) => (
              <section key={category}>
                <h2 className="text-lg font-semibold text-gray-800 mb-3 capitalize">
                  {formatName(category)}{" "}
                  <span className="text-sm font-normal text-gray-500">
                    ({catItems.length})
                  </span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {catItems.map((item) => {
                    const isExpired =
                      item.expirationDate && item.expirationDate < new Date();
                    return (
                      <div
                        key={item.id}
                        className={`bg-white border rounded-xl p-4 flex items-start justify-between gap-3 ${
                          isExpired ? "border-red-200 bg-red-50" : "border-gray-200"
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate">
                            {formatName(item.name)}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            Added{" "}
                            {new Date(item.addedDate).toLocaleDateString()}
                            {item.expirationDate &&
                              ` · Expires ${new Date(item.expirationDate).toLocaleDateString()}`}
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              onClick={() =>
                                updateItem(item.id, {
                                  quantity: Math.max(0, item.quantity - 1),
                                })
                              }
                              className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm flex items-center justify-center"
                              aria-label="Decrease quantity"
                            >
                              −
                            </button>
                            <span className="text-sm font-medium text-gray-800 min-w-[60px] text-center">
                              {item.quantity} {item.unit}
                            </span>
                            <button
                              onClick={() =>
                                updateItem(item.id, {
                                  quantity: item.quantity + 1,
                                })
                              }
                              className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm flex items-center justify-center"
                              aria-label="Increase quantity"
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-gray-400 hover:text-red-600 text-sm"
                          title="Remove from pantry"
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
