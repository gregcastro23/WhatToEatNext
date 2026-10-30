"use client";

/**
 * AlchemizeOptInModal — Opt-in or nominate a restaurant's signature dishes
 * to be alchemized into elemental twin recipes for home cooks.
 *
 * @file src/components/RestaurantDiscovery/AlchemizeOptInModal.tsx
 */

import { useState } from "react";
import { useToast } from "@/components/ToastProvider";
import { getSignatureDishes } from "@/data/restaurant/curatedCatalog";

export interface AlchemizeOptInModalProps {
  restaurant: {
    id: string;
    name: string;
    cuisine?: string;
    isPartner?: boolean;
    source?: string;
  };
  onClose: () => void;
  onSuccess?: () => void;
}

export function AlchemizeOptInModal({
  restaurant,
  onClose,
  onSuccess,
}: AlchemizeOptInModalProps) {
  const { showToast } = useToast();
  const [role, setRole] = useState<"owner" | "chef" | "diner_nomination">(
    restaurant.isPartner ? "owner" : "diner_nomination",
  );
  const [contactEmail, setContactEmail] = useState("");
  const [selectedDishes, setSelectedDishes] = useState<string[]>([]);
  const [customDish, setCustomDish] = useState("");
  const [recipeNotes, setRecipeNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const suggestedDishes = getSignatureDishes(restaurant.name, restaurant.cuisine);

  const toggleDish = (dish: string) => {
    setSelectedDishes((prev) =>
      prev.includes(dish) ? prev.filter((d) => d !== dish) : [...prev, dish],
    );
  };

  const addCustomDish = () => {
    const trimmed = customDish.trim();
    if (trimmed && !selectedDishes.includes(trimmed)) {
      setSelectedDishes((prev) => [...prev, trimmed]);
      setCustomDish("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactEmail.trim() || !contactEmail.includes("@")) {
      showToast("Please provide a valid contact email", "error");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/restaurants/alchemize-opt-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantId: restaurant.id,
          restaurantName: restaurant.name,
          contactEmail: contactEmail.trim(),
          role,
          signatureDishesToAlchemize: selectedDishes,
          recipeNotes: recipeNotes.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to submit nomination");
      }

      setSubmitted(true);
      showToast(
        role === "diner_nomination"
          ? "Nomination received! We'll reach out to alchemize this dish."
          : "Registration successful! Welcome to the Alchemized Kitchen network.",
        "success",
      );
      if (onSuccess) onSuccess();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Failed to submit request",
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="alchemize-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
    >
      {/* Backdrop hit area */}
      <button
        type="button"
        aria-label="Close overlay"
        onClick={onClose}
        className="absolute inset-0 w-full h-full cursor-default bg-transparent -z-10 focus:outline-none"
      />
      <div className="relative w-full max-w-lg rounded-2xl border border-amber-500/30 bg-stone-900/95 p-6 shadow-2xl backdrop-blur-md text-stone-100 max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-100 transition-colors text-lg"
        >
          ✕
        </button>

        {submitted ? (
          <div className="py-6 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-3xl">
              ✨
            </div>
            <h3 className="text-xl font-serif font-bold text-amber-300">
              {role === "diner_nomination" ? "Nomination Recorded!" : "Welcome, Partner Kitchen!"}
            </h3>
            <p className="text-sm text-stone-300 max-w-md mx-auto leading-relaxed">
              {role === "diner_nomination"
                ? `We've logged your request to alchemize dishes from ${restaurant.name}. Our culinary team analyzes cosmic and elemental compositions to formulate delicious home-cookable twin recipes.`
                : `${restaurant.name} is now registered. We will send an onboarding packet to ${contactEmail} with elemental breakdown analytics for your signature dishes.`}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-4 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-stone-900 font-semibold shadow-lg hover:brightness-110 transition-all text-sm"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30 mb-2">
                ✨ Alchemize Our Recipes
              </div>
              <h3
                id="alchemize-modal-title"
                className="text-xl font-serif font-bold text-stone-100"
              >
                Alchemize {restaurant.name}
              </h3>
              <p className="text-xs text-stone-400 mt-1">
                Bridge restaurant magic with home kitchens. Opt in or nominate signature dishes to unlock elemental flavor twins and community recognition.
              </p>
            </div>

            {/* Role Selection */}
            <div>
              <span className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">
                Your Relationship
              </span>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { key: "owner", label: "Owner / GM", icon: "🏛️" },
                  { key: "chef", label: "Head Chef", icon: "👨‍🍳" },
                  { key: "diner_nomination", label: "Loving Diner", icon: "🍴" },
                ] as const).map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setRole(item.key)}
                    className={`p-2.5 rounded-xl border text-center transition-all text-xs font-medium flex flex-col items-center gap-1 ${
                      role === item.key
                        ? "bg-amber-500/20 border-amber-500/60 text-amber-200 shadow-sm"
                        : "bg-stone-800/60 border-stone-700 text-stone-300 hover:border-stone-600"
                    }`}
                  >
                    <span className="text-base">{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Contact Email */}
            <div>
              <label htmlFor="alchemize-contact-email" className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-1.5">
                {role === "diner_nomination" ? "Your Contact Email" : "Kitchen Contact Email"}
              </label>
              <input
                id="alchemize-contact-email"
                type="email"
                required
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="chef@kitchen.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-800/90 border border-stone-700 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500/60 text-sm"
              />
            </div>

            {/* Dishes Selection */}
            <div>
              <span className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-1.5">
                Signature Dishes to Alchemize
              </span>
              <div className="flex flex-wrap gap-1.5 mb-2.5">
                {suggestedDishes.map((dish) => {
                  const active = selectedDishes.includes(dish);
                  return (
                    <button
                      key={dish}
                      type="button"
                      onClick={() => toggleDish(dish)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all border ${
                        active
                          ? "bg-amber-500 text-stone-900 border-amber-400 shadow-sm font-semibold"
                          : "bg-stone-800 border-stone-700 text-stone-300 hover:border-stone-500"
                      }`}
                    >
                      {active ? `✓ ${dish}` : `+ ${dish}`}
                    </button>
                  );
                })}
              </div>

              {/* Custom Dish Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customDish}
                  onChange={(e) => setCustomDish(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCustomDish();
                    }
                  }}
                  placeholder="Or enter a specific dish..."
                  className="flex-1 px-3 py-1.5 rounded-lg bg-stone-800/80 border border-stone-700 text-stone-100 placeholder-stone-500 text-xs focus:outline-none focus:border-amber-500/60"
                />
                <button
                  type="button"
                  onClick={addCustomDish}
                  disabled={!customDish.trim()}
                  className="px-3 py-1.5 rounded-lg bg-stone-700 hover:bg-stone-600 disabled:opacity-50 text-xs font-medium text-stone-200 transition-colors"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Recipe Notes */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-1.5">
                {role === "diner_nomination"
                  ? "Why do you love this dish? (Optional tips/flavors)"
                  : "Preparation Notes & Elemental Highlights (Optional)"}
              </label>
              <textarea
                rows={2}
                value={recipeNotes}
                onChange={(e) => setRecipeNotes(e.target.value)}
                placeholder={
                  role === "diner_nomination"
                    ? "The smoky broth and charred aromatics are out of this world..."
                    : "Simmered 12 hours, high collagen, balanced with cold-pressed citrus oil..."
                }
                className="w-full px-3.5 py-2 rounded-xl bg-stone-800/90 border border-stone-700 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500/60 text-xs resize-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-stone-400 hover:text-stone-200 text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-900 font-semibold shadow-md hover:shadow-amber-500/20 disabled:opacity-50 transition-all text-sm flex items-center gap-1.5"
              >
                {submitting ? "Submitting..." : "✨ Submit Nomination"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
