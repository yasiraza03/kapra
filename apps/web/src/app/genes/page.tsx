import Link from "next/link";
import { WeavePlate } from "@/components/editorial/WeavePlate";
import { GENES } from "@/content/site";

export const metadata = {
  title: "The gene index",
  description:
    "Every property kapra reads from cloth, the method behind it, and the honesty tier it carries.",
};

const TIER_COLOR: Record<string, string> = {
  MEASURED: "var(--tier-measured)",
  ESTIMATED: "var(--tier-estimated)",
  INFERRED: "var(--tier-inferred)",
};

export default function GenesPage() {
  const groups = ["MEASURED", "ESTIMATED", "INFERRED"] as const;

  return (
    <main>
      {/* masthead */}
      <section className="rule-b">
        <div className="mx-auto max-w-editorial px-5 py-16 sm:px-8 sm:py-24">
          <p className="kicker text-signal">The gene index</p>
          <h1 className="mt-6 max-w-4xl font-display text-d2 font-semibold leading-[0.95] text-ink">
            Everything the instrument reads from cloth.
          </h1>
          <p className="mt-6 max-w-2xl font-sans text-lg leading-relaxed text-ink-dim">
            A genome is assembled from genes. Each gene is one property, produced
            by one named method, carrying one honesty tier. Add a gene and
            nothing else in the system changes — that is the whole architecture.
          </p>
          <dl className="mt-10 flex flex-wrap gap-x-12 gap-y-4">
            <Stat label="genes defined" value={String(GENES.length)} />
            <Stat
              label="live today"
              value={String(GENES.filter((g) => g.status === "live").length)}
            />
            <Stat label="honesty tiers" value="3" />
          </dl>
        </div>
      </section>

      {groups.map((tier, gi) => {
        const items = GENES.filter((g) => g.tier === tier);
        if (items.length === 0) return null;
        return (
          <section key={tier} className={gi === 1 ? "band-dark" : undefined}>
            <div className="mx-auto max-w-editorial px-5 py-16 sm:px-8 sm:py-20">
              <div className="mb-10 flex items-center gap-4">
                <span
                  aria-hidden
                  className="inline-block h-3 w-3"
                  style={{ backgroundColor: TIER_COLOR[tier] }}
                />
                <h2 className="readout text-sm tracking-[0.2em] text-ink">{tier}</h2>
                <span className="h-px flex-1 bg-[color:var(--surface-line)]" />
                <span className="readout text-xs text-ink-faint">
                  {items.length} {items.length === 1 ? "gene" : "genes"}
                </span>
              </div>

              <div className="space-y-px">
                {items.map((g) => (
                  <article
                    key={g.id}
                    id={g.id}
                    className="grid scroll-mt-32 gap-6 border-t border-line py-10 md:grid-cols-[200px_1fr] md:gap-10"
                  >
                    <WeavePlate
                      variant={g.plate}
                      className="aspect-[4/5] w-full max-w-[200px]"
                    />
                    <div>
                      <div className="flex flex-wrap items-baseline justify-between gap-3">
                        <h3 className="font-display text-3xl text-ink">{g.name}</h3>
                        <span
                          className="tier-chip"
                          style={{
                            color:
                              g.status === "live"
                                ? TIER_COLOR[g.tier]
                                : "var(--ink-faint)",
                          }}
                        >
                          {g.status === "live" ? "live" : "planned"}
                        </span>
                      </div>
                      <p className="readout mt-3 text-xs text-ink-faint">{g.method}</p>
                      <p className="mt-4 font-display text-xl italic leading-snug text-ink-dim">
                        {g.reads}
                      </p>
                      <p className="mt-4 max-w-2xl font-sans text-sm leading-relaxed text-ink-dim">
                        {g.detail}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        );
      })}

      <section className="blueprint-grid rule-t">
        <div className="mx-auto max-w-editorial px-5 py-20 text-center sm:px-8">
          <h2 className="mx-auto max-w-3xl font-display text-d3 text-ink">
            See these genes read off a real photograph.
          </h2>
          <div className="mt-8">
            <Link href="/analyze" className="btn-solid">
              Sequence a garment
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="kicker text-ink-faint">{label}</dt>
      <dd className="mt-2 font-display text-3xl text-ink">{value}</dd>
    </div>
  );
}
