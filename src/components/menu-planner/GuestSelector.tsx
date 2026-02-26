"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@/contexts/UserContext";
import type { NatalChart, DiningGroup, GroupMember } from "@/types/natalChart";

interface GuestSelectorProps {
  onParticipantsChange: (participantIds: string[]) => void;
}

export function GuestSelector({ onParticipantsChange }: GuestSelectorProps) {
  const { currentUser, isLoading: userIsLoading, error: userError } = useUser();
  const [activeParticipants, setActiveParticipants] = useState<string[]>([]);

  const savedCharts: Array<DiningGroup | GroupMember> = [
    ...(currentUser?.diningGroups || []),
    ...(currentUser?.groupMembers || []),
  ];

  const toggleParticipant = (chartId: string) => {
    setActiveParticipants((prev) => {
      const newParticipants = prev.includes(chartId)
        ? prev.filter((id) => id !== chartId)
        : [...prev, chartId];

      onParticipantsChange(newParticipants); // Notify parent component
      return newParticipants;
    });
  };

  if (userIsLoading) {
    return <div>Loading guest charts...</div>;
  }

  if (userError) {
    return (
      <div style={{ color: "#ef4444" }}>
        Error loading guest charts: {userError}
      </div>
    );
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
        {savedCharts.length === 0 && (
          <p className="text-gray-500 text-sm">No saved guests found.</p>
        )}
      </div>
    </div>
  );
}
