import Link from "next/link";
import type { Genome, Tier } from "@kapra/genome-schema";
import { GeneCard } from "./GeneCard";

const TIER_ORDER: Record<Tier, number> = { MEASURED: 0, ESTIMATED: 1, INFERRED: 2 };

export function ForensicReport({ genome }: { genome: Genome }) {
  const shot = genome.source.shots[0];
  const genes = [...genome.genes].sort((a, b) => TIER_ORDER[a.tier] - TIER_ORDER[b.tier]);
  const totalMs = genome.timings
    ? Object.values(genome.timings).reduce((a, b) => a + b, 0)
    : null;
  const created = new Date(genome.createdAt);

  return (
    <main>
      {/* title block */}
      <section className="rule-b">
        <div className="mx-auto max-w-editorial px-5 py-14 sm:px-8 sm:py-20">
          <p className="kicker text-signal">Forensic report</p>
          <h1 className="mt-6 break-all font-display text-d3 font-semibold text-ink">
            {genome.id}
          </h1>
          <dl className="mt-8 flex flex-wrap gap-x-12 gap-y-4">
            <Meta
              label="sequenced"
              value={`${created.toISOString().replace("T", " ").slice(0, 19)} UTC`}
            />
            <Meta label="genes" value={String(genome.genes.length)} />
            {totalMs != null && <Meta label="compute" value={`${totalMs.toFixed(0)} ms`} />}
            <Meta label="schema" value={`v${genome.schemaVersion}`} />
          </dl>
        </div>
      </section>

      {/* specimen + legend */}
      <section className="band-dark">
        <div className="mx-auto grid max-w-editorial gap-10 px-5 py-14 sm:px-8 md:grid-cols-[0.85fr_1.15fr]">
          <div className="relative aspect-square w-full overflow-hidden border border-line">
            {shot?.uri ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={shot.uri}
                alt="Analyzed specimen"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-ink-faint">
                no preview
              </div>
            )}
            <span className="readout absolute left-3 top-3 bg-surface/85 px-2 py-1 text-[0.625rem] uppercase tracking-[0.2em] text-ink-dim">
              {shot?.type ?? "specimen"}
              {shot?.width && shot?.height ? ` · ${shot.width}×${shot.height}` : ""}
            </span>
          </div>

          <div className="flex flex-col justify-center">
            <p className="kicker text-ink-faint">Honesty tiers</p>
            <ul className="mt-6 space-y-4">
              <LegendRow
                color="var(--tier-measured)"
                name="MEASURED"
                gloss="computed directly from pixels — deterministic and reproducible"
              />
              <LegendRow
                color="var(--tier-estimated)"
                name="ESTIMATED"
                gloss="a model prediction, carrying a confidence interval"
              />
              <LegendRow
                color="var(--tier-inferred)"
                name="INFERRED"
                gloss="a hypothesis reasoned from the tiers above"
              />
            </ul>

            {genome.warnings && genome.warnings.length > 0 && (
              <div className="mt-8 border border-line p-4">
                <p className="kicker text-signal">Warnings</p>
                {genome.warnings.map((w, i) => (
                  <p key={i} className="mt-2 font-sans text-xs text-ink-dim">
                    {w}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* genome strand */}
      <section>
        <div className="mx-auto max-w-editorial space-y-6 px-5 py-16 sm:px-8 sm:py-20">
          {genes.map((gene, i) => (
            <GeneCard key={gene.geneId} gene={gene} index={i} />
          ))}
        </div>
      </section>

      {/* closing */}
      <section className="blueprint-grid rule-t">
        <div className="mx-auto flex max-w-editorial flex-wrap items-center justify-between gap-6 px-5 py-14 sm:px-8">
          <h2 className="font-display text-d3 text-ink">Sequence another specimen.</h2>
          <div className="flex flex-wrap gap-4">
            <Link href="/analyze" className="btn-solid">
              New analysis
            </Link>
            <Link href="/archive" className="btn-line">
              The archive
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="kicker text-ink-faint">{label}</dt>
      <dd className="readout mt-2 text-sm text-ink-dim">{value}</dd>
    </div>
  );
}

function LegendRow({ color, name, gloss }: { color: string; name: string; gloss: string }) {
  return (
    <li className="flex items-start gap-4">
      <span
        aria-hidden
        className="mt-1.5 inline-block h-2.5 w-2.5 shrink-0"
        style={{ backgroundColor: color }}
      />
      <span className="font-sans text-sm">
        <span className="readout text-xs tracking-[0.16em] text-ink">{name}</span>
        <span className="text-ink-dim"> — {gloss}</span>
      </span>
    </li>
  );
}
