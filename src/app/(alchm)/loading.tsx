/**
 * Route-group loading state for (alchm)/*.
 *
 * Next.js streams this immediately while the page-tree renders. Without it,
 * a slow render (e.g. cold-start tail latency on /profile or
 * /restaurant-creator) leaves the user looking at a blank page until either
 * SSR completes or the 60s function timeout fires. With it, the loading
 * skeleton ships in the first chunk and the user sees motion.
 *
 * Intentionally minimal so it's small and renders instantly without pulling
 * in heavy client modules.
 */
export default function AlchmLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading"
      className="alchm-loading"
      style={{
        minHeight: "60vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "rgba(255,255,255,0.5)",
        fontFamily: "var(--font-mono, ui-monospace, monospace)",
        fontSize: "0.75rem",
        letterSpacing: "0.15em",
        textTransform: "uppercase",
      }}
    >
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.75rem",
        }}
      >
        <span
          aria-hidden="true"
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "999px",
            background: "currentColor",
            opacity: 0.6,
            animation: "alchm-pulse 1.4s ease-in-out infinite",
          }}
        />
        Aligning
      </span>
      <style>{`
        @keyframes alchm-pulse {
          0%, 100% { opacity: 0.25; transform: scale(0.9); }
          50% { opacity: 0.85; transform: scale(1.15); }
        }
      `}</style>
    </div>
  );
}
