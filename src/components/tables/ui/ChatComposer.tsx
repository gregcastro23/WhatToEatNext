"use client";

import { Camera, Send } from "lucide-react";
import type { FormEvent, JSX } from "react";

export interface ChatComposerProps {
  /** Controlled input value. */
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  /** Optional photo attach affordance; hidden when omitted. */
  onPhoto?: () => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

/**
 * Discussion composer pill (tables-design-spec.md §2.13): blurred capsule,
 * transparent input, photo button, gradient circular send with violet glow.
 * Positioning (fixed above the nav) is left to the composing screen.
 */
export function ChatComposer({
  value,
  onChange,
  onSend,
  onPhoto,
  disabled = false,
  placeholder = "Share a thought...",
  className = "",
}: ChatComposerProps): JSX.Element {
  const canSend = !disabled && value.trim().length > 0;
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (canSend) onSend();
  };
  return (
    <form
      onSubmit={handleSubmit}
      className={`flex items-center gap-1.5 rounded-full bg-surface-container-highest/60 backdrop-blur-2xl border border-white/10 p-1.5 pl-5 ${className}`}
    >
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        aria-label="Message"
        className="flex-1 min-w-0 bg-transparent text-sm text-alchm-fg placeholder:text-alchm-fg-mute focus:outline-none disabled:opacity-50"
      />
      {onPhoto && (
        <button
          type="button"
          onClick={onPhoto}
          disabled={disabled}
          aria-label="Add a photo"
          className="flex h-9 w-9 items-center justify-center rounded-full text-alchm-fg-dim transition-colors hover:text-alchm-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-alchm-violet disabled:opacity-50"
        >
          <Camera size={18} aria-hidden />
        </button>
      )}
      <button
        type="submit"
        disabled={!canSend}
        aria-label="Send message"
        className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-alchm text-alchm-bg glow-violet transition-all hover:shadow-[0_0_20px_rgba(181,126,224,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-alchm-violet focus-visible:ring-offset-2 focus-visible:ring-offset-alchm-bg disabled:opacity-50 disabled:shadow-none"
      >
        <Send size={16} aria-hidden />
      </button>
    </form>
  );
}

export default ChatComposer;
