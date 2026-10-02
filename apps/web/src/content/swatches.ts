/**
 * Demo specimens shipped with the app.
 *
 * These are rendered by apps/engine/scripts/generate_swatches.py — real
 * interlacing patterns with yarn shading, slub and fibre fuzz, not stock
 * photography. That keeps the repo free of licensed assets and means anyone who
 * clones it can try the instrument without finding a photo first.
 */
export interface DemoSwatch {
  slug: string;
  name: string;
  weave: "plain" | "twill" | "satin";
  note: string;
}

export const DEMO_SWATCHES: DemoSwatch[] = [
  { slug: "linen-natural", name: "Linen", weave: "plain", note: "Coarse plain weave, undyed" },
  { slug: "denim-indigo", name: "Denim", weave: "twill", note: "2/2 twill, indigo warp" },
  { slug: "poplin-white", name: "Poplin", weave: "plain", note: "Fine, dense plain weave" },
  { slug: "satin-charcoal", name: "Satin", weave: "satin", note: "5-harness floats, high sheen" },
  { slug: "flannel-grey", name: "Flannel", weave: "twill", note: "Brushed wool twill" },
  { slug: "canvas-olive", name: "Canvas", weave: "plain", note: "Heavy cotton plain weave" },
];

export const swatchSrc = (slug: string) => `/swatches/${slug}.jpg`;
