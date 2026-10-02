import type { Config } from "tailwindcss";

/**
 * Tailwind maps onto the CSS custom properties from @kapra/ui-tokens so there's
 * exactly one source of truth for the palette. Utilities read the variables;
 * the variables live in tokens.css.
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
        line: "var(--surface-line)",
        ink: "var(--ink)",
        "ink-dim": "var(--ink-dim)",
        "ink-faint": "var(--ink-faint)",
        signal: "var(--signal)",
        tier: {
          measured: "var(--tier-measured)",
          estimated: "var(--tier-estimated)",
          inferred: "var(--tier-inferred)",
        },
      },
      fontFamily: {
        serif: "var(--font-serif)",
        mono: "var(--font-mono)",
        sans: "var(--font-sans)",
      },
      transitionTimingFunction: {
        liquid: "var(--ease)",
      },
      borderRadius: {
        DEFAULT: "var(--radius)",
      },
    },
  },
  plugins: [],
};

export default config;
