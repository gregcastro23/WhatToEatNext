"use client";

/**
 * MessageComposer — wraps the Tables UI kit's ChatComposer with local input
 * state, a one-photo attach (data URL, ≤5MB, jpeg/png/webp — the server
 * re-validates), and a send guard. Positioning is left to the parent.
 */

import { useRef, useState } from "react";
import { ChatComposer } from "@/components/tables/ui/ChatComposer";
import type { ChangeEvent, JSX } from "react";

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];

export interface MessageComposerProps {
  disabled?: boolean;
  placeholder?: string;
  /** Return true on a successful send to clear the composer. */
  onSend: (body: string, opts?: { attachmentDataUrl?: string }) => Promise<boolean>;
  allowPhoto?: boolean;
  className?: string;
}

export function MessageComposer({
  disabled = false,
  placeholder,
  onSend,
  allowPhoto = true,
  className = "",
}: MessageComposerProps): JSX.Element {
  const [value, setValue] = useState("");
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const handlePhoto = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!ACCEPTED.includes(file.type)) {
      setError("Photos must be JPEG, PNG, or WebP.");
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setError("Photos must be at most 5MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setPhotoDataUrl(typeof reader.result === "string" ? reader.result : null);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const doSend = async () => {
    if (busy) return;
    const trimmed = value.trim();
    if (!trimmed && !photoDataUrl) return;
    setBusy(true);
    setError(null);
    const ok = await onSend(trimmed, photoDataUrl ? { attachmentDataUrl: photoDataUrl } : undefined);
    setBusy(false);
    if (ok) {
      setValue("");
      setPhotoDataUrl(null);
    } else {
      setError("Message couldn't be sent. Try again.");
    }
  };

  return (
    <div className={className}>
      {error && <p className="mb-1.5 px-2 text-xs text-rose-400">{error}</p>}
      {photoDataUrl && (
        <div className="mb-2 flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photoDataUrl} alt="Attachment preview" className="h-14 w-14 rounded-lg object-cover" />
          <button
            type="button"
            onClick={() => setPhotoDataUrl(null)}
            className="text-xs text-alchm-fg-mute hover:text-alchm-fg"
          >
            Remove
          </button>
        </div>
      )}
      <ChatComposer
        value={value}
        onChange={setValue}
        onSend={() => void doSend()}
        onPhoto={allowPhoto ? () => fileRef.current?.click() : undefined}
        disabled={disabled || busy}
        placeholder={placeholder}
      />
      {allowPhoto && (
        <input
          ref={fileRef}
          type="file"
          accept={ACCEPTED.join(",")}
          onChange={handlePhoto}
          className="hidden"
          aria-hidden
        />
      )}
    </div>
  );
}

export default MessageComposer;
