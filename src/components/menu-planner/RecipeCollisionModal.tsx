"use client";

/**
 * Recipe Collision Modal
 * Shown when "Generate Next Meal" targets a slot that already has a recipe.
 * Lets the user push the existing recipe to the next empty slot or move it
 * into the Recipe Queue, then proceeds with generation in the cleared slot.
 *
 * @file src/components/menu-planner/RecipeCollisionModal.tsx
 */

import React from "react";

interface RecipeCollisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPush: () => void | Promise<void>;
  onQueue: () => void | Promise<void>;
  existingRecipeName: string;
  targetMealName: string;
}

export default function RecipeCollisionModal({
  isOpen,
  onClose,
  onPush,
  onQueue,
  existingRecipeName,
  targetMealName,
}: RecipeCollisionModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="collision-modal-title"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3 mb-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-xl">
            ⚠️
          </div>
          <div className="flex-1">
            <h2
              id="collision-modal-title"
              className="text-xl font-bold text-gray-900"
            >
              Slot Occupied
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Your <span className="font-semibold">{targetMealName}</span> slot
              already has{" "}
              <span className="font-semibold text-purple-700">
                &ldquo;{existingRecipeName}&rdquo;
              </span>
              . Where should it go before we generate a new recommendation?
            </p>
          </div>
        </div>

        <div className="space-y-3 mt-6">
          <button
            type="button"
            onClick={() => {
              void onPush();
            }}
            className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 text-left"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">➡️</span>
              <div className="flex-1">
                <div className="text-sm font-bold">
                  Push to next available slot
                </div>
                <div className="text-xs text-purple-100 mt-0.5">
                  Keep the recipe planned — we&apos;ll move it to the next empty
                  slot in the week.
                </div>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              void onQueue();
            }}
            className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 text-left"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">📋</span>
              <div className="flex-1">
                <div className="text-sm font-bold">Move to Recipe Queue</div>
                <div className="text-xs text-emerald-100 mt-0.5">
                  Save it for later — drag it onto any slot when you&apos;re
                  ready.
                </div>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full px-4 py-2 rounded-lg bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
