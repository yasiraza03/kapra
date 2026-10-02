import type { GeneResult } from "@kapra/genome-schema";
import { TierChip } from "../ui/TierChip";
import { ConfidenceMeter } from "./ConfidenceMeter";
import { EvidenceList } from "./EvidenceList";
import { VizRenderer } from "../viz/VizRenderer";

function humanize(key: string): string {
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/Px$/, " (px)")
    .replace(/Deg$/, " (°)")
    .toLowerCase();
}

function primitiveEntries(value: Record<string, unknown>): [string, string][] {
  return Object.entries(value)
    .filter(([, v]) => ["string", "number", "boolean"].includes(typeof v))
    .map(([k, v]) => [humanize(k), String(v)]);
}

export function GeneCard({ gene, index }: { gene: GeneResult; index: number }) {
  const readouts = primitiveEntries(gene.value);
  const tierVar =
    gene.tier === "MEASURED"
      ? "var(--tier-measured)"
      : gene.tier === "ESTIMATED"
        ? "var(--tier-estimated)"
        : "var(--tier-inferred)";

  return (
    <article
      className="relative border border-line bg-surface-raised/40 p-6 sm:p-8"
      style={{ borderLeft: `2px solid ${tierVar}` }}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-baseline gap-3">
          <span className="readout text-xs text-ink-faint">
            {String(index + 1).padStart(2, "0")}
          </span>
          <h3 className="font-display text-2xl text-ink">{gene.label}</h3>
        </div>
        <div className="flex items-center gap-4">
          <TierChip tier={gene.tier} title />
          <ConfidenceMeter value={gene.confidence} tier={gene.tier} />
        </div>
      </div>

      {gene.summary && (
        <p className="mt-3 font-display text-lg italic leading-snug text-ink-dim">
          {gene.summary}
        </p>
      )}

      {readouts.length > 0 && (
        <dl className="mt-6 grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-3">
          {readouts.map(([k, v]) => (
            <div key={k}>
              <dt className="readout text-[0.625rem] uppercase tracking-[0.18em] text-ink-faint">
                {k}
              </dt>
              <dd className="readout text-base text-ink">{v}</dd>
            </div>
          ))}
        </dl>
      )}

      {gene.viz && gene.viz.length > 0 && (
        <div className="mt-8 space-y-8 border-t border-line pt-6">
          {gene.viz.map((spec) => (
            <VizRenderer key={spec.id} spec={spec} />
          ))}
        </div>
      )}

      <div className="mt-8 border-t border-line pt-5">
        <p className="readout mb-2 text-[0.625rem] uppercase tracking-[0.22em] text-ink-faint">
          evidence
        </p>
        <EvidenceList evidence={gene.evidence} />
      </div>
    </article>
  );
}
