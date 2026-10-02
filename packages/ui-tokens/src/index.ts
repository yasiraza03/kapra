/**
 * kapra design tokens — editorial bone paper, near-black ink, cyanotype bands,
 * one oxblood accent.
 *
 * Concept: textiles were historically archived as cyanotype blueprints. kapra is
 * that archive, printed. Paper is the ground; cyanotype is the band; the accent
 * is a single thread of oxblood.
 *
 * Rule that kills slop: nothing decorative that isn't also data.
 */

export const palette = {
  /** Warm bone papers — the ground. */
  paper: {
    100: "#FAF8F2",
    200: "#F3F0E7",
    300: "#EAE5D9",
    400: "#DED7C6",
  },
  /** Near-black warm inks. */
  ink: {
    900: "#141310",
    700: "#332F29",
    500: "#4A463E",
    300: "#8B8578",
  },
  /** Cyanotype — used for dark bands, not the default ground. */
  indigo: {
    900: "#081A27",
    800: "#0E2738",
    600: "#16384D",
    400: "#2D5F7C",
  },
  /** The single accent: oxblood thread. */
  accent: {
    DEFAULT: "#B23E2B",
    bright: "#CC4A33",
    deep: "#8A2E1F",
  },
  /** Data spectrum — reserved for measurement visuals only, never chrome. */
  data: {
    c1: "#0E2738",
    c2: "#1C6B74",
    c3: "#4E9A8E",
    c4: "#C2A24A",
    c5: "#D2802F",
    c6: "#B23E2B",
  },
} as const;

/** Honesty tiers get a stable visual language across the whole app. */
export const tierColor = {
  MEASURED: palette.data.c2, // teal — hard, computed, trustworthy
  ESTIMATED: "#9A6B1F", // ochre — probabilistic
  INFERRED: palette.accent.DEFAULT, // oxblood — explicitly a hypothesis
} as const;

export const typography = {
  display: `"Bodoni Moda", Didot, "Times New Roman", Georgia, serif`,
  sans: `"Archivo", Inter, system-ui, -apple-system, "Segoe UI", sans-serif`,
  mono: `"IBM Plex Mono", "SFMono-Regular", ui-monospace, monospace`,
} as const;

export const motion = {
  /** Liquid easing — restrained; this is an instrument, not a toy. */
  ease: "cubic-bezier(0.22, 1, 0.36, 1)",
  fast: "160ms",
  base: "320ms",
  slow: "640ms",
} as const;

export const space = {
  grid: "8px",
  radius: "0px", // editorial: no rounding
  rule: "1px",
} as const;

export type Tier = keyof typeof tierColor;
