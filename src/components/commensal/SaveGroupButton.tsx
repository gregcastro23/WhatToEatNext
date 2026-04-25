"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import type { BirthData, NatalChart } from "@/types/natalChart";

export interface SavableGuest {
  name: string;
  relationship?: "family" | "friend" | "partner" | "colleague" | "other";
  birthData: BirthData;
  natalChart: NatalChart;
}

interface Props {
  guests: SavableGuest[];
  /** Suggested default group name (e.g. "Friday dinner"). User can override. */
  defaultGroupName?: string;
  onSaved?: (groupId: string) => void;
}

type Status = "idle" | "saving" | "saved" | "error";

export function SaveGroupButton({
  guests,
  defaultGroupName = "",
  onSaved,
}: Props) {
  const { status: authStatus } = useSession();
  const [groupName, setGroupName] = useState(defaultGroupName);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (authStatus !== "authenticated") return null;
  if (guests.length === 0) return null;

  const handleSave = async () => {
    const trimmed = groupName.trim();
    if (!trimmed) {
      setErrorMessage("Give your group a name");
      setStatus("error");
      return;
    }
    setStatus("saving");
    setErrorMessage(null);
    try {
      const res = await fetch("/api/commensal/save-group", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ groupName: trimmed, guests }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMessage(data.message ?? "Failed to save group");
        setStatus("error");
        return;
      }
      setStatus("saved");
      onSaved?.(data.diningGroup?.id ?? "");
    } catch (err) {
      console.error("Save group error:", err);
      setErrorMessage("Network error — please try again");
      setStatus("error");
    }
  };

  const isSaved = status === "saved";

  return (
    <div className="glass-card-premium rounded-2xl p-5 border border-white/10 space-y-3">
      <div>
        <h3 className="text-base font-semibold text-purple-100">
          Save this group
        </h3>
        <p className="text-xs text-purple-300/80 mt-1">
          Persist these companions and revisit recommendations from your
          profile.
        </p>
      </div>
      <input
        type="text"
        value={groupName}
        onChange={(e) => setGroupName(e.target.value)}
        placeholder="Group name (e.g. Friday dinner)"
        className="w-full p-2.5 bg-black/40 border border-purple-900/60 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-400/50"
        disabled={status === "saving" || isSaved}
      />
      <button
        type="button"
        onClick={() => void handleSave()}
        disabled={status === "saving" || isSaved}
        className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-lg hover:from-emerald-400 hover:to-teal-400 disabled:opacity-50 transition-all text-sm"
      >
        {status === "saving"
          ? "Saving…"
          : isSaved
            ? "✓ Saved"
            : `Save ${guests.length} companion${guests.length === 1 ? "" : "s"} as a group`}
      </button>
      {status === "error" && errorMessage && (
        <p className="text-xs text-red-300">{errorMessage}</p>
      )}
      {isSaved && (
        <p className="text-xs text-emerald-200">
          Saved. Find it under your profile's dining groups.
        </p>
      )}
    </div>
  );
}

export default SaveGroupButton;
