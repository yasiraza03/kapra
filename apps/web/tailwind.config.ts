import type { Config } from "tailwindcss";

/**
 * Tailwind maps onto the CSS custom properties from @kapra/ui-tokens so there's
 * exactly one source of truth for the palette. Utilities read the variables;
 * the variables live in tokens.css — which means .band-dark / .band-ink invert
 * every utility automatically.
 */
const config: Config = {
  content: [
    "./src/**/*.{ts,tsx,mdx}",
    "../../packages/ui-tokens/src/**/*.{ts,css}",
  ],
  theme: {
    extend: {
      colors: {
        surface: "var(--surface)",
        "surface-raised": "var(--surface-raised)",
        "surface-sunken": "var(--surface-sunken)",
        line: "var(--surface-line)",
        "line-strong": "var(--surface-line-strong)",
        ink: "var(--ink)",
        "ink-dim": "var(--ink-dim)",
        "ink-faint": "var(--ink-faint)",
        signal: "var(--signal)",
        paper: "var(--paper-200)",
        indigo: "var(--indigo-800)",
        tier: {
          measured: "var(--tier-measured)",
          estimated: "var(--tier-estimated)",
          inferred: "var(--tier-inferred)",
        },
      },
      fontFamily: {
        display: "var(--font-display)",
        sans: "var(--font-sans)",
        mono: "var(--font-mono)",
      },
      fontSize: {
        // editorial display scale — fluid, poster-sized
        kicker: ["0.6875rem", { lineHeight: "1", letterSpacing: "0.26em" }],
        d1: ["clamp(3.5rem, 13vw, 11rem)", { lineHeight: "0.86", letterSpacing: "-0.03em" }],
        d2: ["clamp(2.5rem, 7vw, 5.5rem)", { lineHeight: "0.95", letterSpacing: "-0.02em" }],
        d3: ["clamp(1.9rem, 4vw, 3rem)", { lineHeight: "1.05", letterSpacing: "-0.015em" }],
      },
      transitionTimingFunction: {
        liquid: "var(--ease)",
      },
      borderRadius: {
        DEFAULT: "var(--radius)",
      },
      maxWidth: {
        editorial: "88rem",
      },
    },
  },
  plugins: [],
};

export default config;
