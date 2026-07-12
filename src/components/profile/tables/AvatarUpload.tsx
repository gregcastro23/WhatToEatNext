"use client";

/**
 * AvatarUpload — the owner-only affordance on the profile avatar ring
 * (tables-design-spec.md §3.5 / §4.2). File → data URL → POST /api/user/avatar
 * (same data-URL pipeline as the cook-photo share). The reveal reward
 * (visage_revealed) comes back from the server and is handed to the delight
 * host — no visible token amounts here.
 */

import { Camera, X } from "lucide-react";
import { useRef, useState, type JSX } from "react";
import { LabelXS } from "@/components/tables/ui";
import { revealPracticeReward } from "@/lib/economy/practiceClient";

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPTED = new Set(["image/jpeg", "image/png", "image/webp"]);

export interface AvatarUploadProps {
  /** Whether the owner currently has an uploaded avatar (enables Remove). */
  hasAvatar: boolean;
  onChanged: (avatarUrl: string | null) => void;
  className?: string;
}

export function AvatarUpload({ hasAvatar, onChanged, className = "" }: AvatarUploadProps): JSX.Element {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = async (file: File) => {
    if (!ACCEPTED.has(file.type)) {
      setError("JPEG, PNG or WebP only");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("Image must be under 5MB");
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error("read failed"));
        reader.readAsDataURL(file);
      });
      const res = await fetch("/api/user/avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoDataUrl: dataUrl }),
      });
      const json = (await res.json()) as {
        success?: boolean;
        avatarUrl?: string;
        message?: string;
        reward?: { tokenType: string; amount: number; hint: string } | null;
      };
      if (json.success && json.avatarUrl) {
        onChanged(json.avatarUrl);
        if (json.reward) revealPracticeReward(json.reward);
      } else {
        setError(json.message || "Upload failed");
      }
    } catch {
      setError("Upload failed");
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/user/avatar", { method: "DELETE" });
      const json = (await res.json()) as { success?: boolean; message?: string };
      if (json.success) {
        onChanged(null);
      } else {
        setError(json.message || "Removal failed");
      }
    } catch {
      setError("Removal failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={`flex flex-col items-center gap-1.5 ${className}`}>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void upload(file);
          e.target.value = "";
        }}
      />
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 bg-white/5 border border-white/10 text-alchm-fg-dim hover:text-white hover:border-white/25 transition-colors disabled:opacity-50"
          aria-label={hasAvatar ? "Change avatar" : "Reveal your visage"}
        >
          <Camera size={12} aria-hidden />
          <LabelXS>{busy ? "Working…" : hasAvatar ? "Change" : "Reveal visage"}</LabelXS>
        </button>
        {hasAvatar && (
          <button
            type="button"
            disabled={busy}
            onClick={() => void remove()}
            className="inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 bg-white/5 border border-white/10 text-alchm-fg-dim hover:text-rose-300 hover:border-rose-400/30 transition-colors disabled:opacity-50"
            aria-label="Remove avatar"
          >
            <X size={12} aria-hidden />
          </button>
        )}
      </div>
      {error && <LabelXS className="text-rose-300/80">{error}</LabelXS>}
    </div>
  );
}

export default AvatarUpload;
