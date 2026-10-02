import type { VizSpec } from "@kapra/genome-schema";
import { FftViz } from "./FftViz";
import { BarsViz } from "./BarsViz";
import { PaletteViz } from "./PaletteViz";
import { HistogramViz } from "./HistogramViz";

/**
 * Renders the proof for a gene. The engine owns the data; the web app owns the
 * rendering. Unknown viz kinds degrade to nothing rather than crash — so adding
 * a new kind engine-side never breaks an older client.
 */
export function VizRenderer({ spec }: { spec: VizSpec }) {
  const data = (spec.data ?? {}) as Record<string, unknown>;
  const body = render(spec.kind, data);
  if (!body) return null;
  return (
    <figure className="m-0">
      {spec.title && (
        <figcaption className="readout mb-3 text-[0.625rem] uppercase tracking-[0.22em] text-ink-dim">
          {spec.title}
        </figcaption>
      )}
      {body}
      {spec.caption && (
        <p className="mt-3 font-sans text-xs leading-relaxed text-ink-faint">{spec.caption}</p>
      )}
    </figure>
  );
}

function render(kind: VizSpec["kind"], data: Record<string, unknown>) {
  switch (kind) {
    case "fft":
      return <FftViz data={data} />;
    case "bars":
    case "gabor":
      return <BarsViz data={data} />;
    case "palette":
      return <PaletteViz data={data} />;
    case "histogram":
      return <HistogramViz data={data} />;
    default:
      return null;
  }
}
