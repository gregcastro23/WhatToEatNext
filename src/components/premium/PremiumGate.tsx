"use client";

/**
 * PremiumGate
 * Wraps any section that requires a premium subscription.
 * Free users see a blurred preview of the content with an upgrade CTA.
 * Premium users see the full content.
 *
 * @file src/components/premium/PremiumGate.tsx
 */

import React, { useState } from "react";
import { usePremium } from "@/contexts/PremiumContext";
import type { SubscriptionTier } from "@/types/subscription";

interface PremiumGateProps {
  children: React.ReactNode;
  /** Optional blurred preview shown to free users behind the paywall overlay */
  preview?: React.ReactNode;
  featureName?: string;
}

export default function PremiumGate({
  children,
  preview,
  featureName = "this feature",
}: PremiumGateProps) {
  const { tier, isLoading, openCheckout } = usePremium();
  const [showModal, setShowModal] = useState(false);
  const isPremium = tier !== "free";

  if (isLoading) return null;
  if (isPremium) return <>{children}</>;

  return (
    <>
      <div className="relative">
        {/* Blurred preview visible behind the gate */}
        {preview && (
          <div
            className="filter blur-sm pointer-events-none select-none opacity-50"
            aria-hidden="true"
          >
            {preview}
          </div>
        )}

        {/* Premium overlay */}
        <div
          className={`${preview ? "absolute inset-0" : ""} flex flex-col items-center justify-center bg-white/85 backdrop-blur-sm rounded-xl z-10 py-12 px-6`}
        >
          <div className="text-center max-w-sm">
            <div className="text-5xl mb-4">✨</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Premium Feature
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              The Recipe Builder generates cosmically-aligned recipes tuned to
              real-time planetary positions — unlock {featureName} with a
              premium subscription.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => setShowModal(true)}
                className="w-full py-3 px-6 rounded-xl font-bold text-sm bg-gradient-to-r from-purple-600 to-orange-500 text-white hover:from-purple-700 hover:to-orange-600 shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Unlock Premium →
              </button>
              <p className="text-xs text-gray-400">
                7-day free trial · Cancel anytime
              </p>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <PremiumModal
          onClose={() => setShowModal(false)}
          onUpgrade={() => {
            void openCheckout("premium" as SubscriptionTier);
            setShowModal(false);
          }}
        />
      )}
    </>
  );
}

// ── Paywall Modal ──────────────────────────────────────────────────────────────

const TIERS = [
  {
    name: "Starter",
    price: "$4.99",
    period: "/mo",
    features: [
      "10 recipe generations / month",
      "Planetary alignment scoring",
      "Elemental profile display",
      "Basic cosmic pairing",
    ],
    cta: "Start Free Trial",
    highlighted: false,
  },
  {
    name: "Premium",
    price: "$9.99",
    period: "/mo",
    features: [
      "Unlimited recipe generation",
      "Full Monica optimization",
      "Swiss Ephemeris precision",
      "Natal chart personalization",
      "Seasonal recipe adaptations",
      "Priority support",
    ],
    cta: "Get Premium",
    highlighted: true,
  },
] as const;

function PremiumModal({
  onClose,
  onUpgrade,
}: {
  onClose: () => void;
  onUpgrade: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-orange-500 p-6 text-white text-center">
          <div className="text-3xl mb-2">✨</div>
          <h2 className="text-2xl font-bold">Alchm Kitchen Premium</h2>
          <p className="text-sm text-purple-100 mt-1">
            Unlimited cosmic recipes aligned to the stars
          </p>
        </div>

        {/* Tiers */}
        <div className="p-6 grid grid-cols-2 gap-4">
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-xl p-4 border-2 flex flex-col ${
                tier.highlighted
                  ? "border-purple-500 bg-purple-50"
                  : "border-gray-200 bg-white"
              }`}
            >
              <div className="mb-3">
                <h3 className="font-bold text-gray-900">{tier.name}</h3>
                <div className="flex items-baseline gap-0.5 mt-1">
                  <span className="text-2xl font-bold text-gray-900">
                    {tier.price}
                  </span>
                  <span className="text-xs text-gray-500">{tier.period}</span>
                </div>
              </div>
              <ul className="space-y-1.5 flex-1 mb-4">
                {tier.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-1.5 text-xs text-gray-600"
                  >
                    <span className="text-purple-500 mt-0.5 shrink-0">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={onUpgrade}
                className={`w-full py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                  tier.highlighted
                    ? "bg-gradient-to-r from-purple-600 to-orange-500 text-white hover:shadow-md hover:scale-[1.02]"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {tier.cta}
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 text-center">
          <p className="text-xs text-gray-400 mb-3">
            7-day free trial included · No credit card required to start ·
            Cancel anytime
          </p>
          <button
            onClick={onClose}
            className="text-xs text-gray-400 hover:text-gray-600 underline"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
