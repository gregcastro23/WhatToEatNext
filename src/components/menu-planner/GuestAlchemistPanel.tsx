"use client";

/**
 * Guest Alchemist Panel
 * Allows users to add guest participants ("Guest Alchemists") to the session
 * for collective synastry calculations.
 *
 * @file src/components/menu-planner/GuestAlchemistPanel.tsx
 * @created 2026-02-09
 */

import {
  useMenuPlanner,
  type Participant,
} from "@/contexts/MenuPlannerContext";
import React, { useState } from "react";

export default function GuestAlchemistPanel({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { participants, addParticipant, removeParticipant } = useMenuPlanner();

  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [location, setLocation] = useState(""); // Simplified for now

  // Default coordinates for MVP (users can just enter city name in future)
  const defaultLocation = { latitude: 40.7128, longitude: -74.006 }; // NYC

  const handleAddGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !birthDate) return;

    const newGuest: Participant = {
      id: `guest-${Date.now()}`,
      name,
      birthDate,
      birthTime: birthTime || "12:00",
      location: location || `${defaultLocation.latitude},${defaultLocation.longitude}`,
    };

    addParticipant(newGuest);
    setName("");
    setBirthDate("");
    setBirthTime("");
    setLocation("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-end z-50">
      <div className="w-96 bg-white h-full shadow-2xl p-6 overflow-y-auto animate-slide-in-right">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Guest Alchemists</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ×
          </button>
        </div>

        <p className="text-gray-600 mb-6 text-sm">
          Add friends to calculate your collective alchemical equilibrium. Menu
          recommendations will balance the group's energy.
        </p>

        {/* Add Guest Form */}
        <form
          onSubmit={handleAddGuest}
          className="space-y-4 mb-8 border-b pb-6"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
              placeholder="Friend's Name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Birth Date
            </label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Birth Time (Optional)
            </label>
            <input
              type="time"
              value={birthTime}
              onChange={(e) => setBirthTime(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg py-2 font-medium hover:shadow-lg transition-all"
          >
            Add Guest
          </button>
        </form>

        {/* Participants List */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-3">
            Active Session ({participants.length + 1})
          </h3>
          <div className="space-y-3">
            {/* User (Self) */}
            <div className="flex items-center p-3 bg-blue-50 rounded-lg border border-blue-100">
              <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-bold mr-3">
                Me
              </div>
              <div>
                <p className="font-medium text-gray-800">You</p>
                <p className="text-xs text-gray-500">Host Alchemist</p>
              </div>
            </div>

            {/* Guests */}
            {participants.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-100"
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-purple-200 flex items-center justify-center text-purple-700 font-bold mr-3">
                    {p.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{p.name}</p>
                    <p className="text-xs text-gray-500">{p.birthDate}</p>
                  </div>
                </div>
                <button
                  onClick={() => removeParticipant(p.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                  title="Remove"
                >
                  🗑️
                </button>
              </div>
            ))}

            {participants.length === 0 && (
              <p className="text-center text-sm text-gray-400 py-2">
                No guests added yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
