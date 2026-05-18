/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    "el-fire",
    "el-water",
    "el-earth",
    "el-air",
    "el-dot",
  ],
  theme: {
    extend: {
      colors: {
        // Modern Alchemist surface palette (dark mode only)
        "alchm-bg": "#07060B",
        "alchm-bg-elev": "#0E0C16",
        "alchm-bg-elev-2": "#15121F",
        "alchm-surface": "rgba(255,255,255,0.03)",
        "alchm-surface-hi": "rgba(255,255,255,0.055)",
        "alchm-line": "rgba(255,255,255,0.08)",
        "alchm-line-hi": "rgba(255,255,255,0.14)",
        "alchm-fg": "#F2EDFF",
        "alchm-fg-dim": "#B5ADCC",
        "alchm-fg-mute": "#6E6884",
        "alchm-fg-faint": "#3F3A52",
        // Accents
        "alchm-violet": "oklch(0.72 0.18 305)",
        "alchm-copper": "oklch(0.78 0.14 65)",
        "alchm-violet-soft":
          "color-mix(in oklch, oklch(0.72 0.18 305), transparent 70%)",
        "alchm-violet-glow":
          "color-mix(in oklch, oklch(0.72 0.18 305), transparent 80%)",
        // Elemental
        "el-fire": "oklch(0.74 0.17 35)",
        "el-water": "oklch(0.74 0.13 230)",
        "el-earth": "oklch(0.74 0.11 130)",
        "el-air": "oklch(0.85 0.07 90)",
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', '"EB Garamond"', "serif"],
        body: ["Manrope", "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
      borderRadius: {
        "alchm-sm": "8px",
        alchm: "14px",
        "alchm-lg": "16px",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-up": {
          "0%": { transform: "translateY(100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(-4px)" },
          "75%": { transform: "translateX(4px)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "0.9" },
        },
        breathe: {
          "0%, 100%": { transform: "scale(1)", opacity: "0.7" },
          "50%": { transform: "scale(1.04)", opacity: "1" },
        },
        scanLine: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(1200%)" },
        },
        blink: {
          "0%, 49%": { opacity: "1" },
          "50%, 100%": { opacity: "0.3" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.3s ease-in-out",
        "fade-in-up": "fade-in-up 0.3s ease-in-out",
        "slide-up": "slide-up 0.3s ease-out",
        shake: "shake 0.3s ease-in-out",
        "pulse-glow": "pulseGlow 1.4s ease-in-out infinite",
        breathe: "breathe 4s ease-in-out infinite",
        "scan-line": "scanLine 6s linear infinite",
        "blink-dot": "blink 1.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
