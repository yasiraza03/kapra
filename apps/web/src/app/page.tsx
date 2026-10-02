import { GENOME_SCHEMA_VERSION, TIERS } from "@kapra/genome-schema";
import { probeEngine } from "@/lib/api/engine";
import { TierChip } from "@/components/ui/TierChip";

export default async function Home() {
  const probe = await probeEngine();

  return (
    <main className="blueprint-grid min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-10">
        {/* masthead */}
        <header className="flex items-baseline justify-between border-b border-line pb-4">
          <span className="readout text-xs uppercase tracking-[0.3em] text-ink-dim">
            kapra
          </span>
          <span className="readout text-xs text-ink-faint">
            genome schema v{GENOME_SCHEMA_VERSION}
          </span>
        </header>

        {/* hero */}
        <section className="flex flex-1 flex-col justify-center py-16">
          <p className="readout mb-6 text-xs uppercase tracking-[0.3em] text-signal">
            garment forensics instrument
          </p>
          <h1 className="font-serif text-5xl font-light leading-[1.05] text-ink sm:text-6xl">
            Reconstruct a garment&apos;s{" "}
            <span className="italic text-signal">genome</span> from
            photographs.
          </h1>
          <p className="mt-6 max-w-2xl font-sans text-lg leading-relaxed text-ink-dim">
            Weave, texture, color, silhouette, construction — measured from pixels
            with real computer vision. Every claim is stamped with how confident
            we are, and why.
          </p>

          {/* the honesty taxonomy, front and centre */}
          <div className="mt-10 flex flex-wrap gap-3">
            {TIERS.map((t) => (
              <TierChip key={t} tier={t} title />
            ))}
          </div>
        </section>

        {/* engine instrument readout */}
        <footer className="border-t border-line pt-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span
                aria-hidden
                className="inline-block h-2 w-2 rounded-full"
                style={{
                  backgroundColor: probe.ok
                    ? "var(--tier-measured)"
                    : "var(--signal)",
                  boxShadow: probe.ok
                    ? "0 0 10px var(--tier-measured)"
                    : "0 0 10px var(--signal)",
                }}
              />
              <span className="readout text-xs text-ink-dim">
                engine{" "}
                {probe.ok ? (
                  <span className="text-ink">
                    online · v{probe.health.version}
                  </span>
                ) : (
                  <span className="text-signal">offline · {probe.error}</span>
                )}
              </span>
            </div>
            <span className="readout text-xs text-ink-faint">
              phase 0 — foundations
            </span>
          </div>
        </footer>
      </div>
    </main>
  );
}
