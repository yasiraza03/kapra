/**
 * Turns a genome into plain English for someone who has never heard of a
 * Fourier transform. The technical readings stay untouched below; this is the
 * "what am I actually looking at" layer.
 */
import type { Genome, GeneResult } from "@kapra/genome-schema";

export interface PlainFact {
  key: string;
  label: string; // "Fabric"
  value: string; // "Twill weave"
  detail: string; // friendly explanation
  technical?: string; // the measurement behind it
  confidence: number;
  swatchHex?: string;
}

export interface PlainSummary {
  headline: string;
  facts: PlainFact[];
}

const FABRIC: Record<string, { name: string; detail: string }> = {
  plain: {
    name: "Plain weave",
    detail:
      "The simplest over-under structure — threads cross one at a time. Think poplin, chambray, canvas.",
  },
  twill: {
    name: "Twill weave",
    detail:
      "Threads step across to form a diagonal line in the cloth. Think denim, chino, gabardine.",
  },
  satin: {
    name: "Satin weave",
    detail:
      "Threads float over several others, giving a smooth, light-catching face. Think sateen or charmeuse.",
  },
  indeterminate: {
    name: "Not clearly woven",
    detail:
      "No regular interlacing was found — this may be a knit, a non-woven, or simply too soft a photograph.",
  },
};

const TEXTURE: Record<string, string> = {
  fine: "Smooth and tightly finished — little visible surface grain.",
  medium: "Lightly textured — the weave is visible but not rough.",
  coarse: "Visibly textured — an open, rustic surface.",
};

const FINISH: Record<string, string> = {
  matte: "Matte. Light scatters evenly, with no shine.",
  "semi-matte": "A soft, low sheen — slight light-catch at angles.",
  sheen: "A noticeable sheen, suggesting a smooth or treated surface.",
};

/** A small, deliberately plain vocabulary of colour names. */
const COLOR_NAMES: ReadonlyArray<readonly [string, [number, number, number]]> = [
  ["black", [20, 20, 22]],
  ["charcoal", [55, 55, 58]],
  ["slate grey", [105, 108, 112]],
  ["grey", [150, 150, 152]],
  ["silver", [196, 196, 198]],
  ["white", [243, 243, 240]],
  ["cream", [238, 230, 210]],
  ["beige", [205, 190, 160]],
  ["tan", [178, 146, 104]],
  ["brown", [120, 88, 60]],
  ["olive", [110, 115, 70]],
  ["green", [70, 125, 80]],
  ["teal", [55, 125, 125]],
  ["navy", [35, 50, 85]],
  ["indigo", [55, 70, 115]],
  ["blue", [70, 105, 175]],
  ["denim blue", [85, 110, 150]],
  ["purple", [110, 80, 140]],
  ["burgundy", [110, 45, 55]],
  ["red", [175, 55, 45]],
  ["rust", [175, 95, 55]],
  ["orange", [210, 130, 55]],
  ["mustard", [200, 165, 70]],
  ["yellow", [225, 205, 95]],
  ["pink", [220, 160, 165]],
];

function hexToRgb(hex: string): [number, number, number] | null {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m || !m[1]) return null;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Nearest plain-language colour name, weighted for human perception. */
export function colorName(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return "unknown";
  let best = "unknown";
  let bestD = Infinity;
  for (const [name, ref] of COLOR_NAMES) {
    // weights approximate luminance sensitivity (red/green matter more)
    const d =
      3 * (rgb[0] - ref[0]) ** 2 +
      4 * (rgb[1] - ref[1]) ** 2 +
      2 * (rgb[2] - ref[2]) ** 2;
    if (d < bestD) {
      bestD = d;
      best = name;
    }
  }
  return best;
}

const num = (v: unknown): number | undefined =>
  typeof v === "number" ? v : undefined;
const str = (v: unknown): string | undefined =>
  typeof v === "string" ? v : undefined;

export function summarize(genome: Genome): PlainSummary {
  const by = new Map<string, GeneResult>();
  for (const g of genome.genes) by.set(g.geneId, g);

  const facts: PlainFact[] = [];

  // ── fabric
  const familyGene = by.get("weave_family");
  const weaveGene = by.get("weave");
  const family = str(familyGene?.value.family) ?? "indeterminate";
  const fabric = FABRIC[family] ?? FABRIC.indeterminate!;
  const period = num(weaveGene?.value.threadPeriodPx);
  facts.push({
    key: "fabric",
    label: "Fabric",
    value: fabric.name,
    detail: fabric.detail,
    ...(period !== undefined
      ? { technical: `thread repeat ${period}px` }
      : {}),
    confidence: familyGene?.confidence ?? 0,
  });

  // ── colour
  const colorGene = by.get("color");
  const hex = str(colorGene?.value.dominantHex);
  if (hex) {
    const evenness = num(colorGene?.value.evenness);
    const evenPct = evenness !== undefined ? Math.round(evenness * 100) : undefined;
    facts.push({
      key: "color",
      label: "Colour",
      value: colorName(hex),
      detail:
        evenPct !== undefined
          ? `Dyeing looks ${evenPct >= 85 ? "very even" : evenPct >= 70 ? "fairly even" : "uneven or faded"} across the surface (${evenPct}% consistency).`
          : "The dominant colour across the surface.",
      technical: hex,
      confidence: colorGene?.confidence ?? 0,
      swatchHex: hex,
    });
  }

  // ── weight
  const weightGene = by.get("weight");
  if (weightGene) {
    const cls = str(weightGene.value.class) ?? "unknown";
    const lo = num(weightGene.value.gsmLow);
    const hi = num(weightGene.value.gsmHigh);
    facts.push({
      key: "weight",
      label: "Weight",
      value: cls === "unknown" ? "Unclear" : cls[0]!.toUpperCase() + cls.slice(1),
      detail:
        lo !== undefined && hi !== undefined
          ? `Roughly ${lo}–${hi} g/m². This is an estimate only — a photo carries no scale, so put a coin or ruler in frame for a real figure.`
          : "Could not be estimated from this photograph.",
      ...(lo !== undefined && hi !== undefined
        ? { technical: `${lo}–${hi} g/m² (estimated)` }
        : {}),
      confidence: weightGene.confidence,
    });
  }

  // ── texture
  const textureGene = by.get("texture");
  const scale = str(textureGene?.value.scale);
  if (scale) {
    facts.push({
      key: "texture",
      label: "Texture",
      value: scale[0]!.toUpperCase() + scale.slice(1),
      detail: TEXTURE[scale] ?? "Surface character of the cloth.",
      confidence: textureGene?.confidence ?? 0,
    });
  }

  // ── finish
  const sheenGene = by.get("sheen");
  const finish = str(sheenGene?.value.finish);
  if (finish) {
    facts.push({
      key: "finish",
      label: "Finish",
      value: finish[0]!.toUpperCase() + finish.slice(1),
      detail: FINISH[finish] ?? "How the surface handles light.",
      confidence: sheenGene?.confidence ?? 0,
    });
  }

  // ── headline
  const weightWord = str(weightGene?.value.class);
  const colourWord = hex ? colorName(hex) : undefined;
  const fabricWord =
    family === "indeterminate" ? "fabric" : `${family} weave`;
  const finishWord = finish && finish !== "matte" ? ` with a ${finish} finish` : "";
  const parts = [weightWord, colourWord, fabricWord].filter(Boolean);
  const headline =
    parts.length > 0
      ? `A ${parts.join(" ")}${finishWord}.`
      : "A fabric specimen.";

  return { headline, facts };
}
