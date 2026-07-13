"use client";

import React from "react";
import LaunchReadinessPanel from "@/components/admin/LaunchReadinessPanel";

/**
 * Admin Settings Page - System configuration overview
 *
 * Top: the live launch-readiness board (presence-only config for every
 * revenue + on-chain subsystem, fed by /api/admin/launch-readiness).
 * Below: static platform facts that don't move without a redeploy.
 */
export default function AdminSettingsPage() {
  const settings = [
    {
      section: "Application",
      items: [
        { label: "App Name", value: "alchm.kitchen" },
        { label: "Environment", value: process.env.NODE_ENV || "development" },
        {
          label: "URL",
          value: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        },
      ],
    },
    {
      section: "Authentication",
      items: [
        { label: "JWT Configured", value: "Yes (lazy initialization)" },
        { label: "Token Expiry", value: "24 hours" },
        {
          label: "Cookie Settings",
          value: "HttpOnly, Secure (prod), SameSite=Strict",
        },
      ],
    },
    {
      section: "Data Storage",
      items: [
        { label: "User Storage", value: "PostgreSQL (Railway) with In-Memory fallback" },
        { label: "Food Diary", value: "PostgreSQL (Railway) with In-Memory fallback" },
        { label: "Production DB", value: "PostgreSQL (Railway)" },
      ],
    },
    {
      section: "Planetary Calculations",
      items: [
        { label: "Primary Engine", value: "pyswisseph (backend)" },
        { label: "Fallback Engine", value: "astronomy-engine" },
        { label: "Precision", value: "NASA JPL DE (sub-arcsecond)" },
      ],
    },
    {
      section: "Version Info",
      items: [
        { label: "Next.js", value: "15.x" },
        { label: "React", value: "19.1.0" },
        { label: "TypeScript", value: "5.8.3" },
        { label: "Node.js", value: "18+" },
      ],
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
        <p className="text-gray-600 mt-1">
          Launch readiness &amp; system configuration overview
        </p>
      </div>

      {/* Live readiness board — which revenue / on-chain subsystems are wired */}
      <div className="mb-10">
        <LaunchReadinessPanel variant="full" />
      </div>

      {/* Static platform facts */}
      <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">
        Platform
      </h2>
      <div className="space-y-6">
        {settings.map((section) => (
          <div key={section.section} className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">
                {section.section}
              </h2>
            </div>
            <div className="p-6">
              <dl className="divide-y divide-gray-100">
                {section.items.map((item) => (
                  <div
                      key={item.label}
                      className="py-3 flex justify-between items-center"
                  >
                    <dt className="text-sm text-gray-600">{item.label}</dt>
                    <dd className="text-sm font-medium text-gray-800">
                      {item.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        ))}
      </div>

      {/* Notes */}
      <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="font-semibold text-yellow-800 mb-2">
          System Integration Notes
        </h3>
        <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
          <li>
            User data is persisted in PostgreSQL with transparent in-memory fallbacks when connections fail.
          </li>
          <li>
            PostgreSQL connection parameters are defined via environment variables.
          </li>
          <li>Email service requires SMTP configuration for notifications</li>
        </ul>
      </div>
    </div>
  );
}
