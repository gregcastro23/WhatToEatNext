"use client";

import React, { useState } from "react";
import { z } from "zod";
import { EmptyState } from "@/components/admin/kit/EmptyState";
import { Metric } from "@/components/admin/kit/Metric";
import { fromLiveFlag } from "@/components/admin/kit/provenance";
import { ProvenanceBadge } from "@/components/admin/kit/ProvenanceBadge";
import { readJson } from "@/lib/api/json";

export interface EnvironmentSummary {
  geohashCount: number;
  archiveSeededCount: number;
  matureCount: number;
  minSampleDays: number;
  maxSampleDays: number;
  observationCount: number;
  lastComputedAt: string | null;
  live: boolean;
}

export const EnvironmentSummaryResponseSchema = z
  .object({
    success: z.boolean().optional(),
    geohashCount: z.union([z.number(), z.string()]).optional(),
    archiveSeededCount: z.union([z.number(), z.string()]).optional(),
    matureCount: z.union([z.number(), z.string()]).optional(),
    minSampleDays: z.union([z.number(), z.string()]).optional(),
    maxSampleDays: z.union([z.number(), z.string()]).optional(),
    observationCount: z.union([z.number(), z.string()]).optional(),
    lastComputedAt: z.string().nullable().optional(),
    live: z.boolean().optional(),
  })
  .passthrough();

export const SeedResponseSchema = z
  .object({
    success: z.boolean().optional(),
    seeded: z.array(z.object({ geohash5: z.string(), label: z.string().optional() })).optional(),
    failed: z.array(z.object({ geohash5: z.string(), label: z.string().optional(), error: z.string() })).optional(),
    message: z.string().optional(),
  })
  .passthrough();

export const MAJOR_CULINARY_HUBS = [
  { label: "New York, US", latitude: 40.7128, longitude: -74.006 },
  { label: "Tokyo, JP", latitude: 35.6762, longitude: 139.6503 },
  { label: "Paris, FR", latitude: 48.8566, longitude: 2.3522 },
  { label: "Mexico City, MX", latitude: 19.4326, longitude: -99.1332 },
  { label: "Rome, IT", latitude: 41.9028, longitude: 12.4964 },
];

function EnvironmentalMetricsGrid({ summary }: { summary: EnvironmentSummary }): React.JSX.Element {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
        <Metric label="Seeded Geohashes" value={summary.geohashCount} provenance={fromLiveFlag(summary.live)} caption={`${summary.archiveSeededCount} archive-seeded`} size="sm" />
      </div>
      <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
        <Metric label="Mature Baselines" value={summary.matureCount} provenance={fromLiveFlag(summary.live)} caption=">= 14 sample days" size="sm" />
      </div>
      <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
        <Metric label="Sample Window Span" value={`${summary.minSampleDays}–${summary.maxSampleDays}d`} provenance={fromLiveFlag(summary.live)} caption="Target: 30d window" size="sm" />
      </div>
      <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
        <Metric label="Raw Observations" value={summary.observationCount} provenance={fromLiveFlag(summary.live)} caption="90d retention window" size="sm" />
      </div>
      <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
        <Metric label="Last Computed" value={summary.lastComputedAt ? new Date(summary.lastComputedAt).toLocaleString() : "—"} provenance={fromLiveFlag(summary.live)} size="sm" />
      </div>
    </div>
  );
}

function CoordinateInputs({
  lat,
  lon,
  label,
  onLatChange,
  onLonChange,
  onLabelChange,
}: {
  lat: string;
  lon: string;
  label: string;
  onLatChange: (v: string) => void;
  onLonChange: (v: string) => void;
  onLabelChange: (v: string) => void;
}): React.JSX.Element {
  return (
    <>
      <div>
        <label htmlFor="seed-lat" className="block text-xs font-medium text-gray-600 mb-1">Latitude</label>
        <input id="seed-lat" type="number" step="any" value={lat} onChange={(e) => onLatChange(e.target.value)} placeholder="40.7128" className="w-full px-3 py-1.5 border border-gray-300 rounded-lg font-mono text-sm" />
      </div>
      <div>
        <label htmlFor="seed-lon" className="block text-xs font-medium text-gray-600 mb-1">Longitude</label>
        <input id="seed-lon" type="number" step="any" value={lon} onChange={(e) => onLonChange(e.target.value)} placeholder="-74.0060" className="w-full px-3 py-1.5 border border-gray-300 rounded-lg font-mono text-sm" />
      </div>
      <div>
        <label htmlFor="seed-label" className="block text-xs font-medium text-gray-600 mb-1">Label (optional)</label>
        <input id="seed-label" type="text" value={label} onChange={(e) => onLabelChange(e.target.value)} placeholder="Manhattan, NY" className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm" />
      </div>
    </>
  );
}

