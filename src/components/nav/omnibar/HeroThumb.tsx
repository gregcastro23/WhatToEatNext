"use client";

/**
 * The hero's thumbnail. Some catalog images are missing from the asset store
 * (vanilla.png answers 404 in production), so a failed load falls back to the
 * card's initials instead of an empty box. The load is probed off-DOM, so the
 * <img> itself carries no handlers.
 */
import { useEffect, useState, type JSX } from "react";

export function HeroThumb({ src, label }: { src: string | null; label: string }): JSX.Element {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  useEffect(() => {
    if (src === null) return undefined;
    const probe = new Image();
    probe.onerror = (): void => setFailedSrc(src);
    probe.src = src;
    return (): void => {
      probe.onerror = null;
    };
  }, [src]);
  return (
    <span className="omni-hero-thumb" aria-hidden="true">
      {src !== null && failedSrc !== src ? (
        // A plain <img>: the lazy chunk stays free of next/image, and the URL is already served.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" loading="lazy" />
      ) : (
        label.slice(0, 2)
      )}
    </span>
  );
}
