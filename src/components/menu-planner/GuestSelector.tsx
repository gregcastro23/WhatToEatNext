"use client";

import React, { useState, useEffect } from "react";
import type { NatalChart } from "@/types/natalChart";

// Mock data for saved charts, as we can't fetch from /api/charts directly
const MOCK_SAVED_CHARTS: NatalChart[] = [
  {
    id: "chart-1",
    name: "Greg",
    birthData: {
      dateTime: "1990-05-21T10:30:00Z",
      latitude: 40.7128,
      longitude: -74.006,
    },
    planetaryPositions: {
      Sun: "gemini",
      Moon: "leo",
      Ascendant: "virgo",
      Mercury: "cancer",
      Venus: "taurus",
      Mars: "aries",
      Jupiter: "pisces",
      Saturn: "capricorn",
      Uranus: "aquarius",
      Neptune: "sagittarius",
      Pluto: "scorpio",
    },
    dominantElement: "Air",
    dominantModality: "Mutable",
    elementalBalance: { Fire: 0.2, Water: 0.3, Earth: 0.1, Air: 0.4 },
    alchemicalProperties: { Spirit: 10, Essence: 12, Matter: 8, Substance: 5 },
    calculatedAt: new Date().toISOString(),
  },
  {
    id: "chart-2",
    name: "Monica",
    birthData: {
      dateTime: "1992-11-15T14:00:00Z",
      latitude: 34.0522,
      longitude: -118.2437,
    },
    planetaryPositions: {
      Sun: "scorpio",
      Moon: "taurus",
      Ascendant: "aquarius",
      Mercury: "libra",
      Venus: "sagittarius",
      Mars: "leo",
      Jupiter: "virgo",
      Saturn: "pisces",
      Uranus: "capricorn",
      Neptune: "aquarius",
      Pluto: "scorpio",
    },
    dominantElement: "Water",
    dominantModality: "Fixed",
    elementalBalance: { Fire: 0.1, Water: 0.5, Earth: 0.2, Air: 0.2 },
    alchemicalProperties: { Spirit: 8, Essence: 15, Matter: 10, Substance: 7 },
    calculatedAt: new Date().toISOString(),
  },
];

interface GuestSelectorProps {
  onParticipantsChange: (participantIds: string[]) => void;
}

export function GuestSelector({ onParticipantsChange }: GuestSelectorProps) {
  const [savedCharts, setSavedCharts] = useState<NatalChart[]>([]);
  const [activeParticipants, setActiveParticipants] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real implementation, this would be an API call:
    // fetch('/api/charts').then(res => res.json()).then(data => setSavedCharts(data));
    setIsLoading(true);
    setTimeout(() => {
      setSavedCharts(MOCK_SAVED_CHARTS);
      setIsLoading(false);
    }, 500);
  }, []);

  const toggleParticipant = (chartId: string) => {
    setActiveParticipants((prev) => {
      const newParticipants = prev.includes(chartId)
        ? prev.filter((id) => id !== chartId)
        : [...prev, chartId];

      onParticipantsChange(newParticipants); // Notify parent component
      return newParticipants;
    });
  };

  if (isLoading) {
    return <div>Loading guest charts...</div>;
  }

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="font-semibold mb-2">Select Guest Alchemists</h3>
      <div className="space-y-2">
        {savedCharts.map(
          (chart) =>
            chart.id && (
              <div key={chart.id} className="flex items-center">
                <input
                  type="checkbox"
                  id={`guest-${chart.id}`}
                  checked={activeParticipants.includes(chart.id)}
                  onChange={() => {
                    if (chart.id) {
                      toggleParticipant(chart.id);
                    }
                  }}
                  className="mr-2"
                />
                <label htmlFor={`guest-${chart.id}`}>{chart.name}</label>
              </div>
            ),
        )}
      </div>
    </div>
  );
}
