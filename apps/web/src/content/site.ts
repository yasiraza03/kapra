import type { PlateVariant } from "@/components/editorial/WeavePlate";

export interface GeneEntry {
  id: string;
  name: string;
  tier: "MEASURED" | "ESTIMATED" | "INFERRED";
  method: string;
  reads: string;
  detail: string;
  plate: PlateVariant;
  status: "live" | "planned";
}

/** The gene index — what the instrument reads, and by what method. */
export const GENES: GeneEntry[] = [
  {
    id: "weave",
    name: "Weave Structure",
    tier: "MEASURED",
    method: "2D Fourier transform · GLCM · Gabor bank",
    reads: "Plain / twill / satin, thread periodicity, dominant orientation",
    detail:
      "A woven cloth is a periodic signal. Its 2D power spectrum carries the repeat distance and the angle of the wale directly — a twill's diagonal shows up as diagonal energy in frequency space. A grey-level co-occurrence matrix and a bank of Gabor filters corroborate the scale and directionality.",
    plate: "twill",
    status: "live",
  },
  {
    id: "color",
    name: "Color & Dye Evenness",
    tier: "MEASURED",
    method: "CIELAB k-means · CIEDE2000",
    reads: "Dominant palette, area shares, dye consistency",
    detail:
      "Colour is clustered in CIELAB, which is perceptually uniform, so distances mean what the eye means. Dye evenness is the mean CIEDE2000 distance of each pixel to its cluster centre: tight clusters indicate consistent dyeing, a long tail indicates mottling or fade.",
    plate: "plain",
    status: "live",
  },
  {
    id: "texture",
    name: "Texture Fineness",
    tier: "MEASURED",
    method: "Local Binary Patterns · Laplacian energy",
    reads: "Coarse / medium / fine, micro-structure distribution",
    detail:
      "Local Binary Patterns encode the micro-structure around every pixel into a histogram, and the variance of the Laplacian measures how much genuine micro-detail is present. Together they separate a dense fine poplin from an open, coarse weave.",
    plate: "rib",
    status: "live",
  },
  {
    id: "sheen",
    name: "Finish & Sheen",
    tier: "MEASURED",
    method: "Specular histogram analysis",
    reads: "Matte / semi-matte / sheen, specular share",
    detail:
      "A matte fabric scatters light evenly; a mercerised or coated finish throws a bright specular tail. We read that tail from the value-channel distribution, isolating bright low-saturation pixels. It is lighting-dependent, so it reports a deliberately modest confidence.",
    plate: "satin",
    status: "live",
  },
  {
    id: "silhouette",
    name: "Silhouette",
    tier: "MEASURED",
    method: "Segmentation · elliptic Fourier descriptors",
    reads: "Outline shape, proportion ratios",
    detail:
      "Once the garment is isolated from its background, its contour is encoded as elliptic Fourier descriptors and Hu moments — a compact, rotation-aware description of cut and proportion.",
    plate: "spectrum",
    status: "planned",
  },
  {
    id: "fiber",
    name: "Fibre Class",
    tier: "ESTIMATED",
    method: "Fine-tuned classifier on public texture corpora",
    reads: "Probabilistic cotton / linen / wool / synthetic",
    detail:
      "A classifier trained on public material and texture datasets returns a probability distribution, not a verdict. It reports top-k with honest accuracy — pixels cannot tell you fibre content the way a burn test can.",
    plate: "plain",
    status: "planned",
  },
  {
    id: "weight",
    name: "Weight Class",
    tier: "ESTIMATED",
    method: "Weave tightness · opacity · fibre prior",
    reads: "Lightweight / midweight / heavyweight, with an interval",
    detail:
      "You cannot read exact GSM off a JPEG, so we refuse to print one. Weight is reported as a bucket with a stated confidence interval, derived from weave tightness, opacity where a backlit shot exists, and the fibre prior.",
    plate: "rib",
    status: "planned",
  },
  {
    id: "construction",
    name: "Construction",
    tier: "INFERRED",
    method: "Local reasoning over the assembled genome",
    reads: "Likely seam types, finishing, process hypotheses",
    detail:
      "The inferred layer reasons over the measured and estimated genes against a textile knowledge base, and must cite which measurements drove each claim. It is labelled as hypothesis, never as fact.",
    plate: "satin",
    status: "planned",
  },
];

export const TIERS = [
  {
    name: "MEASURED",
    rule: "Computed directly from pixels.",
    detail:
      "A deterministic function of the image. The same pixels always produce the same numbers — Fourier spectra, CIELAB distances, co-occurrence statistics. Reproducible, and verifiable against the visual we show you.",
    color: "var(--tier-measured)",
  },
  {
    name: "ESTIMATED",
    rule: "A model prediction, with its uncertainty attached.",
    detail:
      "A trained model's output, always carrying a confidence and, where it means anything, an interval. We publish validation metrics rather than asking you to take accuracy on faith.",
    color: "var(--tier-estimated)",
  },
  {
    name: "INFERRED",
    rule: "A hypothesis, labelled as one.",
    detail:
      "Reasoning layered over the two tiers above. It must cite the specific measurements that led to it, and it is never presented as a finding.",
    color: "var(--tier-inferred)",
  },
] as const;

export const PRINCIPLES = [
  {
    n: "01",
    title: "Deterministic",
    body: "The measured layer is pure signal processing. Same photograph, same readings, every time.",
  },
  {
    n: "02",
    title: "Evidence-backed",
    body: "No claim ships without the measurement behind it. The schema itself refuses to serialise one.",
  },
  {
    n: "03",
    title: "Zero model weights",
    body: "The core instrument is numpy and OpenCV. Clone it and it runs — no downloads, no API keys.",
  },
  {
    n: "04",
    title: "Honest about limits",
    body: "It will not print a GSM it cannot know. Where pixels run out, confidence drops and says so.",
  },
] as const;

export const STATS = [
  { value: "4", label: "genes live" },
  { value: "3", label: "honesty tiers" },
  { value: "0", label: "model weights" },
  { value: "~1.4s", label: "to sequence" },
] as const;
