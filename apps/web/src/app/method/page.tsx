import Link from "next/link";
import { WeavePlate } from "@/components/editorial/WeavePlate";
import { TIERS } from "@/content/site";

export const metadata = {
  title: "The method",
  description:
    "How kapra reads cloth: Fourier analysis of weave, CIELAB colour forensics, texture statistics — and where the instrument stops.",
};

const PIPELINE = [
  {
    n: "01",
    title: "Intake",
    body: "A photograph arrives. It is decoded, downscaled to a working resolution, and a clean interior patch is cropped away from the edges — fabric genes should read cloth, not the table it sits on.",
  },
  {
    n: "02",
    title: "Transform",
    body: "The patch is windowed and pushed through a 2D fast Fourier transform. Periodic structure that is nearly invisible in the image becomes a bright, measurable peak in frequency space.",
  },
  {
    n: "03",
    title: "Extract",
    body: "Each registered extractor runs independently over the same context — weave, colour, texture, finish — and returns a value, a confidence, the evidence behind it, and a specification for how to draw the proof.",
  },
  {
    n: "04",
    title: "Assemble",
    body: "The genome is assembled, versioned, timed per gene, and stored. A failing extractor degrades into a warning rather than taking the whole reading down with it.",
  },
];

export default function MethodPage() {
  return (
    <main>
      <section className="rule-b">
        <div className="mx-auto max-w-editorial px-5 py-16 sm:px-8 sm:py-24">
          <p className="kicker text-signal">The method</p>
          <h1 className="mt-6 max-w-4xl font-display text-d2 font-semibold leading-[0.95] text-ink">
            Cloth is a periodic signal. So we treat it like one.
          </h1>
          <p className="mt-6 max-w-2xl font-sans text-lg leading-relaxed text-ink-dim">
            A woven fabric repeats. Warp crosses weft on a fixed interval, at a
            fixed angle. That regularity is a frequency, and frequencies are
            measurable — exactly, repeatably, without a model guessing on your
            behalf.
          </p>
        </div>
      </section>

      {/* the Fourier idea */}
      <section className="band-dark">
        <div className="mx-auto grid max-w-editorial items-center gap-12 px-5 py-20 sm:px-8 md:grid-cols-2">
          <div>
            <p className="kicker text-ink-faint">Frequency space</p>
            <h2 className="mt-5 font-display text-d3 text-ink">
              The weave, seen as its harmonics.
            </h2>
            <p className="mt-5 font-sans text-base leading-relaxed text-ink-dim">
              Take the two-dimensional Fourier transform of a swatch and the
              cloth&apos;s structure separates itself from its colour and its
              lighting. A plain weave puts energy on the horizontal and vertical
              axes. A twill throws it onto the diagonal. The distance of a peak
              from the centre is the thread repeat; its angle is the direction of
              the wale.
            </p>
            <p className="mt-4 font-sans text-base leading-relaxed text-ink-dim">
              kapra reads the dominant peak, measures how far it stands above the
              surrounding noise, and turns that prominence into a confidence. A
              crisp macro gives a sharp peak and a high number. A blurry,
              cluttered shot gives a soft one — and the report says so.
            </p>
          </div>
          <WeavePlate variant="spectrum" className="aspect-square w-full" label="power spectrum" />
        </div>
      </section>

      {/* pipeline */}
      <section>
        <div className="mx-auto max-w-editorial px-5 py-20 sm:px-8 sm:py-24">
          <h2 className="font-display text-d3 text-ink">The pipeline</h2>
          <div className="mt-12 divide-y divide-[color:var(--surface-line)] border-y border-line">
            {PIPELINE.map((s) => (
              <div key={s.n} className="grid gap-4 py-8 md:grid-cols-[auto_240px_1fr] md:gap-10">
                <span className="readout text-xs text-signal">{s.n}</span>
                <h3 className="font-display text-2xl text-ink">{s.title}</h3>
                <p className="font-sans text-sm leading-relaxed text-ink-dim">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* honesty */}
      <section id="honesty" className="scroll-mt-32 bg-surface-raised rule-t rule-b">
        <div className="mx-auto max-w-editorial px-5 py-20 sm:px-8">
          <p className="kicker text-ink-faint">The honesty system</p>
          <h2 className="mt-5 max-w-3xl font-display text-d3 text-ink">
            A reading is worthless without its uncertainty.
          </h2>
          <div className="mt-12 grid gap-10 md:grid-cols-3">
            {TIERS.map((t) => (
              <div key={t.name} className="border-t-2 pt-5" style={{ borderColor: t.color }}>
                <h3 className="readout text-sm tracking-[0.18em]" style={{ color: t.color }}>
                  {t.name}
                </h3>
                <p className="mt-4 font-display text-xl italic text-ink">{t.rule}</p>
                <p className="mt-3 font-sans text-sm leading-relaxed text-ink-dim">
                  {t.detail}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-12 max-w-3xl font-sans text-sm leading-relaxed text-ink-dim">
            This is enforced structurally, not by convention: the genome schema
            requires a tier and at least one piece of evidence on every gene. A
            claim with nothing behind it cannot be serialised, so it can never
            reach the page.
          </p>
        </div>
      </section>

      {/* limits */}
      <section id="limits" className="scroll-mt-32">
        <div className="mx-auto max-w-editorial px-5 py-20 sm:px-8 sm:py-24">
          <p className="kicker text-signal">What it cannot do</p>
          <h2 className="mt-5 max-w-3xl font-display text-d3 text-ink">
            The limits, stated plainly.
          </h2>
          <ul className="mt-10 divide-y divide-[color:var(--surface-line)] border-y border-line">
            {[
              [
                "It cannot weigh cloth.",
                "GSM is mass per area. A photograph carries neither mass nor absolute scale, so kapra reports a weight class with an interval and refuses to print a specific number.",
              ],
              [
                "It cannot determine fibre content.",
                "A burn test or a microscope can. Pixels support a probabilistic guess at best, which is why fibre sits in the ESTIMATED tier with published accuracy rather than a confident label.",
              ],
              [
                "Finish readings depend on your lighting.",
                "Specular response is a function of the light as much as the cloth. Sheen is deliberately given a modest confidence, and a flat, diffuse light makes it meaningfully better.",
              ],
              [
                "It does not identify brands or authenticity.",
                "kapra measures material properties. It makes no claim about provenance, labels, or whether a garment is genuine.",
              ],
            ].map(([title, body]) => (
              <li key={title} className="grid gap-3 py-7 md:grid-cols-[1fr_1.6fr] md:gap-10">
                <h3 className="font-display text-xl text-ink">{title}</h3>
                <p className="font-sans text-sm leading-relaxed text-ink-dim">{body}</p>
              </li>
            ))}
          </ul>
          <div className="mt-12 flex flex-wrap gap-4">
            <Link href="/analyze" className="btn-solid">
              Try it on a swatch
            </Link>
            <Link href="/genes" className="btn-line">
              The gene index
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
