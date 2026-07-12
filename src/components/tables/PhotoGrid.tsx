"use client";

/**
 * Table photo grid + upload affordance for joined members while the table
 * is live or after it closes (memories accrete; the frozen feed card keeps
 * its original photo set). 12-photo cap enforced server-side.
 */

import { Camera } from "lucide-react";
import { useRef, useState } from "react";
import { GlassPanel, LabelXS } from "@/components/tables/ui";
import type { TablePhoto } from "@/types/table";
import type { JSX } from "react";

export interface PhotoGridProps {
  tableId: string;
  photos: TablePhoto[];
  canUpload: boolean;
  onChanged?: () => void;
  className?: string;
}

const MAX_BYTES = 5 * 1024 * 1024;

export function PhotoGrid({
  tableId,
  photos,
  canUpload,
  onChanged,
  className = "",
}: PhotoGridProps): JSX.Element {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    if (file.size > MAX_BYTES) {
      setError("Photos must be under 5MB.");
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error("read failed"));
        reader.readAsDataURL(file);
      });

      const res = await fetch(`/api/tables/${tableId}/photos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ photoDataUrl: dataUrl }),
      });
      const data = (await res.json()) as { success?: boolean; message?: string };
      if (!res.ok || !data.success) {
        setError(data.message || "Could not add that photo.");
        return;
      }
      onChanged?.();
    } catch {
      setError("Could not add that photo.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <GlassPanel className={`p-5 ${className}`}>
      <div className="mb-3 flex items-center justify-between">
        <LabelXS className="text-alchm-fg-dim">Photos</LabelXS>
        {canUpload && (
          <>
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleFile(file);
              }}
            />
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1 text-[10px] font-mono uppercase tracking-wide text-alchm-fg-dim hover:text-alchm-fg disabled:opacity-40"
            >
              <Camera size={12} aria-hidden />
              {uploading ? "Adding…" : "Add photo"}
            </button>
          </>
        )}
      </div>

      {error && <p className="mb-3 text-sm text-rose-400">{error}</p>}

      {photos.length === 0 ? (
        <p className="text-sm text-alchm-fg-mute">No photos yet.</p>
      ) : (
        <div className="grid grid-cols-3 gap-1 overflow-hidden rounded-xl">
          {photos.map((photo, index) => (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              key={photo.id}
              src={photo.url}
              alt={`From the table (${index + 1})`}
              loading="lazy"
              className={`h-full w-full object-cover transition-transform duration-700 hover:scale-105 ${
                index === 0 ? "col-span-2 row-span-2" : ""
              }`}
            />
          ))}
        </div>
      )}
    </GlassPanel>
  );
}

export default PhotoGrid;
