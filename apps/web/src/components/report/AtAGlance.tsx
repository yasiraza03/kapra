import type { Genome } from "@kapra/genome-schema";
import { summarize } from "@/lib/plain";

function confidenceWord(c: number): { word: string; color: string } {
  if (c >= 0.75) return { word: "high confidence", color: "var(--tier-measured)" };
  if (c >= 0.5) return { word: "moderate confidence", color: "var(--tier-estimated)" };
  return { word: "low confidence", color: "var(--tier-inferred)" };
}

/**
 * The plain-English answer, before any signal processing is mentioned. Someone
 * who has never heard of a Fourier transform should be able to read this panel
 * and know what the cloth is.
 */
export function AtAGlance({ genome }: { genome: Genome }) {
  const { headline, facts } = summarize(genome);

  return (
    <section className="rule-b bg-surface-raised">
      <div className="mx-auto max-w-editorial px-5 py-14 sm:px-8 sm:py-16">
        <p className="kicker text-ink-faint">In plain English</p>

        <h2 className="mt-5 max-w-4xl font-display text-d3 font-semibold leading-[1.05] text-ink">
          {headline}
        </h2>

        <div className="mt-12 grid gap-px border border-line bg-[color:var(--surface-line)] sm:grid-cols-2 lg:grid-cols-3">
          {facts.map((f) => {
            const conf = confidenceWord(f.confidence);
            return (
              <div key={f.key} className="bg-surface p-6">
                <div className="flex items-center justify-between gap-3">
                  <p className="kicker text-ink-faint">{f.label}</p>
                  {f.swatchHex && (
                    <span
                      aria-hidden
                      className="h-5 w-5 border border-line"
                      style={{ backgroundColor: f.swatchHex }}
                    />
                  )}
                </div>

                <p className="mt-3 font-display text-2xl capitalize text-ink">
                  {f.value}
                </p>

                <p className="mt-3 font-sans text-sm leading-relaxed text-ink-dim">
                  {f.detail}
                </p>

                <div className="mt-5 flex items-center gap-2 border-t border-line pt-3">
                  <span
                    aria-hidden
                    className="inline-block h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: conf.color }}
                  />
                  <span className="readout text-[0.625rem] uppercase tracking-[0.16em] text-ink-faint">
                    {conf.word}
                  </span>
                  {f.technical && (
                    <span className="readout ml-auto text-[0.625rem] text-ink-faint">
                      {f.technical}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-8 max-w-3xl font-sans text-sm leading-relaxed text-ink-faint">
          Everything above is derived from the photograph alone. The full
          measurements, the figures behind them, and how far each can be trusted
          are below.
        </p>
      </div>
    </section>
  );
}