function CoordinateForm({ onSeed, busy }: { onSeed: (lat: number, lon: number, label?: string) => void; busy: boolean }): React.JSX.Element {
  const [lat, setLat] = useState("");
  const [lon, setLon] = useState("");
  const [label, setLabel] = useState("");

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    const parsedLat = Number(lat);
    const parsedLon = Number(lon);
    if (!Number.isFinite(parsedLat) || parsedLat < -90 || parsedLat > 90 || !Number.isFinite(parsedLon) || parsedLon < -180 || parsedLon > 180) {
      return;
    }
    onSeed(parsedLat, parsedLon, label.trim() || undefined);
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-3 flex-1 items-end">
      <CoordinateInputs lat={lat} lon={lon} label={label} onLatChange={setLat} onLonChange={setLon} onLabelChange={setLabel} />
      <div>
        <button type="submit" disabled={busy} className="w-full px-4 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-900 text-white text-sm font-medium disabled:opacity-50">
          {busy ? "Seeding…" : "Seed Coordinate"}
        </button>
      </div>
    </form>
  );
}

async function seedLocationsRequest(
  locations: Array<{ latitude: number; longitude: number; label?: string }>,
): Promise<{ ok: boolean; count: number; message: string }> {
  try {
    const res = await fetch("/api/admin/environment/seed", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locations }),
    });
    const payload = await readJson(res, { parse: (raw) => SeedResponseSchema.parse(raw) });
    const count = payload.seeded?.length ?? 0;
    return {
      ok: res.ok && count > 0,
      count,
      message: res.ok && count > 0 ? `Seeded ${count} baseline(s).` : (payload.message ?? "Seeding done."),
    };
  } catch {
    return { ok: false, count: 0, message: "Network error calling /api/admin/environment/seed." };
  }
}

export function EnvironmentalSeedPanel({
  envSummary,
  envEndpointOk,
  onSeedCompleted,
}: {
  envSummary: EnvironmentSummary | null;
  envEndpointOk: boolean;
  onSeedCompleted: () => void;
}): React.JSX.Element {
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const runSeed = async (locations: Array<{ latitude: number; longitude: number; label?: string }>): Promise<void> => {
    setBusy(true);
    setFeedback(null);
    const res = await seedLocationsRequest(locations);
    setFeedback(res.message);
    setBusy(false);
    if (res.ok) onSeedCompleted();
  };

  return (
    <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Environmental Baseline Ingestion (ERA5)</h2>
          <p className="text-xs text-gray-500 mt-0.5">30-day trailing surface pressure baselines via /api/admin/environment/seed</p>
        </div>
        <ProvenanceBadge provenance={fromLiveFlag(envEndpointOk && Boolean(envSummary?.live))} compact />
      </div>
      <div className="p-6 space-y-6">
        {!envEndpointOk ? (
          <EmptyState kind="cannot-read" title="Environmental ingestion summary unavailable" description="Could not query /api/admin/environment/seed." />
        ) : !envSummary?.live ? (
          <EmptyState kind="never-used" title="No ERA5 geohash baselines seeded yet" description="Seed the major culinary hubs or a custom coordinate below." />
        ) : (
          <EnvironmentalMetricsGrid summary={envSummary} />
        )}
        <div className="pt-4 border-t border-gray-100 flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <CoordinateForm onSeed={(lat, lon, lbl) => { runSeed([{ latitude: lat, longitude: lon, ...(lbl ? { label: lbl } : {}) }]).catch(() => {}); }} busy={busy} />
          <button type="button" onClick={() => { runSeed(MAJOR_CULINARY_HUBS).catch(() => {}); }} disabled={busy} className="px-4 py-1.5 rounded-lg border border-purple-300 bg-purple-50 hover:bg-purple-100 text-purple-800 text-sm font-medium whitespace-nowrap disabled:opacity-50">
            {busy ? "Seeding ERA5…" : "Seed 5 Major Culinary Hubs"}
          </button>
        </div>
        {feedback && <p className="text-xs font-medium text-purple-800">{feedback}</p>}
      </div>
    </div>
  );
}
