/**
 * kapra design tokens — cyanotype x bone x thread-red.
 *
 * Concept: textiles were historically archived as cyanotype blueprints. kapra
 * is that archive reborn as a forensic instrument. The default surface is the
 * blueprint (deep indigo ground, bone ink), with a single thread-red accent
 * reserved for the live/active signal and a constrained data spectrum reserved
 * ONLY for measurement visuals (FFT / Gabor / heatmaps).
 *
 * Rule that kills slop: nothing decorative that isn't also data.
 */

export const palette = {
  /** Cyanotype blueprint grounds — darkest to lightest. */
  blueprint: {
    900: "#06131F", // deepest ground
    800: "#0A1E2E",
    700: "#0E2A3F",
    600: "#143A54",
    500: "#1D4E6E", // classic cyanotype prussian blue
    400: "#2E6A8E",
    300: "#4E8AAE",
  },
  /** Bone / ecru papers — the "print" side. */
  bone: {
    100: "#F4EFE3",
    200: "#ECE5D4",
    300: "#DED5BF",
    400: "#C7BCA1",
  },
  /** The single accent: thread-red. Live signal, active state, the one spark. */
  thread: {
    DEFAULT: "#CE402E",
    bright: "#E24A33",
    deep: "#A4301F",
  },
  /** Data spectrum — reserved for measurement visuals only, never chrome. */
  data: {
    c0: "#0A1E2E",
    c1: "#14506E",
    c2: "#2E8FA8",
    c3: "#7BC4B6",
    c4: "#D9D28A",
    c5: "#E8A24A",
    c6: "#CE402E",
  },
} as const;

/** Honesty tiers get their own stable visual language across the whole app. */
export const tierColor = {
  MEASURED: palette.data.c2, // teal — hard, computed, trustworthy
  ESTIMATED: palette.data.c4, // sand — probabilistic
  INFERRED: palette.thread.DEFAULT, // thread-red — explicitly a hypothesis
} as const;

export const typography = {
  serif: `"Newsreader", "Iowan Old Style", Georgia, serif`, // editorial voice
  mono: `"IBM Plex Mono", "SFMono-Regular", ui-monospace, monospace`, // data readouts + tiers
  sans: `"Inter", system-ui, -apple-system, "Segoe UI", sans-serif`, // body
  scale: {
    xs: "0.75rem",
    sm: "0.875rem",
    base: "1rem",
    lg: "1.25rem",
    xl: "1.75rem",
    "2xl": "2.5rem",
    "3xl": "3.75rem",
    "4xl": "5.5rem",
  },
} as const;

export const motion = {
  /** Liquid easing — restrained; this is an instrument, not a toy. */
  ease: "cubic-bezier(0.22, 1, 0.36, 1)",
  fast: "160ms",
  base: "320ms",
  slow: "640ms",
} as const;

export const space = {
  grid: "8px", // blueprint measurement grid base unit
  radius: "2px", // technical, crisp — almost no rounding
  rule: "1px", // callout line weight
} as const;

export type Tier = keyof typeof tierColor;
