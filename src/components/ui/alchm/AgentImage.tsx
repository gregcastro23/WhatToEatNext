import type { CSSProperties, JSX } from "react";

export interface AgentImageProps {
  label?: string;
  aspect?: string;
  /** Optional real image URL from /api/generate-image cache */
  src?: string;
  alt?: string;
  style?: CSSProperties;
  endpointLabel?: string;
}

export function AgentImage({
  label = "AGENT · IMG",
  aspect = "4/3",
  src,
  alt,
  style,
  endpointLabel = "/api/generate-image",
}: AgentImageProps): JSX.Element {
  return (
    <div
      style={{
        position: "relative",
        aspectRatio: aspect,
        borderRadius: 10,
        overflow: "hidden",
        background: src
          ? undefined
          : `
              repeating-linear-gradient(135deg, rgba(255,255,255,0.025) 0 1px, transparent 1px 14px),
              radial-gradient(ellipse at 30% 20%, color-mix(in oklch, var(--accent), transparent 70%), transparent 60%),
              linear-gradient(180deg, #1A1525, #0E0B16)
            `,
        border: "1px solid var(--line)",
        ...style,
      }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt ?? label}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      ) : (
        <>
          <div
            style={{
              position: "absolute",
              inset: 12,
              border: "1px dashed rgba(255,255,255,0.08)",
              borderRadius: 6,
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 12,
              left: 12,
              fontFamily: "var(--f-mono)",
              fontSize: 9,
              letterSpacing: "0.18em",
              color: "var(--fg-mute)",
            }}
          >
            {label}
          </div>
          <div
            style={{
              position: "absolute",
              bottom: 12,
              right: 12,
              fontFamily: "var(--f-mono)",
              fontSize: 9,
              letterSpacing: "0.18em",
              color: "var(--fg-faint)",
            }}
          >
            {endpointLabel}
          </div>
        </>
      )}
    </div>
  );
}

export default AgentImage;
